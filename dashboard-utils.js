"use strict";

(function () {
  const CURRENCIES = Object.freeze(["RUB", "USD", "EUR", "GBP"]);

  function normalizeHttpUrl(value) {
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    try {
      const parsed = new URL(raw);
      return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : "";
    } catch {
      return "";
    }
  }

  function normalizeCurrency(value) {
    const code = String(value || "RUB").toUpperCase();
    return CURRENCIES.includes(code) ? code : "RUB";
  }

  function formatMoney(amount, currency = "RUB", locale = "ru-RU") {
    const value = Number(amount);
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: normalizeCurrency(currency),
      maximumFractionDigits: 2
    }).format(Number.isFinite(value) ? value : 0);
  }

  function totalsByCurrency(orders, status) {
    const totals = {};
    for (const order of Array.isArray(orders) ? orders : []) {
      if (status && order.status !== status) continue;
      const currency = normalizeCurrency(order.currency);
      const amount = Number(order.amount);
      if (!Number.isFinite(amount) || amount < 0) continue;
      totals[currency] = (totals[currency] || 0) + amount;
    }
    return totals;
  }

  function formatCurrencyTotals(orders, status, locale = "ru-RU") {
    const entries = Object.entries(totalsByCurrency(orders, status))
      .sort(([left], [right]) => left.localeCompare(right));
    return entries.length
      ? entries.map(([currency, amount]) => formatMoney(amount, currency, locale)).join(" · ")
      : formatMoney(0, "RUB", locale);
  }

  function csvCell(value) {
    const raw = String(value ?? "");
    const safe = /^[\u0000-\u0020]*[=+\-@]/.test(raw) ? "'" + raw : raw;
    return '"' + safe.replaceAll('"', '""') + '"';
  }

  function toCsv(rows) {
    return "\uFEFF" + rows.map((row) => row.map(csvCell).join(";")).join("\r\n");
  }

  const ORDER_STATUSES = Object.freeze([
    "found", "prepared", "sent", "replied", "contracted", "active", "done", "paid"
  ]);

  function parseOrdersJson(raw) {
    if (typeof raw !== "string") throw new Error("Backup must be a text file");
    if (raw.length > 1_000_000) throw new Error("Backup file is larger than 1 MB");
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Backup is not valid JSON");
    }
    if (!Array.isArray(parsed)) throw new Error("Backup must contain an array of orders");
    if (parsed.length > 5000) throw new Error("Backup contains more than 5000 orders");

    const ids = new Set();
    return parsed.map((order, index) => {
      const fail = (reason) => { throw new Error(`Order ${index + 1}: ${reason}`); };
      if (!order || typeof order !== "object" || Array.isArray(order)) fail("invalid record");
      if (typeof order.id !== "string" || !order.id.trim() || order.id.length > 100) fail("invalid ID");
      if (ids.has(order.id)) fail("duplicate ID");
      ids.add(order.id);
      if (typeof order.client !== "string") fail("client name is missing");
      const client = order.client.trim();
      if (!client || client.length > 120) fail("client name must contain 1–120 characters");
      const task = order.task == null ? "" : order.task;
      if (typeof task !== "string" || task.length > 1000) fail("task must be text up to 1000 characters");
      if (order.amount == null || String(order.amount).trim() === "") fail("amount is missing");
      if (typeof order.amount !== "number" && typeof order.amount !== "string") fail("invalid amount");
      const amount = Number(order.amount);
      if (!Number.isFinite(amount) || amount < 0) fail("amount must be a non-negative number");
      const currency = order.currency == null ? "RUB" : String(order.currency).toUpperCase();
      if (!CURRENCIES.includes(currency)) fail("unsupported currency");
      if (typeof order.status !== "string" || !ORDER_STATUSES.includes(order.status)) fail("unknown status");
      if (typeof order.created !== "string" || !Number.isFinite(Date.parse(order.created))) fail("invalid creation date");
      const rawUrl = order.url == null ? "" : order.url;
      if (typeof rawUrl !== "string") fail("invalid link");
      const url = normalizeHttpUrl(rawUrl);
      if (rawUrl.trim() && !url) fail("link must use HTTP or HTTPS");
      return {
        id: order.id,
        client,
        task,
        amount,
        currency,
        status: order.status,
        url,
        created: new Date(order.created).toISOString()
      };
    });
  }

  function serializeOrdersJson(orders) {
    const raw = JSON.stringify(orders);
    if (typeof raw !== "string") throw new Error("Orders cannot be serialized");
    return JSON.stringify(parseOrdersJson(raw), null, 2);
  }

  const api = {
    normalizeHttpUrl,
    normalizeCurrency,
    formatMoney,
    totalsByCurrency,
    formatCurrencyTotals,
    csvCell,
    toCsv,
    parseOrdersJson,
    serializeOrdersJson
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.TextyDashboardUtils = api;
})();
