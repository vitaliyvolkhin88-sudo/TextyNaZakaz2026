const TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const API = TOKEN ? `https://api.telegram.org/bot${TOKEN}` : null;

async function telegram(method, payload) {
  if (!API) throw new Error("BOT_TOKEN is not configured");
  const response = await fetch(`${API}/${method}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.description || `Telegram API error: ${response.status}`);
  return data.result;
}
async function send(chatId, text, reply_markup) {
  return telegram("sendMessage", { chat_id: chatId, text, ...(reply_markup ? { reply_markup } : {}) });
}
const menu = { inline_keyboard: [
  [{ text: "📝 Заказать текст", callback_data: "order" }],
  [{ text: "💼 Услуги и цены", callback_data: "services" }],
  [{ text: "ℹ️ Как это работает", callback_data: "help" }]
]};
const services = "Наши услуги:\n\n• Короткий пост или объявление — от 300 ₽\n• Описание товара или услуги — от 500 ₽\n• Рекламный текст — от 700 ₽\n\nИтоговая цена зависит от объёма и задачи. До начала работы согласуем стоимость.";
const orderPrompt = "Чтобы оформить заявку, отправьте одним сообщением:\n\n1. Какой текст нужен?\n2. Тема и цель текста\n3. Желаемый объём\n4. Срок выполнения\n5. Ваш контакт для ответа (если отличается от Telegram).\n\nНе отправляйте пароли и платёжные данные.";
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(200).send("TextyNaZakaz bot endpoint is active");
  if (!TOKEN || !WEBHOOK_SECRET) return res.status(503).send("Bot configuration is incomplete");
  const suppliedSecret = req.headers?.["x-telegram-bot-api-secret-token"];
  if (suppliedSecret !== WEBHOOK_SECRET) return res.status(401).send("Unauthorized");
  try {
    const update = req.body || {};
    if (update.callback_query) {
      const q = update.callback_query, chatId = q.message?.chat?.id;
      await telegram("answerCallbackQuery", { callback_query_id: q.id });
      if (chatId && q.data === "services") await send(chatId, services, menu);
      else if (chatId && q.data === "help") await send(chatId, "Вы выбираете услугу и описываете задачу одним сообщением. Детали, цену и срок согласуем до начала работы.", menu);
      else if (chatId && q.data === "order") await send(chatId, orderPrompt);
      return res.status(200).send("OK");
    }
    const message = update.message;
    if (!message?.chat?.id) return res.status(200).send("OK");
    const chatId = message.chat.id, text = (message.text || "").trim();
    const name = [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ") || "Без имени";
    const username = message.from?.username ? `@${message.from.username}` : "не указан";
    if (text === "/start" || text === "/menu") await send(chatId, "Здравствуйте! Это TextyNaZakaz — помогаем подготовить посты, объявления и рекламные тексты. Выберите, что вас интересует:", menu);
    else if (text === "/services") await send(chatId, services, menu);
    else if (text === "/order") await send(chatId, orderPrompt);
    else if (text === "/help") await send(chatId, "Команды: /start — меню, /services — услуги и цены, /order — оставить заявку.");
    else if (text.startsWith("/")) await send(chatId, "Не знаю такую команду. Откройте /start, чтобы увидеть меню.");
    else if (text) {
      if (!ADMIN_CHAT_ID) {
        await send(chatId, "Спасибо! Приём заявок временно не подключён: канал получения заказов ещё не настроен. Пожалуйста, попробуйте позже.");
      } else {
        await send(ADMIN_CHAT_ID, "📩 Новая заявка TextyNaZakaz\n\nКлиент: " + name + "\nTelegram: " + username + "\nChat ID: " + chatId + "\n\nЗадача:\n" + text);
        await send(chatId, "Спасибо! Заявка передана. Мы свяжемся с вами в Telegram после уточнения задачи и стоимости.", menu);
      }
    } else await send(chatId, "Пожалуйста, отправьте описание задачи текстом или выберите пункт меню.", menu);
    return res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(200).send("OK");
  }
};
