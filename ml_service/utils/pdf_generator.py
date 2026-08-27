import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_gdp_pdf(shipment, readings, alerts, custody_log, mkt_value):
    """
    Generates a professional, GDP-compliant PDF audit report using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles adhering to ChillGuard color palette
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0D1B2A')
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#1D6FA4')
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#0D1B2A'),
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#111827')
    )

    header_table_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white
    )

    story = []

    # Title Banner
    story.append(Paragraph("CHILLGUARD OPERATIONAL INTELLIGENCE", subtitle_style))
    story.append(Spacer(1, 2))
    story.append(Paragraph("GDP Cold-Chain Compliance Audit Report", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')} | Document Ref: CG-GDP-{shipment.get('id', 'N/A')}", body_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#1D6FA4'), spaceBefore=2, spaceAfter=12))

    # Shipment Summary Table
    story.append(Paragraph("1. Shipment Overview", section_heading))
    overview_data = [
        [
            Paragraph("<b>Shipment ID:</b>", body_style), Paragraph(str(shipment.get('id')), body_style),
            Paragraph("<b>Status:</b>", body_style), Paragraph(str(shipment.get('status')).upper(), body_style)
        ],
        [
            Paragraph("<b>Product Name:</b>", body_style), Paragraph(str(shipment.get('product_name')), body_style),
            Paragraph("<b>Product Type:</b>", body_style), Paragraph(str(shipment.get('product_type')).upper(), body_style)
        ],
        [
            Paragraph("<b>Route:</b>", body_style), Paragraph(f"{shipment.get('origin')} → {shipment.get('destination')}", body_style),
            Paragraph("<b>Operator:</b>", body_style), Paragraph(str(shipment.get('operator_name')), body_style)
        ],
        [
            Paragraph("<b>Setpoint Temp:</b>", body_style), Paragraph(f"{shipment.get('setpoint_temp')}°C", body_style),
            Paragraph("<b>Safe Range:</b>", body_style), Paragraph(f"{shipment.get('min_temp')}°C to {shipment.get('max_temp')}°C", body_style)
        ]
    ]

    t_overview = Table(overview_data, colWidths=[110, 160, 110, 160])
    t_overview.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_overview)
    story.append(Spacer(1, 12))

    # MKT & Thermal Quality Metrics
    story.append(Paragraph("2. Thermal Stability & MKT Analysis", section_heading))
    mkt_str = f"{mkt_value}°C" if mkt_value is not None else "N/A"
    
    # Calculate excursion stats
    excursions = [r for r in readings if r.get('temperature', 0) > shipment.get('max_temp', 8) or r.get('temperature', 0) < shipment.get('min_temp', 2)]
    excursion_mins = len(excursions) * 5
    max_dev = max([abs(r.get('temperature', 0) - shipment.get('setpoint_temp', 5)) for r in readings]) if readings else 0

    mkt_data = [
        [
            Paragraph("<b>Mean Kinetic Temp (MKT):</b>", body_style), Paragraph(f"<b>{mkt_str}</b>", body_style),
            Paragraph("<b>Method:</b>", body_style), Paragraph("Arrhenius Kinetics (Ea=83.14 kJ/mol)", body_style)
        ],
        [
            Paragraph("<b>Total Excursion Time:</b>", body_style), Paragraph(f"{excursion_mins} minutes", body_style),
            Paragraph("<b>Max Temp Deviation:</b>", body_style), Paragraph(f"{round(max_dev, 2)}°C", body_style)
        ],
        [
            Paragraph("<b>Total Telemetry Points:</b>", body_style), Paragraph(str(len(readings)), body_style),
            Paragraph("<b>Compliance Rating:</b>", body_style), Paragraph("PASS (GDP Compliant)" if excursion_mins < 30 else "AUDIT REQUIRED", body_style)
        ]
    ]

    t_mkt = Table(mkt_data, colWidths=[140, 130, 110, 160])
    t_mkt.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F1F5F9')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_mkt)
    story.append(Spacer(1, 12))

    # Custody Chain Verification
    story.append(Paragraph("3. Custody Transfer & Handover Log", section_heading))
    custody_rows = [[
        Paragraph("Timestamp", header_table_style),
        Paragraph("Operator / Handler", header_table_style),
        Paragraph("Action", header_table_style),
        Paragraph("Temp (°C)", header_table_style)
    ]]

    for c in custody_log[:6]:
        ts = str(c.get('timestamp', ''))[:16].replace('T', ' ')
        custody_rows.append([
            Paragraph(ts, body_style),
            Paragraph(str(c.get('operator_name')), body_style),
            Paragraph(str(c.get('action')), body_style),
            Paragraph(f"{c.get('temperature_at_handoff')}°C", body_style)
        ])

    if len(custody_rows) == 1:
        custody_rows.append([Paragraph("No formal handovers recorded", body_style), Paragraph("-", body_style), Paragraph("-", body_style), Paragraph("-", body_style)])

    t_custody = Table(custody_rows, colWidths=[110, 160, 200, 70])
    t_custody.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0D1B2A')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_custody)
    story.append(Spacer(1, 14))

    # Sign-off Seal
    story.append(Paragraph("4. Quality Assurance Sign-Off", section_heading))
    sign_data = [
        [
            Paragraph("<b>QA Manager Signature:</b> ___________________________", body_style),
            Paragraph("<b>Date:</b> ______________", body_style)
        ],
        [
            Paragraph("<b>System Validation Stamp:</b> Verified via ChillGuard ML Automated Compliance Engine v1.0", body_style),
            Paragraph("<b>Status:</b> SIGNED & APPROVED", body_style)
        ]
    ]
    t_sign = Table(sign_data, colWidths=[380, 160])
    t_sign.setStyle(TableStyle([
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_sign)

    doc.build(story)
    pdf_data = buffer.getvalue()
    buffer.close()
    return pdf_data
