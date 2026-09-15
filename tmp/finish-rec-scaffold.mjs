import fs from 'node:fs';
const root='C:/Proyectos/KiwiKERP/K_ERP_FREELANDSITE/src/main/java/com/freelandsite/api/';
let p='src/views/Ventas/Frm_Rectificativas/Frm_Rectificativas.vue';let s=fs.readFileSync(p,'utf8');
s=s.replace("import { backendUrl }", "import { useAuthStore } from '@/stores/authStore';\nimport { backendUrl }");
s=s.replace('const router = useRouter();',"const router = useRouter();\nconst auth = useAuthStore();\nconst api = axios.create();\napi.interceptors.request.use(config => { Object.assign(config.headers, auth.portalRequestConfig().headers); return config; });");
s=s.replaceAll('await axios.','await api.').replace('return { operationKey:', 'return { version: form.value.version, operationKey:');
s=s.replace('invoiceOptions.value = (await api.get','invoiceOptions.value = (await api.get').replace("} })).data.content; } catch (e) { dialogError.value", "} })).data.content.map((i: any) => ({ ...i, customer: i.entityName })); } catch (e) { dialogError.value");
fs.writeFileSync(p,s);
p='src/views/Ventas/Pn_VentasHub.vue';s=fs.readFileSync(p,'utf8');s=s.replace("fondo: 'linear-gradient(135deg, #e56b6f, #bd3e43)', disponible: false", "fondo: 'linear-gradient(135deg, #e56b6f, #bd3e43)', disponible: true, funciones: ['Abonos parciales', 'Emisión y trazabilidad']");fs.writeFileSync(p,s);
// Reuse the reviewed email workflow with a separate entity and routes.
for(const name of ['jpa/SalesInvoiceEmail.java','services/SalesInvoiceEmailService.java','webservices/WebRestInvoiceEmail.java']){
 let text=fs.readFileSync(root+name,'utf8').replaceAll('SalesInvoiceEmail','SalesRecInvoiceEmail').replaceAll('WebRestInvoiceEmail','WebRestRecInvoiceEmail').replaceAll('sales_invoice_emails','sales_recinvoice_emails').replaceAll('SALES_INVOICES_KY_ID','SALES_RECINVOICES_PK_ID').replaceAll('UK_SALES_INVOICE_EMAIL_OPERATION','UK_SALES_RECINVOICE_EMAIL_OPERATION');
 if(name.includes('Service')){
  text=text.replace(/\bSalesInvoice\b/g,'SalesRecInvoices').replaceAll('invoice.getState()','invoice.getEstado()').replaceAll('invoice.getCode()','invoice.getCodigo()').replaceAll('invoice.getDateSend()','invoice.getFechaEnvio()').replace('invoice.getFechaEnvio().toInstant().toString()','invoice.getFechaEnvio().toString()').replace('invoice.setDateSend(Date.from(row.completedAt.toInstant(ZoneOffset.UTC)))','invoice.setFechaEnvio(row.completedAt)');
  text=text.replace('sendSalesRecInvoiceEmail','sendSalesInvoiceEmail');
  text=text.replace('documents.exists(REPORTS,id.longValue(),filename(id))','hasPdf(id)');
  const start=text.indexOf('    private byte[] pdf(Integer id){'), end=text.indexOf('    static void validate(',start);
  text=text.substring(0,start)+`    private boolean hasPdf(Integer id){return em.createQuery("select count(q) from RecInvoiceSubmission q where q.invoiceId=:id and q.signedPdf is not null",Long.class).setParameter("id",id).getSingleResult()>0;}
    private byte[] pdf(Integer id){
        List<RecInvoiceSubmission> rows=em.createQuery("select q from RecInvoiceSubmission q where q.invoiceId=:id",RecInvoiceSubmission.class).setParameter("id",id).getResultList();
        if(rows.isEmpty()||rows.get(0).getSignedPdf()==null)conflict("No está disponible el PDF fiscal archivado.");
        return rows.get(0).getSignedPdf();
    }
`+text.substring(end);
  text=text.replaceAll('FACTURA_VERIFACTU_', 'RECTIFICATIVA_VERIFACTU_').replaceAll('"Factura ', '"Rectificativa ').replaceAll('la factura ', 'la rectificativa ').replaceAll('esta factura', 'esta rectificativa').replaceAll('facturas emitidas', 'rectificativas emitidas');
 }
 fs.writeFileSync(root+name.replaceAll('SalesInvoiceEmail','SalesRecInvoiceEmail').replaceAll('WebRestInvoiceEmail','WebRestRecInvoiceEmail'),text);
}
let email=fs.readFileSync('src/views/Ventas/Frm_Facturas/InvoiceEmailDialog.vue','utf8').replaceAll('WebGetSalesInvoice','WebGetSalesRecInvoice').replaceAll('WebSendSalesInvoice','WebSendSalesRecInvoice').replaceAll('factura','rectificativa').replaceAll('Factura','Rectificativa').replace('la migración V21','la migración de Rectificativas');
fs.writeFileSync('src/views/Ventas/Frm_Rectificativas/RecInvoiceEmailDialog.vue',email);
