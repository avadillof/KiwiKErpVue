import fs from 'node:fs';
const root='C:/Proyectos/KiwiKERP/K_ERP_FREELANDSITE/src/main/java/com/freelandsite/api/';
const read=p=>fs.readFileSync(root+p,'utf8');
const write=(p,s)=>fs.writeFileSync(root+p,s);
let lines=read('jpa/SalesLinesInvoices.java').replaceAll('SalesLinesInvoices','SalesLinesRecInvoices').replaceAll('sales_linesinvoices','sales_linesrecinvoices').replaceAll('SALES_LINESINVOICES','SALES_LINESRECINVOICES').replaceAll('SalesInvoice salesInvoice','SalesRecInvoices salesInvoice').replaceAll('SalesInvoice getSalesInvoice','SalesRecInvoices getSalesInvoice').replaceAll('SALES_INVOICES_PK_ID','SALES_RECINVOICES_PK_ID').replaceAll('SALES_LINES_PK_ID','SALES_LINESINVOICES_PK_ID');
lines=lines.replace(/    @Column\(name = "SALES_LINESALBARANES_PK_ID"\)[\s\S]*?private Integer salesLinesAlbaranesPkId;/,'    @Column(name = "SALES_LINESRECINVOICES_DS_TERMINOS")\n    private String terms;');
lines=lines.replace(/    public Integer getSalesLinesAlbaranesPkId\(\)[\s\S]*?this.salesLinesAlbaranesPkId = salesLinesAlbaranesPkId;\s*}/,'    public String getTerms() { return terms; }\n    public void setTerms(String value) { terms = value; }');
write('jpa/SalesLinesRecInvoices.java',lines);
write('repositories/SalesLinesRecInvoicesRepository.java',`package com.freelandsite.api.repositories;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.freelandsite.api.jpa.SalesLinesRecInvoices;
public interface SalesLinesRecInvoicesRepository extends JpaRepository<SalesLinesRecInvoices,Integer> {
    List<SalesLinesRecInvoices> findBySalesInvoiceIdOrderById(Integer id);
}
`);
let repo=read('repositories/RepositorySalesRecInvoices.java').replace('extends JpaRepository<SalesRecInvoices, Integer>','extends JpaRepository<SalesRecInvoices, Integer>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<SalesRecInvoices>');
write('repositories/RepositorySalesRecInvoices.java',repo);
for(const [source,target] of [['jpa/VeriFactuSubmission.java','jpa/RecInvoiceSubmission.java'],['repositories/VeriFactuSubmissionRepository.java','repositories/RecInvoiceSubmissionRepository.java']]) {
 let s=read(source).replaceAll('VeriFactuSubmission','RecInvoiceSubmission').replaceAll('verifactu_submission_queue','recinvoice_submission_queue').replaceAll('UK_VERIFACTU_SUBMISSION_INVOICE','UK_RECINVOICE_SUBMISSION').replaceAll('SALES_INVOICES_KY_ID','SALES_RECINVOICES_PK_ID');
 write(target,s);
}
let counter=read('jpa/vulcano/CountersVulcano.java').replace('    public Integer getId()',`    @Column(name = "COUNTERS_INT_RECINVOICE_COUNTER") private Integer recInvoiceCounter;
    @Column(name = "COUNTERS_INT_RECINVOICE_YEAR") private Integer recInvoiceYear;
    public Integer getRecInvoiceCounter() { return recInvoiceCounter; }
    public void setRecInvoiceCounter(Integer value) { recInvoiceCounter = value; }
    public Integer getRecInvoiceYear() { return recInvoiceYear; }
    public void setRecInvoiceYear(Integer value) { recInvoiceYear = value; }
    public Integer getId()`);
write('jpa/vulcano/CountersVulcano.java',counter);
