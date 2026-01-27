from typing import Dict

class CreditScorer:
    """
    Implement 40-30-30 credit scoring model
    Component 1: Credit History & Administration (40%)
    Component 2: Solvency & Viability (30%)
    Component 3: Profitability, Liquidity & Momentum (30%)
    """
    
    @staticmethod
    def score_credit_history(bureau_score: int = 75) -> float:
        """
        Score Component 1: Credit History (40% weight)
        This would typically come from Bureau de Crédito
        For now, we'll accept a manual score out of 100
        """
        # In production, this would integrate with Bureau de Crédito API
        # For now, use provided score or default to 75 (good)
        return min(100, max(0, bureau_score))
    
    @staticmethod
    def score_solvency_viability(ratios: Dict) -> float:
        """
        Score Component 2: Solvency & Viability (30% weight)
        Based on debt-to-assets, leverage, current ratio
        """
        score = 0
        
        # Debt-to-Assets scoring (max 30 points)
        debt_to_assets = ratios.get('debt_to_assets', 0)
        if debt_to_assets < 0.30:
            score += 30
        elif debt_to_assets < 0.50:
            score += 20
        elif debt_to_assets < 0.70:
            score += 10
        else:
            score += 0
        
        # Leverage scoring (max 30 points)
        leverage = ratios.get('leverage_ratio', 0)
        if leverage < 1.5:
            score += 30
        elif leverage < 2.5:
            score += 20
        elif leverage < 3.5:
            score += 10
        else:
            score += 0
        
        # Current ratio scoring (max 40 points)
        current_ratio = ratios.get('current_ratio', 0)
        if current_ratio > 2.0:
            score += 40
        elif current_ratio > 1.5:
            score += 30
        elif current_ratio > 1.0:
            score += 15
        else:
            score += 0
        
        return min(100, score)
    
    @staticmethod
    def score_profitability_liquidity(ratios: Dict, revenue_growth: float = 0, profit_growth: float = 0) -> float:
        """
        Score Component 3: Profitability, Liquidity & Momentum (30% weight)
        Based on ROE, profit margin, growth trends
        """
        score = 0
        
        # ROE scoring (max 25 points)
        roe = ratios.get('roe', 0)
        if roe > 20:
            score += 25
        elif roe > 15:
            score += 20
        elif roe > 10:
            score += 15
        elif roe > 5:
            score += 10
        else:
            score += 0
        
        # Profit margin scoring (max 25 points)
        profit_margin = ratios.get('profit_margin', 0)
        if profit_margin > 15:
            score += 25
        elif profit_margin > 10:
            score += 20
        elif profit_margin > 5:
            score += 10
        else:
            score += 0
        
        # Revenue growth scoring (max 25 points)
        if revenue_growth > 20:
            score += 25
        elif revenue_growth > 10:
            score += 20
        elif revenue_growth > 5:
            score += 15
        elif revenue_growth > 0:
            score += 10
        else:
            score += 0
        
        # Profit growth scoring (max 25 points)
        if profit_growth > 15:
            score += 25
        elif profit_growth > 10:
            score += 15
        elif profit_growth > 0:
            score += 10
        else:
            score += 0
        
        return min(100, score)
    
    @staticmethod
    def calculate_total_score(
        credit_history_score: float,
        solvency_score: float,
        profitability_score: float
    ) -> Dict:
        """
        Calculate weighted total score and assign category
        """
        total_score = (
            credit_history_score * 0.40 +
            solvency_score * 0.30 +
            profitability_score * 0.30
        )
        
        # Determine category (A-E)
        if total_score >= 90:
            category = 'A'
            interpretation = 'Excelente perfil crediticio'
        elif total_score >= 80:
            category = 'B'
            interpretation = 'Perfil sólido con bajo riesgo'
        elif total_score >= 70:
            category = 'C'
            interpretation = 'Perfil aceptable con áreas a revisar'
        elif total_score >= 60:
            category = 'D'
            interpretation = 'Perfil débil, requiere ajustes'
        else:
            category = 'E'
            interpretation = 'Perfil no viable para crédito'
        
        return {
            'total_score': round(total_score, 2),
            'category': category,
            'interpretation': interpretation,
            'breakdown': {
                'credit_history': credit_history_score,
                'solvency': solvency_score,
                'profitability': profitability_score
            }
        }
    
    @staticmethod
    def calculate_full_score(ratios: Dict, bureau_score: int, revenue_growth: float = 0, profit_growth: float = 0) -> Dict:
        """Calculate complete credit score from ratios and metadata"""
        
        credit_history_score = CreditScorer.score_credit_history(bureau_score)
        solvency_score = CreditScorer.score_solvency_viability(ratios)
        profitability_score = CreditScorer.score_profitability_liquidity(ratios, revenue_growth, profit_growth)
        
        return CreditScorer.calculate_total_score(
            credit_history_score,
            solvency_score,
            profitability_score
        )
