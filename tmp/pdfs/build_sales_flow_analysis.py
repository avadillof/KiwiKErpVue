from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether


OUT = Path(r"C:\Proyectos\KiwiKErpVue\output\pdf\Analisis_Flujo_Ventas.pdf")
OUT.parent.mkdir(parents=True, exist_ok=True)

GREEN = colors.HexColor("#6E9A16")
DARK_GREEN = colors.HexColor("#395800")
LIGHT_GREEN = colors.HexColor("#EEF6DB")
MINT = colors.HexColor("#F6FAEF")
NAVY = colors.HexColor("#25323B")
GREY = colors.HexColor("#68747D")
LINE = colors.HexColor("#D8E0E3")
PALE = colors.HexColor("#F7F9FA")
WHITE = colors.white


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="DocTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=25, leading=30, textColor=WHITE, alignment=TA_LEFT, spaceAfter=4))
styles.add(ParagraphStyle(name="Subtitle", parent=styles["Normal"], fontName="Helvetica", fontSize=10, leading=14, textColor=colors.HexColor("#E6F2CD")))
styles.add(ParagraphStyle(name="H1K", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=17, leading=21, textColor=DARK_GREEN, spaceBefore=3, spaceAfter=9))
styles.add(ParagraphStyle(name="H2K", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=11.5, leading=14, textColor=NAVY, spaceBefore=7, spaceAfter=5))
styles.add(ParagraphStyle(name="BodyK", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.2, leading=13.2, textColor=NAVY, spaceAfter=5))
styles.add(ParagraphStyle(name="Small", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.7, leading=10.2, textColor=GREY))
styles.add(ParagraphStyle(name="CardTitle", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=10, leading=12, textColor=DARK_GREEN, spaceAfter=3))
styles.add(ParagraphStyle(name="CardBody", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.3, leading=11.1, textColor=NAVY))
styles.add(ParagraphStyle(name="Step", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=9, leading=11, textColor=WHITE, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="TableHead", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=7.4, leading=9, textColor=WHITE, alignment=TA_LEFT))
styles.add(ParagraphStyle(name="TableCell", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.5, leading=9.8, textColor=NAVY))


def p(txt, style="BodyK"):
    return Paragraph(txt, styles[style])


def flow_box(title, subtitle, tone=LIGHT_GREEN):
    t = Table([[p(title, "Step")], [p(subtitle, "CardBody")]], colWidths=[43*mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("BACKGROUND", (0, 1), (-1, -1), tone),
        ("BOX", (0, 0), (-1, -1), 0.65, colors.HexColor("#C5D79D")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ]))
    return t


def arrow():
    return p("<b>-></b>", "H2K")


def card(title, body, width=83*mm):
    t = Table([[p(title, "CardTitle")], [p(body, "CardBody")]], colWidths=[width])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), MINT),
        ("BOX", (0, 0), (-1, -1), 0.65, LINE),
        ("LINEBELOW", (0, 0), (-1, 0), 0.55, colors.HexColor("#C7D9A3")),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t


def section_label(text):
    t = Table([[p(text, "TableHead")]], colWidths=[180*mm])
    t.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,-1), DARK_GREEN), ("TOPPADDING", (0,0), (-1,-1), 5), ("BOTTOMPADDING", (0,0), (-1,-1), 5), ("LEFTPADDING", (0,0), (-1,-1), 8)]))
    return t


