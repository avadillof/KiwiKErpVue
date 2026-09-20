from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader

root = Path('C:/Proyectos/KiwiKErpVue')
out = Path('C:/Users/comer/Documents/Clientes/FreeLandSite/Documentacion/KiwiKERP Cloud/Manual de Usuario')
out.mkdir(parents=True, exist_ok=True)
for name, filename in [('Regular','segoeui.ttf'),('Bold','segoeuib.ttf'),('Light','segoeuil.ttf'),('Script','segoesc.ttf')]:
    pdfmetrics.registerFont(TTFont(name, 'C:/Windows/Fonts/'+filename))
pdf = out / 'KiwiKERP_Portada_Manual_Usuario_v0_3.pdf'
w, h = 595.276, 841.89
c = canvas.Canvas(str(pdf), pagesize=(w,h))
c.setTitle('KiwiKERP Manual de Usuario')
c.setAuthor('FreeLandSite')
green = HexColor('#9CC10A')
ink = HexColor('#242424')
muted = HexColor('#666666')
c.setFillColor(HexColor('#FFFFFF')); c.rect(0,0,w,h,fill=1,stroke=0)
c.setFillColor(green); c.rect(0,h-10,w,10,fill=1,stroke=0)
logo = ImageReader(str(root / 'src/assets/logos/LogTras.png'))
c.saveState(); c.setFillAlpha(0.22)
c.drawImage(logo, 316, 225, 405, 405, mask='auto')
c.restoreState()
for _ in range(12):
    c.drawImage(logo, 56, 686, 78, 78, mask='auto')
c.setFont('Bold',29); c.setFillColor(ink); c.drawString(151,717,'KiwiKERP')
c.setFont('Regular',10); c.setFillColor(muted); c.drawString(152,697,'GESTIÓN EMPRESARIAL')
c.setFont('Bold',44); c.setFillColor(ink)
c.drawString(56,505,'Manual de')
c.drawString(56,451,'Usuario')
c.setFont('Regular',15); c.setFillColor(muted)
c.drawString(58,412,'Guía de uso y gestión empresarial')
c.setFont('Script',23); c.setFillColor(ink)
c.drawString(58,339,'Pequeñas empresas')
c.drawString(80,304,'Grandes historias')
c.setStrokeColor(green); c.setLineWidth(2.5)
c.bezier(110,291,166,304,237,307,301,307)
c.setFillColor(green); c.rect(58,228,36,4,fill=1,stroke=0)
c.setFont('Bold',10); c.setFillColor(ink); c.drawString(58,203,'EDICIÓN 2026')
c.setFont('Regular',10); c.setFillColor(muted); c.drawString(58,184,'Septiembre 2026')
c.setStrokeColor(HexColor('#DFE5D1')); c.setLineWidth(.7); c.line(58,144,w-58,144)
corporate = ImageReader(str(root / 'src/assets/logos/corporate.png'))
iw,ih = corporate.getSize()
c.drawImage(corporate,58,53,146,146*ih/iw,mask='auto')
c.setFont('Regular',9); c.setFillColor(muted); c.drawRightString(w-58,72,'Manual de Usuario · KiwiKERP')
c.setFont('Regular',10); c.setFillColor(HexColor('#648506'))
c.drawRightString(w-58,53,'www.freelandsite.es')
c.linkURL('https://www.freelandsite.es',(w-160,50,w-58,65),relative=0)
c.showPage(); c.save()
print(pdf)
