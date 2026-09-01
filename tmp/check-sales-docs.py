from pathlib import Path
import re
from PIL import Image
from pypdf import PdfReader
r=Path(__file__).resolve().parents[1]
s=(r/'src/views/Help/Frm_UserManual.vue').read_text(encoding='utf-8')
ids=re.findall(r'\bid="([^"]+)"',s)
anchors=re.findall(r'href="#([^"]+)"',s)
assert len(ids)==len(set(ids)), 'duplicate section id'
assert not (set(anchors)-set(ids)),set(anchors)-set(ids)
for path in re.findall(r"import \w+ from '([^']+\.(?:png|jpg|pdf)(?:\?url)?)'",s):
    clean=path.split('?')[0]
    target=r/'src'/clean[2:] if clean.startswith('@/') else r/'src/views/Help'/clean
    assert target.resolve().is_file(),path
assert 'Versión 2.5' in s
assert 'salesFlowPoster' in s and 'Estado de cierre de Ventas' in s
png=r/'docs/manual-usuario/diagramas/flujo-ventas-pizarra-2026-08-31.png'
assert Image.open(png).size==(2523,1783)
pdf=PdfReader(r/'output/pdf/kiwikerp-ventas-pizarra-a1-2026-08-31.pdf')
assert len(pdf.pages)==1
page=pdf.pages[0]
assert abs(float(page.mediabox.width)-2383.937)<1
words=page.extract_text()
for text in ['9.600,00 USD','Factura en borrador','Emitir factura','PRUEBAS','Rectificativas','Reservas: albaranes']:
    assert text in words,text
embedded=[]
for font in page['/Resources']['/Font'].values():
    obj=font.get_object();desc=obj.get('/FontDescriptor')
    if desc:
        d=desc.get_object();assert any(key in d for key in ['/FontFile','/FontFile2','/FontFile3'])
        embedded.append(str(obj['/BaseFont']))
assert len(embedded)==4,embedded
print('Manual: '+str(len(ids))+' ids únicos; '+str(len(anchors))+' enlaces internos válidos; recursos existentes.')
print('PDF: A1, 1 página, texto comprobado y 4 fuentes Segoe incrustadas. PNG: 2523 x 1783.')
