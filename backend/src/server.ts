import "dotenv/config";
import { execFile } from "node:child_process";
import express from "express";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { sql } from "./db";

const app = express();
app.use(express.json());

const frontendDirectory = path.resolve(__dirname, "../../frontend-design");
const uploadsDirectory = path.resolve(__dirname, "../../uploads");
const projectDirectory = path.resolve(__dirname, "../..");
const modelPath = process.env.MODEL_PATH ?? path.join(projectDirectory, "ml", "artifacts", "melanoma_resnet18.pt");
const pythonExecutable = process.env.PYTHON_EXECUTABLE ?? path.join(projectDirectory, ".venv", "Scripts", "python.exe");
const execFileAsync = promisify(execFile);
app.use("/uploads", express.static(uploadsDirectory));

type LesionInput = {
  userId?: string;
  name?: string;
  bodySite?: string;
  notes?: string;
  firstObservedAt?: string;
};

type PhotoInput = {
  dataUrl?: string;
  capturedAt?: string;
  notes?: string;
};

type AssessmentInput = {
  photoId?: string;
  modelName?: string;
  modelVersion?: string;
  riskLevel?: "low" | "moderate" | "high" | "inconclusive";
  resultSummary?: string;
  resultDetails?: Record<string, unknown>;
  disclaimerVersion?: string;
};

type ModelPrediction = {
  melanomaProbability: number;
  modelName: string;
  modelVersion: string;
  task: string;
};

async function predictFromPhoto(photoPath: string): Promise<ModelPrediction> {
  const { stdout } = await execFileAsync(pythonExecutable, [
    path.join(projectDirectory, "ml", "predict.py"),
    "--image",
    photoPath,
    "--model",
    modelPath,
  ], { maxBuffer: 1024 * 1024 });
  return JSON.parse(stdout.trim()) as ModelPrediction;
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "SkinCheck API" });
});

app.get("/health/db", async (_req, res) => {
  try {
    const rows = await sql`
      SELECT
        current_database() AS database,
        now() AS server_time
    `;

    res.json({
      connected: true,
      database: rows[0].database,
      serverTime: rows[0].server_time,
    });
  } catch (error) {
    console.error("Neon connection test failed:", error);
    res.status(503).json({
      connected: false,
      error: "Database connection failed. Check backend configuration."
    });
  }
});

app.get("/api/dashboard", async (req, res) => {
  const userId = String(req.query.userId ?? "demo-user");

  try {
    const [lesionCount, highRiskCount, recentScans] = await Promise.all([
      sql`
        SELECT COUNT(*)::int AS count
        FROM lesions
        WHERE user_id = ${userId}
      `,
      sql`
        SELECT COUNT(*)::int AS count
        FROM assessments a
        INNER JOIN lesions l ON l.id = a.lesion_id
        WHERE l.user_id = ${userId} AND a.risk_level = 'high'
      `,
      sql`
        SELECT
          l.id,
          l.name,
          l.body_site AS "bodySite",
          a.risk_level AS "riskLevel",
          a.result_summary AS "resultSummary",
          COALESCE(p.captured_at, a.created_at) AS "capturedAt"
        FROM lesions l
        LEFT JOIN LATERAL (
          SELECT * FROM assessments
          WHERE lesion_id = l.id
          ORDER BY created_at DESC
          LIMIT 1
        ) a ON true
        LEFT JOIN LATERAL (
          SELECT * FROM lesion_photos
          WHERE lesion_id = l.id
          ORDER BY captured_at DESC NULLS LAST, uploaded_at DESC
          LIMIT 1
        ) p ON true
        WHERE l.user_id = ${userId}
        ORDER BY COALESCE(p.captured_at, a.created_at, l.updated_at) DESC
        LIMIT 10
      `,
    ]);

    res.json({
      userId,
      trackedLesions: lesionCount[0]?.count ?? 0,
      highRiskFlags: highRiskCount[0]?.count ?? 0,
      recentScans,
    });
  } catch (error) {
    console.error("Dashboard query failed:", error);
    res.status(503).json({ error: "Unable to load dashboard data." });
  }
});

