"""
Intelligent Document Extraction: AI Fallback Layer.
Leverages Large Language Models (LLMs) to extract structured financial data 
from unstructured text, OCR dumps, and unconventional table layouts.
"""
from typing import Dict, List, Optional, Any
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
import os
import logging
from ..file_processing.normalization import normalize_number

logger = logging.getLogger(__name__)

class FinancialDataSchema(BaseModel):
    """Schema for extracted financial data per fiscal year."""
    year: int
    revenue: float = 0.0
    ebitda: float = 0.0
    net_profit: float = 0.0
    total_assets: float = 0.0
    current_assets: float = 0.0
    total_liabilities: float = 0.0
    current_liabilities: float = 0.0
    shareholder_equity: float = 0.0

class MultiYearFinancialData(BaseModel):
    """Container for multi-year AI results."""
    data: List[FinancialDataSchema]

class AIExtractor:
    """
    GPT-powered financial data processor.
    Handles semantic mapping of accounts across multiple languages (ES/EN)
    and reconstructs structured statements from raw data dumps.
    """
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key or self.api_key == "your-openai-api-key-here":
            self.llm = None
            logger.warning("OpenAI API Key not configured. AI fallback services will be unavailable.")
        else:
            # Using GPT-4o for its superior spatial/table reasoning capabilities
            self.llm = ChatOpenAI(
                model="gpt-4o",
                temperature=0, # Deterministic output for accounting accuracy
                openai_api_key=self.api_key
            )
            
    def extract_financials(self, text_content: str) -> Dict[str, Any]:
        """
        Orchestrates the AI extraction flow.
        Converts raw document text into valid Balance Sheet and Income Statement dicts.
        """
        if not self.llm:
            return {"balance_sheet": {}, "income_statement": {}}

        template = """
        You are an expert financial auditor. Your task is to extract a multi-year balance sheet and income statement from the following text.
        
        CRITICAL INSTRUCTIONS:
        1. REASONING OVER KEYWORDS: Do not just look for exact words. Use your financial expertise to identify accounts even if the labels are unconventional or new (e.g., 'Ingresos Globales' -> Revenue, 'Fondo de Maniobra' -> Current Assets).
        2. SYNONYM HANDLING: Handle any Spanish or English synonyms for financial accounts common in Mexico and internationally.
        3. DATA CLEANING: Ignore symbols like $, %, and handles numbers in parentheses correctly as negative values.
        4. YEAR IDENTIFICATION: Identify the fiscal years (e.g., 2022, 2023) and group data accordingly.
        5. OUTPUT: Return ONLY a valid JSON object matching the schema below. If a value is missing, use 0.0.
        
        Text Content:
        ---
        {text}
        ---
        
        Expected Format:
        {{
            "data": [
                {{
                    "year": 2023,
                    "revenue": 1000000,
                    ...
                }}
            ]
        }}
        """
        
        prompt = ChatPromptTemplate.from_template(template)
        parser = JsonOutputParser(pydantic_object=MultiYearFinancialData)
        chain = prompt | self.llm | parser
        
        try:
            # Respect LLM token windows by truncating extremely large dumps
            truncated_text = text_content[:15000] 
            result = chain.invoke({"text": truncated_text})
            
            # Map AI results back to standard internal format
            balance_sheet = {}
            income_statement = {}
            
            for entry in result.get('data', []):
                year = entry.get('year')
                if not year: continue
                
                balance_sheet[year] = {
                    'cash': 0.0, 
                    'accounts_receivable': 0.0,
                    'inventory': 0.0,
                    'current_assets': entry.get('current_assets', 0.0),
                    'fixed_assets': entry.get('total_assets', 0.0) - entry.get('current_assets', 0.0),
                    'total_assets': entry.get('total_assets', 0.0),
                    'current_liabilities': entry.get('current_liabilities', 0.0),
                    'total_liabilities': entry.get('total_liabilities', 0.0),
                    'shareholder_equity': entry.get('shareholder_equity', 0.0)
                }
                
                income_statement[year] = {
                    'revenue': entry.get('revenue', 0.0),
                    'cost_of_goods_sold': entry.get('revenue', 0.0) - entry.get('ebitda', 0.0), 
                    'gross_profit': entry.get('revenue', 0.0) * 0.3, # Heuristic fallback
                    'ebitda': entry.get('ebitda', 0.0),
                    'net_profit': entry.get('net_profit', 0.0)
                }
                
            return {
                "balance_sheet": balance_sheet,
                "income_statement": income_statement
            }
            
        except Exception as e:
            logger.error(f"Post-processing AI extraction failure: {e}")
            return {"balance_sheet": {}, "income_statement": {}}
