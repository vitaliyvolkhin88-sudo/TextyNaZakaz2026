# TextyNaZakaz2026

Минимальный сайт и Telegram-бот для приёма заявок на подготовку текстов.

## Что уже добавлено
- Главная страница с услугами и стартовыми ценами.
- Telegram-меню: услуги, цены, инструкция, оформление заявки и отдельное уведомление о данных (/privacy).
- Пересылка заявки администратору через Telegram, если задан ADMIN_CHAT_ID.
- Проверка обязательной настройки токена бота.
- Входящие заявки ограничены 2500 символами; более длинные сообщения отклоняются до пересылки администратору.
- Команда /privacy и предупреждение перед заказом: какие данные заявки передаются администратору Telegram.
- Портфолио с демонстрационными примерами (они не выдаются за оплаченные клиентские работы).

## Портфолио
- [Russian cybersecurity guide sample](portfolio-cybersecurity-guide-demo-ru.md) — AI-assisted educational sample with NCSC source links; not client work.
- [Jiomart / Meesho product-copy demo](portfolio-jiomart-product-copy-demo-en.md) — fictional marketplace listing and fact-check checklist; not client work.
- [Русские примеры текстов](portfolio.md)
- [English writing samples](portfolio-en.md)
- [Russian language quality-review demo](portfolio-ai-language-review-ru.md) — синтетический пример проверки ответов, созданный с AI-помощью; не реальная клиентская разметка.
- [Bilingual product listing demo](portfolio-product-description-demo-en-ru.md) — fictional English/Russian product copy with a fact-check checklist; not client work.
- [Russian Gmail/email AI quality-review demo](portfolio-gmail-ai-evaluation-demo-ru.md) — synthetic business-email review; no personal mailbox data was accessed and this is not client work.
- [App localization QA demo](portfolio-app-localization-qa-demo.md) — synthetic English-to-Russian UI proofreading example; AI-assisted, not paid client work or a human-only translation test.
- [Russian proofreading QA checklist](portfolio-proofreading-qa-checklist-ru.md) — AI-assisted process template, not a human-only proofreading sample or client work.
- [Russian speech evaluation template](portfolio-russian-speech-evaluation-template.md) — synthetic evaluation worksheet; no real audio was recorded or assessed.
- [Marketplace listing demo EN/RU](portfolio-marketplace-listing-demo-en-ru.md) — fictional eBay/Facebook Marketplace listing and fact-check checklist; not a real seller listing or client work.
- [Product data preparation how-to demo](portfolio-product-data-howto-demo-en.md) — synthetic beginner guide for organizing product facts and QA; not client work.
- [Russian audio quality-review demo](portfolio-audio-quality-review-demo-ru.md) — synthetic text-only worksheet; no real audio was recorded or assessed.

## Поиск заказов и учёт
- [Ежедневный поиск международных заказов — 28 ноября 2026](leads/2026-11-28-research.md)
- [Проверка новых вакансий и интеграций — 28 ноября 2026](leads/2026-11-28-verification-update.md)
- [Ежедневный поиск международных заказов — 27 ноября 2026](leads/2026-11-27-research.md)
- [Уточнение вакансий и интеграций — 27 ноября 2026](leads/2026-11-27-verification-update.md)
- [Ежедневный поиск международных заказов — 26 ноября 2026](leads/2026-11-26-research.md)
- [Ежедневный поиск международных заказов — 25 ноября 2026](leads/2026-11-25-research.md)
- [Ежедневный поиск международных заказов — 24 ноября 2026](leads/2026-11-24-research.md)
- [Ежедневный поиск международных заказов — 23 ноября 2026](leads/2026-11-23-research.md)
- [Ежедневный поиск международных заказов — 22 ноября 2026](leads/2026-11-22-research.md)
- [Ежедневный поиск международных заказов — 21 ноября 2026](leads/2026-11-21-research.md)
- Страница [панели учёта](dashboard.html) отдельно отмечает найденные лиды, подготовленные и отправленные отклики, ответы, согласованные условия, работу, выполненные и оплаченные заказы. Выручка считается только по статусу «Оплачено»; суммы можно записывать отдельно в RUB, USD, EUR и GBP без смешивания валют и без автоматической конвертации. Старые записи без поля currency считаются рублёвыми.
- Панель принимает только ссылки http:// и https://; экспорт CSV защищён от формул электронных таблиц. Логика вынесена в dashboard-utils.js и покрыта тестами, включая раздельные итоги по валютам.
- Чтение и запись localStorage валидируют каждую запись по той же схеме, что и JSON-восстановление; повреждённые записи не перезаписываются, а неизвестные поля не сохраняются.
- Добавлены резервное копирование панели в JSON и восстановление из JSON-файла с проверкой размера, структуры, статусов, валют, ссылок и повторяющихся ID. Восстановление заменяет текущий локальный список только после подтверждения; это не облачная синхронизация.

