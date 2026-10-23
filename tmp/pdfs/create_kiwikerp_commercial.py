from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Flowable, Frame, Image, KeepTogether, PageBreak,
    PageTemplate, Paragraph, Spacer, Table, TableStyle
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader
import os

ROOT = r"C:\Proyectos\KiwiKErpVue"
OUT = os.path.join(ROOT, "output", "pdf", "KiwiKERP_Dossier_Comercial.pdf")
BG = os.path.join(ROOT, "public", "logos", "backtransparent.png")
LOGO = os.path.join(ROOT, "src", "assets", "logos", "corporate.png")
KIWI = os.path.join(ROOT, "public", "logos", "logo512.png")
SCREEN_VERIFACTU = os.path.join(ROOT, "tmp", "pdfs", "screenshots", "verifactu-chain.png")
SCREEN_IMPORT = os.path.join(ROOT, "tmp", "pdfs", "screenshots", "import-assistant.png")
SCREEN_LOGIN = os.path.join(ROOT, "tmp", "pdfs", "screenshots", "login.png")

W, H = A4
GREEN = HexColor("#9CC10A")
GREEN_DARK = HexColor("#627F00")
GREEN_PALE = HexColor("#F1F7DE")
INK = HexColor("#202124")
MUTED = HexColor("#667085")
LINE = HexColor("#DDE5CB")
SOFT = HexColor("#F7F9F3")
BLUE = HexColor("#2E6A83")
PURPLE = HexColor("#73558F")
ORANGE = HexColor("#C97919")

pdfmetrics.registerFont(TTFont("Segoe", r"C:\Windows\Fonts\segoeui.ttf"))
pdfmetrics.registerFont(TTFont("SegoeBold", r"C:\Windows\Fonts\segoeuib.ttf"))

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="H1C", fontName="SegoeBold", fontSize=21.5, leading=25.5, textColor=INK, spaceAfter=8))
styles.add(ParagraphStyle(name="H2C", fontName="SegoeBold", fontSize=16, leading=20, textColor=GREEN_DARK, spaceBefore=4, spaceAfter=8))
styles.add(ParagraphStyle(name="H3C", fontName="SegoeBold", fontSize=11.5, leading=14, textColor=INK, spaceAfter=4))
styles.add(ParagraphStyle(name="BodyC", fontName="Segoe", fontSize=9.3, leading=13.2, textColor=INK))
styles.add(ParagraphStyle(name="BodySmall", fontName="Segoe", fontSize=8.2, leading=11.5, textColor=MUTED))
styles.add(ParagraphStyle(name="Lead", fontName="Segoe", fontSize=11, leading=15.5, textColor=MUTED, spaceAfter=10))
styles.add(ParagraphStyle(name="Eyebrow", fontName="SegoeBold", fontSize=7.5, leading=10, textColor=GREEN_DARK, tracking=1.2, spaceAfter=5))
styles.add(ParagraphStyle(name="BulletC", fontName="Segoe", fontSize=8.8, leading=12.2, textColor=INK, leftIndent=11, firstLineIndent=-8, bulletIndent=1, spaceAfter=3))
styles.add(ParagraphStyle(name="CardTitle", fontName="SegoeBold", fontSize=10.5, leading=13, textColor=INK, spaceAfter=4))
styles.add(ParagraphStyle(name="CardBody", fontName="Segoe", fontSize=8.4, leading=11.5, textColor=MUTED))
styles.add(ParagraphStyle(name="Quote", fontName="SegoeBold", fontSize=16, leading=21, textColor=INK, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="CenterSmall", fontName="Segoe", fontSize=8.6, leading=12, textColor=MUTED, alignment=TA_CENTER))


def P(text, style="BodyC"):
    return Paragraph(text, styles[style])


def bullet(text):
    return Paragraph("<font color='#9CC10A'>●</font>&nbsp;&nbsp;" + text, styles["BulletC"])


