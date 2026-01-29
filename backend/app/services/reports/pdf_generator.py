"""
Reporting Infrastructure: Clinical PDF Generation.
Implements a layered ReportLab architecture to produce visually professional, 
institutionally branded credit analysis documents in multiple languages.
"""
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.platypus.flowables import HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Enforce non-GUI backend for server-side generation
import io
from datetime import datetime
from typing import Dict
import os

class PDFReportGenerator:
    """
    Expert-level document orchestrator.
    Handles dynamic template building, matplotlib chart embedding, and bilingual content mapping.
    """
    
    def __init__(self, language='es'):
        self.language = language
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
        
    def _setup_custom_styles(self):
        """Initializes the institutional design system within PDF styles."""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#253746'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#253746'),
            spaceBefore=20,
            spaceAfter=12,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='ReportBodyText',
            parent=self.styles['Normal'],
            fontSize=11,
            leading=14,
            alignment=TA_JUSTIFY
        ))
    
    def generate(self, analysis_data: Dict, output_path: str):
        """
        Generates the chronological structural elements of the report.
        Assembles sections: Header -> Summary -> Loan -> Ratios -> Score -> SWOT -> Recommendation.
        """
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        story = []
        
        # Integrated Branding & Executive Baseline
        story.extend(self._build_header(analysis_data))
        story.append(Spacer(1, 0.3*inch))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#253746')))
        story.append(Spacer(1, 0.3*inch))
        
        story.extend(self._build_executive_summary(analysis_data))
        story.append(Spacer(1, 0.3*inch))
        
        # Structured Financial Disclosure
        story.extend(self._build_loan_details_section(analysis_data))
        story.append(Spacer(1, 0.3*inch))
        
        story.extend(self._build_financial_ratios_section(analysis_data))
        story.append(Spacer(1, 0.3*inch))
        
        story.extend(self._build_credit_score_section(analysis_data))
        story.append(Spacer(1, 0.3*inch))
        
        # Intelligence & Qualitative Synthesis
        story.extend(self._build_swot_section(analysis_data))
        story.append(PageBreak())
        
        story.extend(self._build_recommendation_section(analysis_data))
        story.extend(self._build_footer())
        
        doc.build(story)
        
    def _build_header(self, data: Dict) -> list:
        """Assembles the report identity and logo baseline."""
        elements = []
        logo_path = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'logo.png')
        if os.path.exists(logo_path):
            elements.append(Image(logo_path, width=1.5*inch, height=0.5*inch))
            elements.append(Spacer(1, 0.2*inch))
            
        title_text = "REPORTE DE ANÁLISIS CREDITICIO" if self.language == 'es' else "CREDIT ANALYSIS REPORT"
        elements.append(Paragraph(title_text, self.styles['CustomTitle']))
        
        company_name = data.get('company_name', 'Entidad No Identificada')
        elements.append(Paragraph(f"<b>{company_name}</b>", self.styles['Heading2']))
        
        date_text = f"Fecha de Emisión: {datetime.now().strftime('%d/%m/%Y')}" if self.language == 'es' else f"Issue Date: {datetime.now().strftime('%m/%d/%Y')}"
        elements.append(Paragraph(date_text, self.styles['Normal']))
        
        return elements
    
    def _calculate_interest_rate(self, data: Dict) -> str:
        """Determines the risk-adjusted interest rate using the TIIE benchmark and spread matrix."""
        TIIE_RATE = 11.25
        spread_matrix = {
            'A': {1: 10.0, 2: 12.0, 3: 16.0, 4: 22.0, 5: 30.0},
            'B': {1: 12.5, 2: 14.5, 3: 18.5, 4: 24.5, 5: 32.5},
            'C': {1: 17.5, 2: 19.5, 3: 23.5, 4: 29.5, 5: 37.5}, 
            'D': {1: 25.0, 2: 27.0, 3: 31.0, 4: 37.0, 5: 45.0},
            'E': {1: 35.0, 2: 37.0, 3: 41.0, 4: 47.0, 5: 55.0}
        }
        
        category = data.get('credit_category', 'C')
        collateral_type = data.get('collateral_type', 2)
        
        # Defensive parameter handling
        if category not in spread_matrix: category = 'C'
        if collateral_type not in [1, 2, 3, 4, 5]: collateral_type = 2
        
        spread = spread_matrix[category][collateral_type]
        total_rate = TIIE_RATE + spread
        
        return f"TIIE + {spread:.1f}% ({total_rate:.2f}%)"

    def _build_loan_details_section(self, data: Dict) -> list:
        """Constructs the loan parameter disclosure table."""
        elements = []
        header_text = "DETALLES DEL CRÉDITO" if self.language == 'es' else "LOAN DETAILS"
        elements.append(Paragraph(header_text, self.styles['SectionHeader']))
        
        rate_text = self._calculate_interest_rate(data)
        
        table_config = {
            'es': [
                ['Concepto', 'Detalle'],
                ['Monto Solicitado', f"${data.get('requested_loan_amount', 0):,.2f}"],
                ['Monto Autorizado', f"${data.get('approved_amount', 0):,.2f}"],
                ['Plazo (Meses)', f"{data.get('loan_term_months', 12)}"],
                ['Tasa de Interés', rate_text],
                ['Tipo de Crédito', data.get('credit_type', 'NUEVO')]
            ],
            'en': [
                ['Concept', 'Detail'],
                ['Requested Amount', f"${data.get('requested_loan_amount', 0):,.2f}"],
                ['Approved Amount', f"${data.get('approved_amount', 0):,.2f}"],
                ['Term (Months)', f"{data.get('loan_term_months', 12)}"],
                ['Interest Rate', rate_text],
                ['Credit Type', data.get('credit_type', 'NEW')]
            ]
        }
        
        table_data = table_config[self.language if self.language in table_config else 'es']
        table = Table(table_data, colWidths=[3.25*inch, 3.25*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#253746')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))
        
        elements.append(table)
        
        # Dynamic TIIE reference note for regulatory compliance
        current_date_str = datetime.now().strftime('%d/%m/%Y')
        tiie_note = {
            'es': f"<font size=8><i>* TIIE a 28 días utilizada: 11.25%, vigente al {current_date_str}. Metodología basada en hechos de mercado (Circular 4/2023).</i></font>",
            'en': f"<font size=8><i>* 28-day TIIE used: 11.25%, effective as of {current_date_str}. Methodology based on market facts (Circular 4/2023).</i></font>"
        }[self.language if self.language in ['es', 'en'] else 'es']
            
        elements.append(Spacer(1, 0.1*inch))
        elements.append(Paragraph(tiie_note, self.styles['Normal']))
        
        return elements
