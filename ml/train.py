"""Train a research-only melanoma classifier from labeled ISIC images.

Expected data layout:
  ml/data/ISIC_2024_Training_Input/<isic_id>.jpg
  ml/data/ISIC_2024_Training_Input/metadata.csv
  ml/data/ISIC_2024_Training_GroundTruth.csv

The ISIC 2024 ground-truth CSV contains isic_id and malignant columns.
The input metadata.csv contains patient_id.
Splitting by patient_id is intentional: it prevents images from the same
patient appearing in both training and validation sets.
"""

from __future__ import annotations

import argparse
import json
import random
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from PIL import Image
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import GroupShuffleSplit, train_test_split
from torch import nn
from torch.utils.data import DataLoader, Dataset
from torchvision import models, transforms


def set_seed(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)


class LesionDataset(Dataset[tuple[torch.Tensor, torch.Tensor]]):
    def __init__(self, frame: pd.DataFrame, image_dir: Path, transform: transforms.Compose):
        self.frame = frame.reset_index(drop=True)
        self.image_dir = image_dir
        self.transform = transform

    def __len__(self) -> int:
        return len(self.frame)

    def __getitem__(self, index: int) -> tuple[torch.Tensor, torch.Tensor]:
        row = self.frame.iloc[index]
        image_path = self.image_dir / f"{row.image_name}.jpg"
        image = Image.open(image_path).convert("RGB")
        return self.transform(image), torch.tensor(float(row.target), dtype=torch.float32)


def split_frame(frame: pd.DataFrame, seed: int) -> tuple[pd.DataFrame, pd.DataFrame]:
    if "patient_id" in frame.columns:
        splitter = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=seed)
        train_indices, validation_indices = next(
            splitter.split(frame, frame.target, groups=frame.patient_id)
        )
        return frame.iloc[train_indices], frame.iloc[validation_indices]

    train, validation = train_test_split(
        frame,
        test_size=0.2,
        random_state=seed,
        stratify=frame.target,
    )
    return train, validation


def evaluate(model: nn.Module, loader: DataLoader, device: torch.device) -> dict[str, float]:
    model.eval()
    probabilities: list[float] = []
    labels: list[float] = []
    with torch.no_grad():
        for images, targets in loader:
            logits = model(images.to(device)).squeeze(1)
            probabilities.extend(torch.sigmoid(logits).cpu().tolist())
            labels.extend(targets.tolist())

    predictions = np.asarray(probabilities) >= 0.5
    actual = np.asarray(labels) == 1
    true_positive = np.sum(predictions & actual)
    true_negative = np.sum(~predictions & ~actual)
    positive_count = np.sum(actual)
    negative_count = np.sum(~actual)
    if len(set(labels)) < 2:
        raise ValueError("Validation split contains only one class; increase the sample size or change the seed.")
    return {
        "auroc": float(roc_auc_score(labels, probabilities)),
        "accuracy": float(np.mean(predictions == actual)),
        "sensitivity": float(true_positive / max(positive_count, 1)),
        "specificity": float(true_negative / max(negative_count, 1)),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", type=Path, default=Path("ml/data"))
    parser.add_argument("--labels", type=Path, default=None)
    parser.add_argument("--output", type=Path, default=Path("ml/artifacts/melanoma_resnet18.pt"))
    parser.add_argument("--epochs", type=int, default=5)
    parser.add_argument("--max-samples", type=int, default=None)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--image-size", type=int, default=224)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    set_seed(args.seed)
    labels_path = args.labels or args.data_dir / "ISIC_2024_Training_GroundTruth.csv"
    input_dir = args.data_dir / "ISIC_2024_Training_Input"
    image_dir = input_dir if input_dir.exists() else args.data_dir / "images"
    metadata_path = input_dir / "metadata.csv"
    frame = pd.read_csv(labels_path)
    if {"isic_id", "malignant"}.issubset(frame.columns):
        frame = frame.rename(columns={"isic_id": "image_name", "malignant": "target"})
    required_columns = {"image_name", "target"}
    missing = required_columns - set(frame.columns)
    if missing:
        raise ValueError(f"Labels are missing required columns: {sorted(missing)}")

    if metadata_path.exists():
        metadata = pd.read_csv(metadata_path, usecols=["isic_id", "patient_id"])
        metadata = metadata.rename(columns={"isic_id": "image_name"})
        frame = frame.merge(metadata, on="image_name", how="left")
    if frame["target"].dtype == object:
        frame["target"] = frame["target"].map({"benign": 0, "malignant": 1})
    frame["target"] = frame["target"].astype(int)
    frame = frame[frame.image_name.map(lambda name: (image_dir / f"{name}.jpg").exists())]
    if frame.empty:
        raise FileNotFoundError(f"No JPEG images found in {image_dir}")
    if args.max_samples and len(frame) > args.max_samples:
        positive_frame = frame[frame.target == 1]
        benign_frame = frame[frame.target == 0]
        positive_count = min(len(positive_frame), max(1, args.max_samples // 5))
        benign_count = args.max_samples - positive_count
        sampled_positive = positive_frame.sample(positive_count, random_state=args.seed)
        sampled_benign = benign_frame.sample(benign_count, random_state=args.seed)
        frame = pd.concat([sampled_positive, sampled_benign]).sample(frac=1, random_state=args.seed)
    print(json.dumps({"usable_samples": len(frame), "malignant": int(frame.target.sum()), "benign": int((frame.target == 0).sum())}))

    train_frame, validation_frame = split_frame(frame, args.seed)
    normalize = transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    train_transform = transforms.Compose([
        transforms.Resize((args.image_size, args.image_size)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.15),
        transforms.ToTensor(),
        normalize,
    ])
    validation_transform = transforms.Compose([
        transforms.Resize((args.image_size, args.image_size)),
        transforms.ToTensor(),
        normalize,
    ])
    train_loader = DataLoader(
        LesionDataset(train_frame, image_dir, train_transform),
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=0,
    )
    validation_loader = DataLoader(
        LesionDataset(validation_frame, image_dir, validation_transform),
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=0,
    )

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    model.fc = nn.Linear(model.fc.in_features, 1)
    model.to(device)
    positive = max(int(train_frame.target.sum()), 1)
    negative = max(len(train_frame) - positive, 1)
    loss_function = nn.BCEWithLogitsLoss(
        pos_weight=torch.tensor([negative / positive], device=device)
    )
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4, weight_decay=1e-4)

    best_metrics: dict[str, float] | None = None
    for epoch in range(1, args.epochs + 1):
        model.train()
        total_loss = 0.0
        for images, targets in train_loader:
            optimizer.zero_grad(set_to_none=True)
            logits = model(images.to(device)).squeeze(1)
            loss = loss_function(logits, targets.to(device))
            loss.backward()
            optimizer.step()
            total_loss += float(loss.item()) * len(images)

        metrics = evaluate(model, validation_loader, device)
        metrics["loss"] = total_loss / len(train_frame)
        print(json.dumps({"epoch": epoch, **metrics}))
        if best_metrics is None or metrics["auroc"] > best_metrics["auroc"]:
            best_metrics = metrics
            args.output.parent.mkdir(parents=True, exist_ok=True)
            torch.save(
                {
                    "model_state_dict": model.state_dict(),
                    "model": "resnet18",
                    "task": "melanoma-vs-benign",
                    "image_size": args.image_size,
                    "metrics": metrics,
                    "train_count": len(train_frame),
                    "validation_count": len(validation_frame),
                },
                args.output,
            )

    print(json.dumps({"saved_checkpoint": str(args.output), "best_metrics": best_metrics}))


if __name__ == "__main__":
    main()
