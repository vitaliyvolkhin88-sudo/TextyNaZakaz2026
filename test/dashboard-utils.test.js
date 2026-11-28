const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeHttpUrl,
  normalizeCurrency,
  formatMoney,
  totalsByCurrency,
  formatCurrencyTotals,
  csvCell,
  toCsv,
  parseOrdersJson,
  serializeOrdersJson,
  readOrdersStorage,
  writeOrdersStorage
} = require("../dashboard-utils.js");

test("only HTTP and HTTPS links are accepted", () => {
  assert.equal(normalizeHttpUrl("https://example.com/path"), "https://example.com/path");
  assert.equal(normalizeHttpUrl("http://example.com"), "http://example.com/");
  assert.equal(normalizeHttpUrl("javascript:alert(1)"), "");
  assert.equal(normalizeHttpUrl("data:text/html,test"), "");
  assert.equal(normalizeHttpUrl("not a URL"), "");
  assert.equal(normalizeHttpUrl(""), "");
});

test("supported currencies are normalized and unknown currencies fall back to RUB", () => {
  assert.equal(normalizeCurrency("usd"), "USD");
  assert.equal(normalizeCurrency("EUR"), "EUR");
  assert.equal(normalizeCurrency(undefined), "RUB");
  assert.equal(normalizeCurrency("BTC"), "RUB");
  assert.match(formatMoney(10, "USD"), /10/);
});

test("income totals remain separated by currency and legacy records default to RUB", () => {
  const orders = [
    { status: "paid", amount: 20, currency: "USD" },
    { status: "paid", amount: 15, currency: "EUR" },
    { status: "paid", amount: 300 },
    { status: "done", amount: 50, currency: "USD" },
    { status: "paid", amount: -5, currency: "GBP" },
    { status: "paid", amount: "not-a-number", currency: "GBP" }
  ];
  assert.deepEqual(totalsByCurrency(orders, "paid"), { USD: 20, EUR: 15, RUB: 300 });
  assert.deepEqual(totalsByCurrency(orders, "done"), { USD: 50 });
  assert.ok(formatCurrencyTotals(orders, "paid").includes("$"));
  assert.ok(formatCurrencyTotals(orders, "paid").includes("€"));
});

test("CSV cells quote delimiters and embedded quotes", () => {
  assert.equal(csvCell('text; with "quotes"'), '"text; with ""quotes"""');
});

test("CSV export neutralizes spreadsheet formulas after leading whitespace or controls", () => {
  assert.equal(csvCell("=1+1"), '"\'=1+1"');
  assert.equal(csvCell("  @SUM(A1:A2)"), '"\'  @SUM(A1:A2)"');
  assert.equal(csvCell("\t+cmd"), '"\'\t+cmd"');
  assert.equal(csvCell("-42"), '"\'-42"');
});

test("CSV output keeps UTF-8 BOM and CRLF rows", () => {
  assert.equal(toCsv([["Имя", "Задача"], ["=1+1", "Обычный текст"]]),
    '\uFEFF"Имя";"Задача"\r\n"\'=1+1";"Обычный текст"');
});


test("JSON backup round-trips valid orders and keeps legacy records in RUB", () => {
  const source = [
    { id: "eur-1", client: "Client", task: "Proofread", amount: 12.5, currency: "EUR", status: "paid", url: "https://example.com", created: "2026-11-25T08:00:00+01:00", privateField: "must not export" },
    { id: "old-1", client: "Legacy", task: "", amount: 300, status: "found", url: "", created: "2026-11-25T07:00:00.000Z" }
  ];
  const backup = serializeOrdersJson(source);
  const restored = parseOrdersJson(backup);
  assert.deepEqual(restored, [
    { id: "eur-1", client: "Client", task: "Proofread", amount: 12.5, currency: "EUR", status: "paid", url: "https://example.com/", created: "2026-11-25T07:00:00.000Z" },
    { id: "old-1", client: "Legacy", task: "", amount: 300, currency: "RUB", status: "found", url: "", created: "2026-11-25T07:00:00.000Z" }
  ]);
  assert.doesNotMatch(backup, /must not export/);
});

