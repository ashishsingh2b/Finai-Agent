"""
Strategic Analysis Layer: Automated SWOT Synthesis.
Generates bilingual SWOT matrixes using Large Language Models with a procedural 
rule-based fallback for high-availability environments.
"""
from typing import Dict
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
import os
import json
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class SWOTGenerator:
    """
    Orchestrator for qualitative financial analysis.
    Synthesizes numerical ratios into actionable business insights (Strengths, Weaknesses, 
    Opportunities, Threats).
    """
    
    def __init__(self):
        try:
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key or api_key == "your-openai-api-key-here":
                self.llm = None
            else:
                self.llm = ChatOpenAI(
                    model="gpt-4", # High-density reasoning model
                    temperature=0.7, # Moderate creativity for qualitative insights
                    openai_api_key=api_key
                )
        except Exception as e:
            logger.error(f"SWOT AI Engine initialization failed: {e}")
            self.llm = None
    
    def generate_swot(self, company_data: dict, ratios: dict, language='es') -> dict:
        """
        Generates a 4-quadrant SWOT matrix.
        Attempts AI-driven synthesis first; falls back to deterministic rule-based generator on error.
        """
        if not self.llm:
            return self._generate_rule_based_swot(ratios, language)
        
        # Construct the context-rich prompt for the financial analyst persona
        template = """
        You are a financial analyst for Moskalti Capital, a Mexican SOFOM specializing in SME loans.
        
        Company: {company_name}
        Industry: {industry}
        
        Financial Performance Metrics:
        - Current Ratio: {current_ratio}
        - ROE: {roe}%
        - ROA: {roa}%
        - Debt-to-Assets: {debt_to_assets:.1%}
        - Profit Margin: {profit_margin}%
        - Leverage Index: {leverage}
        
        Task: Generate a professional SWOT matrix in {language}. 
        Focus strictly on financial stability, operational efficiency, and credit risk.
        
        Format as JSON:
        {{
            "strengths": ["Item 1", "Item 2", "Item 3"],
            "weaknesses": ["Item 1", "Item 2", "Item 3"],
            "opportunities": ["Item 1", "Item 2", "Item 3"],
            "threats": ["Item 1", "Item 2", "Item 3"]
        }}
        """
        
        prompt = ChatPromptTemplate.from_template(template)
        chain = prompt | self.llm
        
        try:
            response = chain.invoke({
                "company_name": company_data.get('name', 'Identidad Desconocida'),
                "industry": company_data.get('industry', 'General'),
                "current_ratio": ratios.get('current_ratio', 0),
                "roe": ratios.get('roe', 0),
                "roa": ratios.get('roa', 0),
                "debt_to_assets": ratios.get('debt_to_assets', 0),
                "profit_margin": ratios.get('profit_margin', 0),
                "leverage": ratios.get('leverage_ratio', 0),
                "language": "Spanish" if language == 'es' else "English"
            })
            
            return json.loads(response.content)
        except Exception as e:
            logger.warning(f"SWOT AI synthesis failed, engaging rule-based fallback: {e}")
            return self._generate_rule_based_swot(ratios, language)
    
    def _generate_rule_based_swot(self, ratios: dict, language='es') -> dict:
        """
        Deterministic SWOT generation based on institutional risk thresholds.
        Ensures system stability even during AI latency or outages.
        """
        swot = {
            "strengths": [],
            "weaknesses": [],
            "opportunities": [],
            "threats": []
        }
        
        if language == 'es':
            # Logic mapping for Spanish reports
            if ratios.get('current_ratio', 0) > 1.5:
                swot['strengths'].append("Sólida posición de liquidez de corto plazo")
            if ratios.get('roe', 0) > 15:
                swot['strengths'].append("Alta eficiencia en generación de utilidad sobre capital")
            if ratios.get('debt_to_assets', 0) < 0.5:
                swot['strengths'].append("Estructura de deuda conservadora")
            
            if ratios.get('current_ratio', 0) < 1.0:
                swot['weaknesses'].append("Capacidad de pago inmediata comprometida")
            if ratios.get('profit_margin', 0) < 5:
                swot['weaknesses'].append("Márgenes operativos reducidos")
            
            swot['opportunities'].append("Potencial de crecimiento mediante apalancamiento estratégico")
            swot['threats'].append("Sensibilidad a fluctuaciones en tasas TIIE")
        else:
            # Logic mapping for English reports
            if ratios.get('current_ratio', 0) > 1.5:
                swot['strengths'].append("Strong short-term liquidity position")
            if ratios.get('roe', 0) > 15:
                swot['strengths'].append("High return on equity efficiency")
            
            if ratios.get('current_ratio', 0) < 1.0:
                swot['weaknesses'].append("Compromised immediate debt service coverage")
            
            swot['opportunities'].append("Growth potential through strategic credit injection")
            swot['threats'].append("Sensitivity to interest rate volatility")
            
        return swot
