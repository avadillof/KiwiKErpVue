import assert from "node:assert/strict";
import test from "node:test";
import { aiSettingsError } from "../src/services/Frm_Ajustes/aiSettingsErrors.ts";

test("preserves the backend credit diagnostic in text and structured errors", () => {
  const message = "OpenAI no tiene saldo API disponible (429).";
  for (const data of [
    message,
    { message },
    { detail: message },
    { reason: message },
    JSON.stringify({ message }),
  ]) {
    assert.equal(aiSettingsError({ response: { status: 502, data } }), message);
  }
});

test("identifies exhausted credits without treating every 429 as a billing failure", () => {
  assert.match(
    aiSettingsError({
      response: {
        status: 502,
        data: { error: { code: "credit_balance_exhausted" } },
      },
    }),
    /no tiene saldo API/,
  );
  assert.match(
    aiSettingsError({ response: { status: 429, data: {} } }),
    /limitado las solicitudes/,
  );
});

test("unrelated failures do not suggest V26 or invent exhausted credits", () => {
  for (const error of [
    {},
    { code: "ECONNABORTED" },
    { response: { status: 502, data: "<html>Gateway error</html>" } },
    { response: { status: 500, data: {} } },
  ]) {
    assert.doesNotMatch(aiSettingsError(error), /V26|migración|saldo/);
  }
  assert.match(aiSettingsError({ response: { status: 401 } }), /sesión/);
});