def page_header_footer(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setStrokeColor(colors.HexColor("#CAD8B0"))
    canvas.setLineWidth(0.45)
    canvas.line(doc.leftMargin, height - 13*mm, width - doc.rightMargin, height - 13*mm)
    canvas.setFont("Helvetica-Bold", 7.5)
    canvas.setFillColor(DARK_GREEN)
    canvas.drawString(doc.leftMargin, height - 10*mm, "KIWIKERP  |  ANALISIS FUNCIONAL")
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(GREY)
    canvas.drawRightString(width - doc.rightMargin, height - 10*mm, "Flujo de ventas y cumplimiento")
    canvas.line(doc.leftMargin, 12*mm, width - doc.rightMargin, 12*mm)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(GREY)
    canvas.drawString(doc.leftMargin, 7.5*mm, "Documento de trabajo - version 1.0 - 25/08/2026")
    canvas.setFillColor(GREEN)
    canvas.drawRightString(width - doc.rightMargin, 7.5*mm, "Pagina %d" % doc.page)
    canvas.restoreState()


doc = SimpleDocTemplate(str(OUT), pagesize=A4, leftMargin=15*mm, rightMargin=15*mm, topMargin=20*mm, bottomMargin=17*mm)
story = []

# Cover
cover = Table([[p("Flujo de ventas", "DocTitle")], [p("Presupuestos, pedidos, albaranes y facturacion", "Subtitle")], [p("Marco funcional acordado para la siguiente fase de KiwiKERP", "Subtitle")]], colWidths=[180*mm])
cover.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), DARK_GREEN),
    ("TOPPADDING", (0,0), (-1,0), 18),
    ("BOTTOMPADDING", (0,0), (-1,0), 4),
    ("TOPPADDING", (0,1), (-1,-1), 3),
    ("BOTTOMPADDING", (0,2), (-1,2), 18),
    ("LEFTPADDING", (0,0), (-1,-1), 16),
]))
story += [cover, Spacer(1, 13*mm)]
story.append(p("Objetivo", "H1K"))
story.append(p("Este documento fija el comportamiento de negocio que seguiremos al construir el modulo de <b>Pedidos de venta</b> y, despues, los modulos de <b>Albaranes</b> y <b>Facturacion</b>. El presupuesto ya finalizado queda como origen del pedido; las cantidades y la politica de cada linea controlan el resto del circuito."))
story.append(Spacer(1, 4*mm))
story.append(section_label("PRINCIPIOS QUE NO DEBEN ROMPERSE"))
story.append(Spacer(1, 4*mm))
principles = [
    [card("Trazabilidad", "No se elimina un pedido ni una linea por haberse cumplido. Se conserva como historico y se bloquea al cerrar."), card("Foto comercial", "La politica logistica y de facturacion se copian a la linea del pedido. Un cambio futuro en el producto no altera un documento ya creado.")],
    [card("Cantidad real", "El avance se calcula desde las lineas validadas de albaran o factura; los campos acumulados/pending son cache recalculable, no la fuente de verdad."), card("Circuito flexible", "El producto decide si requiere albaran. Los servicios facturan directo desde pedido; los productos fisicos se entregan antes de facturar.")],
]
t = Table(principles, colWidths=[88*mm, 88*mm], hAlign="LEFT")
t.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 4), ("TOPPADDING", (0,0), (-1,-1), 0), ("BOTTOMPADDING", (0,0), (-1,-1), 5)]))
story.append(t)
story.append(Spacer(1, 4*mm))
story.append(p("Alcance de esta guia", "H2K"))
story.append(p("Incluye reglas funcionales, estados, datos y decisiones de flujo. La implementacion se hara primero para pedidos, despues para albaranes y finalmente para facturacion, reutilizando los patrones visuales y tecnicos del modulo de presupuestos."))
story.append(PageBreak())

