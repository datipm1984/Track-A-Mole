# SkinCheck research model

This folder contains a research-only melanoma-vs-benign training pipeline based on the official [SLICE-3D 2024 Challenge Dataset](https://challenge.isic-archive.com/data/). The training input contains 401,059 JPEG lesion crops, and the matching ground-truth file provides malignancy labels. The dataset is licensed CC BY-NC 4.0. Review the license and cite ISIC before using or redistributing any resulting artifact.

The model is not a medical device and must not be used to diagnose skin cancer. It is a prototype for offline experimentation and needs external clinical validation, calibration, subgroup evaluation, and regulatory review before any patient-facing use.

## Data setup

Download the official training input archive and the matching ground-truth CSV from the ISIC 2024 section of the [ISIC Challenge datasets page](https://challenge.isic-archive.com/data/). Place files in this layout:

```text
ml/data/
  ISIC_2024_Training_GroundTruth.csv
  ISIC_2024_Training_Input/
    metadata.csv
    ISIC_0015670.jpg
    ...
```

Do not commit the dataset or model weights to this repository.

## Install and train

From the project root:

```powershell
& .\.venv\Scripts\python.exe -m pip install -r ml\requirements.txt
& .\.venv\Scripts\python.exe ml\train.py --data-dir ml\data --epochs 5
```

The script splits by `patient_id` when available, compensates for melanoma class imbalance, reports AUROC, accuracy, sensitivity, and specificity, and writes the best validation checkpoint to `ml/artifacts/melanoma_resnet18.pt`. For a quick experiment on only 1,000 entries, use. The bounded subset intentionally uses roughly 20% malignant cases so validation contains both classes; this is useful for a smoke test but is not representative of source prevalence:

```powershell
& .\.venv\Scripts\python.exe ml\train.py --data-dir ml\data --max-samples 1000 --epochs 3
```