test("JSON restore rejects malformed records and unsafe links", () => {
  const base = { id: "1", client: "Client", task: "", amount: 10, currency: "RUB", status: "found", url: "", created: "2026-11-25T07:00:00.000Z" };
  assert.throws(() => parseOrdersJson("not json"), /valid JSON/);
  assert.throws(() => parseOrdersJson(JSON.stringify([{ ...base, url: "javascript:alert(1)" }])), /HTTP or HTTPS/);
  assert.throws(() => parseOrdersJson(JSON.stringify([{ ...base, status: "unknown" }])), /unknown status/);
  assert.throws(() => parseOrdersJson(JSON.stringify([{ ...base, amount: -1 }])), /non-negative/);
  assert.throws(() => parseOrdersJson(JSON.stringify([{ ...base, currency: "BTC" }])), /unsupported currency/);
});

test("JSON restore rejects duplicate IDs, oversized backups, and non-array roots", () => {
  const order = { id: "same", client: "Client", task: "", amount: 10, status: "found", url: "", created: "2026-11-25T07:00:00.000Z" };
  assert.throws(() => parseOrdersJson(JSON.stringify([order, order])), /duplicate ID/);
  assert.throws(() => parseOrdersJson(" ".repeat(1_000_001)), /larger than 1 MB/);
  assert.throws(() => parseOrdersJson(JSON.stringify({ orders: [order] })), /array of orders/);
});


test("dashboard storage loads empty and validates stored orders", () => {
  const empty = readOrdersStorage({ getItem: () => null }, "orders");
  assert.deepEqual(empty, { ok: true, orders: [] });

  const saved = [{
    id: "one", client: "Client", task: "Proofread", amount: 300,
    currency: "EUR", status: "found", url: "",
    created: "2026-11-25T07:00:00.000Z"
  }];
  const loaded = readOrdersStorage({ getItem: () => JSON.stringify(saved) }, "orders");
  assert.deepEqual(loaded, { ok: true, orders: saved });

  const legacy = { ...saved[0], id: "legacy" };
  delete legacy.currency;
  const legacyLoaded = readOrdersStorage({ getItem: () => JSON.stringify([legacy]) }, "orders");
  assert.deepEqual(legacyLoaded, {
    ok: true,
    orders: [{ ...legacy, currency: "RUB" }]
  });
});

test("dashboard storage reports invalid data and catches browser storage failures", () => {
  assert.deepEqual(
    readOrdersStorage({ getItem: () => "{broken" }, "orders"),
    { ok: false, orders: [], reason: "invalid-data" }
  );
  assert.deepEqual(
    readOrdersStorage({ getItem: () => JSON.stringify({ orders: [] }) }, "orders"),
    { ok: false, orders: [], reason: "invalid-data" }
  );
  assert.deepEqual(readOrdersStorage(null, "orders"), {
    ok: false, orders: [], reason: "read-failed"
  });
  assert.deepEqual(readOrdersStorage({
    getItem() { throw new Error("storage blocked"); }
  }, "orders"), { ok: false, orders: [], reason: "read-failed" });

  const validOrder = {
    id: "write-1", client: "Client", task: "Proofread", amount: 300,
    status: "found", url: "", created: "2026-11-25T07:00:00.000Z",
    privateField: "must not persist"
  };
  assert.deepEqual(writeOrdersStorage({
    setItem() { throw new Error("quota exceeded"); }
  }, "orders", [validOrder]), { ok: false });

  const persisted = {};
  assert.deepEqual(writeOrdersStorage({
    setItem(key, value) { persisted.key = key; persisted.value = value; }
  }, "orders", [validOrder]), { ok: true });
  assert.deepEqual(JSON.parse(persisted.value), [{
    id: "write-1", client: "Client", task: "Proofread", amount: 300,
    currency: "RUB", status: "found", url: "",
    created: "2026-11-25T07:00:00.000Z"
  }]);
});

test("dashboard storage rejects malformed records and does not persist them", () => {
  const valid = {
    id: "valid-1", client: "Client", task: "", amount: 10,
    currency: "RUB", status: "found", url: "",
    created: "2026-11-25T07:00:00.000Z"
  };
  const invalidRecords = [
    null,
    { ...valid, amount: -1 },
    { ...valid, status: "unknown" },
    { ...valid, url: "javascript:alert(1)" }
  ];

  for (const record of invalidRecords) {
    assert.deepEqual(
      readOrdersStorage({ getItem: () => JSON.stringify([record]) }, "orders"),
      { ok: false, orders: [], reason: "invalid-data" }
    );
  }

  let writes = 0;
  assert.deepEqual(writeOrdersStorage({
    setItem() { writes += 1; }
  }, "orders", [null]), { ok: false });
  assert.equal(writes, 0);
});