# Main flow
story.append(p("1. Flujo general acordado", "H1K"))
story.append(p("La aceptacion del presupuesto crea un pedido de venta independiente. Desde ese momento el presupuesto es una foto aprobada y el pedido conduce la ejecucion."))
flow = Table([[flow_box("PRESUPUESTO", "Borrador / Enviado"), arrow(), flow_box("ACEPTAR", "Aprueba y bloquea"), arrow(), flow_box("PEDIDO", "DRAFT_PC-AAAA/NNNN"), arrow(), flow_box("CONFIRMAR", "Preparar ejecucion")]], colWidths=[43*mm, 8*mm, 43*mm, 8*mm, 43*mm, 8*mm, 43*mm])
flow.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "MIDDLE"), ("ALIGN", (0,0), (-1,-1), "CENTER"), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0)]))
story += [Spacer(1, 6*mm), flow, Spacer(1, 7*mm)]
story.append(section_label("A PARTIR DEL PEDIDO CONFIRMADO"))
story.append(Spacer(1, 4*mm))
branches = [
    [card("Linea con albaran", "Politica <b>REQUIRE_DELIVERY = 1</b>. Pasa a <b>Para generar albaran</b>. Se crean uno o varios albaranes por cantidades parciales."), card("Linea sin albaran", "Politica <b>REQUIRE_DELIVERY = 0</b>. Se factura directamente desde el pedido segun la politica <b>ORDERED</b>.")],
    [card("Cierre del pedido", "Solo cuando todas sus lineas cumplan: <b>cantidad pedida - entregada - cancelada = 0</b>. Estado final: <b>Realizado / Done</b>."), card("Facturacion posterior", "Las lineas entregadas se facturan por cantidades entregadas. Para servicios, las lineas facturables proceden directamente del pedido.")],
]
t = Table(branches, colWidths=[88*mm, 88*mm])
t.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 4), ("TOPPADDING", (0,0), (-1,-1), 0), ("BOTTOMPADDING", (0,0), (-1,-1), 5)]))
story.append(t)
story.append(Spacer(1, 3*mm))
story.append(p("Estados principales", "H2K"))
states = [
    [p("Documento", "TableHead"), p("Estado", "TableHead"), p("Regla operativa", "TableHead")],
    [p("Presupuesto", "TableCell"), p("Para aprobar / Enviado", "TableCell"), p("Editable; puede aceptarse, cancelarse o reenviarse." , "TableCell")],
    [p("Presupuesto", "TableCell"), p("Aprobado / Cancelado", "TableCell"), p("Bloqueado. El aprobado origina un pedido DRAFT_PC." , "TableCell")],
    [p("Pedido", "TableCell"), p("Para aprobar venta", "TableCell"), p("Borrador operativo que todavia no genera ejecucion." , "TableCell")],
    [p("Pedido", "TableCell"), p("Para generar albaran", "TableCell"), p("Solo se preparan las lineas que requieran entrega." , "TableCell")],
    [p("Pedido", "TableCell"), p("Realizado / Done", "TableCell"), p("Todo entregado o cancelado; se conserva como historico." , "TableCell")],
]
t = Table(states, colWidths=[29*mm, 53*mm, 94*mm], repeatRows=1)
t.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), DARK_GREEN), ("BACKGROUND", (0,1), (-1,-1), WHITE), ("GRID", (0,0), (-1,-1), 0.4, LINE), ("VALIGN", (0,0), (-1,-1), "TOP"), ("TOPPADDING", (0,0), (-1,-1), 5), ("BOTTOMPADDING", (0,0), (-1,-1), 5), ("LEFTPADDING", (0,0), (-1,-1), 6), ("RIGHTPADDING", (0,0), (-1,-1), 6)]))
story.append(t)
story.append(PageBreak())

# Policies
story.append(p("2. Como se decide el circuito de cada linea", "H1K"))
story.append(p("La clasificacion comercial ya existente y la nueva politica de flujo se combinan. La categoria logistica sigue indicando si el articulo mueve almacen; la politica determina si debe pasar por albaran y como se factura."))
story.append(Spacer(1, 3*mm))
policy_rows = [
    [p("Tipo comercial", "TableHead"), p("Categoria logistica", "TableHead"), p("Requiere albaran", "TableHead"), p("Politica factura", "TableHead"), p("Circuito", "TableHead")],
    [p("103 Producto", "TableCell"), p("Consumible", "TableCell"), p("Si", "TableCell"), p("DELIVERED", "TableCell"), p("Pedido -> Albaran parcial/total -> Factura", "TableCell")],
    [p("104 Producto", "TableCell"), p("Almacenable", "TableCell"), p("Si", "TableCell"), p("DELIVERED", "TableCell"), p("Pedido -> Preparacion/Albaran -> Factura", "TableCell")],
    [p("105 Transporte", "TableCell"), p("Servicio", "TableCell"), p("No", "TableCell"), p("ORDERED", "TableCell"), p("Pedido -> Factura directa", "TableCell")],
    [p("106 Servicio", "TableCell"), p("Servicio", "TableCell"), p("No", "TableCell"), p("ORDERED", "TableCell"), p("Pedido -> Factura directa", "TableCell")],
]
t = Table(policy_rows, colWidths=[31*mm, 34*mm, 33*mm, 34*mm, 44*mm], repeatRows=1)
t.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), DARK_GREEN), ("GRID", (0,0), (-1,-1), 0.4, LINE), ("VALIGN", (0,0), (-1,-1), "TOP"), ("TOPPADDING", (0,0), (-1,-1), 5), ("BOTTOMPADDING", (0,0), (-1,-1), 5), ("LEFTPADDING", (0,0), (-1,-1), 5), ("RIGHTPADDING", (0,0), (-1,-1), 5), ("BACKGROUND", (0,1), (-1,-1), WHITE)]))
story.append(t)
story.append(Spacer(1, 6*mm))
story.append(section_label("JERARQUIA DE RESOLUCION"))
story.append(Spacer(1, 4*mm))
hier = Table([[flow_box("1. PRODUCTO", "Override si existe"), arrow(), flow_box("2. TIPO", "Valor por defecto"), arrow(), flow_box("3. SISTEMA", "Valor seguro")]], colWidths=[43*mm, 10*mm, 43*mm, 10*mm, 43*mm])
hier.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "MIDDLE"), ("ALIGN", (0,0), (-1,-1), "CENTER"), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0)]))
story += [hier, Spacer(1, 6*mm)]
story.append(p("Regla de validacion", "H2K"))
story.append(p("Una linea que <b>no requiere albaran</b> no puede tener politica <b>DELIVERED</b>, porque no existiria una entrega de la que facturar. En ese caso se fuerza <b>ORDERED</b>."))
story.append(p("Instantanea en el pedido", "H2K"))
story.append(p("Al confirmar/crear el pedido se calculan los valores efectivos y se guardan en la propia linea de venta: <b>SALES_LINES_BOL_REQUIREDELIVERY</b> y <b>SALES_LINES_DS_INVOICING_POLICY</b>. Esto permite cambiar un producto para futuros documentos sin modificar pedidos ya emitidos."))
story.append(Spacer(1, 3*mm))
story.append(card("Criterio para excepciones", "La excepcion se configura en el producto solo cuando sea necesaria. El tipo comercial debe contener el comportamiento habitual; asi el mantenimiento sigue siendo sencillo y coherente." , 176*mm))
story.append(PageBreak())