class Cover(Flowable):
    def __init__(self):
        super().__init__()
        self.width = W - 42 * mm
        self.height = H - 49 * mm

    def draw(self):
        c = self.canv
        c.saveState()
        # Platypus translates the canvas to the content frame; return to page origin.
        c.translate(-(18 * mm + 6), -(18 * mm + 6))
        c.drawImage(BG, -18 * mm, -22 * mm, width=W + 36 * mm, height=H + 22 * mm, mask='auto')
        c.setFillColor(colors.Color(1, 1, 1, alpha=0.78))
        c.roundRect(18 * mm, 35 * mm, W - 36 * mm, 222 * mm, 7 * mm, fill=1, stroke=0)
        # Cabecera clara: el logotipo corporativo contiene texto oscuro y necesita
        # respirar sobre blanco para conservar su legibilidad.
        c.setFillColor(colors.Color(1, 1, 1, alpha=0.94))
        c.setStrokeColor(LINE)
        c.setLineWidth(0.8)
        c.roundRect(18 * mm, 230 * mm, W - 36 * mm, 27 * mm, 7 * mm, fill=1, stroke=1)
        c.setStrokeColor(GREEN)
        c.setLineWidth(2)
        c.line(26 * mm, 231.5 * mm, W - 26 * mm, 231.5 * mm)
        c.drawImage(LOGO, 25 * mm, 232.5 * mm, width=67 * mm, height=23 * mm, preserveAspectRatio=True, mask='auto')
        c.setFillColor(GREEN)
        c.roundRect(25 * mm, 207 * mm, 40 * mm, 8 * mm, 4 * mm, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont("SegoeBold", 8)
        c.drawString(29 * mm, 209.2 * mm, "DOSSIER COMERCIAL")
        c.setFont("SegoeBold", 31)
        c.drawString(25 * mm, 184 * mm, "KiwiKERP")
        c.setFont("SegoeBold", 20)
        c.setFillColor(GREEN_DARK)
        c.drawString(25 * mm, 171 * mm, "Gestiona hoy. Crece mañana.")
        c.setFillColor(MUTED)
        c.setFont("Segoe", 12)
        c.drawString(25 * mm, 157 * mm, "Un ERP cloud cercano, visual y conectado para")
        c.drawString(25 * mm, 149 * mm, "autónomos y pequeñas empresas.")
        c.drawImage(KIWI, 131 * mm, 157 * mm, width=48 * mm, height=48 * mm, preserveAspectRatio=True, mask='auto')
        cards = [
            ("ORGANIZA", "Ventas, compras, tareas y documentos"),
            ("SIMPLIFICA", "Procesos claros y trazables"),
            ("HAZ CRECER", "Decisiones con información real"),
        ]
        x = 25 * mm
        for title, sub in cards:
            c.setFillColor(SOFT)
            c.roundRect(x, 104 * mm, 48 * mm, 30 * mm, 4 * mm, fill=1, stroke=0)
            c.setFillColor(GREEN_DARK)
            c.setFont("SegoeBold", 8)
            c.drawString(x + 5 * mm, 124 * mm, title)
            c.setFillColor(MUTED)
            c.setFont("Segoe", 7.7)
            words = sub.split()
            line1 = " ".join(words[:3])
            line2 = " ".join(words[3:])
            c.drawString(x + 5 * mm, 116 * mm, line1)
            c.drawString(x + 5 * mm, 111 * mm, line2)
            x += 52 * mm
        c.setFillColor(GREEN_PALE)
        c.setStrokeColor(GREEN)
        c.setLineWidth(1)
        c.roundRect(25 * mm, 59 * mm, W - 50 * mm, 31 * mm, 4 * mm, fill=1, stroke=1)
        c.setFillColor(GREEN_DARK)
        c.setFont("SegoeBold", 13)
        c.drawCentredString(W / 2, 78 * mm, "Todo el ciclo de tu empresa en un mismo lugar")
        c.setFont("Segoe", 8.8)
        c.setFillColor(MUTED)
        c.drawCentredString(W / 2, 69 * mm, "De la oportunidad comercial al cobro, con fiscalidad, portal y seguimiento.")
        c.setFillColor(MUTED)
        c.setFont("Segoe", 8.5)
        c.drawCentredString(W / 2, 43 * mm, "www.freelandsite.es")
        c.restoreState()


def header_footer(c, doc):
    if doc.page == 1:
        return
    c.saveState()
    c.setFillColor(colors.white)
    c.rect(0, H - 18 * mm, W, 18 * mm, fill=1, stroke=0)
    c.setStrokeColor(GREEN)
    c.setLineWidth(1.2)
    c.line(0, H - 18 * mm, W, H - 18 * mm)
    c.drawImage(LOGO, 16 * mm, H - 16.5 * mm, width=48 * mm, height=15 * mm, preserveAspectRatio=True, mask='auto')
    c.setFillColor(GREEN_DARK)
    c.setFont("SegoeBold", 8)
    c.drawRightString(W - 16 * mm, H - 10.7 * mm, "KiwiKERP · DOSSIER COMERCIAL")
    c.setStrokeColor(LINE)
    c.line(16 * mm, 14 * mm, W - 16 * mm, 14 * mm)
    c.setFont("Segoe", 7.2)
    c.setFillColor(MUTED)
    c.drawString(16 * mm, 8.5 * mm, "FreeLandSite · Soluciones a medida para sus proyectos")
    c.drawRightString(W - 16 * mm, 8.5 * mm, f"{doc.page - 1}")
    c.restoreState()


def card(title, body, accent=GREEN, width=80 * mm):
    data = [[P(title, "CardTitle")], [P(body, "CardBody")]]
    t = Table(data, colWidths=[width], hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.white),
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("LINEBEFORE", (0, 0), (0, -1), 3, accent),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, 0), 8),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 9),
    ]))
    return t


