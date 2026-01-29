"""
Compliance and Integrity: Financial Validation Layer.
Implements institutional logic for data consistency and minimum loan requirements 
at Moskalti Capital.
"""
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)

class FinancialValidationService:
    """
    Quality Assurance coordinator for credit analysis.
    Categorizes anomalies into Blocking (prohibits analysis) and Warnings (noted for the analyst).
    """
    
    @staticmethod
    def validate(
        balance_sheet: Dict[int, Dict], 
        income_statement: Dict[int, Dict],
        loan_amount: float,
        loan_term: int,
        credit_type: str
    ) -> Tuple[bool, List[Dict]]:
        """
        Executes a hierarchical validation suite.
        Ensures temporal data presence, accounting equilibrium (A=L+E), and loan detail integrity.
        Returns a tuple: (is_analysis_permitted, list_of_audit_alerts).
        """
        alerts = []
        is_blocked = False
        
        # 1. Structural Requirements (Blocking)
        
        # 1.1 Temporal Coverage Check
        years = sorted(balance_sheet.keys())
        if len(years) < 2:
            alerts.append({
                'level': 'BLOCKING',
                'rule': 'minimum_years_rule',
                'message': 'Institutional policy requires a minimum of two (2) complete fiscal years.',
                'details': f'Detected fiscal periods: {years}'
            })
            is_blocked = True
            
        # 1.2 Document Completeness Check
        for year in years:
            if not balance_sheet.get(year) or not income_statement.get(year):
                alerts.append({
                    'level': 'BLOCKING',
                    'rule': 'incomplete_statements_rule',
                    'message': f'Incomplete documentation detected for fiscal year {year}.',
                    'details': f'Missing: {"Balance Sheet" if not balance_sheet.get(year) else "Income Statement"}'
                })
                is_blocked = True

        # 1.3 Loan Parameter Validation
        if not loan_amount or loan_amount <= 0:
            alerts.append({
                'level': 'BLOCKING',
                'rule': 'invalid_principal_rule',
                'message': 'Analysis cannot proceed without a valid principal loan amount.',
                'details': 'Principal must be a positive non-zero value.'
            })
            is_blocked = True
            
        if not loan_term or loan_term <= 0:
            alerts.append({
                'level': 'BLOCKING',
                'rule': 'invalid_term_rule',
                'message': 'Contractual loan term must be explicitly defined.',
                'details': 'Term must be greater than zero months.'
            })
            is_blocked = True
            
        if not credit_type:
            alerts.append({
                'level': 'BLOCKING',
                'rule': 'missing_product_type_rule',
                'message': 'Credit product categorization (NEW/RENEWAL) is mandatory.',
                'details': 'Implicit type determination is currently disabled.'
            })
            is_blocked = True

        # 1.4 Accounting Integrity (The Balance Sheet Equilibrium Check)
        for year in years:
            bs = balance_sheet.get(year, {})
            assets = bs.get('total_assets', 0)
            liabilities = bs.get('total_liabilities', 0)
            equity = bs.get('shareholder_equity', 0)
            
            # Allow for minor rounding errors ($100 threshold) common in manual ledger captures
            discrepancy = abs(assets - (liabilities + equity))
            if discrepancy > 100:
                alerts.append({
                    'level': 'BLOCKING',
                    'rule': 'accounting_imbalance_rule',
                    'message': f'Internal accounting discrepancy detected in fiscal year {year}.',
                    'details': f'Out of balance by: ${discrepancy:,.2f} (Assets != Liabilities + Equity)'
                })
                is_blocked = True

        # 2. Risk Indicators (Non-blocking Warnings)
        
        # 2.1 Latest Year Performance Check
        latest_year = max(years) if years else None
        if latest_year and income_statement.get(latest_year):
            net_profit = income_statement[latest_year].get('net_profit', 0)
            if net_profit <= 0:
                alerts.append({
                    'level': 'WARNING',
                    'rule': 'negative_performance_alert',
                    'message': f'Negative or zero net profit reported in latest fiscal year ({latest_year}).',
                    'details': 'High-risk indicator. Review justification in SWOT analysis.'
                })
        
        return not is_blocked, alerts