# Data and quantity
story.append(p("3. Modelo de datos y control de cantidades", "H1K"))
story.append(p("El modelo actual ya dispone de los documentos necesarios. No se crean tablas paralelas: se aprovecha la relacion existente entre pedido, linea de pedido, albaran, linea de albaran y factura."))
data_rows = [
    [p("Entidad", "TableHead"), p("Papel", "TableHead"), p("Relacion clave", "TableHead")],
    [p("sales_orders", "TableCell"), p("Cabecera comun de presupuestos (P) y pedidos (S).", "TableCell"), p("El pedido conserva SALES_ORDERS_PKPK_ID como origen del presupuesto.", "TableCell")],
    [p("sales_lines", "TableCell"), p("Cantidad, precio y politica efectiva de cada pedido.", "TableCell"), p("Base de trazabilidad para albaranes y facturas.", "TableCell")],
    [p("sales_albaranes", "TableCell"), p("Cabecera de entrega total o parcial.", "TableCell"), p("SALES_ORDERS_PK_ID vincula al pedido.", "TableCell")],
    [p("sales_linesalbaranes", "TableCell"), p("Cantidad realmente entregada de una linea.", "TableCell"), p("SALES_LINES_PK_ID identifica la linea del pedido y PICK_PK_ID el movimiento de salida.", "TableCell")],
    [p("sales_invoices / sales_linesinvoices", "TableCell"), p("Facturacion de entregas o directamente del pedido.", "TableCell"), p("La linea admite origen de pedido y, si existe, origen de linea de albaran.", "TableCell")],
]
t = Table(data_rows, colWidths=[39*mm, 69*mm, 68*mm], repeatRows=1)
t.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), DARK_GREEN), ("GRID", (0,0), (-1,-1), 0.4, LINE), ("VALIGN", (0,0), (-1,-1), "TOP"), ("TOPPADDING", (0,0), (-1,-1), 5), ("BOTTOMPADDING", (0,0), (-1,-1), 5), ("LEFTPADDING", (0,0), (-1,-1), 6), ("RIGHTPADDING", (0,0), (-1,-1), 6)]))
story.append(t)
story.append(Spacer(1, 7*mm))
story.append(section_label("INVARIANTE DE CUMPLIMIENTO DE LINEA"))
story.append(Spacer(1, 5*mm))
formula = Table([[p("Pendiente = Cantidad pedida - Cantidad entregada - Cantidad cancelada", "H2K")]], colWidths=[176*mm])
formula.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,-1), LIGHT_GREEN), ("BOX", (0,0), (-1,-1), 0.7, colors.HexColor("#C5D79D")), ("ALIGN", (0,0), (-1,-1), "CENTER"), ("TOPPADDING", (0,0), (-1,-1), 11), ("BOTTOMPADDING", (0,0), (-1,-1), 11)]))
story.append(formula)
story.append(Spacer(1, 5*mm))
rules = [
    [card("Fuente de verdad", "Las lineas de albaran validadas suman la cantidad entregada. Las lineas de factura validadas suman la cantidad facturada. No se incrementan manualmente."), card("Campos de rendimiento", "QUANTYDELIVERED, QUANTYCANCELED, QUANTYINVOICED y QUANTYPENDING permiten listar rapido; deben recalcularse en cada transaccion relevante.")],
    [card("Entrega parcial", "Se puede albaranar cualquier cantidad positiva pendiente. El restante permanece disponible para un nuevo albaran o para una cancelacion parcial."), card("Cierre", "Un pedido queda Done cuando todas sus lineas tienen pendiente 0. No se borra ni se 'mata': queda bloqueado y auditable.")],
]
t = Table(rules, colWidths=[88*mm, 88*mm])
t.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 4), ("TOPPADDING", (0,0), (-1,-1), 0), ("BOTTOMPADDING", (0,0), (-1,-1), 5)]))
story.append(t)
story.append(PageBreak())