**Ограничение:** записи панели сохраняются только в локальном хранилище браузера на одном устройстве. Это не общая база, не резервная копия и не синхронизация с Telegram. Не заносите туда пароли, платёжные реквизиты или другие секреты.
**Защита панели:** noindex/nofollow не является авторизацией. В самом dashboard.html нет пароля; до Production нужно включить Vercel Deployment Protection или серверную авторизацию. Не хранить в панели конфиденциальные данные.

## Настройка Vercel
Добавить переменные окружения для Production (и Preview при необходимости):
- BOT_TOKEN — токен Telegram-бота от BotFather.
- WEBHOOK_SECRET — случайная секретная строка (1–256 символов) для проверки заголовка Telegram webhook.
- ADMIN_CHAT_ID — числовой chat ID администратора или ID закрытой группы, куда пересылать заявки.

После добавления переменных выполнить повторное Production-развёртывание и установить Telegram webhook на адрес:
https://<домен-проекта>/api/webhook

Webhook нужно установить запросом к Telegram Bot API setWebhook, передав тот же WEBHOOK_SECRET как параметр secret_token. Токен и секрет использовать только в защищённой среде. Не публиковать токен в репозитории и не отправлять его в чат.

## Текущие ограничения — повторно проверено 28 ноября 2026
- Без BOT_TOKEN бот не может отвечать.
- Без ADMIN_CHAT_ID бот не пересылает заявки и честно сообщает, что приём ещё не подключён.
- Хранилище заказов и онлайн-оплата пока не подключены; не сообщать клиенту, что заявка принята, если пересылка не удалась.
- Цены на странице — стартовое предложение, окончательную стоимость нужно согласовать до выполнения заказа.
- В api/webhook.js обработчик ошибок сейчас возвращает HTTP 200 даже при сбое отправки в Telegram. Поэтому Telegram не повторит доставку автоматически. Перед production-запуском нужно подключить постоянное хранилище для идемпотентной обработки update_id, затем настроить корректные ответы при ошибках; без этого простое изменение кода может привести к дублированию уведомлений.
- Команда Vercel называется TextyNaZakaz2026, её фактический slug — texty-na-zakaz-2026. Повторная проверка 28 ноября: запросы интеграции GET /v10/projects и GET /v7/deployments вернули 403 forbidden; поэтому текущий список проектов и развёртываний через подключение прочитать нельзя, а Production-сайт не подтверждён. Ранее проверка показывала 0 проектов и 0 развёртываний; не считать этот прошлый результат актуальным после отказа доступа. CLI fallback недоступен без известного project/session ID.
- GitHub Actions workflow .github/workflows/validate.yml запускает npm test и проверяет наличие главных страниц. Последний независимо подтверждённый успешный запуск — run ID 46092209983 от 28 ноября 2026 для HEAD 5e00ceb025a5b297b84835055f8787b231691d41: 20 тестов пройдены, 0 ошибок; также проверено наличие index.html, index-en.html и dashboard.html. CI не тестирует production-сайт и живой Telegram webhook.
- Telegram не подключён к доступному инструменту проверки в текущем запуске; живой webhook и пересылка заявок не проверены.

## Локальная структура
- index.html — посадочная страница.
- api/webhook.js — Telegram webhook.
- dashboard-utils.js — проверка ссылок, безопасный экспорт CSV и раздельные итоги по валютам.
- package.json — метаданные проекта.
