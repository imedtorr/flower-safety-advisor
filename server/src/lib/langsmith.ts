import type { RunnableConfig } from "@langchain/core/runnables";

const DEFAULT_PROJECT = "flower-safety-advisor";

function envFlag(name: string): boolean {
  return process.env[name] === "true";
}

export function isLangSmithEnabled(): boolean {
  return (
    envFlag("LANGSMITH_TRACING") ||
    envFlag("LANGSMITH_TRACING_V2") ||
    envFlag("LANGCHAIN_TRACING") ||
    envFlag("LANGCHAIN_TRACING_V2")
  );
}

export function logLangSmithStatus(): void {
  if (!isLangSmithEnabled()) {
    console.log(
      "LangSmith: трассировка выключена (установите LANGSMITH_TRACING=true в .env)",
    );
    return;
  }

  const apiKey =
    process.env.LANGSMITH_API_KEY ?? process.env.LANGCHAIN_API_KEY;
  if (!apiKey) {
    console.warn(
      "LangSmith: трассировка включена, но LANGSMITH_API_KEY не задан",
    );
    return;
  }

  const project =
    process.env.LANGSMITH_PROJECT ??
    process.env.LANGCHAIN_PROJECT ??
    DEFAULT_PROJECT;

  console.log(`LangSmith: трассировка включена → проект «${project}»`);
}

export function getGraphInvokeConfig(query: string): RunnableConfig {
  return {
    runName: "flower-safety-advisor",
    tags: ["api", "ask"],
    metadata: {
      query_preview: query.slice(0, 120),
      query_length: query.length,
    },
  };
}