# Implementation plan
story.append(p("4. Orden de implementacion", "H1K"))
story.append(p("Trabajaremos por capas funcionales para que cada paso sea comprobable y no rompa el circuito ya terminado de presupuestos."))
plan_rows = [
    [p("Fase", "TableHead"), p("Entregable", "TableHead"), p("Resultado verificable", "TableHead")],
    [p("1", "TableCell"), p("Mantenimiento de productos", "TableCell"), p("Tipos comerciales y excepciones de producto definen albaran/politica. Ya alineado con el modelo.", "TableCell")],
    [p("2", "TableCell"), p("Pedidos de venta", "TableCell"), p("Listado, formulario, contadores, bloqueo y confirmacion desde presupuesto. Las lineas guardan la politica resuelta.", "TableCell")],
    [p("3", "TableCell"), p("Albaranes", "TableCell"), p("Creacion total/parcial desde lineas pendientes; actualiza entregado, pendiente, picking y estado del pedido.", "TableCell")],
    [p("4", "TableCell"), p("Facturacion", "TableCell"), p("Propuesta de lineas entregadas o directas de pedido; evita doble facturacion y actualiza facturado.", "TableCell")],
    [p("5", "TableCell"), p("Controles y reporting", "TableCell"), p("Indicadores de pendiente, entregado, facturado y cerrado; PDFs y correos con los patrones ya consolidados.", "TableCell")],
]
t = Table(plan_rows, colWidths=[18*mm, 54*mm, 104*mm], repeatRows=1)
t.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), DARK_GREEN), ("GRID", (0,0), (-1,-1), 0.4, LINE), ("VALIGN", (0,0), (-1,-1), "TOP"), ("TOPPADDING", (0,0), (-1,-1), 6), ("BOTTOMPADDING", (0,0), (-1,-1), 6), ("LEFTPADDING", (0,0), (-1,-1), 6), ("RIGHTPADDING", (0,0), (-1,-1), 6)]))
story.append(t)
story.append(Spacer(1, 7*mm))
story.append(section_label("DECISIONES CERRADAS"))
story.append(Spacer(1, 4*mm))
closed = [
    [p("1.", "CardTitle"), p("El pedido nace exclusivamente de un presupuesto aprobado, como copia trazable.", "CardBody")],
    [p("2.", "CardTitle"), p("Un pedido confirmado usa dos rutas: con albaran para productos fisicos y factura directa para servicios/transporte.", "CardBody")],
    [p("3.", "CardTitle"), p("Se permiten entregas parciales; el cierre se calcula por linea, no por una marca manual de cabecera.", "CardBody")],
    [p("4.", "CardTitle"), p("No se rediseña la base de datos existente; se usan las columnas nuevas y las relaciones ya disponibles.", "CardBody")],
    [p("5.", "CardTitle"), p("La moneda, precios, impuestos y politica efectiva quedan congelados en el documento para mantener la foto comercial.", "CardBody")],
]
t = Table(closed, colWidths=[14*mm, 162*mm])
t.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,-1), PALE), ("GRID", (0,0), (-1,-1), 0.35, LINE), ("VALIGN", (0,0), (-1,-1), "TOP"), ("TOPPADDING", (0,0), (-1,-1), 6), ("BOTTOMPADDING", (0,0), (-1,-1), 6), ("LEFTPADDING", (0,0), (-1,-1), 7), ("RIGHTPADDING", (0,0), (-1,-1), 7)]))
story.append(t)
story.append(Spacer(1, 9*mm))
story.append(card("Siguiente paso", "Crear el modulo de <b>Pedidos de venta</b> reutilizando el patron de Presupuestos y aplicando desde el primer guardado las politicas efectivas por linea. No se implementaran aun albaranes ni facturas, pero el pedido quedara preparado para ambos circuitos." , 176*mm))

doc.build(story, onFirstPage=page_header_footer, onLaterPages=page_header_footer)
print(OUT)
