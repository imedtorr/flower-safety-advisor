import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Agent } from "node:https";
import GigaChat from "gigachat";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
const flowersPath = join(__dirname, "../../../data/flowers.json");

const VisionFlowerSchema = z.object({
  slug: z.string(),
  labelRu: z.string(),
  confidence: z.number().min(0).max(1),
});

const VisionResultSchema = z.object({
  flowers: z.array(VisionFlowerSchema).max(7),
  notes: z.string().optional(),
});

export type DetectedFlower = z.infer<typeof VisionFlowerSchema>;
export type VisionIdentifyResult = z.infer<typeof VisionResultSchema>;

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function loadKnownSlugs(): string[] {
  const data = JSON.parse(readFileSync(flowersPath, "utf-8")) as {
    slug: string;
    names: string[];
  }[];
  return data.map((f) => `${f.slug} (${f.names.find((n) => /[а-яё]/i.test(n)) ?? f.names[0]})`);
}

export function createGigaChatVisionClient(): GigaChat {
  const credentials = process.env.GIGACHAT_CREDENTIALS;
  if (!credentials) {
    throw new Error("GIGACHAT_CREDENTIALS is not set in .env");
  }

  const httpsAgent = new Agent({ rejectUnauthorized: false });

  return new GigaChat({
    credentials,
    model: process.env.GIGACHAT_VISION_MODEL ?? "GigaChat-Pro",
    httpsAgent,
    timeout: 120,
  });
}

export async function uploadImage(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const ext = MIME_EXT[mimeType] ?? "jpg";
  const file = new File([new Uint8Array(buffer)], `bouquet.${ext}`, {
    type: mimeType,
  });
  const client = createGigaChatVisionClient();
  const uploaded = await client.uploadFile(file);
  return uploaded.id;
}

export async function identifyFlowersFromImage(
  fileId: string,
  userQuery: string,
): Promise<VisionIdentifyResult> {
  const client = createGigaChatVisionClient();
  const knownSlugs = loadKnownSlugs().join(", ");

  const systemPrompt = `Ты — ботаник, распознающий цветы на фотографиях букетов.
Ответь ТОЛЬКО валидным JSON без markdown:
{"flowers":[{"slug":"...","labelRu":"...","confidence":0.0}],"notes":"..."}

Правила:
- Перечисли до 7 видимых цветов/зелени в букете (основные, не мелочь).
- slug: если растение из списка — используй точный slug; иначе латинский slug (snake_case) или "unknown_plant".
- labelRu: русское название.
- confidence: 0.0–1.0 (насколько уверен в определении).
- notes: кратко на русском, если что-то неразборчиво.

Известные slug в базе: ${knownSlugs}`;

  const response = await client.chat({
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: userQuery,
        attachments: [fileId],
      },
    ],
    temperature: 0.1,
  });

  const raw =
    response.choices[0]?.message?.content?.trim() ?? '{"flowers":[]}';

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : raw;

  try {
    const parsed = JSON.parse(jsonStr) as unknown;
    return VisionResultSchema.parse(parsed);
  } catch (e) {
    console.error("vision JSON parse error:", e, raw);
    return { flowers: [], notes: "Не удалось распознать цветы на фото." };
  }
}
