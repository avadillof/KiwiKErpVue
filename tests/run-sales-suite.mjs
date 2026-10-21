import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('../', import.meta.url));
// Every HTTP request in these checks uses an isolated adapter. No real documents are issued.
const groups = [
  ['Emisión, factura manual y expediente', ['--test', 'tests/invoice-issue-flow.test.mjs', 'tests/manual-invoice-dialog.test.mjs', 'tests/aeat-cases.test.mjs']],
  ['Tarifas, cantidades y respuestas concurrentes', ['tests/sales-pricing-state.check.mjs']],
];
let failed = false;
for (const [name, args] of groups) {
  console.log(`\n${name}`);
  const result = spawnSync(process.execPath, args, { cwd, stdio: 'inherit' });
  if (result.error) console.error(result.error.message);
  if (result.status !== 0) failed = true;
}
console.log('\nLa suite aislada no verifica presupuesto → pedido → albarán → factura contra la BD.');
process.exitCode = failed ? 1 : 0;
