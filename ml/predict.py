"""Run one research-only melanoma probability prediction."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import torch
from PIL import Image
from torchvision import models, transforms


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", type=Path, required=True)
    parser.add_argument("--model", type=Path, required=True)
    args = parser.parse_args()

    checkpoint = torch.load(args.model, map_location="cpu", weights_only=True)
    image_size = int(checkpoint.get("image_size", 224))
    model = models.resnet18(weights=None)
    model.fc = torch.nn.Linear(model.fc.in_features, 1)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    preprocessing = transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])
    image = preprocessing(Image.open(args.image).convert("RGB")).unsqueeze(0)
    with torch.no_grad():
        probability = float(torch.sigmoid(model(image).squeeze()).item())

    print(json.dumps({
        "melanomaProbability": probability,
        "modelName": "ISIC-2024-ResNet18",
        "modelVersion": "research-1000-sample-1epoch",
        "task": "melanoma-vs-benign",
    }))


if __name__ == "__main__":
    main()
