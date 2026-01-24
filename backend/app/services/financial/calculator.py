from typing import Dict
import numpy as np

class FinancialCalculator:
    """Calculate all financial ratios based on Moskalti formulas"""
    
    @staticmethod
    def calculate_current_ratio(current_assets: float, current_liabilities: float) -> float:
        """Activo Circulante / Pasivo a Corto Plazo"""
        if current_liabilities == 0:
            return 0.0
        return round(current_assets / current_liabilities, 4)
    
    @staticmethod
    def calculate_debt_to_assets(total_liabilities: float, total_assets: float) -> float:
        """Deuda Total / Activos Totales"""
        if total_assets == 0:
            return 0.0
        return round(total_liabilities / total_assets, 4)
    
    @staticmethod
    def calculate_leverage(total_liabilities: float, total_assets: float) -> float:
        """Deuda Total / Activos Totales (Client Request)"""
        if total_assets == 0:
            return 0.0
        return round(total_liabilities / total_assets, 4)
    
    @staticmethod
    def calculate_fixed_asset_ratio(fixed_assets: float, total_assets: float) -> float:
        """Activos Fijos / Activos Totales"""
        if total_assets == 0:
            return 0.0
        return round(fixed_assets / total_assets, 4)
    
    @staticmethod
    def calculate_dso(accounts_receivable: float, annual_sales: float) -> float:
        """Days Sales Outstanding - Rotación de cuentas por cobrar"""
        if annual_sales == 0:
            return 0.0
        return round((accounts_receivable / annual_sales) * 360, 2)
    
    @staticmethod
    def calculate_dio(inventory: float, cogs: float) -> float:
        """Days Inventory Outstanding - Rotación de inventarios"""
        if cogs == 0:
            return 0.0
        return round((inventory / cogs) * 360, 2)
    
    @staticmethod
    def calculate_dpo(accounts_payable: float, cogs: float) -> float:
        """Days Payable Outstanding - Rotación de cuentas por pagar"""
        if cogs == 0:
            return 0.0
        return round((accounts_payable / cogs) * 360, 2)
    
    @staticmethod
    def calculate_cash_conversion_cycle(dso: float, dio: float, dpo: float) -> float:
        """Ciclo Financiero"""
        return round(dso + dio - dpo, 2)
    
    @staticmethod
    def calculate_profit_margin(net_profit: float, revenue: float) -> float:
        """Margen Utilidad (%)"""
        if revenue == 0:
            return 0.0
        return round((net_profit / revenue) * 100, 2)
    
    @staticmethod
    def calculate_ebitda_margin(ebitda: float, revenue: float) -> float:
        """Margen UAFIR (%)"""
        if revenue == 0:
            return 0.0
        return round((ebitda / revenue) * 100, 2)
    
    @staticmethod
    def calculate_roa(net_profit: float, total_assets: float) -> float:
        """ROA (%)"""
        if total_assets == 0:
            return 0.0
        return round((net_profit / total_assets) * 100, 2)
    
    @staticmethod
    def calculate_roe(net_profit: float, equity: float) -> float:
        """ROE (%)"""
        if equity == 0:
            return 0.0
        return round((net_profit / equity) * 100, 2)
    
    @staticmethod
    def calculate_asset_turnover(revenue: float, total_assets: float) -> float:
        """Ventas / Activos Totales"""
        if total_assets == 0:
            return 0.0
        return round(revenue / total_assets, 4)
    
    @staticmethod
    def calculate_interest_coverage(ebitda: float, interest_expense: float) -> float:
        """Interest Coverage Ratio"""
        if interest_expense == 0:
            return 0.0
        return round(ebitda / abs(interest_expense), 2)
    
    @staticmethod
    def calculate_3year_average_profit(profits: list) -> float:
        """Promedio últimos 3 años"""
        if len(profits) < 3:
            return 0.0
        return round(np.mean(profits[-3:]), 2)
    
    @staticmethod
    def calculate_profit_to_loan_ratio(avg_profit: float, loan_amount: float) -> float:
        """Margen de utilidad / Préstamo"""
        if loan_amount == 0:
            return 0.0
        return round(avg_profit / loan_amount, 4)
    
    @staticmethod
    def calculate_sales_trend(current_sales: float, previous_sales: float) -> float:
        """(Ventas Actuales - Ventas Anteriores) / Ventas Anteriores * 100"""
        if previous_sales == 0:
            return 0.0
        return round(((current_sales - previous_sales) / previous_sales) * 100, 2)

    @staticmethod
    def calculate_net_income_coverage(net_profit: float, requested_amount: float) -> float:
        """Utilidad Neta / Monto Solicitado"""
        if requested_amount == 0:
            return 0.0
        return round(net_profit / requested_amount, 4)
    
    @staticmethod
    def calculate_all_ratios(balance_sheet: Dict, income_statement: Dict, loan_amount: float = None) -> Dict:
        """Calculate all ratios at once"""
        
        # Extract values
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
        
        # Calculate all ratios
        ratios = {
            # Solvency & Viability
            'current_ratio': FinancialCalculator.calculate_current_ratio(current_assets, current_liabilities),
            'debt_to_assets': FinancialCalculator.calculate_debt_to_assets(total_liabilities, total_assets),
            'leverage_ratio': FinancialCalculator.calculate_leverage(total_liabilities, equity),
            'fixed_asset_ratio': FinancialCalculator.calculate_fixed_asset_ratio(fixed_assets, total_assets),
            
            # Cycle
            'dso': FinancialCalculator.calculate_dso(accounts_receivable, revenue),
            'dio': FinancialCalculator.calculate_dio(inventory, cogs),
            'dpo': FinancialCalculator.calculate_dpo(accounts_payable, cogs),
            
            # Profitability & Liquidity
            'profit_margin': FinancialCalculator.calculate_profit_margin(net_profit, revenue),
            'ebitda_margin': FinancialCalculator.calculate_ebitda_margin(ebitda, revenue),
            'roa': FinancialCalculator.calculate_roa(net_profit, total_assets),
            'roe': FinancialCalculator.calculate_roe(net_profit, equity),
            'asset_turnover': FinancialCalculator.calculate_asset_turnover(revenue, total_assets),
            'interest_coverage': FinancialCalculator.calculate_interest_coverage(ebitda, interest_expense),
        }
        
        # Calculate cash conversion cycle
        ratios['cash_conversion_cycle'] = FinancialCalculator.calculate_cash_conversion_cycle(
            ratios['dso'], ratios['dio'], ratios['dpo']
        )
        
        # Add profit-to-loan ratio if loan amount provided
        if loan_amount:
            ratios['profit_to_loan_ratio'] = FinancialCalculator.calculate_profit_to_loan_ratio(
                net_profit, loan_amount
            )
        
        return ratios
