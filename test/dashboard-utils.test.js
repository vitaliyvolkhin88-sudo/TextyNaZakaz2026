const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeHttpUrl, csvCell, toCsv } = require("../dashboard-utils.js");

test("only HTTP and HTTPS links are accepted", () => {
  assert.equal(normalizeHttpUrl("https://example.com/path"), "https://example.com/path");
  assert.equal(normalizeHttpUrl("http://example.com"), "http://example.com/");
  assert.equal(normalizeHttpUrl("javascript:alert(1)"), "");
  assert.equal(normalizeHttpUrl("data:text/html,test"), "");
  assert.equal(normalizeHttpUrl("not a URL"), "");
  assert.equal(normalizeHttpUrl(""), "");
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
