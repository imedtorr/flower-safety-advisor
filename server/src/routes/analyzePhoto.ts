import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import { runPhotoAdvisor } from "../photoGraph.js";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Допустимы только JPEG, PNG или WebP"));
    }
  },
});

const DEFAULT_QUERY =
  "Проверь этот букет на безопасность для кошки";

export const analyzePhotoRouter = Router();

function handleUpload(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ error: "Файл слишком большой (макс. 5 МБ)" });
        return;
      }
      res.status(400).json({ error: err.message });
      return;
    }
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
      return;
    }
    next();
  });
}

analyzePhotoRouter.post(
  "/analyze-photo",
  handleUpload,
  async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "Поле image обязательно (JPEG, PNG или WebP)" });
      return;
    }

    const query =
      typeof req.body?.query === "string" && req.body.query.trim()
        ? req.body.query.trim()
        : DEFAULT_QUERY;

    if (query.length > 500) {
      res.status(400).json({ error: "Запрос слишком длинный (макс. 500 символов)" });
      return;
    }

    try {
      const result = await runPhotoAdvisor(
        req.file.buffer,
        req.file.mimetype,
        query,
      );
      res.json(result);
    } catch (e) {
      console.error("analyze-photo error:", e);
      const message = e instanceof Error ? e.message : "Internal error";
      res.status(500).json({ error: message });
    }
  },
);
