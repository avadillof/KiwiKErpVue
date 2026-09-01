import fs from 'node:fs';import assert from 'node:assert/strict';
const base='C:/Proyectos/KiwiKERP/K_ERP_FREELANDSITE/';
const v23=fs.readFileSync(base+'BackUpBBDD/sql/V23_20260831_invoice_due_reminders.sql','utf8');
const v24=fs.readFileSync(base+'BackUpBBDD/sql/V24_20260831_invoice_reminder_relations.sql','utf8');
const sql=v23+'\n'+v24;
const fks=[...v24.matchAll(/CONSTRAINT (FK_[A-Z_]+) FOREIGN KEY\(([^)]+)\) REFERENCES (`?\w+`?)\(([^)]+)\) ON DELETE RESTRICT ON UPDATE RESTRICT/g)];
assert.equal(fks.length,8);
assert.equal(fks.filter(f=>f[3]==='`user`').length,3);
assert.ok(fks.some(f=>f[2]==='SALES_INVOICE_DUES_KY_ID,SALES_INVOICES_KY_ID'&&f[4]==='SALES_INVOICE_DUES_PK_ID,SALES_INVOICES_KY_ID'));
assert.ok(v24.includes('ADD UNIQUE KEY UK_SALES_INVOICE_DUE_ID_INVOICE(SALES_INVOICE_DUES_PK_ID,SALES_INVOICES_KY_ID)'));
assert.ok(!/ON (?:DELETE|UPDATE) CASCADE/i.test(v24));
assert.ok(!/SET\s+(?:@@)?FOREIGN_KEY_CHECKS\s*=\s*0/i.test(v24));
assert.ok(v24.indexOf('destinatario huérfano')<v24.indexOf('CREATE TABLE sales_invoice_reminder_recipients'));
assert.ok(v24.indexOf('factura huérfana')<v24.indexOf('CREATE TABLE sales_invoice_reminder_recipients'));
assert.ok(v24.includes('IF v_n<>1 THEN SET v_actor_id=NULL;'));
assert.ok(v24.includes('IF v_n<>1 THEN SET v_recipient_id=NULL;'));
assert.ok(!/DROP COLUMN|DROP TABLE\s/i.test(v24));
assert.ok(v24.includes('CHARACTER SET '));assert.ok(v24.includes('v_collation'));
assert.ok(v24.includes('v_total_details AS DETALLES'));
for(const entity of ['Settings','Dispatch','Recipient','Detail']){
 const java=fs.readFileSync(base+'src/main/java/com/freelandsite/api/jpa/SalesInvoiceReminder'+entity+'.java','utf8');
 for(const match of java.matchAll(/@Column\(name="([A-Z_]+)"/g)){assert.ok(sql.includes(match[1]),entity+' SQL mapping missing: '+match[1]);assert.ok(match[1].length<=64);}
}
for(const fk of fks)assert.ok(fk[1].length<=64);
const config=fs.readFileSync(base+'src/main/java/com/freelandsite/api/services/SalesInvoiceReminderService.java','utf8');assert.ok(config.includes('select r.userId from SalesInvoiceReminderRecipient'));assert.ok(!config.includes('readValue(s.recipientIds'));
const dispatch=fs.readFileSync(base+'src/main/java/com/freelandsite/api/services/SalesInvoiceReminderDispatchService.java','utf8');assert.ok(dispatch.indexOf('em.persist(detail)')<dispatch.indexOf('em.flush();return true'));
console.log('PASS: 8 RESTRICT foreign keys, composite due ownership, SQL/JPA naming and migration safeguards (static contracts, not a MySQL execution).');
