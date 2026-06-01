import dotenv from "dotenv";
import { resolve } from "node:path";

dotenv.config({ path: resolve(process.cwd(), "../.env") });
dotenv.config();
import cors from "cors";
import express from "express";
import { askRouter } from "./routes/ask.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "flower-safety-advisor" });
});

app.use("/api", askRouter);

app.listen(port, () => {
  console.log(`Flower Safety Advisor API → http://localhost:${port}`);
});
