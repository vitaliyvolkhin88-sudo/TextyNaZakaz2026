
const TOKEN = process.env.BOT_TOKEN;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(200).send("Bot is running");
  }

  const message = req.body?.message;
  if (!message) {
    return res.status(200).send("OK");
  }

  const chatId = message.chat.id;
  const text = message.text || "";

  let reply = "Привет! Бот TextyNaZakaz2026 работает.";

  if (text === "/start") {
    reply = "Добро пожаловать! Бот запущен.";
  }

  const response = await fetch(
    `https://api.telegram.org/bot${TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: reply
      })
    }
  );

  return res.status(200).send("OK");
};
