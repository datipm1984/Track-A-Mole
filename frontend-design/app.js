(function () {
  const stateKey = "skincheck.activeCapture";

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(stateKey) || "null");
    } catch (_error) {
      return null;
    }
  }

  function saveState(state) {
    localStorage.setItem(stateKey, JSON.stringify(state));
  }

  async function createLesionAndUpload(file) {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Unable to read selected image."));
      reader.readAsDataURL(file);
    });

    const lesionResponse = await fetch("/api/lesions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "New lesion",
        bodySite: "Unspecified",
        firstObservedAt: new Date().toISOString(),
      }),
    });

    if (!lesionResponse.ok) throw new Error("Unable to create lesion record.");
    const { lesion } = await lesionResponse.json();

    const photoResponse = await fetch(`/api/lesions/${lesion.id}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dataUrl,
        capturedAt: new Date().toISOString(),
      }),
    });

    if (!photoResponse.ok) throw new Error("Unable to save lesion photo.");
    const { photo } = await photoResponse.json();
    saveState({ lesionId: lesion.id, photoId: photo.id, photoUrl: photo.url });
    window.location.href = `/assessment?lesionId=${encodeURIComponent(lesion.id)}&photoId=${encodeURIComponent(photo.id)}`;
  }

  function showCaptureMessage(message) {
    const toast = document.getElementById("capture-toast");
    if (!toast) return;
    const text = toast.querySelector("span:last-child");
    if (text) text.textContent = message;
    toast.classList.remove("opacity-0");
    window.setTimeout(() => toast.classList.add("opacity-0"), 2600);
  }

  function setupCapture() {
    const shutter = document.getElementById("btn-shutter");
    if (!shutter) return;

    shutter.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/jpeg,image/png,image/webp";
      input.capture = "environment";
      input.addEventListener("change", async () => {
        const file = input.files && input.files[0];
        if (!file) return;
        if (file.size > 8 * 1024 * 1024) {
          showCaptureMessage("Please choose an image smaller than 8 MB");
          return;
        }
        showCaptureMessage("Saving calibrated capture...");
        try {
          await createLesionAndUpload(file);
        } catch (error) {
          showCaptureMessage(error.message || "Capture could not be saved");
        }
      });
      input.click();
    });
  }

  async function setupAssessment() {
    const image = document.getElementById("derm-image");
    const params = new URLSearchParams(window.location.search);
    const state = readState();
    const lesionId = params.get("lesionId") || state?.lesionId;
    const photoId = params.get("photoId") || state?.photoId;
    if (!lesionId) return;

    try {
      const response = await fetch(`/api/lesions/${encodeURIComponent(lesionId)}`);
      if (!response.ok) return;
      const payload = await response.json();
      const photo = payload.photos.find((item) => item.id === photoId) || payload.photos[0];
      if (image && photo?.url) image.src = photo.url;

      const confirmButton = document.getElementById("confirm-assignment");
      if (confirmButton && !confirmButton.dataset.apiBound) {
        confirmButton.dataset.apiBound = "true";
        confirmButton.addEventListener("click", async () => {
          await fetch(`/api/lesions/${encodeURIComponent(lesionId)}/assessments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              photoId: photo?.id || photoId,
              modelName: "awaiting-review",
              riskLevel: "inconclusive",
              resultSummary: "Assessment saved for clinical review.",
              disclaimerVersion: "v1",
            }),
          });
        });
      }
    } catch (_error) {
      // The designed result screen remains usable if the API is unavailable.
    }
  }

  function setupHome() {
    const button = document.getElementById("start-scan-btn");
    if (button) button.addEventListener("click", () => { window.location.href = "/capture"; });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupHome();
    setupCapture();
    setupAssessment();
  });
})();