app.get("/api/lesions", async (req, res) => {
  const userId = String(req.query.userId ?? "demo-user");

  try {
    const lesions = await sql`
      SELECT
        l.id,
        l.name,
        l.body_site AS "bodySite",
        l.notes,
        l.first_observed_at AS "firstObservedAt",
        l.created_at AS "createdAt",
        l.updated_at AS "updatedAt",
        COUNT(p.id)::int AS "photoCount",
        COUNT(a.id)::int AS "assessmentCount"
      FROM lesions l
      LEFT JOIN lesion_photos p ON p.lesion_id = l.id
      LEFT JOIN assessments a ON a.lesion_id = l.id
      WHERE l.user_id = ${userId}
      GROUP BY l.id
      ORDER BY l.updated_at DESC
    `;

    res.json({ lesions });
  } catch (error) {
    console.error("Lesion list query failed:", error);
    res.status(503).json({ error: "Unable to load lesions." });
  }
});

app.post("/api/lesions", async (req, res) => {
  const input = req.body as LesionInput;
  const userId = input.userId?.trim() || "demo-user";
  const name = input.name?.trim();

  if (!name) {
    res.status(400).json({ error: "name is required." });
    return;
  }

  try {
    const rows = await sql`
      INSERT INTO lesions (user_id, name, body_site, notes, first_observed_at)
      VALUES (
        ${userId},
        ${name},
        ${input.bodySite?.trim() || null},
        ${input.notes?.trim() || null},
        ${input.firstObservedAt || null}
      )
      RETURNING
        id,
        user_id AS "userId",
        name,
        body_site AS "bodySite",
        notes,
        first_observed_at AS "firstObservedAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `;

    res.status(201).json({ lesion: rows[0] });
  } catch (error) {
    console.error("Lesion creation failed:", error);
    res.status(503).json({ error: "Unable to create lesion." });
  }
});

app.post("/api/lesions/:id/photos", async (req, res) => {
  const input = req.body as PhotoInput;
  const dataUrl = input.dataUrl?.trim();
  const match = dataUrl?.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);

  if (!match) {
    res.status(400).json({ error: "dataUrl must be a base64 JPEG, PNG, or WebP image." });
    return;
  }

  const [, mimeType, encodedImage] = match;
  const extension = mimeType.split("/")[1].replace("jpeg", "jpg");
  const objectKey = `${randomUUID()}.${extension}`;

  try {
    const lesion = await sql`
      SELECT id FROM lesions WHERE id = ${req.params.id} LIMIT 1
    `;

    if (!lesion[0]) {
      res.status(404).json({ error: "Lesion not found." });
      return;
    }

    await mkdir(uploadsDirectory, { recursive: true });
    await writeFile(path.join(uploadsDirectory, objectKey), Buffer.from(encodedImage, "base64"));

    const photos = await sql`
      INSERT INTO lesion_photos (lesion_id, object_key, captured_at, notes)
      VALUES (${req.params.id}, ${objectKey}, ${input.capturedAt || null}, ${input.notes?.trim() || null})
      RETURNING
        id,
        lesion_id AS "lesionId",
        object_key AS "objectKey",
        captured_at AS "capturedAt",
        uploaded_at AS "uploadedAt",
        notes
    `;

    res.status(201).json({
      photo: { ...photos[0], url: `/uploads/${objectKey}` },
    });
  } catch (error) {
    console.error("Photo upload failed:", error);
    res.status(503).json({ error: "Unable to save lesion photo." });
  }
});

