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
