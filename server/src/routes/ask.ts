import { Router } from "express";
import { runAdvisor } from "../graph.js";
import { sanitizeUserQuery } from "../lib/queryGuard.js";

export const askRouter = Router();

askRouter.post("/ask", async (req, res) => {
  const query =
    typeof req.body?.query === "string"
      ? sanitizeUserQuery(req.body.query)
      : "";

  if (!query) {
    res.status(400).json({ error: "Поле query обязательно" });
    return;
  }

  if (query.length > 500) {
    res.status(400).json({ error: "Запрос слишком длинный (макс. 500 символов)" });
    return;
  }

  try {
    const result = await runAdvisor(query);
    res.json(result);
  } catch (e) {
    console.error("ask error:", e);
    const message = e instanceof Error ? e.message : "Internal error";
    res.status(500).json({ error: message });
  }
});
