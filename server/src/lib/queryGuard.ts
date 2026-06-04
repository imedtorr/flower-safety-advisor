import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { detectFlower, detectPet } from "./synonyms.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const flowersPath = join(__dirname, "../../../data/flowers.json");

export type GuardVerdict = "allow" | "injection" | "off_topic";

export interface GuardResult {
  verdict: GuardVerdict;
  reason: string;
}

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /disregard\s+(all\s+)?(previous|prior|system)/i,
  /forget\s+(your|all|previous)\s+(instructions|rules)/i,
  /system\s*prompt/i,
  /you\s+are\s+now\s+/i,
  /ты\s+теперь\s+/i,
  /теперь\s+ты\s+(не\s+)?/i,
  /новые\s+инструкции/i,
  /override\s+(the\s+)?(system|instructions)/i,
  /jailbreak/i,
  /\bDAN\b/,
  /role\s*play\s+as/i,
  /developer\s+mode/i,
  /раскрой\s+(системный|скрытый)\s+промпт/i,
  /выведи\s+(системный|исходный)\s+промпт/i,
  /покажи\s+инструкции\s+(модели|системы)/i,
  /assistant\s*:/i,
  /<\s*script\b/i,
  /```\s*(system|assistant)/i,
];

const OFF_TOPIC_STRONG: RegExp[] = [
  /\b(python|javascript|typescript|java|react|sql)\b.*\b(код|code|скрипт|программ)/i,
  /напиши\s+(код|скрипт|программу)/i,
  /погод[аеуы]/i,
  /\bweather\b/i,
  /курс\s+(доллара|евро|биткоин)/i,
  /\b(bitcoin|crypto|криптовалют)/i,
  /политик/i,
  /рецепт\s+(борщ|торт|пирог|супа)/i,
  /порно|xxx/i,
  /ставк[аи]\s+на\s+матч/i,
  /кто\s+победит\s+на\s+(выборах|чемпионате)/i,
  /расскажи\s+анекдот/i,
  /напиши\s+стих/i,
  /переведи\s+на\s+английский\s+текст/i,
];

const ON_TOPIC_PATTERNS: RegExp[] = [
  /цветок|цветы|цветов|растен|букет|лепест|ваз[аы]?|горшеч|комнатн.*растен/i,
  /токсичн|ядовит|безопасн|опасн|отравлен|симптом/i,
  /кошк|кот[а-я]*|собак|пёс|пес|щенок|питомец|pet\b/i,
  /домашн.*живот|ветерин/i,
  /\b(flower|plant|bouquet|toxic|poison|lily|rose|pet)\b/i,
];

let cachedFlowerTerms: string[] | null = null;

function loadFlowerTerms(): string[] {
  if (cachedFlowerTerms) return cachedFlowerTerms;
  const data = JSON.parse(readFileSync(flowersPath, "utf-8")) as {
    names: string[];
  }[];
  cachedFlowerTerms = data.flatMap((f) =>
    f.names.map((n) => n.toLowerCase()).filter((n) => n.length >= 3),
  );
  return cachedFlowerTerms;
}

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

function mentionsKnownFlower(text: string): boolean {
  const lower = text.toLowerCase();
  return loadFlowerTerms().some((term) => lower.includes(term));
}

function hasOnTopicSignals(query: string): boolean {
  if (detectFlower(query) || detectPet(query)) return true;
  if (mentionsKnownFlower(query)) return true;
  return matchesAny(query, ON_TOPIC_PATTERNS);
}

function hasInjectionAttempt(query: string): boolean {
  return matchesAny(query, INJECTION_PATTERNS);
}

function hasStrongOffTopic(query: string): boolean {
  return matchesAny(query, OFF_TOPIC_STRONG);
}

export function validateUserQuery(query: string): GuardResult {
  const trimmed = query.trim();

  if (!trimmed) {
    return {
      verdict: "off_topic",
      reason: "Пустой запрос.",
    };
  }

  if (hasInjectionAttempt(trimmed)) {
    return {
      verdict: "injection",
      reason: "Обнаружена попытка подмены инструкций (prompt injection).",
    };
  }

  if (hasOnTopicSignals(trimmed)) {
    return { verdict: "allow", reason: "" };
  }

  if (hasStrongOffTopic(trimmed)) {
    return {
      verdict: "off_topic",
      reason: "Запрос не связан с безопасностью цветов для питомцев.",
    };
  }

  if (trimmed.length < 12) {
    return {
      verdict: "off_topic",
      reason: "Слишком короткий запрос без указания цветка или питомца.",
    };
  }

  return {
    verdict: "off_topic",
    reason:
      "Не удалось определить тему. Уточните цветок/букет и питомца (кошка или собака).",
  };
}

export function getRejectionAnswer(result: GuardResult): string {
  if (result.verdict === "injection") {
    return `Запрос отклонён: ${result.reason}

Я отвечаю только на вопросы о безопасности цветов и растений для кошек и собак.
Пример: «Розы на столе — безопасны ли для кошки?»`;
  }

  return `Запрос вне темы сервиса: ${result.reason}

Flower Safety Advisor помогает проверить, безопасны ли цветы и букеты для домашних кошек и собак.
Примеры вопросов:
• «Пионы в вазе — опасны для кошки?»
• «Тюльпаны и щенок в одной комнате»`;
}

export function sanitizeUserQuery(query: string): string {
  return query
    .trim()
    .replace(/\0/g, "")
    .slice(0, 500);
}
