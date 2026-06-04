# Flower Safety Advisor

Веб-приложение на TypeScript + LangGraph: советник по безопасности цветов (пионы, розы, герберы и др.) для домашних кошек и собак.

## Архитектура

**Текстовый запрос:**

```
Пользователь → React UI → POST /api/ask → LangGraph
  guardQuery → [rejectQuery] | analyzeQuery → [multiFlowerHint] → normalize → localDb
    → externalApi → tavily → fallback (каскад по found)
  → composeAnswer → qualityCheck → [composeAnswerRetry] → END
```

**Фото букета:**

```
Пользователь → React UI → POST /api/analyze-photo → LangGraph (photo)
  visionIdentify (GigaChat-Pro)
    → bouquetLookup (уверенное распознавание)
    → visionFallback (пусто / низкая уверенность)
  → composeBouquetReport
```

| Шаг | Источник |
|-----|----------|
| 0 | Проверка темы и защита от prompt injection |
| 1 | Анализ запроса (тип, сложность) + нормализация |
| 2 | Локальная JSON-база с курируемыми данными |
| 3 | ASPCA JSON API (GitHub) |
| 4 | Tavily веб-поиск |
| 5 | Fallback + финальный ответ GigaChat |
| 6 | Проверка качества ответа и повтор при необходимости |

В UI отображаются badge источника, риска, **маршрут узлов LangGraph** (`graphPath`), для текста — качество и число повторов; для фото — качество распознавания (`visionQuality`).

## Требования

- Node.js 20+
- Ключ [GigaChat](https://developers.sber.ru/docs/ru/gigachat) (для фото — доступ к vision-модели, например **GigaChat-Pro**)
- Ключ [Tavily](https://tavily.com/)
- (Опционально) ключ [LangSmith](https://smith.langchain.com/) для трассировки графа и LLM-вызовов

## Установка

```bash
cd "Flower Safety Advisor"
cp .env.example .env
# Заполните GIGACHAT_CREDENTIALS и TAVILY_API_KEY в .env

npm install
npm install --prefix server
npm install --prefix client
npm run dev
```

Откройте http://localhost:5173

## Демо для защиты

| Запрос | Ожидаемый результат |
|--------|---------------------|
| «Розы и кот на столе» | Локальная БД, `graphPath` без retry |
| Редкое растение из ASPCA | Внешний API |
| Экзотический цветок | Веб-поиск / Общие советы |
| «Подробно сравни токсичность лилий и азалий для кошки» | `multiFlowerHint` + при плохом ответе `composeAnswerRetry` в `graphPath` |
| Вкладка «Фото букета» + чёткий снимок | `visionIdentify → bouquetLookup → composeBouquetReport` |
| Размытое / пустое фото | `visionIdentify → visionFallback` (без ASPCA/Tavily) |
| Скриншот, код, не букет | `isFlowerPhoto: false` → `not_flower` → отказ без «угадывания» лилий |

В LangSmith при `LANGSMITH_TRACING=true` видны все узлы графа, включая цикл `qualityCheck ↔ composeAnswerRetry`.

### Анализ фото (curl)

```bash
curl -X POST http://localhost:3001/api/analyze-photo \
  -F "image=@/path/to/bouquet.jpg" \
  -F "query=Проверь этот букет на безопасность для кошки"
```

## Структура

- `server/` — Express + LangGraph + GigaChat
- `client/` — React + Vite + Tailwind (пастельная тема)
- `data/flowers.json` — локальная база
- `langGraph/` — учебные примеры курса (базовый, условный, продвинутый граф)

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| `GIGACHAT_CREDENTIALS` | Authorization key GigaChat |
| `GIGACHAT_VISION_MODEL` | Модель для распознавания фото (по умолчанию `GigaChat-Pro`) |
| `TAVILY_API_KEY` | API key Tavily |
| `PORT` | Порт API (по умолчанию 3001) |
| `LANGSMITH_TRACING` | `true` — отправлять трейсы в LangSmith |
| `LANGSMITH_API_KEY` | API key из [настроек LangSmith](https://smith.langchain.com/settings) |
| `LANGSMITH_PROJECT` | Имя проекта в LangSmith (по умолчанию `flower-safety-advisor`) |

После запуска с включённой трассировкой запросы `/api/ask` и `/api/analyze-photo` появляются в LangSmith как run графа с узлами и вложенными вызовами GigaChat.
