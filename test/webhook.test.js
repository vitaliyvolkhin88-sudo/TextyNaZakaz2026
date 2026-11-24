const test = require("node:test");
const assert = require("node:assert/strict");

const webhookPath = require.resolve("../api/webhook.js");

function loadHandler(env = {}) {
  const keys = ["BOT_TOKEN", "ADMIN_CHAT_ID", "WEBHOOK_SECRET"];
  const previous = new Map(keys.map((key) => [key, process.env[key]]));

  for (const key of keys) {
    if (Object.hasOwn(env, key)) process.env[key] = env[key];
    else delete process.env[key];
  }

  delete require.cache[webhookPath];
  const handler = require(webhookPath);

  for (const key of keys) {
    const value = previous.get(key);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }

  return handler;
}

function response() {
  return {
    statusCode: 0,
    body: "",
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    }
  };
}

async function withTelegramMock(run) {
  const previousFetch = global.fetch;
  const calls = [];
  global.fetch = async (_url, options) => {
    calls.push(JSON.parse(options.body));
    return {
      ok: true,
      async json() {
        return { ok: true, result: { message_id: calls.length } };
      }
    };
  };
  try {
    await run(calls);
  } finally {
    global.fetch = previousFetch;
  }
}

test("GET reports endpoint status without requiring bot secrets", async () => {
  const handler = loadHandler();
  const res = response();

  await handler({ method: "GET", headers: {} }, res);

  assert.equal(res.statusCode, 200);
  assert.match(res.body, /endpoint is active/i);
});

test("POST refuses incomplete bot configuration", async () => {
  const handler = loadHandler({ BOT_TOKEN: "test-token-only" });
  const res = response();

  await handler({ method: "POST", headers: {}, body: {} }, res);

  assert.equal(res.statusCode, 503);
  assert.match(res.body, /configuration is incomplete/i);
});

test("POST rejects an incorrect Telegram webhook secret", async () => {
  const handler = loadHandler({
    BOT_TOKEN: "test-token-not-a-real-credential",
    WEBHOOK_SECRET: "test-secret"
  });
  const res = response();

  await handler({
    method: "POST",
    headers: { "x-telegram-bot-api-secret-token": "wrong-secret" },
    body: { message: { text: "test" } }
  }, res);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body, "Unauthorized");
});

test("POST rejects a missing Telegram webhook secret header", async () => {
  const handler = loadHandler({
    BOT_TOKEN: "test-token-not-a-real-credential",
    WEBHOOK_SECRET: "test-secret"
  });
  const res = response();

  await handler({ method: "POST", headers: {}, body: {} }, res);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body, "Unauthorized");
});

test("privacy command explains what data is forwarded to the administrator", async () => {
  const handler = loadHandler({
    BOT_TOKEN: "test-token-not-a-real-credential",
    ADMIN_CHAT_ID: "123",
    WEBHOOK_SECRET: "test-secret"
  });
  const res = response();

  await withTelegramMock(async (calls) => {
    await handler({
      method: "POST",
      headers: { "x-telegram-bot-api-secret-token": "test-secret" },
      body: { message: { chat: { id: 42 }, text: "/privacy" } }
    }, res);

    assert.equal(calls.length, 1);
    assert.match(calls[0].text, /текст вашего сообщения/i);
    assert.match(calls[0].text, /Telegram chat ID/i);
    assert.match(calls[0].text, /отдельная база заявок пока не подключена/i);
  });

  assert.equal(res.statusCode, 200);
});

test("order prompt includes a concise data-use notice", async () => {
  const handler = loadHandler({
    BOT_TOKEN: "test-token-not-a-real-credential",
    ADMIN_CHAT_ID: "123",
    WEBHOOK_SECRET: "test-secret"
  });
  const res = response();

  await withTelegramMock(async (calls) => {
    await handler({
      method: "POST",
      headers: { "x-telegram-bot-api-secret-token": "test-secret" },
      body: { message: { chat: { id: 42 }, text: "/order" } }
    }, res);

    assert.equal(calls.length, 1);
    assert.match(calls[0].text, /если приём заявок включён/i);
    assert.match(calls[0].text, /\\/privacy/);
    assert.match(calls[0].text, /пароли/i);
  });

  assert.equal(res.statusCode, 200);
});
