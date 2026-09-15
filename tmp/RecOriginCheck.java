import com.freelandsite.api.services.*;
import com.freelandsite.api.jpa.*;
import com.freelandsite.api.repositories.*;
import javax.persistence.*;
import java.lang.reflect.*;
import java.util.*;
public class RecOriginCheck {
 static void inject(Object o,String n,Object v)throws Exception{Field f=o.getClass().getDeclaredField(n);f.setAccessible(true);f.set(o,v);}
 static Object invoke(Object o,String n,Class<?>[] types,Object... args)throws Exception{Method m=o.getClass().getDeclaredMethod(n,types);m.setAccessible(true);return m.invoke(o,args);}
 static void check(boolean b,String m){if(!b)throw new AssertionError(m);}
 public static void main(String[] args)throws Exception{
  SalesRecInvoiceService service=new SalesRecInvoiceService();
  SalesInvoice root=new SalesInvoice();root.setId(1);
  SalesRecInvoices parent=new SalesRecInvoices();parent.setId(2);parent.setSalesInvoice(root);parent.setEstado("Realizada");parent.setVerifactuStatus("ACCEPTED");
  SalesRecInvoices child=new SalesRecInvoices();child.setId(3);child.setSalesInvoice(root);child.setRectificativaOrigen(parent);
  SalesLinesRecInvoices origin=new SalesLinesRecInvoices();origin.setId(4);origin.setSalesInvoice(parent);origin.setProduct(new ProductProduct());origin.setNameProduct("Prueba");origin.setQuantity(5d);origin.setPriceUnit(100d);origin.setTax(21d);
  double[] reserved={1}; List<SalesLinesRecInvoices> saved=new ArrayList<>();
  Query query=(Query)Proxy.newProxyInstance(Query.class.getClassLoader(),new Class[]{Query.class},(o,m,a)->m.getName().equals("getSingleResult")?reserved[0]:o);
  EntityManager em=(EntityManager)Proxy.newProxyInstance(EntityManager.class.getClassLoader(),new Class[]{EntityManager.class},(o,m,a)->m.getName().equals("createQuery")?query:null);
  SalesLinesRecInvoicesRepository repo=(SalesLinesRecInvoicesRepository)Proxy.newProxyInstance(SalesLinesRecInvoicesRepository.class.getClassLoader(),new Class[]{SalesLinesRecInvoicesRepository.class},(o,m,a)->{
   if(m.getName().equals("findBySalesInvoiceIdOrderById"))return a[0].equals(2)?Arrays.asList(origin):Collections.emptyList();
   if(m.getName().equals("saveAll")){saved.clear();for(Object l:(Iterable<?>)a[0])saved.add((SalesLinesRecInvoices)l);return saved;}return null;});
  inject(service,"em",em);inject(service,"lines",repo);
  SalesRecInvoiceService.Request r=new SalesRecInvoiceService.Request();r.mode="QUANTITY";
  SalesRecInvoiceService.LineRequest l=new SalesRecInvoiceService.LineRequest();l.sourceLineId=4;l.quantity=2d;r.lines=Arrays.asList(l);
  invoke(service,"saveRecLines",new Class[]{SalesRecInvoices.class,SalesRecInvoiceService.Request.class},child,r);
  check(child.getTotal()==242d,"Reverse negative abono must be positive");check(saved.get(0).getOriginLine()==origin,"Immediate source retained");
  r.mode="ECONOMIC";l.priceUnit=50d;l.tax=21d;
  invoke(service,"saveRecLines",new Class[]{SalesRecInvoices.class,SalesRecInvoiceService.Request.class},child,r);
  check(child.getTotal()==121d,"Economic difference on selected rectification");
  origin.setNetDelta(500d);origin.setTaxDelta(105d);r.mode="QUANTITY";
  invoke(service,"saveRecLines",new Class[]{SalesRecInvoices.class,SalesRecInvoiceService.Request.class},child,r);
  check(child.getTotal()==-242d,"Reverse positive correction must be negative");
  reserved[0]=5;
  try{invoke(service,"saveRecLines",new Class[]{SalesRecInvoices.class,SalesRecInvoiceService.Request.class},child,r);throw new AssertionError("Exhausted origin accepted");}catch(InvocationTargetException e){check(e.getCause() instanceof org.springframework.web.server.ResponseStatusException,"Business rejection");}
  reserved[0]=0;l.sourceLineId=99;
  try{invoke(service,"saveRecLines",new Class[]{SalesRecInvoices.class,SalesRecInvoiceService.Request.class},child,r);throw new AssertionError("Foreign line accepted");}catch(InvocationTargetException e){check(e.getCause() instanceof org.springframework.web.server.ResponseStatusException,"Foreign source rejected");}
  System.out.println("PASS: signed reversals, economic delta, source linkage, exhausted quantity and foreign line rejection");
 }
}
