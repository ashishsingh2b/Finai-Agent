"""
PDF Report Generator for Credit Analysis
Generates professional PDF reports using ReportLab
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
matplotlib.use('Agg')  # Non-GUI backend
import io
from datetime import datetime
from typing import Dict
import os

class PDFReportGenerator:
    """Generate professional credit analysis PDF reports"""
    
    def __init__(self, language='es'):
        self.language = language
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
        
    def _setup_custom_styles(self):
        """Create custom paragraph styles"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#253746'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Section header
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#253746'),
            spaceBefore=20,
            spaceAfter=12,
            fontName='Helvetica-Bold'
        ))
        
        # Body text
        self.styles.add(ParagraphStyle(
            name='ReportBodyText',
            parent=self.styles['Normal'],
            fontSize=11,
            leading=14,
            alignment=TA_JUSTIFY
        ))
    
    def generate(self, analysis_data: Dict, output_path: str):
        """Generate complete PDF report"""
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        # Build document content
        story = []
        
        # Header
        story.extend(self._build_header(analysis_data))
        story.append(Spacer(1, 0.3*inch))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#253746')))
        story.append(Spacer(1, 0.3*inch))
        
        # Executive Summary
        story.extend(self._build_executive_summary(analysis_data))
        story.append(Spacer(1, 0.3*inch))
        
        # Loan Details Section
        story.extend(self._build_loan_details_section(analysis_data))
        story.append(Spacer(1, 0.3*inch))
        
        # Financial Ratios Section
        story.extend(self._build_financial_ratios_section(analysis_data))
        story.append(Spacer(1, 0.3*inch))
        
        # Credit Score Section
        story.extend(self._build_credit_score_section(analysis_data))
        story.append(Spacer(1, 0.3*inch))
        
        # SWOT Analysis
        story.extend(self._build_swot_section(analysis_data))
        story.append(PageBreak())
        
        # Recommendation
        story.extend(self._build_recommendation_section(analysis_data))
        
        # Footer
        story.extend(self._build_footer())
        
        # Build PDF
        doc.build(story)
        
    def _build_header(self, data: Dict) -> list:
        """Build report header with logo if available"""
        elements = []
        
        # Logo integration
        logo_path = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'logo.png')
        if os.path.exists(logo_path):
            elements.append(Image(logo_path, width=1.5*inch, height=0.5*inch))
            elements.append(Spacer(1, 0.2*inch))
            
        # Title
        title_text = "REPORTE DE ANÁLISIS CREDITICIO" if self.language == 'es' else "CREDIT ANALYSIS REPORT"
        elements.append(Paragraph(title_text, self.styles['CustomTitle']))
        
        # Company name
        company_name = data.get('company_name', 'N/A')
        elements.append(Paragraph(f"<b>{company_name}</b>", self.styles['Heading2']))
        
        # Date
        date_text = f"Fecha: {datetime.now().strftime('%d/%m/%Y')}" if self.language == 'es' else f"Date: {datetime.now().strftime('%m/%d/%Y')}"
        elements.append(Paragraph(date_text, self.styles['Normal']))
        
        return elements
    
    def _build_executive_summary(self, data: Dict) -> list:
        """Build executive summary section"""
        elements = []
        
        header_text = "RESUMEN EJECUTIVO" if self.language == 'es' else "EXECUTIVE SUMMARY"
        elements.append(Paragraph(header_text, self.styles['SectionHeader']))
        
        # Summary content
        credit_score = data.get('total_credit_score', 0)
        category = data.get('credit_category', 'N/A')
        recommendation = data.get('recommendation', 'PENDING')
        
        if self.language == 'es':
            summary = f"""
            La empresa ha sido evaluada mediante un análisis financiero integral. 
            El puntaje crediticio obtenido es de <b>{credit_score}/100</b>, clasificándose en la 
            categoría <b>{category}</b>. La recomendación final es: <b>{recommendation}</b>.
            """
        else:
            summary = f"""
            The company has been evaluated through a comprehensive financial analysis.
            The credit score obtained is <b>{credit_score}/100</b>, classified in 
            category <b>{category}</b>. The final recommendation is: <b>{recommendation}</b>.
            """
        
        elements.append(Paragraph(summary, self.styles['ReportBodyText']))
        
        return elements

    def _build_loan_details_section(self, data: Dict) -> list:
        """Build loan details table"""
        elements = []
        
        header_text = "DETALLES DEL CRÉDITO" if self.language == 'es' else "LOAN DETAILS"
        elements.append(Paragraph(header_text, self.styles['SectionHeader']))
        
        if self.language == 'es':
            table_data = [
                ['Concepto', 'Detalle'],
                ['Monto Solicitado', f"${data.get('requested_loan_amount', 0):,.2f}"],
                ['Monto Autorizado', f"${data.get('approved_amount', 0):,.2f}"],
                ['Plazo (Meses)', f"{data.get('loan_term_months', 12)}"],
                ['Tasa de Interés', "TIIE + 4.5%"],
                ['Tipo de Crédito', data.get('credit_type', 'NUEVO')]
            ]
        else:
            table_data = [
                ['Concept', 'Detail'],
                ['Requested Amount', f"${data.get('requested_loan_amount', 0):,.2f}"],
                ['Approved Amount', f"${data.get('approved_amount', 0):,.2f}"],
                ['Term (Months)', f"{data.get('loan_term_months', 12)}"],
                ['Interest Rate', "TIIE + 4.5%"],
                ['Credit Type', data.get('credit_type', 'NEW')]
            ]
            
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
        return elements
    
    def _build_financial_ratios_section(self, data: Dict) -> list:
        """Build financial ratios table"""
        elements = []
        
        header_text = "ÍNDICES FINANCIEROS" if self.language == 'es' else "FINANCIAL RATIOS"
        elements.append(Paragraph(header_text, self.styles['SectionHeader']))
        
        # Create table data
        if self.language == 'es':
            table_data = [
                ['Indicador', 'Valor', 'Interpretación'],
                ['Razón Corriente', f"{data.get('current_ratio', 0):.2f}", self._interpret_ratio('current_ratio', data.get('current_ratio', 0))],
                ['ROE (%)', f"{data.get('roe', 0):.2f}%", self._interpret_ratio('roe', data.get('roe', 0))],
                ['Apalancamiento (D/A)', f"{data.get('leverage_ratio', data.get('debt_to_assets', 0)):.2%}", self._interpret_ratio('leverage_ratio', data.get('leverage_ratio', data.get('debt_to_assets', 0)))],
                ['Tendencia de Ventas (%)', f"{data.get('sales_trend', 0):.2f}%", self._interpret_ratio('sales_trend', data.get('sales_trend', 0))],
                ['Cobertura Utilidad Neta', f"{data.get('net_income_coverage', 0):.2f}x", self._interpret_ratio('net_income_coverage', data.get('net_income_coverage', 0))],
                ['Cobertura de Intereses', f"{data.get('interest_coverage', 0):.2f}", self._interpret_ratio('interest_coverage', data.get('interest_coverage', 0))],
            ]
        else:
            table_data = [
                ['Indicator', 'Value', 'Interpretation'],
                ['Current Ratio', f"{data.get('current_ratio', 0):.2f}", self._interpret_ratio('current_ratio', data.get('current_ratio', 0))],
                ['ROE (%)', f"{data.get('roe', 0):.2f}%", self._interpret_ratio('roe', data.get('roe', 0))],
                ['Leverage (D/A)', f"{data.get('leverage_ratio', data.get('debt_to_assets', 0)):.2%}", self._interpret_ratio('leverage_ratio', data.get('leverage_ratio', data.get('debt_to_assets', 0)))],
                ['Sales Trend (%)', f"{data.get('sales_trend', 0):.2f}%", self._interpret_ratio('sales_trend', data.get('sales_trend', 0))],
                ['Net Income Coverage', f"{data.get('net_income_coverage', 0):.2f}x", self._interpret_ratio('net_income_coverage', data.get('net_income_coverage', 0))],
                ['Interest Coverage', f"{data.get('interest_coverage', 0):.2f}", self._interpret_ratio('interest_coverage', data.get('interest_coverage', 0))],
            ]
        
        # Create table
        table = Table(table_data, colWidths=[2.5*inch, 1.5*inch, 2.5*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#253746')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))
        
        elements.append(table)
        
        return elements
    
    def _build_credit_score_section(self, data: Dict) -> list:
        """Build credit score breakdown with pie chart"""
        elements = []
        
        header_text = "DESGLOSE DE CALIFICACIÓN CREDITICIA" if self.language == 'es' else "CREDIT SCORE BREAKDOWN"
        elements.append(Paragraph(header_text, self.styles['SectionHeader']))
        
        # Generate pie chart
        chart_buffer = self._generate_credit_score_chart(data)
        if chart_buffer:
            img = Image(chart_buffer, width=4*inch, height=3*inch)
            elements.append(img)
        
        return elements
    
    def _generate_credit_score_chart(self, data: Dict) -> io.BytesIO:
        """Generate credit score pie chart"""
        try:
            scores = {
                'Credit History (40%)': data.get('credit_history_score', 0),
                'Solvency (30%)': data.get('solvency_score', 0),
                'Profitability (30%)': data.get('profitability_score', 0)
            }
            
            if self.language == 'es':
                scores = {
                    'Historial Crediticio (40%)': data.get('credit_history_score', 0),
                    'Solvencia (30%)': data.get('solvency_score', 0),
                    'Rentabilidad (30%)': data.get('profitability_score', 0)
                }
            
            fig, ax = plt.subplots(figsize=(6, 4))
            ax.pie(scores.values(), labels=scores.keys(), autopct='%1.1f%%',
                  colors=['#253746', '#425563', '#BDC2C9'])
            ax.set_title('Credit Score Components' if self.language == 'en' else 'Componentes del Puntaje Crediticio')
            
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
            buffer.seek(0)
            plt.close()
            
            return buffer
        except Exception as e:
            return None
    
    def _build_swot_section(self, data: Dict) -> list:
        """Build SWOT analysis section"""
        elements = []
        
        header_text = "ANÁLISIS FODA" if self.language == 'es' else "SWOT ANALYSIS"
        elements.append(Paragraph(header_text, self.styles['SectionHeader']))
        
        swot = data.get('swot_analysis', {})
        
        # SWOT Table
        if self.language == 'es':
            swot_data = [
                ['FORTALEZAS', 'OPORTUNIDADES'],
                [self._format_list(swot.get('strengths', [])), self._format_list(swot.get('opportunities', []))],
                ['DEBILIDADES', 'AMENAZAS'],
                [self._format_list(swot.get('weaknesses', [])), self._format_list(swot.get('threats', []))]
            ]
        else:
            swot_data = [
                ['STRENGTHS', 'OPPORTUNITIES'],
                [self._format_list(swot.get('strengths', [])), self._format_list(swot.get('opportunities', []))],
                ['WEAKNESSES', 'THREATS'],
                [self._format_list(swot.get('weaknesses', [])), self._format_list(swot.get('threats', []))]
            ]
        
        table = Table(swot_data, colWidths=[3.25*inch, 3.25*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#10b981')),
            ('BACKGROUND', (1, 0), (1, 0), colors.HexColor('#0284c7')),
            ('BACKGROUND', (0, 2), (0, 2), colors.HexColor('#f59e0b')),
            ('BACKGROUND', (1, 2), (1, 2), colors.HexColor('#ef4444')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('TEXTCOLOR', (0, 2), (-1, 2), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('PADDING', (0, 0), (-1, -1), 10),
        ]))
        
        elements.append(table)
        
        return elements
    
    def _build_recommendation_section(self, data: Dict) -> list:
        """Build recommendation section"""
        elements = []
        
        header_text = "RECOMENDACIÓN FINAL" if self.language == 'es' else "FINAL RECOMMENDATION"
        elements.append(Paragraph(header_text, self.styles['SectionHeader']))
        
        recommendation = data.get('recommendation', 'PENDING')
        justification = data.get('recommendation_justification', [])
        conditions = data.get('conditions', [])
        
        # Recommendation decision
        decision_color = colors.green if recommendation == 'APPROVE' else (colors.orange if recommendation == 'APPROVE_WITH_CONDITIONS' else colors.red)
        elements.append(Paragraph(f"<b>Decisión: <font color='{decision_color}'>{recommendation}</font></b>", self.styles['Heading3']))
        
        # Justification
        if justification:
            just_text = "Justificación:" if self.language == 'es' else "Justification:"
            elements.append(Paragraph(f"<b>{just_text}</b>", self.styles['Normal']))
            elements.append(Paragraph(self._format_list(justification), self.styles['ReportBodyText']))
        
        # Conditions
        if conditions:
            cond_text = "Condiciones:" if self.language == 'es' else "Conditions:"
            elements.append(Spacer(1, 0.2*inch))
            elements.append(Paragraph(f"<b>{cond_text}</b>", self.styles['Normal']))
            elements.append(Paragraph(self._format_list(conditions), self.styles['ReportBodyText']))
        
        return elements
    
    def _build_footer(self) -> list:
        """Build report footer"""
        elements = []
        
        elements.append(Spacer(1, 0.5*inch))
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.grey))
        
        footer_text = f"Generado por Moskalti FinAI Agent - {datetime.now().strftime('%d/%m/%Y %H:%M')}"
        elements.append(Paragraph(footer_text, self.styles['Normal']))
        
        return elements
    
    def _format_list(self, items: list) -> str:
        """Format list items as bullet points"""
        if not items:
            return "N/A"
        return "<br/>".join([f"• {item}" for item in items])
    
    def _interpret_ratio(self, ratio_name: str, value: float) -> str:
        """Interpret financial ratio value"""
        interpretations = {
            'current_ratio': {
                'es': 'Bueno' if value > 1.5 else ('Adecuado' if value > 1.0 else 'Bajo'),
                'en': 'Good' if value > 1.5 else ('Adequate' if value > 1.0 else 'Low')
            },
            'roe': {
                'es': 'Excelente' if value > 15 else ('Bueno' if value > 10 else 'Bajo'),
                'en': 'Excellent' if value > 15 else ('Good' if value > 10 else 'Low')
            },
            'roa': {
                'es': 'Excelente' if value > 10 else ('Bueno' if value > 5 else 'Bajo'),
                'en': 'Excellent' if value > 10 else ('Good' if value > 5 else 'Low')
            },
            'debt_to_assets': {
                'es': 'Alto' if value > 0.7 else ('Moderado' if value > 0.5 else 'Bajo'),
                'en': 'High' if value > 0.7 else ('Moderate' if value > 0.5 else 'Low')
            },
            'profit_margin': {
                'es': 'Excelente' if value > 15 else ('Bueno' if value > 5 else 'Bajo'),
                'en': 'Excellent' if value > 15 else ('Good' if value > 5 else 'Low')
            },
            'interest_coverage': {
                'es': 'Excelente' if value > 3 else ('Adecuado' if value > 1.5 else 'Riesgoso'),
                'en': 'Excellent' if value > 3 else ('Adequate' if value > 1.5 else 'Risky')
            },
            'leverage_ratio': {
                'es': 'Bajo' if value < 0.4 else ('Moderado' if value < 0.6 else 'Alto'),
                'en': 'Low' if value < 0.4 else ('Moderate' if value < 0.6 else 'High')
            },
            'sales_trend': {
                'es': 'Crecimiento' if value > 5 else ('Estable' if value > -2 else 'Decrecimiento'),
                'en': 'Growth' if value > 5 else ('Stable' if value > -2 else 'Decline')
            },
            'net_income_coverage': {
                'es': 'Adecuada' if value >= 2 else 'Baja',
                'en': 'Adequate' if value >= 2 else 'Low'
            }
        }
        
        return interpretations.get(ratio_name, {}).get(self.language, 'N/A')
