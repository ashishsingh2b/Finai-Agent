from typing import Dict

class CreditScorer:
    """
    Implements a 40-30-30 Credit Scoring Model:
    - Component 1: Credit History & Past Performance (40%)
    - Component 2: Solvency & Capital Viability (30%)
    - Component 3: Profitability, Liquidity & Momentum (30%)
    """
    
    @staticmethod
    def score_credit_history(bureau_score: int = 75) -> float:
        """
        Score Component 1: Credit History (40% weight).
        Currently accepts a manual score (0-100) representing Bureau de Crédito status.
        In production, this should integrate with a Credit Bureau API.
        """
        return min(100, max(0, bureau_score))
    
    @staticmethod
    def score_solvency_viability(ratios: Dict) -> float:
        """
        Score Component 2: Solvency & Viability (30% weight).
        Evaluates debt-to-assets, leverage, and current ratio to determine capital health.
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
        
        # Leverage scoring (max 30 points)
        leverage = ratios.get('leverage_ratio', 0)
        if leverage < 1.5:
            score += 30
        elif leverage < 2.5:
            score += 20
        elif leverage < 3.5:
            score += 10
        
        # Current ratio scoring (max 40 points)
        current_ratio = ratios.get('current_ratio', 0)
        if current_ratio > 2.0:
            score += 40
        elif current_ratio > 1.5:
            score += 30
        elif current_ratio > 1.0:
            score += 15
        
        return min(100, score)
    
    @staticmethod
    def score_profitability_liquidity(ratios: Dict, revenue_growth: float = 0, profit_growth: float = 0) -> float:
        """
        Score Component 3: Profitability & Momentum (30% weight).
        Evaluates ROE, profit margins, and growth trends to determine operational success.
        """
        score = 0
        
        # ROE scoring (max 25 points)
        roe = ratios.get('roe', 0)
        if roe > 20: score += 25
        elif roe > 15: score += 20
        elif roe > 10: score += 15
        elif roe > 5: score += 10
        
        # Profit margin scoring (max 25 points)
        profit_margin = ratios.get('profit_margin', 0)
        if profit_margin > 15: score += 25
        elif profit_margin > 10: score += 20
        elif profit_margin > 5: score += 10
        
        # Revenue growth scoring (max 25 points)
        if revenue_growth > 20: score += 25
        elif revenue_growth > 10: score += 20
        elif revenue_growth > 5: score += 15
        elif revenue_growth > 0: score += 10
        
        # Profit growth scoring (max 25 points)
        if profit_growth > 15: score += 25
        elif profit_growth > 10: score += 15
        elif profit_growth > 0: score += 10
        
        return min(100, score)
    
    @staticmethod
    def calculate_total_score(
        credit_history_score: float,
        solvency_score: float,
        profitability_score: float
    ) -> Dict:
        """
        Calculate weighted total score and assign risk category (A-E).
        """
        total_score = (
            credit_history_score * 0.40 +
            solvency_score * 0.30 +
            profitability_score * 0.30
        )
        
        # Assign risk category and descriptive interpretation
        if total_score >= 90:
            category = 'A'
            interpretation = 'Excellent credit profile'
        elif total_score >= 80:
            category = 'B'
            interpretation = 'Solid profile with low risk'
        elif total_score >= 70:
            category = 'C'
            interpretation = 'Acceptable profile with minor risks'
        elif total_score >= 60:
            category = 'D'
            interpretation = 'Weak profile, requires significant mitigation'
        else:
            category = 'E'
            interpretation = 'High risk, not viable for standard credit'
        
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
        """
        High-level orchestrator to calculate the complete credit score from raw ratios.
        """
        credit_history_score = CreditScorer.score_credit_history(bureau_score)
        solvency_score = CreditScorer.score_solvency_viability(ratios)
        profitability_score = CreditScorer.score_profitability_liquidity(ratios, revenue_growth, profit_growth)
        
        return CreditScorer.calculate_total_score(
            credit_history_score,
            solvency_score,
            profitability_score
        )
