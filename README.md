# Flower Safety Advisor

Веб-приложение на TypeScript + LangGraph: советник по безопасности цветов (пионы, розы, герберы и др.) для домашних кошек и собак.

## Архитектура

**Текстовый запрос:**

```
Пользователь → React UI → POST /api/ask → LangGraph
  normalize → localDb → externalApi → tavily → fallback → composeAnswer (GigaChat)
```

**Фото букета:**

```
Пользователь → React UI → POST /api/analyze-photo → LangGraph (photo)
  visionIdentify (GigaChat-Pro) → bouquetLookup → composeBouquetReport
```

| Шаг | Источник |
|-----|----------|
| 1 | Нормализация (синонимы + GigaChat при необходимости) |
| 2 | Локальная JSON-база с курируемыми данными |
| 3 | ASPCA JSON API (GitHub) |
| 4 | Tavily веб-поиск |
| 5 | Fallback + финальный ответ GigaChat |

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

| Запрос | Ожидаемый источник |
|--------|-------------------|
| «Розы и кот на столе» | Локальная БД |
| Редкое растение из ASPCA | Внешний API |
| Экзотический цветок | Веб-поиск / Общие советы |
| Вкладка «Фото букета» + снимок с розами/лилиями | Vision → local / mixed |

В UI отображается badge источника и уровня риска.

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
