const fs=require('fs');
const base='C:/Proyectos/KiwiKERP/K_ERP_FREELANDSITE/src/main/';
const service=base+'java/com/freelandsite/api/services/';
let s=fs.readFileSync(service+'SalesQuotePdfService.java','utf8');
const method=`
    /** Rectificativa con la misma plantilla, emisor, cliente y pie que Facturas. */
    public byte[] generateRecInvoice(com.freelandsite.api.jpa.SalesRecInvoices invoice, List<com.freelandsite.api.jpa.SalesLinesRecInvoices> lines) {
        ParametersGenerals company=repositoryParameters.findTopByOrderByPkidAsc();
        CurrencyInfo currency=currency(invoice.getSalesTarifa()==null?null:invoice.getSalesTarifa().getSalesTarifasPkId());
        SalesInvoice adapter=new SalesInvoice();adapter.setCode(invoice.getCodigo());adapter.setReference(invoice.getReferencia());adapter.setEntitie(invoice.getEntitie());adapter.setTerms(invoice.getTerminos());
        Context context=new Context(new Locale("es","ES"));
        context.setVariable("quote",adapter);
        context.setVariable("documentTitle","Factura rectificativa / Corrective invoice");
        context.setVariable("createdDateLabel","Fecha factura / Invoice date");
        context.setVariable("validityDateLabel","Documento rectificado / Corrected document");
        context.setVariable("validityDate",invoice.getRectificativaOrigen()!=null?invoice.getRectificativaOrigen().getCodigo():invoice.getSalesInvoice()==null?"":invoice.getSalesInvoice().getCode());
        context.setVariable("isDraft",SalesRecInvoiceService.draft(invoice));
        context.setVariable("issuer",issuer(company));context.setVariable("recipient",recipient(adapter));
        context.setVariable("rgpd",company==null?"":safe(company.getReportRgpd()));
        context.setVariable("createdDate",formatDate(invoice.getFechaCreacion()));context.setVariable("currency",currency.label);
        List<Map<String,String>> rows=new ArrayList<>();
        for(com.freelandsite.api.jpa.SalesLinesRecInvoices line:lines){
            Map<String,String> row=new LinkedHashMap<>();row.put("code",line.getProduct()==null?"":safe(line.getProduct().getProductProductDsCode()));
            String description=safe(line.getNameProduct());
            if(number(line.getPercentIncremento())!=0)description+=" (Incremento: "+numberFormat(number(line.getPercentIncremento()))+" %)";
            row.put("description",description);row.put("quantity",numberFormat(number(line.getQuantity())));row.put("uom","");
            row.put("unitPrice",money(line.getPriceUnit(),currency));row.put("discount",number(line.getPercentDiscount())==0?"":numberFormat(number(line.getPercentDiscount()))+" %");row.put("tax",numberFormat(number(line.getTax()))+" %");
            row.put("total",money(SalesRecInvoiceService.net(line).add(SalesRecInvoiceService.tax(line)).doubleValue(),currency));rows.add(row);
        }
        context.setVariable("lines",rows);context.setVariable("money",money(invoice.getTotal(),currency));context.setVariable("net",money(invoice.getTotalNeto(),currency));context.setVariable("tax",money(invoice.getTotalImpuestos(),currency));
        context.setVariable("retentionValue",0);context.setVariable("manualDelivery",false);context.setVariable("valued",true);
        context.setVariable("rectificationReason",safe(invoice.getRazon()));
        context.setVariable("rectificationStatus",SalesRecInvoiceService.CANCELLED.equals(invoice.getEstado())?"CANCELADA":SalesRecInvoiceService.draft(invoice)?"BORRADOR - SIN VALIDEZ FISCAL":"");
        String html=templateEngine.process("sales-quote",context);
        try(ByteArrayOutputStream output=new ByteArrayOutputStream()){
            PdfRendererBuilder builder=new PdfRendererBuilder();builder.useFastMode();builder.withHtmlContent(html,null);builder.toStream(output);builder.run();return output.toByteArray();
        }catch(Exception e){throw new IllegalStateException("No se pudo generar el PDF de la rectificativa.",e);}
    }
`;
s=s.replace('    private List<Map<String, String>> invoiceLineRows',method+'\n    private List<Map<String, String>> invoiceLineRows');
fs.writeFileSync(service+'SalesQuotePdfService.java',s);
s=fs.readFileSync(service+'SalesRecInvoiceArtifacts.java','utf8');
let a=s.indexOf('    public byte[] pdf('),b=s.indexOf('    public byte[] facturae',a);
s=s.slice(0,a)+`    @Autowired private SalesQuotePdfService corporatePdf;
    public byte[] pdf(SalesRecInvoices i,List<SalesLinesRecInvoices> lines) {
        return corporatePdf.generateRecInvoice(i,lines);
    }
`+s.slice(b);
fs.writeFileSync(service+'SalesRecInvoiceArtifacts.java',s);
const template=base+'resources/templates/sales-quote.html';s=fs.readFileSync(template,'utf8');
s=s.replace('  <table class="lines"><thead>',`  <div class="manual-info" th:if="\u0024{rectificationReason != null}"><div class="manual-info-title">Motivo de rectificación / Correction reason</div><div class="manual-info-row" th:text="\u0024{rectificationReason}"></div><div th:if="\u0024{rectificationStatus != null and !rectificationStatus.isEmpty()}" th:text="\u0024{rectificationStatus}"></div></div>
  <table class="lines"><thead>`);
fs.writeFileSync(template,s);
