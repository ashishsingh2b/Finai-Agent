from typing import Dict
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
import os
import json
from dotenv import load_dotenv

load_dotenv()

class SWOTGenerator:
    """Generate SWOT analysis using GPT-4"""
    
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key or api_key == "your-openai-api-key-here":
            # Fallback to rule-based SWOT if no API key
            self.llm = None
        else:
            self.llm = ChatOpenAI(
                model="gpt-4",
                temperature=0.7,
                api_key=api_key
            )
    
    def generate_swot(self, company_data: dict, ratios: dict, language='es') -> dict:
        """Generate SWOT analysis"""
        
        # If no OpenAI key, use rule-based SWOT
        if not self.llm:
            return self._generate_rule_based_swot(ratios, language)
        
        # Use AI-powered SWOT
        template = """
        You are a financial analyst for Moskalti Capital, a Mexican SOFOM specializing in SME loans.
        
        Company: {company_name}
        Industry: {industry}
        
        Financial Ratios:
        - Current Ratio: {current_ratio}
        - ROE: {roe}%
        - ROA: {roa}%
        - Debt-to-Assets: {debt_to_assets:.1%}
        - Profit Margin: {profit_margin}%
        - Leverage: {leverage}
        
        Generate a SWOT analysis in {language}. Format as JSON:
        {{
            "strengths": ["point 1", "point 2", "point 3"],
            "weaknesses": ["point 1", "point 2", "point 3"],
            "opportunities": ["point 1", "point 2", "point 3"],
            "threats": ["point 1", "point 2", "point 3"]
        }}
        
        Each category should have 3-4 specific, data-driven points.
        Focus on financial health and creditworthiness.
        """
        
        prompt = ChatPromptTemplate.from_template(template)
        chain = prompt | self.llm
        
        try:
            response = chain.invoke({
                "company_name": company_data.get('name', 'Company'),
                "industry": company_data.get('industry', 'General'),
                "current_ratio": ratios.get('current_ratio', 0),
                "roe": ratios.get('roe', 0),
                "roa": ratios.get('roa', 0),
                "debt_to_assets": ratios.get('debt_to_assets', 0),
                "profit_margin": ratios.get('profit_margin', 0),
                "leverage": ratios.get('leverage_ratio', 0),
                "language": "Spanish" if language == 'es' else "English"
            })
            
            # Parse JSON response
            swot = json.loads(response.content)
            return swot
            
        except Exception as e:
            # Fallback to rule-based if AI fails
            return self._generate_rule_based_swot(ratios, language)
    
    def _generate_rule_based_swot(self, ratios: dict, language='es') -> dict:
        """Generate rule-based SWOT when AI is unavailable"""
        
        if language == 'es':
            swot = {
                "strengths": [],
                "weaknesses": [],
                "opportunities": [],
                "threats": []
            }
            
            # Strengths
            if ratios.get('current_ratio', 0) > 1.5:
                swot['strengths'].append("Buena liquidez para cubrir obligaciones a corto plazo")
            if ratios.get('roe', 0) > 15:
                swot['strengths'].append("Alta rentabilidad sobre capital propio")
            if ratios.get('debt_to_assets', 0) < 0.5:
                swot['strengths'].append("Nivel de endeudamiento moderado")
            
            # Weaknesses
            if ratios.get('current_ratio', 0) < 1.0:
                swot['weaknesses'].append("Liquidez insuficiente")
            if ratios.get('profit_margin', 0) < 5:
                swot['weaknesses'].append("Márgenes de utilidad bajos")
            if ratios.get('debt_to_assets', 0) > 0.7:
                swot['weaknesses'].append("Alto nivel de endeudamiento")
            
            # Opportunities
            swot['opportunities'].append("Expansión de mercado con financiamiento adecuado")
            swot['opportunities'].append("Optimización de estructura de capital")
            swot['opportunities'].append("Mejora en eficiencia operativa")
            
            # Threats
            swot['threats'].append("Volatilidad en tasas de interés")
            swot['threats'].append("Competencia en el sector")
            if ratios.get('leverage_ratio', 0) > 3:
                swot['threats'].append("Riesgo de sobreapalancamiento")
            
        else:  # English
            swot = {
                "strengths": [],
                "weaknesses": [],
                "opportunities": [],
                "threats": []
            }
            
            # Strengths
            if ratios.get('current_ratio', 0) > 1.5:
                swot['strengths'].append("Good liquidity to cover    short-term obligations")
            if ratios.get('roe', 0) > 15:
                swot['strengths'].append("High return on equity")
            if ratios.get('debt_to_assets', 0) < 0.5:
                swot['strengths'].append("Moderate debt level")
            
            # Weaknesses
            if ratios.get('current_ratio', 0) < 1.0:
                swot['weaknesses'].append("Insufficient liquidity")
            if ratios.get('profit_margin', 0) < 5:
                swot['weaknesses'].append("Low profit margins")
            if ratios.get('debt_to_assets', 0) > 0.7:
                swot['weaknesses'].append("High debt level")
            
            # Opportunities
            swot['opportunities'].append("Market expansion with adequate financing")
            swot['opportunities'].append("Capital structure optimization")
            swot['opportunities'].append("Operational efficiency improvement")
            
            # Threats
            swot['threats'].append("Interest rate volatility")
            swot['threats'].append("Industry competition")
            if ratios.get('leverage_ratio', 0) > 3:
                swot['threats'].append("Over-leverage risk")
        
        return swot
