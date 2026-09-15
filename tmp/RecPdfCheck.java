import com.freelandsite.api.services.*;
import com.freelandsite.api.jpa.*;
import com.freelandsite.api.repositories.*;
import java.lang.reflect.*;
import java.nio.file.*;
import java.util.*;
import org.thymeleaf.spring5.SpringTemplateEngine;
import org.thymeleaf.templateresolver.FileTemplateResolver;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;
import javax.imageio.ImageIO;
public class RecPdfCheck {
 static void inject(Object o,String n,Object v)throws Exception{Field f=o.getClass().getDeclaredField(n);f.setAccessible(true);f.set(o,v);}
 public static void main(String[] args)throws Exception {
  SalesQuotePdfService service=new SalesQuotePdfService();
  FileTemplateResolver resolver=new FileTemplateResolver();resolver.setPrefix("C:/Proyectos/KiwiKERP/K_ERP_FREELANDSITE/src/main/resources/templates/");resolver.setSuffix(".html");resolver.setCharacterEncoding("UTF-8");resolver.setTemplateMode("HTML");
  SpringTemplateEngine engine=new SpringTemplateEngine();engine.setTemplateResolver(resolver);inject(service,"templateEngine",engine);
  ParametersGenerals company=new ParametersGenerals();company.setNameCompany("Empresa de demostración");company.setCifCompany("B12345678");company.setAddress("Calle de ejemplo 12");company.setCity("Madrid");
  inject(service,"repositoryParameters",Proxy.newProxyInstance(ParametersGeneralsRepository.class.getClassLoader(),new Class[]{ParametersGeneralsRepository.class},(o,m,a)->company));
  SalesInvoice root=new SalesInvoice();root.setCode("FC-2026/0009");
  Entitie customer=new Entitie();customer.setEntitieDsName("Cliente de prueba S.A.");customer.setEntitieDsCif("B87654321");
  SalesRecInvoices rec=new SalesRecInvoices();rec.setCodigo("RFC-2026/0015");rec.setSalesInvoice(root);rec.setFechaCreacion(new Date());rec.setEntitie(customer);rec.setEstado("Confirmada");rec.setReferencia("REF-15");rec.setRazon("Devolución parcial de artículos. Documento de prueba para comprobar el diseño corporativo.");rec.setTerminos("Condiciones acordadas con el cliente.");rec.setTotalNeto(-200d);rec.setTotalImpuestos(-42d);rec.setTotal(-242d);
  SalesLinesRecInvoices l=new SalesLinesRecInvoices();l.setNameProduct("Artículo de demostración");l.setQuantity(2d);l.setPriceUnit(100d);l.setTax(21d);
  byte[] pdf=service.generateRecInvoice(rec,Arrays.asList(l));Files.write(Paths.get("tmp/rec-corporate-preview.pdf"),pdf);
  try(PDDocument doc=org.apache.pdfbox.Loader.loadPDF(pdf)){
   String text=new PDFTextStripper().getText(doc);
   if(!text.contains("RFC-2026/0015")||!text.contains("FC-2026/0009")||!text.contains("242,00")||!text.contains("Devolución"))throw new AssertionError(text);
   PDFRenderer renderer=new PDFRenderer(doc);ImageIO.write(renderer.renderImageWithDPI(0,110),"png",Paths.get("tmp/rec-corporate-preview.png").toFile());
   System.out.println("PASS: corporate PDF rendered, reference, reason and signed total preserved; pages="+doc.getNumberOfPages());
  }
 }
}