def two_cards(left, right, gap=5 * mm):
    return Table([[left, right]], colWidths=[82.5 * mm, 82.5 * mm], hAlign="LEFT",
                 style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"),
                                   ("LEFTPADDING", (0, 0), (-1, -1), 0),
                                   ("RIGHTPADDING", (0, 0), (-1, -1), gap)]))


def screenshot_panel(path, caption, width, height):
    """Presenta una captura real como ventana de producto, sin competir con el texto."""
    picture = Image(path, width=width, height=height, hAlign="CENTER")
    panel = Table([
        [picture],
        [P(caption, "CenterSmall")],
    ], colWidths=[width + 6 * mm], hAlign="CENTER")
    panel.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.white),
        ("BOX", (0, 0), (-1, -1), 0.8, LINE),
        ("LINEABOVE", (0, 0), (-1, 0), 2, GREEN),
        ("LEFTPADDING", (0, 0), (-1, 0), 3 * mm),
        ("RIGHTPADDING", (0, 0), (-1, 0), 3 * mm),
        ("TOPPADDING", (0, 0), (-1, 0), 3 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 2 * mm),
        ("TOPPADDING", (0, 1), (-1, 1), 2.2 * mm),
        ("BOTTOMPADDING", (0, 1), (-1, 1), 2.5 * mm),
    ]))
    return KeepTogether(panel)


def section_title(eyebrow, title, lead):
    return [P(eyebrow.upper(), "Eyebrow"), P(title, "H1C"), P(lead, "Lead")]


def flow_step(number, title, subtitle, color):
    box = Table([[P(str(number), "H3C"), P(title, "H3C")], ["", P(subtitle, "BodySmall")]],
                colWidths=[10 * mm, 43 * mm])
    box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.white),
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("BACKGROUND", (0, 0), (0, 0), color),
        ("TEXTCOLOR", (0, 0), (0, 0), colors.white),
        ("ALIGN", (0, 0), (0, 0), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("SPAN", (0, 0), (0, 1)),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return box


doc = BaseDocTemplate(
    OUT, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm,
    topMargin=25 * mm, bottomMargin=18 * mm,
    title="KiwiKERP - Dossier comercial", author="FreeLandSite",
    subject="ERP cloud para autónomos y pequeñas empresas"
)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
doc.addPageTemplates([PageTemplate(id="content", frames=[frame], onPageEnd=header_footer)])

story = [Cover(), PageBreak()]

# 1. Propuesta de valor
story += section_title("Una gestión más sencilla", "Tu empresa, conectada de principio a fin",
    "KiwiKERP reúne las operaciones que una pequeña empresa utiliza cada día. Menos herramientas aisladas, menos datos duplicados y más tiempo para atender el negocio.")
story.append(two_cards(
    card("Una visión clara", "Paneles de control que separan ventas y compras, muestran vencimientos y acercan las tareas importantes.", GREEN),
    card("Un flujo conectado", "Clientes, productos, presupuestos, pedidos, entregas, facturas, cobros y tareas comparten la misma información.", BLUE)
))
story.append(Spacer(1, 5 * mm))
story.append(two_cards(
    card("Preparado para España", "IVA trimestral, Facturae, VeriFactu, certificados digitales, vencimientos y trazabilidad documental.", PURPLE),
    card("Cercano y evolutivo", "Una solución cloud modular, pensada para crecer con la empresa y adaptarse a su forma real de trabajar.", ORANGE)
))
story.append(Spacer(1, 8 * mm))
story.append(P("¿Qué aporta KiwiKERP?", "H2C"))
benefits = [
    "Centraliza la información comercial y operativa.",
    "Reduce tareas repetitivas y errores de transcripción.",
    "Mantiene el historial de cada operación y conversación.",
    "Avisa antes de que una entrega, factura o tarea requiera atención.",
    "Permite colaborar con clientes desde un Portal propio.",
    "Ofrece control sin convertir el día a día en un proyecto informático.",
]
bt = Table([[bullet(x) for x in benefits[:3]], [bullet(x) for x in benefits[3:]]], colWidths=[56 * mm] * 3)
bt.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 5)]))
story.append(bt)
story.append(Spacer(1, 7 * mm))
story.append(screenshot_panel(
    SCREEN_LOGIN,
    "Una bienvenida clara y corporativa para acceder al espacio de trabajo.",
    148 * mm,
    92.5 * mm,
))

