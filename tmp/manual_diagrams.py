from reportlab.platypus import Flowable, Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader

class ManualDiagram(Flowable):
    def __init__(self,kind):
        Flowable.__init__(self);self.kind=kind;self.width=487;self.height=265 if kind=='adapt' else 360
    def draw(self):
        c=self.canv
        def text(t,x,y,w,size=10,bold=False,color='#242424'):
            p=Paragraph(t,ParagraphStyle('d',fontName='Bold' if bold else 'Regular',fontSize=size,leading=size*1.4,textColor=HexColor(color)))
            _,h=p.wrap(w,200);p.drawOn(c,x,y-h)
        def card(x,y,w,h):
            c.setFillColor(HexColor('#FAFCF4'));c.setStrokeColor(HexColor('#DAE5B8'));c.roundRect(x,y,w,h,12,fill=1,stroke=1)
        def excerpt(path,box,x,y,w,h):
            # Place the supplied illustration through a PDF clipping window.
            im=ImageReader(path);iw,ih=im.getSize();l,t,r,b=box;s=min(w/(r-l),h/(b-t))
            c.saveState();p=c.beginPath();p.rect(x,y,w,h);c.clipPath(p,stroke=0)
            c.drawImage(im,x-l*s,y-(ih-b)*s,iw*s,ih*s,mask='auto');c.restoreState()
        if self.kind=='adapt':
            src='C:/Users/comer/Documents/Clientes/FreeLandSite/Documentacion/KiwiKERP Cloud/Manual de Usuario/imagenes/modalidades-suministrada.png'
            im=ImageReader(src);iw,ih=im.getSize();h=487*ih/iw
            c.drawImage(im,0,(self.height-h)/2,487,h,mask='auto')
            return
            card(0,0,487,260)
            for _ in range(12):
                c.drawImage('C:/Proyectos/KiwiKErpVue/src/assets/logos/LogTras.png',20,65,135,135,mask='auto')
            for title,body,y in [('ESTÁNDAR','Una base común para la gestión habitual de la empresa.',233),('A MEDIDA','Procesos e integraciones específicos para cada cliente.',167),('EVOLUCIÓN','La solución crece con el negocio y sus nuevas necesidades.',101)]:
                text(title,184,y,280,11,True,'#648506');text(body,184,y-22,273)
            text('Si el estándar no alcanza, lo integramos a medida.',20,28,447,10,True,'#648506')
        else:
            src='C:/Users/comer/AppData/Local/Temp/codex-clipboard-b248b1be-567a-46b1-8bbb-c501cf80ac76.png'
            for x,title,subtitle,items,box in [(0,'En la nube','FreeLandSite gestiona el entorno',['Sin comprar ni mantener un servidor propio','Acceso con navegador e Internet','Actualizaciones, copias y monitorización gestionadas','Instancia y base de datos independientes'],(355,211,608,384)),(251,'En su servidor','Infraestructura del cliente',['Instalación directa en Windows, sin Docker','Datos alojados en su infraestructura','Integración con sus sistemas internos','Mantenimiento y copias según el servicio acordado'],(1006,204,1236,380))]:
                card(x,0,236,355);text(title,x+16,335,204,18,True);text(subtitle,x+16,304,204,9,True,'#648506')
                excerpt(src,box,x+49,166,145,103)
                for i,item in enumerate(items):text('• '+item,x+16,155-i*36,204,9)
