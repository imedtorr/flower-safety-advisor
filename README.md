# Flower Safety Advisor

Веб-приложение на TypeScript + LangGraph: советник по безопасности цветов (пионы, розы, герберы и др.) для домашних кошек и собак.

## Архитектура

```
Пользователь → React UI → Express API → LangGraph
  normalize → localDb → externalApi → tavily → fallback → composeAnswer (GigaChat)
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
- Ключ [GigaChat](https://developers.sber.ru/docs/ru/gigachat)
- Ключ [Tavily](https://tavily.com/)

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

В UI отображается badge источника и уровня риска.

## Структура

- `server/` — Express + LangGraph + GigaChat
- `client/` — React + Vite + Tailwind (пастельная тема)
- `data/flowers.json` — локальная база

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| `GIGACHAT_CREDENTIALS` | Authorization key GigaChat |
| `TAVILY_API_KEY` | API key Tavily |
| `PORT` | Порт API (по умолчанию 3001) |
