# TextyNaZakaz2026

Минимальный сайт и Telegram-бот для приёма заявок на подготовку текстов.

## Что уже добавлено
- Главная страница с услугами и стартовыми ценами.
- Telegram-меню: услуги, цены, инструкция, оформление заявки и отдельное уведомление о данных (`/privacy`).
- Пересылка заявки администратору через Telegram, если задан `ADMIN_CHAT_ID`.
- Проверка обязательной настройки токена бота.
- Команда `/privacy` и предупреждение перед заказом: какие данные заявки передаются администратору Telegram.
- Портфолио с демонстрационными примерами (они не выдаются за оплаченные клиентские работы).

## Портфолио
- [Русские примеры текстов](portfolio.md)
- [English writing samples](portfolio-en.md)
- [Russian language quality-review demo](portfolio-ai-language-review-ru.md) — синтетический пример проверки ответов, созданный с AI-помощью; не реальная клиентская разметка.
- [Bilingual product listing demo](portfolio-product-description-demo-en-ru.md) — fictional English/Russian product copy with a fact-check checklist; not client work.
- [Russian Gmail/email AI quality-review demo](portfolio-gmail-ai-evaluation-demo-ru.md) — synthetic business-email review; no personal mailbox data was accessed and this is not client work.
- [App localization QA demo](portfolio-app-localization-qa-demo.md) — synthetic English-to-Russian UI proofreading example; AI-assisted, not paid client work or a human-only translation test.
- [Russian proofreading QA checklist](portfolio-proofreading-qa-checklist-ru.md) — AI-assisted process template, not a human-only proofreading sample or client work.
- [Russian speech evaluation template](portfolio-russian-speech-evaluation-template.md) — synthetic evaluation worksheet; no real audio was recorded or assessed.
- [Marketplace listing demo EN/RU](portfolio-marketplace-listing-demo-en-ru.md) — fictional eBay/Facebook Marketplace listing and fact-check checklist; not a real seller listing or client work.

## Поиск заказов и учёт
- [Ежедневный поиск международных заказов — 25 ноября 2026](leads/2026-11-25-research.md)
- [Ежедневный поиск международных заказов — 24 ноября 2026](leads/2026-11-24-research.md)
- [Ежедневный поиск международных заказов — 23 ноября 2026](leads/2026-11-23-research.md)
- [Ежедневный поиск международных заказов — 22 ноября 2026](leads/2026-11-22-research.md)
- [Ежедневный поиск международных заказов — 21 ноября 2026](leads/2026-11-21-research.md)
- Страница [панели учёта](dashboard.html) отдельно отмечает найденные лиды, подготовленные и отправленные отклики, ответы, согласованные условия, работу, выполненные и оплаченные заказы. Выручка считается только по статусу «Оплачено»; суммы можно записывать отдельно в RUB, USD, EUR и GBP без смешивания валют и без автоматической конвертации. Старые записи без поля currency считаются рублёвыми.
- Панель принимает только ссылки `http://` и `https://`; экспорт CSV защищён от формул электронных таблиц. Логика вынесена в `dashboard-utils.js` и покрыта тестами.

**Ограничение:** записи панели сохраняются только в локальном хранилище браузера на одном устройстве. Это не общая база, не резервная копия и не синхронизация с Telegram. Не заносите туда пароли, платёжные реквизиты или другие секреты.

## Настройка Vercel
Добавить переменные окружения для Production (и Preview при необходимости):
- `BOT_TOKEN` — токен Telegram-бота от BotFather.
- `WEBHOOK_SECRET` — случайная секретная строка (1–256 символов) для проверки заголовка Telegram webhook.
- `ADMIN_CHAT_ID` — числовой chat ID администратора или ID закрытой группы, куда пересылать заявки.

После добавления переменных выполнить повторное Production-развёртывание и установить Telegram webhook на адрес:
`https://<домен-проекта>/api/webhook`

Webhook нужно установить запросом к Telegram Bot API `setWebhook`, передав тот же `WEBHOOK_SECRET` как параметр `secret_token`. Токен и секрет использовать только в защищённой среде. Не публиковать токен в репозитории и не отправлять его в чат.

## Текущие ограничения — повторно проверено 25 ноября 2026
- Без `BOT_TOKEN` бот не может отвечать.
- Без `ADMIN_CHAT_ID` бот не пересылает заявки и честно сообщает, что приём ещё не подключён.
- Хранилище заказов и онлайн-оплата пока не подключены; не сообщать клиенту, что заявка принята, если пересылка не удалась.
- Цены на странице — стартовое предложение, окончательную стоимость нужно согласовать до выполнения заказа.
- В `api/webhook.js` обработчик ошибок сейчас возвращает HTTP 200 даже при сбое отправки в Telegram. Поэтому Telegram не повторит доставку автоматически. Перед production-запуском нужно подключить постоянное хранилище для идемпотентной обработки `update_id`, затем настроить корректные ответы при ошибках; без этого простое изменение кода может привести к дублированию уведомлений.
- Команда Vercel называется `TextyNaZakaz2026`, её фактический slug — `texty-na-zakaz2026`. 24 ноября подтверждена роль владельца команды (`OWNER`), но список проектов и развёртываний по-прежнему пуст. Вызов `create_git_project` с явным team ID вернул `403 forbidden` из-за отсутствия разрешения на создание проекта у текущего подключения. Это не означает, что владельцу команды нужно менять роль; вероятная область проверки — авторизация/права Vercel-подключения. Production URL не подтверждён.
- GitHub Actions workflow `.github/workflows/validate.yml` запускает `npm test` и проверяет наличие главных страниц. 24 ноября исправлена синтаксическая ошибка в `test/webhook.test.js`; после этого runs #41–44 завершились успешно. Добавлены два регрессионных теста: честное сообщение клиенту при отсутствии `ADMIN_CHAT_ID` и порядок пересылки заявки администратору до подтверждения клиенту. Новые runs `45347637805` и `45347641695` завершились успешно. 24 ноября workflow обновлён до `actions/checkout@v7` и `actions/setup-node@v7` с Node.js 24; run `45348216522` завершился успешно без прежнего предупреждения о Node.js 20. Успешный CI подтверждает только тесты репозитория, но не работу Telegram или Production-сайта.
- Telegram не подключён к доступному инструменту проверки в текущем запуске; живой webhook и пересылка заявок не проверены.

## Локальная структура
- `index.html` — посадочная страница.
- `api/webhook.js` — Telegram webhook.
- `dashboard-utils.js` — проверка ссылок и безопасный экспорт CSV.
- `package.json` — метаданные проекта.