app.post("/api/lesions/:id/assessments", async (req, res) => {
  const input = req.body as AssessmentInput;

  try {
    const lesion = await sql`
      SELECT id FROM lesions WHERE id = ${req.params.id} LIMIT 1
    `;

    if (!lesion[0]) {
      res.status(404).json({ error: "Lesion not found." });
      return;
    }

    if (!input.photoId) {
      res.status(400).json({ error: "photoId is required for model assessment." });
      return;
    }

    const photos = await sql`
      SELECT object_key AS "objectKey"
      FROM lesion_photos
      WHERE id = ${input.photoId} AND lesion_id = ${req.params.id}
      LIMIT 1
    `;
    if (!photos[0]) {
      res.status(404).json({ error: "Photo not found for lesion." });
      return;
    }

    const photoPath = path.resolve(uploadsDirectory, photos[0].objectKey);
    if (!photoPath.startsWith(`${path.resolve(uploadsDirectory)}${path.sep}`)) {
      res.status(400).json({ error: "Invalid photo path." });
      return;
    }

    const prediction = await predictFromPhoto(photoPath);
    const riskLevel = prediction.melanomaProbability >= 0.5 ? "high" : "low";
    const resultDetails = {
      ...(input.resultDetails ?? {}),
      melanomaProbability: prediction.melanomaProbability,
      task: prediction.task,
      researchNotice: "This model is a research prototype and is not a diagnosis.",
    };
    const resultSummary = `Research model estimated ${(prediction.melanomaProbability * 100).toFixed(1)}% melanoma probability. Clinical review is required.`;

    const assessments = await sql`
      INSERT INTO assessments (
        lesion_id, photo_id, model_name, model_version, risk_level,
        result_summary, result_details, disclaimer_version
      )
      VALUES (
        ${req.params.id},
        ${input.photoId},
        ${prediction.modelName},
        ${prediction.modelVersion},
        ${riskLevel},
        ${resultSummary},
        ${JSON.stringify(resultDetails)}::jsonb,
        ${input.disclaimerVersion?.trim() || "v1"}
      )
      RETURNING
        id,
        lesion_id AS "lesionId",
        photo_id AS "photoId",
        model_name AS "modelName",
        model_version AS "modelVersion",
        risk_level AS "riskLevel",
        result_summary AS "resultSummary",
        result_details AS "resultDetails",
        disclaimer_version AS "disclaimerVersion",
        created_at AS "createdAt"
    `;

    res.status(201).json({ assessment: assessments[0] });
  } catch (error) {
    console.error("Assessment creation failed:", error);
    res.status(503).json({ error: "Unable to save assessment." });
  }
});

app.get("/api/lesions/:id", async (req, res) => {
  try {
    const lesions = await sql`
      SELECT
        id,
        user_id AS "userId",
        name,
        body_site AS "bodySite",
        notes,
        first_observed_at AS "firstObservedAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM lesions
      WHERE id = ${req.params.id}
      LIMIT 1
    `;

    if (!lesions[0]) {
      res.status(404).json({ error: "Lesion not found." });
      return;
    }

    const [photos, assessments] = await Promise.all([
      sql`
        SELECT
          id,
          object_key AS "objectKey",
          CONCAT('/uploads/', object_key) AS url,
          captured_at AS "capturedAt",
          uploaded_at AS "uploadedAt",
          notes
        FROM lesion_photos
        WHERE lesion_id = ${req.params.id}
        ORDER BY captured_at DESC NULLS LAST, uploaded_at DESC
      `,
      sql`
        SELECT
          id,
          photo_id AS "photoId",
          model_name AS "modelName",
          model_version AS "modelVersion",
          risk_level AS "riskLevel",
          result_summary AS "resultSummary",
          result_details AS "resultDetails",
          disclaimer_version AS "disclaimerVersion",
          created_at AS "createdAt"
        FROM assessments
        WHERE lesion_id = ${req.params.id}
        ORDER BY created_at DESC
      `,
    ]);

    res.json({ lesion: lesions[0], photos, assessments });
  } catch (error) {
    console.error("Lesion detail query failed:", error);
    res.status(503).json({ error: "Unable to load lesion details." });
  }
});

app.use(express.static(frontendDirectory));

const frontendPage = (page: string) =>
  path.join(frontendDirectory, "pages", page, "index.html");

async function sendFrontendPage(res: express.Response, page: string) {
  const html = await readFile(frontendPage(page), "utf8");
  res.type("html").send(html.replace("</body>", '<script src="/app.js"></script></body>'));
}

app.get("/welcome", async (_req, res) => {
  await sendFrontendPage(res, "welcome_onboarding");
});

app.get("/home", async (_req, res) => {
  await sendFrontendPage(res, "home_dashboard");
});

app.get("/capture", async (_req, res) => {
  await sendFrontendPage(res, "capture_quality_guide");
});

app.get("/assessment", async (_req, res) => {
  await sendFrontendPage(res, "ai_assessment_results");
});

app.get("/", (_req, res) => {
  res.redirect("/welcome");
});

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

app.listen(port, host, () => {
  console.log(`SkinCheck API running at http://${host}:${port}`);
});
