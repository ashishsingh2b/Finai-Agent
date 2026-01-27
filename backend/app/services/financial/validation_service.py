from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)

class FinancialValidationService:
    """
    Service to validate financial data quality based on Moskalti institutional rules.
    Divided into Mandatory (Blocking) and Warning (Alert-based) rules.
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
        Comprehensive validation. 
        Returns (is_valid, alerts)
        If is_valid is False, the alerts contain blocking errors.
        """
        alerts = []
        is_blocked = False
        
        # 1. Mandatory Validations (Blocking)
        
        # 1.1 At least two complete fiscal years
        years = sorted(balance_sheet.keys())
        if len(years) < 2:
            alerts.append({
                'level': 'BLOCKING',
                'rule': 'minimum_years',
                'message': 'At least two complete fiscal years of financial statements must be provided.',
                'details': f'Found years: {years}'
            })
            is_blocked = True
            
        # 1.2 Balance Sheet and Income Statement required for all years
        for year in years:
            if not balance_sheet.get(year) or not income_statement.get(year):
                alerts.append({
                    'level': 'BLOCKING',
                    'rule': 'missing_statements',
                    'message': f'Both Balance Sheet and Income Statement are required for year {year}.',
                    'details': f'BS: {"Yes" if balance_sheet.get(year) else "No"}, IS: {"Yes" if income_statement.get(year) else "No"}'
                })
                is_blocked = True

        # 1.3 Loan Details required
        if not loan_amount or loan_amount <= 0:
            alerts.append({
                'level': 'BLOCKING',
                'rule': 'missing_loan_amount',
                'message': 'Requested loan amount must be entered.',
                'details': 'Amount cannot be zero or empty.'
            })
            is_blocked = True
            
        if not loan_term or loan_term <= 0:
            alerts.append({
                'level': 'BLOCKING',
                'rule': 'missing_loan_term',
                'message': 'Loan term must be defined.',
                'details': 'Term must be > 0 months.'
            })
            is_blocked = True
            
        if not credit_type:
            alerts.append({
                'level': 'BLOCKING',
                'rule': 'missing_credit_type',
                'message': 'Credit type must be defined.',
                'details': 'Select either NEW or RENEWAL.'
            })
            is_blocked = True

        # 1.4 Accounting Consistency (Assets = Liabilities + Equity)
        for year in years:
            bs = balance_sheet.get(year, {})
            assets = bs.get('total_assets', 0)
            liabilities = bs.get('total_liabilities', 0)
            equity = bs.get('shareholder_equity', 0)
            
            diff = abs(assets - (liabilities + equity))
            if diff > 100: # Threshold for rounding errors
                alerts.append({
                    'level': 'BLOCKING',
                    'rule': 'accounting_inconsistency',
                    'message': f'Financial statements for {year} are internally inconsistent (Assets != Liabilities + Equity).',
                    'details': f'Difference: {diff:.2f} (Assets: {assets:.2f}, L+E: {liabilities+equity:.2f})'
                })
                is_blocked = True

        # 2. Warning / Alert-Based Validations (Non-blocking)
        
        # 2.1 Net Profit zero or negative
        latest_year = max(years) if years else None
        if latest_year and income_statement.get(latest_year):
            net_profit = income_statement[latest_year].get('net_profit', 0)
            if net_profit <= 0:
                alerts.append({
                    'level': 'WARNING',
                    'rule': 'negative_profit',
                    'message': f'Net profit for {latest_year} is zero or negative.',
                    'details': 'Clean approval is not recommended for companies with zero/negative profit.'
                })

        # 2.2 Low OCR Confidence (Placeholder - would be passed from parser)
        # 2.3 Financial ratios outside preferred thresholds (e.g. coverage below 2:1)
        # This is already handled by SWOT and Recommendation engine, but can be added here for UI visibility
        
        return not is_blocked, alerts