# 2. Ventas
story.append(PageBreak())
story += section_title("Área comercial", "Del primer contacto al cobro",
    "Cada documento continúa el trabajo anterior. KiwiKERP conserva precios, condiciones, cantidades e historial para que la venta avance sin perder contexto.")
steps = [
    flow_step(1, "Presupuesto", "Oferta, validez, PDF y correo", GREEN_DARK),
    flow_step(2, "Pedido", "Confirmación y planificación", BLUE),
    flow_step(3, "Albarán", "Entregas totales o parciales", ORANGE),
]
story.append(Table([steps], colWidths=[56 * mm] * 3, style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 4)])))
story.append(Spacer(1, 4 * mm))
steps2 = [
    flow_step(4, "Factura", "Emisión, fiscalidad y envío", PURPLE),
    flow_step(5, "Cobro", "Total, parcial y vencimientos", GREEN),
    flow_step(6, "Seguimiento", "Avisos, tareas y trazabilidad", GREEN_DARK),
]
story.append(Table([steps2], colWidths=[56 * mm] * 3, style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 4)])))
story.append(Spacer(1, 7 * mm))
story.append(two_cards(
    card("Control por cantidades", "Visualiza lo pedido, entregado, facturado, cancelado y pendiente. El sistema evita entregar o reducir cantidades de forma incoherente.", GREEN),
    card("Flexibilidad real", "Pedidos directos o desde presupuesto, entregas parciales, albaranes unificados, proformas y facturación desde pedido o entrega.", BLUE)
))
story.append(Spacer(1, 5 * mm))
story.append(two_cards(
    card("Precios y condiciones", "Tarifas, descuentos por cantidad, condiciones de cliente e impuestos aplicados de forma consistente durante todo el circuito.", ORANGE),
    card("Comunicación cuidada", "Presupuestos, facturas y rectificativas por correo con documentos corporativos e histórico de envíos.", PURPLE)
))

# 3. Fiscalidad
story.append(PageBreak())
story += section_title("Facturación y cumplimiento", "Fiscalidad integrada en la operación",
    "La gestión fiscal no aparece al final como un proceso separado: acompaña a la factura desde su borrador hasta su archivo, presentación y cobro.")
story.append(two_cards(
    card("VeriFactu", "Cola de envío, reintentos, subsanaciones, cadena de huellas, consulta AEAT y expedientes con evidencias archivadas.", GREEN),
    card("Facturae", "Generación y archivo del XML original, visor legible, descarga y soporte para el circuito de factura electrónica.", BLUE)
))
story.append(Spacer(1, 5 * mm))
story.append(two_cards(
    card("Rectificativas", "Documentos vinculados a la factura original, emisión controlada, PDF, correo y trazabilidad fiscal.", PURPLE),
    card("Cobros y vencimientos", "Calendarios de pago, cobros parciales, saldos pendientes, avisos y conservación del historial.", ORANGE)
))
story.append(Spacer(1, 7 * mm))
vat = Table([
    [P("Liquidación trimestral de IVA", "H2C"), ""],
    [P("Ventas", "H3C"), P("Compras", "H3C")],
    [P("IVA repercutido, facturas y resumen por cliente.", "BodySmall"), P("IVA soportado, facturas y resumen por proveedor.", "BodySmall")],
    [P("Versiones, marcado como presentada y detección de cambios posteriores.", "BodySmall"), P("Envío opcional al gestor y avisos al responsable.", "BodySmall")],
], colWidths=[84 * mm, 84 * mm])
vat.setStyle(TableStyle([
    ("SPAN", (0, 0), (1, 0)), ("BACKGROUND", (0, 0), (1, 0), GREEN_PALE),
    ("BOX", (0, 0), (-1, -1), 0.8, LINE), ("INNERGRID", (0, 1), (-1, -1), 0.4, LINE),
    ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
]))
story.append(vat)
story.append(Spacer(1, 6 * mm))
story.append(screenshot_panel(
    SCREEN_VERIFACTU,
    "Trazabilidad VeriFactu: consulta visual de la cadena y del estado de cada registro.",
    154 * mm,
    54.5 * mm,
))

