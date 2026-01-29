from typing import Dict
import numpy as np

class FinancialCalculator:
    """
    Standardized calculator for all financial ratios used in the credit model.
    Implements standard accounting formulas synchronized across PDF reports and dashboard.
    """
    
    @staticmethod
    def calculate_current_ratio(current_assets: float, current_liabilities: float) -> float:
        """
        Calculates Liquidity: Current Assets / Current Liabilities.
        Represents the ability to cover short-term debts.
        """
        if current_liabilities == 0:
            return 0.0
        return round(current_assets / current_liabilities, 4)
    
    @staticmethod
    def calculate_debt_to_assets(total_liabilities: float, total_assets: float) -> float:
        """
        Calculates Solvency: Total Liabilities / Total Assets.
        Measures the extent of asset financing via debt.
        """
        if total_assets == 0:
            return 0.0
        return round(total_liabilities / total_assets, 4)
    
    @staticmethod
    def calculate_leverage(total_liabilities: float, equity: float) -> float:
        """
        Calculates Leverage: Total Liabilities / Shareholder Equity.
        Measures the multiplier effect of debt on owner's capital.
        """
        if equity == 0:
            return 0.0
        return round(total_liabilities / equity, 4)
    
    @staticmethod
    def calculate_fixed_asset_ratio(fixed_assets: float, total_assets: float) -> float:
        """
        Calculates Asset Concentration: Fixed Assets / Total Assets.
        """
        if total_assets == 0:
            return 0.0
        return round(fixed_assets / total_assets, 4)
    
    @staticmethod
    def calculate_dso(accounts_receivable: float, annual_sales: float) -> float:
        """
        Days Sales Outstanding: (Receivables / Sales) * 360.
        Measures efficiency in collecting payments.
        """
        if annual_sales == 0:
            return 0.0
        return round((accounts_receivable / annual_sales) * 360, 2)
    
    @staticmethod
    def calculate_dio(inventory: float, cogs: float) -> float:
        """
        Days Inventory Outstanding: (Inventory / COGS) * 360.
        Measures how fast inventory is sold.
        """
        if cogs == 0:
            return 0.0
        return round((inventory / cogs) * 360, 2)
    
    @staticmethod
    def calculate_dpo(accounts_payable: float, cogs: float) -> float:
        """
        Days Payable Outstanding: (Payables / COGS) * 360.
        Measures how fast a company pays its suppliers.
        """
        if cogs == 0:
            return 0.0
        return round((accounts_payable / cogs) * 360, 2)
    
    @staticmethod
    def calculate_cash_conversion_cycle(dso: float, dio: float, dpo: float) -> float:
        """
        Financial Cycle: DSO + DIO - DPO.
        Overall measure of operational cash flow efficiency.
        """
        return round(dso + dio - dpo, 2)
    
    @staticmethod
    def calculate_profit_margin(net_profit: float, revenue: float) -> float:
        """Margen Utilidad (%) - Net Profit / Revenue."""
        if revenue == 0:
            return 0.0
        return round((net_profit / revenue) * 100, 2)
    
    @staticmethod
    def calculate_ebitda_margin(ebitda: float, revenue: float) -> float:
        """Margen EBITDA (%) - EBITDA / Revenue."""
        if revenue == 0:
            return 0.0
        return round((ebitda / revenue) * 100, 2)
    
    @staticmethod
    def calculate_roa(net_profit: float, total_assets: float) -> float:
        """Return on Assets (%) - Net Profit / Total Assets."""
        if total_assets == 0:
            return 0.0
        return round((net_profit / total_assets) * 100, 2)
    
    @staticmethod
    def calculate_roe(net_profit: float, equity: float) -> float:
        """Return on Equity (%) - Net Profit / Equity."""
        if equity == 0:
            return 0.0
        return round((net_profit / equity) * 100, 2)
    
    @staticmethod
    def calculate_asset_turnover(revenue: float, total_assets: float) -> float:
        """Efficiency: Revenue / Total Assets."""
        if total_assets == 0:
            return 0.0
        return round(revenue / total_assets, 4)
    
    @staticmethod
    def calculate_interest_coverage(ebitda: float, interest_expense: float) -> float:
        """Debt Service Ability: EBITDA / Interest Expense."""
        if interest_expense == 0:
            return 0.0
        return round(ebitda / abs(interest_expense), 2)
    
    @staticmethod
    def calculate_3year_average_profit(profits: list) -> float:
        """Standard arithmetic mean for the last 3 business cycles."""
        if len(profits) < 3:
            return 0.0
        return round(np.mean(profits[-3:]), 2)
    
    @staticmethod
    def calculate_profit_to_loan_ratio(avg_profit: float, loan_amount: float) -> float:
        """Coverage Ratio: Net Profit / Requested Loan Amount."""
        if loan_amount == 0:
            return 0.0
        return round(avg_profit / loan_amount, 4)
    
    @staticmethod
    def calculate_sales_trend(current_sales: float, previous_sales: float) -> float:
        """Year-over-Year (YoY) Revenue Growth Percentage."""
        if previous_sales == 0:
            return 0.0
        return round(((current_sales - previous_sales) / previous_sales) * 100, 2)

    @staticmethod
    def calculate_net_income_coverage(net_profit: float, requested_amount: float) -> float:
        """Specific metric for Loan vs Annual Net Income."""
        if requested_amount == 0:
            return 0.0
        return round(net_profit / requested_amount, 4)
    
    @staticmethod
    def calculate_all_ratios(balance_sheet: Dict, income_statement: Dict, loan_amount: float = None) -> Dict:
        """Orchestrate the calculation of all core ratios from standardized financial objects."""
        
        # Extract base values with safe fallbacks
        current_assets = balance_sheet.get('current_assets', 0)
        current_liabilities = balance_sheet.get('current_liabilities', 0)
        total_assets = balance_sheet.get('total_assets', 0)
        total_liabilities = balance_sheet.get('total_liabilities', 0)
        equity = balance_sheet.get('shareholder_equity', 0)
        fixed_assets = balance_sheet.get('fixed_assets', 0)
        accounts_receivable = balance_sheet.get('accounts_receivable', 0)
        inventory = balance_sheet.get('inventory', 0)
        accounts_payable = balance_sheet.get('accounts_payable', 0)
        
        revenue = income_statement.get('revenue', 0)
        cogs = income_statement.get('cost_of_goods_sold', 0)
        net_profit = income_statement.get('net_profit', 0)
        ebitda = income_statement.get('ebitda', 0)
        interest_expense = income_statement.get('interest_expense', 0)
        
        # Aggregate all ratios
        ratios = {
            'current_ratio': FinancialCalculator.calculate_current_ratio(current_assets, current_liabilities),
            'debt_to_assets': FinancialCalculator.calculate_debt_to_assets(total_liabilities, total_assets),
            'leverage_ratio': FinancialCalculator.calculate_leverage(total_liabilities, equity),
            'fixed_asset_ratio': FinancialCalculator.calculate_fixed_asset_ratio(fixed_assets, total_assets),
            'dso': FinancialCalculator.calculate_dso(accounts_receivable, revenue),
            'dio': FinancialCalculator.calculate_dio(inventory, cogs),
            'dpo': FinancialCalculator.calculate_dpo(accounts_payable, cogs),
            'profit_margin': FinancialCalculator.calculate_profit_margin(net_profit, revenue),
            'ebitda_margin': FinancialCalculator.calculate_ebitda_margin(ebitda, revenue),
            'roa': FinancialCalculator.calculate_roa(net_profit, total_assets),
            'roe': FinancialCalculator.calculate_roe(net_profit, equity),
            'asset_turnover': FinancialCalculator.calculate_asset_turnover(revenue, total_assets),
            'interest_coverage': FinancialCalculator.calculate_interest_coverage(ebitda, interest_expense),
        }
        
        # Financial Cycle calculation
        ratios['cash_conversion_cycle'] = FinancialCalculator.calculate_cash_conversion_cycle(
            ratios['dso'], ratios['dio'], ratios['dpo']
        )
        
        # Add coverage metric if context allows
        if loan_amount:
            ratios['profit_to_loan_ratio'] = FinancialCalculator.calculate_profit_to_loan_ratio(
                net_profit, loan_amount
            )
        
        return ratios
