const fs = require('fs');
const root = 'C:/Proyectos/KiwiKERP/K_ERP_FREELANDSITE/src/main/';
const base = root+'java/com/freelandsite/api/';
function edit(path, fn) { const text=fs.readFileSync(path,'utf8'); fs.writeFileSync(path,fn(text)); }
edit(base+'jpa/SalesLinesRecInvoices.java', s=>s.replace('public class SalesLinesRecInvoices {',`public class SalesLinesRecInvoices {
    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="SALES_LINESRECINVOICES_KY_ORIGIN")
    private SalesLinesRecInvoices originLine;
    @Column(name="SALES_LINESRECINVOICES_DB_NETDELTA")
    private Double netDelta;
    @Column(name="SALES_LINESRECINVOICES_DB_TAXDELTA")
    private Double taxDelta;
    public SalesLinesRecInvoices getOriginLine(){return originLine;}
    public void setOriginLine(SalesLinesRecInvoices v){originLine=v;}
    public Double getNetDelta(){return netDelta;}
    public void setNetDelta(Double v){netDelta=v;}
    public Double getTaxDelta(){return taxDelta;}
    public void setTaxDelta(Double v){taxDelta=v;}
`));
const columns=[['SALES_LINESRECINVOICES_KY_ORIGIN','INT NULL'],['SALES_LINESRECINVOICES_DB_NETDELTA','DECIMAL(19,2) NULL'],['SALES_LINESRECINVOICES_DB_TAXDELTA','DECIMAL(19,2) NULL']];
fs.writeFileSync(root+'resources/db/migration/V2026091401__recinvoice_line_origin_amounts.sql', columns.map(([c,t])=>`SET @sql = IF((SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='sales_linesrecinvoices' AND column_name='${c}')=0,'ALTER TABLE sales_linesrecinvoices ADD COLUMN ${c} ${t}','SELECT 1');\nPREPARE rec_stmt FROM @sql; EXECUTE rec_stmt; DEALLOCATE PREPARE rec_stmt;`).join('\n')+`\nSET @sql = IF((SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='sales_linesrecinvoices' AND index_name='IX_REC_LINE_ORIGIN')=0,'ALTER TABLE sales_linesrecinvoices ADD INDEX IX_REC_LINE_ORIGIN (SALES_LINESRECINVOICES_KY_ORIGIN)','SELECT 1');
PREPARE rec_stmt FROM @sql; EXECUTE rec_stmt; DEALLOCATE PREPARE rec_stmt;
`);
edit(base+'services/SalesRecInvoiceService.java', s=>{
s=s.replace('where r.salesInvoice.id=:id and r.estado', 'where r.salesInvoice.id=:id and r.rectificativaOrigen is null and r.estado');
s=s.replace('where l.salesLinesPkId=:line and l.salesInvoice.estado','where l.salesLinesPkId=:line and l.salesInvoice.rectificativaOrigen is null and l.salesInvoice.estado');
s=s.replace('Map<String,Object> dto=prepare(parent.getSalesInvoice().getId());',`validateParent(parent,parent.getSalesInvoice().getId());
        Map<String,Object> dto=new LinkedHashMap<>();
        dto.put("invoiceId",parent.getSalesInvoice().getId());dto.put("invoiceCode",parent.getSalesInvoice().getCode());
        dto.put("customer",parent.getEntitie().getEntitieDsName());dto.put("currency",currency(parent.getSalesInvoice()));dto.put("terms",parent.getTerminos());
        dto.put("lines",availableRecLines(parent,null));`);
const marker='    private double reserved(Integer lineId,Integer exclude) {';
s=s.replace(marker,`    private void validateParent(SalesRecInvoices p,Integer invoiceId) {
        if(p.getSalesInvoice()==null||!Objects.equals(p.getSalesInvoice().getId(),invoiceId)) fail("La rectificativa no pertenece a la factura inicial.");
        if(draft(p)||CANCELLED.equals(p.getEstado())||!Arrays.asList("ACCEPTED","ACCEPTED_WITH_ERRORS").contains(p.getVerifactuStatus())) fail("La rectificativa de origen debe estar aceptada.");
    }
    private double reservedRec(Integer line,Integer exclude) {
        return ((Number)em.createQuery("select coalesce(sum(abs(l.quantity)),0) from SalesLinesRecInvoices l where l.originLine.id=:line and l.salesInvoice.estado<>:cancelled and (:excluded is null or l.salesInvoice.id<>:excluded)")
            .setParameter("line",line).setParameter("cancelled",CANCELLED).setParameter("excluded",exclude).getSingleResult()).doubleValue();
    }
    private List<Map<String,Object>> availableRecLines(SalesRecInvoices parent,Integer exclude) {
        List<Map<String,Object>> result=new ArrayList<>();
        for(SalesLinesRecInvoices l:lines.findBySalesInvoiceIdOrderById(parent.getId())) {
            double q=Math.abs(value(l.getQuantity())); if(q==0)continue;
            double base=net(l).doubleValue()/q, taxValue=tax(l).doubleValue()/q;
            Map<String,Object> m=new LinkedHashMap<>();m.put("sourceLineId",l.getId());m.put("description",l.getNameProduct());
            m.put("quantity",Math.max(0,q-reservedRec(l.getId(),exclude)));m.put("originalQuantity",q);
            m.put("priceUnit",Math.abs(base));m.put("originalPriceUnit",Math.abs(base));m.put("discount",0d);m.put("originalDiscount",0d);m.put("increment",0d);m.put("originalIncrement",0d);
            double rate=base==0?0:100*taxValue/base;m.put("tax",rate);m.put("originalTax",rate);
            m.put("sourceNetUnit",base);m.put("sourceTaxUnit",taxValue);result.add(m);
        } return result;
    }
`+marker);
s=s.replace('SalesInvoice original=source(r.invoiceId);','SalesInvoice original=source(r.invoiceId);\n        if(parent!=null)validateParent(parent,original.getId());');
s=s.replace('if(previous!=null){if(!previous.getSalesInvoice()', 'if(previous!=null){if(!Objects.equals(previous.getRectificativaOrigen()==null?null:previous.getRectificativaOrigen().getId(),r.sourceRecInvoiceId))fail("La operación pertenece a otro documento.");if(!previous.getSalesInvoice()');
s=s.replace('if(!Objects.equals(r.version,i.getVersion()))', 'if(!Objects.equals(r.sourceRecInvoiceId,i.getRectificativaOrigen()==null?null:i.getRectificativaOrigen().getId()))fail("No se puede cambiar el documento rectificado.");\n        if(!Objects.equals(r.version,i.getVersion()))');
s=s.replace('LocalDate original=i.getSalesInvoice().getCreateDate().toInstant()', 'LocalDate original=(i.getRectificativaOrigen()==null?i.getSalesInvoice().getCreateDate():i.getRectificativaOrigen().getFechaCreacion()).toInstant()');
s=s.replace('Map<Integer,SalesLinesInvoices> origins=new HashMap<>();',`if(i.getRectificativaOrigen()!=null){saveRecLines(i,r);return;}
        Map<Integer,SalesLinesInvoices> origins=new HashMap<>();`);
s=s.replace('l.setPriceUnit(price);l.setTax(taxRate);l.setPercentDiscount(discount);l.setPercentIncremento(increment);',`l.setPriceUnit(price);l.setTax(taxRate);l.setPercentDiscount(discount);l.setPercentIncremento(increment);`);
// Separate parent-line identifiers from original invoice-line identifiers throughout the lifecycle.
const point='    public static BigDecimal net(SalesLinesRecInvoices l) {';
s=s.replace(point,`    private void saveRecLines(SalesRecInvoices i,Request r) {
        validateParent(i.getRectificativaOrigen(),i.getSalesInvoice().getId());
        Map<Integer,SalesLinesRecInvoices> origins=new HashMap<>();
        for(SalesLinesRecInvoices l:lines.findBySalesInvoiceIdOrderById(i.getRectificativaOrigen().getId()))origins.put(l.getId(),l);
        List<SalesLinesRecInvoices> planned=new ArrayList<>();Set<Integer> used=new HashSet<>();
        for(LineRequest input:r.lines){
            if(input==null||!used.add(input.sourceLineId))fail("Hay líneas repetidas o vacías.");
            SalesLinesRecInvoices o=origins.get(input.sourceLineId);
            if(o==null||o.getProduct()==null)fail("Una línea no pertenece a la rectificativa seleccionada.");
            double sourceQuantity=Math.abs(value(o.getQuantity()));
            if(input.quantity==null||!Double.isFinite(input.quantity)||input.quantity<=0||BigDecimal.valueOf(input.quantity).stripTrailingZeros().scale()>3||input.quantity>sourceQuantity-reservedRec(o.getId(),i.getId())+0.0000001)fail("Revise la cantidad disponible de "+o.getNameProduct());
            double oldNet=net(o).doubleValue()/sourceQuantity,oldTax=tax(o).doubleValue()/sourceQuantity;
            double price=input.priceUnit==null?Math.abs(oldNet):input.priceUnit,discount=input.discount==null?0:input.discount,increment=input.increment==null?0:input.increment,rate=input.tax==null?(oldNet==0?0:100*oldTax/oldNet):input.tax;
            if(!Double.isFinite(price)||!Double.isFinite(discount)||!Double.isFinite(increment)||!Double.isFinite(rate)||price<0||price>1000000000d||discount<0||discount>100||increment<0||increment>100||rate<0||rate>100)fail("Revise precio, descuento, incremento e impuesto.");
            boolean economic="ECONOMIC".equals(r.mode);
            if(!economic){price=Math.abs(oldNet);discount=0;increment=0;rate=oldNet==0?0:100*oldTax/oldNet;}
            BigDecimal originalNet=BigDecimal.valueOf(oldNet*input.quantity).setScale(2,RoundingMode.HALF_UP),originalTax=BigDecimal.valueOf(oldTax*input.quantity).setScale(2,RoundingMode.HALF_UP);
            BigDecimal target=economic?BigDecimal.valueOf(Math.signum(oldNet)*input.quantity*price*(1-discount/100)*(1+increment/100)).setScale(2,RoundingMode.HALF_UP):BigDecimal.ZERO;
            BigDecimal targetTax=target.multiply(BigDecimal.valueOf(rate).movePointLeft(2)).setScale(2,RoundingMode.HALF_UP);
            SalesLinesRecInvoices l=new SalesLinesRecInvoices();l.setSalesInvoice(i);l.setOriginLine(o);l.setSalesLinesPkId(o.getSalesLinesPkId());l.setProduct(o.getProduct());l.setProductUomPkId(o.getProductUomPkId());l.setNameProduct(o.getNameProduct());l.setQuantity(input.quantity);l.setPriceUnit(price);l.setPercentDiscount(discount);l.setPercentIncremento(increment);l.setTax(rate);l.setNetDelta(target.subtract(originalNet).doubleValue());l.setTaxDelta(targetTax.subtract(originalTax).doubleValue());planned.add(l);
        }
        recalculate(i,planned);lines.deleteAll(lines.findBySalesInvoiceIdOrderById(i.getId()));lines.flush();lines.saveAll(planned);em.flush();
    }
    private boolean validOrigin(SalesRecInvoices i,SalesLinesRecInvoices l){
        if(i.getRectificativaOrigen()!=null){SalesLinesRecInvoices o=l.getOriginLine();return o!=null&&Objects.equals(o.getSalesInvoice().getId(),i.getRectificativaOrigen().getId())&&value(l.getQuantity())>0&&value(l.getQuantity())<=Math.abs(value(o.getQuantity()))-reservedRec(o.getId(),i.getId())+0.0000001;}
        SalesLinesInvoices o=l.getSalesLinesPkId()==null?null:em.find(SalesLinesInvoices.class,l.getSalesLinesPkId());return o!=null&&Objects.equals(o.getSalesInvoice().getId(),i.getSalesInvoice().getId())&&value(l.getQuantity())>0&&value(l.getQuantity())<=value(o.getQuantity())-reserved(o.getId(),i.getId())+0.0000001;
    }
`+point+'\n        if(l.getNetDelta()!=null)return BigDecimal.valueOf(l.getNetDelta()).setScale(2,RoundingMode.HALF_UP);');
s=s.replace('public static BigDecimal tax(SalesLinesRecInvoices l) {return', 'public static BigDecimal tax(SalesLinesRecInvoices l) {if(l.getTaxDelta()!=null)return BigDecimal.valueOf(l.getTaxDelta()).setScale(2,RoundingMode.HALF_UP);return');
s=s.replace('if(n.add(t).signum()>=0)fail("El importe del abono debe ser negativo.");', 'if(i.getRectificativaOrigen()==null?n.add(t).signum()>=0:n.add(t).signum()==0)fail("La rectificación debe producir una diferencia de importe válida.");');
s=s.replace('row.put("sourceLineId",l.getSalesLinesPkId())','row.put("sourceLineId",l.getOriginLine()==null?l.getSalesLinesPkId():l.getOriginLine().getId())');
s=s.replace('m.put("availableLines",availableLines(i.getSalesInvoice(),id))','m.put("availableLines",i.getRectificativaOrigen()==null?availableLines(i.getSalesInvoice(),id):availableRecLines(i.getRectificativaOrigen(),id))');
s=s.replace('m.put("paid",i.getPagado());return m;', 'm.put("paid",i.getPagado());m.put("sourceRecInvoiceId",i.getRectificativaOrigen()==null?null:i.getRectificativaOrigen().getId());m.put("sourceCode",i.getRectificativaOrigen()==null?(i.getSalesInvoice()==null?"":i.getSalesInvoice().getCode()):i.getRectificativaOrigen().getCodigo());return m;');
let a=s.indexOf('            SalesLinesInvoices origin=',s.indexOf('public Map<String,Object> validateIssue'));
let b=s.indexOf('            total=total.add',a);
s=s.slice(0,a)+'            if(!validOrigin(i,l))errors.add("Revise el origen y la cantidad de "+l.getNameProduct());\n'+s.slice(b);
s=s.replace('if(total.signum()>=0) errors.add("El importe del abono debe ser negativo.");','if(i.getRectificativaOrigen()==null?total.signum()>=0:total.signum()==0) errors.add("La rectificación debe producir una diferencia de importe válida.");\n        if(i.getRectificativaOrigen()!=null)validateParent(i.getRectificativaOrigen(),i.getSalesInvoice().getId());');
a=s.indexOf('        for(SalesLinesRecInvoices l:ls){',s.indexOf('public Map<String,Object> issue'));
b=s.indexOf('        if(i.getRazon()',a);
s=s.slice(0,a)+'        for(SalesLinesRecInvoices l:ls)if(!validOrigin(i,l))fail("Revise las líneas y cantidades antes de emitir.");\n'+s.slice(b);
return s;
});
edit(base+'services/SalesRecInvoiceArtifacts.java',s=>s.replace('i.getSalesInvoice()==null?"":i.getSalesInvoice().getCode()', 'i.getRectificativaOrigen()!=null?i.getRectificativaOrigen().getCodigo():i.getSalesInvoice()==null?"":i.getSalesInvoice().getCode()'));