# 4. Operaciones y clientes
story.append(PageBreak())
story += section_title("Trabajo diario", "Tareas, incidencias y clientes en conversación",
    "KiwiKERP conecta el trabajo del equipo con el cliente y con la facturación. Una incidencia no queda en un correo perdido: se convierte en una operación trazable.")
story.append(two_cards(
    card("Gestión de tareas", "Vistas Kanban, tabla y Gantt; responsables, prioridades, fechas, estados, listas, tiempos y trabajo facturable.", GREEN),
    card("Incidencias", "Solicitudes de clientes, conversaciones, cambios de estado, responsables y seguimiento desde el mismo circuito.", ORANGE)
))
story.append(Spacer(1, 5 * mm))
story.append(two_cards(
    card("Portal del cliente", "Consulta de facturas y rectificativas, descarga de documentos, tareas, comentarios y solicitudes de revisión.", BLUE),
    card("Avisos multicanal", "Campana, correo y notificaciones push en ordenador o móvil, con QR de vinculación y modo No molestar.", PURPLE)
))
story.append(Spacer(1, 8 * mm))
story.append(P("Un ejemplo de continuidad", "H2C"))
example = Table([
    [P("1", "H3C"), P("El cliente solicita revisar una factura desde su Portal.", "BodyC")],
    [P("2", "H3C"), P("KiwiKERP crea una incidencia y avisa al responsable.", "BodyC")],
    [P("3", "H3C"), P("El equipo conversa, registra tiempo y documenta la solución.", "BodyC")],
    [P("4", "H3C"), P("El cliente recibe actualizaciones y todo queda vinculado al historial.", "BodyC")],
], colWidths=[12 * mm, 155 * mm])
example.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (0, -1), GREEN), ("TEXTCOLOR", (0, 0), (0, -1), INK),
    ("ALIGN", (0, 0), (0, -1), "CENTER"), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("BOX", (0, 0), (-1, -1), 0.7, LINE), ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
    ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
]))
story.append(example)

# 5. Productos, compras y TPV
story.append(PageBreak())
story += section_title("Una base común", "Productos, compras y punto de venta",
    "El catálogo central alimenta los distintos canales y evita mantener precios, impuestos y descripciones en herramientas separadas.")
story.append(two_cards(
    card("Productos y servicios", "Familias, unidades, impuestos, tarifas, descuentos, códigos de barras y políticas de entrega y facturación.", GREEN),
    card("Compras", "Albaranes de proveedor, facturas recibidas, relación documental e IVA soportado para la liquidación trimestral.", BLUE)
))
story.append(Spacer(1, 5 * mm))
story.append(two_cards(
    card("TPV para comercio y hostelería", "Acceso por PIN, zonas, mesas, comandas, cocina, cobro, cierre, tickets y conexión fiscal con el ERP.", ORANGE),
    card("Etiquetas Zebra/ZPL", "Diseñador visual con textos, códigos de barras, QR, formas, medidas, cuadrícula, zoom e intensidad de impresión.", PURPLE)
))
story.append(Spacer(1, 8 * mm))
story.append(P("Puesta en marcha más ágil", "H2C"))
story.append(P("Los asistentes de importación permiten cargar entidades, productos y servicios desde Excel con equivalencias, validación previa, detección de duplicados y permisos específicos. Los registros se revisan antes de confirmar: la importación no es una caja negra.", "Lead"))
story.append(Table([[bullet("Catálogo único"), bullet("Precios consistentes"), bullet("Revisión antes de importar")],
                    [bullet("Familias automáticas controladas"), bullet("Permisos de importación"), bullet("Historial de procesos")]],
                   colWidths=[56 * mm] * 3,
                   style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0)])))
story.append(Spacer(1, 6 * mm))
story.append(screenshot_panel(
    SCREEN_IMPORT,
    "Asistente guiado para importar clientes y proveedores desde Excel con revisión previa.",
    145 * mm,
    75.7 * mm,
))

# 6. Seguridad y continuidad
story.append(PageBreak())
story += section_title("Confianza operativa", "Seguridad, documentos y continuidad",
    "La información de una empresa necesita algo más que formularios: requiere permisos, respaldo, archivo y una infraestructura mantenible.")
