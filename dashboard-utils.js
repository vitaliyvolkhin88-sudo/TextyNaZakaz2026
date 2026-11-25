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

  const api = {
    normalizeHttpUrl,
    normalizeCurrency,
    formatMoney,
    totalsByCurrency,
    formatCurrencyTotals,
    csvCell,
    toCsv
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.TextyDashboardUtils = api;
})();
