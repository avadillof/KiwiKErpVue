"""Original reproducible: PDF A1 vectorial. No interviene en la aplicacion.
Requiere reportlab; renderizar el PDF con Poppler para obtener el PNG del manual.
"""
from pathlib import Path
import random
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'output/pdf/kiwikerp-ventas-pizarra-a1-2026-08-31.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
for name, file in [('Hand','segoepr.ttf'),('HandBold','segoeprb.ttf'),('Sans','segoeui.ttf'),('Bold','segoeuib.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(Path('C:/Windows/Fonts') / file)))
W,H=1682,1188
c=canvas.Canvas(str(OUT), pagesize=(841/25.4*72,594/25.4*72))
c.setTitle('KiwiKERP | Del precio al cobro | Mapa de Ventas')
c.setAuthor('FreeLandSite - KiwiKERP')
c.scale(841/25.4*72/W,594/25.4*72/H)
BG='#182e2c'; WHITE='#f0f3df'; MUTED='#c1d2c8'; GREEN='#c4e776'; BLUE='#96d9ec'; PURPLE='#d8b9ed'; AMBER='#f4d099'
random.seed(31)
def line(points,color=WHITE,width=1.4,dash=False):
    c.setStrokeColor(HexColor(color));c.setLineWidth(width);c.setDash(6,5) if dash else c.setDash()
    p=c.beginPath();p.moveTo(points[0][0],H-points[0][1])
    for x,y in points[1:]:p.lineTo(x,H-y)
    c.drawPath(p);c.setDash()
def text(x,y,s,size=17,color=WHITE,font='Sans'):
    c.setFont(font,size);c.setFillColor(HexColor(color));c.drawString(x,H-y,s)
def rect(x,y,w,h,color=WHITE,dash=False,fill=None):
    if fill:
        c.setFillColor(HexColor(fill));c.rect(x,H-y-h,w,h,stroke=0,fill=1)
    line([(x,y),(x+w,y+.5),(x+w-.8,y+h),(x+.6,y+h-.5),(x,y)],color,1.6,dash)
    if not dash:line([(x+2,y+2),(x+w-2,y+1),(x+w-1,y+h-2)],color,.35)
def arrow(points,color=WHITE,dash=False):
    line(points,color,2,dash)
    x,y=points[-1];a,b=points[-2];dx=x-a;dy=y-b
    if abs(dx)>abs(dy):
        k=1 if dx>0 else -1;line([(x-9*k,y-5),(x,y),(x-9*k,y+5)],color,2)
    else:
        k=1 if dy>0 else -1;line([(x-5,y-9*k),(x,y),(x+5,y-9*k)],color,2)
def box(x,y,w,h,title,rows,color=WHITE,title_size=19):
    rect(x,y,w,h,color)
    text(x+15,y+29,title,title_size,color,'HandBold')
    for i,s in enumerate(rows):
        assert pdfmetrics.stringWidth(s,'Sans',16) < w-26, (title,s)
        text(x+15,y+53+i*22,s,16)
def heading(x,y,num,title,color):
    text(x,y,num,19,color,'Bold');text(x+38,y,title,23,color,'HandBold')

c.setFillColor(HexColor(BG));c.rect(0,0,W,H,stroke=0,fill=1)
# Subtle vector chalk dust; no bitmap background or rasterized text.
for _ in range(1900):
    x=random.uniform(15,W-15);y=random.uniform(15,H-15)
    line([(x,y),(x+random.uniform(.2,2),y+.2)],'#29403a',.35)
rect(18,18,W-36,H-36,'#73947d')
text(50,74,'KiwiKERP',47,GREEN,'HandBold')
text(350,71,'DEL PRECIO AL COBRO',37,WHITE,'Bold')
text(53,113,'Una venta conectada. Cada documento conserva su origen.',23,MUTED,'Hand')
# Preserve the corporate logo unaltered on a light backing for readability.
c.setFillColor(HexColor('#f7f8ee'));c.roundRect(1424,H-124,200,89,8,stroke=0,fill=1)
c.drawImage(ImageReader(str(ROOT/'src/assets/logos/corporate.png')),1435,H-115,width=178,height=77,preserveAspectRatio=True,anchor='c',mask='auto')
line([(50,136),(1632,136)],GREEN,2)

heading(50,173,'01','CONDICIONES COMERCIALES',GREEN)
box(50,192,366,116,'Producto + configuración',['Precio de venta en moneda base.','Tarifa predeterminada para las ventas.','El cliente puede tener su propia tarifa.'],GREEN)
arrow([(419,248),(447,248)],GREEN)
box(451,192,590,116,'Tarifas y descuentos por cantidad',['Producto > familia exacta > todos > precio base.','Una sola regla: precio fijo o descuento; no se acumulan.','Dentro del ámbito, gana el mayor mínimo alcanzado.'],GREEN)
arrow([(1044,248),(1072,248)],GREEN)
box(1076,192,556,116,'El precio acordado viaja con la venta',['Simula antes de guardar. Consulta el precio por unidad.','Otra moneda: precio fijo aplicable, sin conversión.','Ejemplo: desde 101 ud., 80,00 USD; 120 ud. = 9.600,00 USD.*'],GREEN)

heading(50,346,'02','DE LA PROPUESTA AL PEDIDO',BLUE)
for x,title,rows in [(50,'Presupuesto',['Cliente, líneas y tarifa']),(376,'Enviar propuesta',['PDF y correo al cliente']),(702,'Aceptar',['Presupuesto aprobado']),(1028,'Pedido en borrador',['Revisar fechas y cantidades']),(1354,'Confirmar pedido',['Activa la operativa'])]:
    box(x,367,278,79,title,rows,BLUE,18)
    if x<1354:arrow([(x+281,406),(x+320,406)],BLUE)
text(52,470,'También puedes crear un pedido sin presupuesto. Un presupuesto rechazado o cancelado no continúa.',16,MUTED)

heading(50,516,'03','CADA LÍNEA SIGUE SU RECORRIDO',BLUE)
heading(1170,516,'04','FACTURAR Y COBRAR',PURPLE)
text(53,547,'El pedido confirmado admite productos y servicios con políticas distintas.',17,MUTED)
# Route endpoints merge only into the invoice draft, never directly into issuance.
routes=[(570,'A  Servicio sin albarán','Facturar desde pedido','Por cantidades pedidas.',GREEN),
        (645,'B  Producto por pedido','Facturar desde pedido','Entrega física en paralelo; no condiciona la factura.',BLUE),
        (720,'C  Producto por entrega','Albarán > confirmar > facturar','Solo cantidades entregadas disponibles.',BLUE),
        (795,'D  Factura manual','Crear borrador manual','Sin pedido ni albarán; no modifica reservas ni entregas.',PURPLE)]
for y,title,step,note,col in routes:
    text(52,y,title,20,col,'HandBold')
    text(52,y+26,note,16,MUTED)
    rect(665,y-26,405,49,col);text(681,y+5,step,19,col,'Bold')
    arrow([(590,y-2),(656,y-2)],col)
    line([(1072,y-2),(1121,y-2)],col,1.7)
line([(1121,568),(1121,793)],PURPLE,2)
arrow([(1121,570),(1164,570)],PURPLE)
box(1170,540,462,68,'Factura en borrador',['Revisar líneas, impuestos y plazos.'],PURPLE)
arrow([(1401,610),(1401,623)],PURPLE)
box(1170,626,462,68,'Emitir factura',['Número fiscal + PDF + calendario fijado.'],PURPLE)
arrow([(1401,696),(1401,709)],PURPLE)
box(1170,712,462,68,'VeriFactu: envío y resultado',['Aceptada: habilita el registro de cobros.'],PURPLE)
arrow([(1401,782),(1401,795)],PURPLE)
box(1170,798,462,68,'Registrar cobro',['Parcial o total. Saldo cero: cobrada.'],PURPLE)
text(53,861,'Entrega parcial: pedido de 10 ud., entrega de 6 ud.; por entrega se pueden facturar 6 ud.',17,BLUE,'Bold')

heading(50,914,'05','SEGUIMIENTO QUE ACOMPAÑA A LA VENTA',GREEN)
box(50,935,507,131,'Vencimientos y cobros',['Uno o varios plazos; cobros por plazo.','Historial y justificantes; no superar el saldo.','Reversión con motivo: conserva el historial.','Registrar un cobro no ejecuta una transferencia.'],GREEN,20)
box(575,935,507,131,'Comunicación y avisos',['PDF y correo al cliente, con historial.','Avisos internos de presupuestos y entregas.','Vencimientos: responsables elegidos en Ajustes.','Consulta previa y confirmación de envíos.'],BLUE,20)
box(1100,935,532,131,'Controles que importan',['Borrador no equivale a entregar, emitir ni cobrar.','Reservas: albaranes y facturas en borrador.','Reabrir conserva precios; recalcular es explícito.','Incidencia fiscal: revisar, sin duplicar la factura.'],AMBER,20)
rect(50,1085,1582,41,AMBER,True)
text(67,1113,'PRÓXIMA AMPLIACIÓN  /  Rectificativas y abonos: fuera del circuito actual del portal.',20,AMBER,'Bold')
text(51,1147,'Mapa funcional · 31/08/2026 · Circuito fiscal documentado en PRUEBAS; no acredita despliegue en producción.',15,MUTED)
text(51,1165,'* Ejemplo de precio neto antes de impuestos y de descuentos adicionales. Flechas: avance; marco discontinuo: función pendiente.',13,MUTED)
c.showPage();c.save()
print(OUT)