story.append(two_cards(
    card("Permisos detallados", "Acceso por módulos, secciones y acciones. Las comprobaciones se realizan tanto en la interfaz como en el servidor.", GREEN),
    card("Salvaguarda de datos", "Copias de base de datos y documentos, histórico, retención configurable, recuperación y ZIP documental asíncrono.", BLUE)
))
story.append(Spacer(1, 5 * mm))
story.append(two_cards(
    card("Archivo documental", "Árbol de carpetas, versiones actuales e históricas, adjuntos y conservación de evidencias fiscales.", PURPLE),
    card("Cloud gestionado", "Instalaciones Docker independientes, base de datos y documentos persistentes, HTTPS y actualizaciones controladas.", ORANGE)
))
story.append(Spacer(1, 8 * mm))
story.append(P("Acompañamiento y ayuda", "H2C"))
story.append(P("El Centro de Autoayuda integra manual, buscador, categorías y vídeos tutoriales. La documentación evoluciona junto con el producto para que cada mejora llegue también al usuario final.", "Lead"))
story.append(Table([[P("INFORMACIÓN", "Eyebrow"), P("PROCESOS", "Eyebrow"), P("RESULTADOS", "Eyebrow")],
                    [P("Un único origen de datos", "H3C"), P("Flujos guiados y trazables", "H3C"), P("Más control con menos esfuerzo", "H3C")]],
                   colWidths=[56 * mm] * 3,
                   style=TableStyle([("BACKGROUND", (0, 0), (-1, -1), GREEN_PALE), ("BOX", (0, 0), (-1, -1), 0.7, LINE),
                                     ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE), ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                                     ("TOPPADDING", (0, 0), (-1, -1), 8), ("BOTTOMPADDING", (0, 0), (-1, -1), 8)])))

# 7. Cierre
story.append(PageBreak())
story.append(Spacer(1, 10 * mm))
story.append(Image(KIWI, width=34 * mm, height=34 * mm, hAlign="CENTER"))
story.append(Spacer(1, 6 * mm))
story.append(P("Pequeñas empresas.<br/>Grandes historias.", "Quote"))
story.append(Spacer(1, 5 * mm))
story.append(P("KiwiKERP no busca complicar la empresa con cientos de opciones. Busca que cada presupuesto, entrega, factura, tarea y conversación tenga continuidad y ayude a tomar mejores decisiones.", "CenterSmall"))
story.append(Spacer(1, 10 * mm))
closing = Table([
    [P("Una solución especialmente indicada para", "H2C")],
    [bullet("Autónomos y profesionales")],
    [bullet("Empresas de servicios")],
    [bullet("Pequeñas empresas comerciales")],
    [bullet("Negocios con entregas parciales")],
    [bullet("Comercio y hostelería con TPV")],
    [bullet("Equipos que necesitan tareas vinculadas a clientes")],
], colWidths=[128 * mm], hAlign="CENTER")
closing.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), SOFT), ("BOX", (0, 0), (-1, -1), 0.8, LINE),
    ("LEFTPADDING", (0, 0), (-1, -1), 14), ("RIGHTPADDING", (0, 0), (-1, -1), 14),
    ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
]))
story.append(closing)
story.append(Spacer(1, 11 * mm))
cta = Table([[P("Hablemos de cómo trabaja tu empresa", "H2C")],
             [P("Te mostramos KiwiKERP con un recorrido adaptado a tu actividad y tus procesos.", "CenterSmall")],
             [Paragraph("<link href='https://www.freelandsite.es'><b>www.freelandsite.es</b></link>", ParagraphStyle(name="Link", parent=styles["H3C"], alignment=TA_CENTER, textColor=GREEN_DARK))]],
            colWidths=[150 * mm], hAlign="CENTER")
cta.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), GREEN_PALE), ("BOX", (0, 0), (-1, -1), 1, GREEN),
    ("TOPPADDING", (0, 0), (-1, -1), 9), ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
]))
story.append(cta)

doc.build(story)

# Structural verification: page count, metadata and non-empty extracted text.
reader = PdfReader(OUT)
assert len(reader.pages) == 8, f"Expected 8 pages, got {len(reader.pages)}"
for idx, page in enumerate(reader.pages, start=1):
    text = (page.extract_text() or "").strip()
    assert text, f"Page {idx} has no extractable text"
print(OUT)
print(f"pages={len(reader.pages)} bytes={os.path.getsize(OUT)}")
