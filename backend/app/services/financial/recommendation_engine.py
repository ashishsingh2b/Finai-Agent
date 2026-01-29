from typing import Dict, List

class RecommendationEngine:
    """
    Core engine for generating credit recommendations.
    Uses a combination of:
    - Weighted Credit Score (Category A-E)
    - Profit-to-Loan Coverage (Minimum 2:1 recommended)
    - Key Financial Ratios (Liquidity, Leverage)
    """
    
    @staticmethod
    def generate_recommendation(
        total_score: float,
        category: str,
        profit_to_loan_ratio: float,
        ratios: Dict,
        language: str = 'es'
    ) -> Dict:
        """
        Orchestrate the recommendation process.
        Evaluates constraints and credit scoring to determine the final decision.
        Returns: APPROVE, APPROVE_WITH_CONDITIONS, or REJECT
        """
        
        # Determine risk level
        if category in ['A', 'B']:
            risk_level = "LOW"
        elif category == 'C':
            risk_level = "MEDIUM"
        else:
            risk_level = "HIGH"
        
        # Decision logic
        if category in ['A', 'B']:
            if profit_to_loan_ratio >= 2.0:
                return RecommendationEngine._approve(total_score, category, profit_to_loan_ratio, ratios, language)
            else:
                return RecommendationEngine._approve_with_conditions(
                    total_score, category, profit_to_loan_ratio, ratios, language,
                    reason="insufficient_profit_coverage"
                )
        
        elif category == 'C':
            if profit_to_loan_ratio >= 2.0 and ratios.get('current_ratio', 0) >= 1.5:
                return RecommendationEngine._approve_with_conditions(
                    total_score, category, profit_to_loan_ratio, ratios, language,
                    reason="marginal_score"
                )
            else:
                return RecommendationEngine._reject(total_score, category, profit_to_loan_ratio, ratios, language)
        
        else:  # Category D or E
            return RecommendationEngine._reject(total_score, category, profit_to_loan_ratio, ratios, language)
    
    @staticmethod
    def _approve(score: float, category: str, profit_ratio: float, ratios: Dict, language: str) -> Dict:
        """Logic for standard approval with good financials."""
        
        if language == 'es':
            justification = [
                f'Excelente calificación crediticia: {score:.1f}/100 (Categoría {category})',
                f'Cobertura de utilidad: {profit_ratio:.2f}x (cumple requisito 2:1)',
                f'Liquidez sólida: Ratio circulante {ratios.get("current_ratio", 0):.2f}',
                f'Rentabilidad saludable: ROE {ratios.get("roe", 0):.1f}%'
            ]
            conditions = None
        else:  # English
            justification = [
                f'Excellent credit score: {score:.1f}/100 (Category {category})',
                f'Profit coverage ratio: {profit_ratio:.2f}x (meets 2:1 requirement)',
                f'Strong liquidity: Current ratio {ratios.get("current_ratio", 0):.2f}',
                f'Healthy profitability: ROE {ratios.get("roe", 0):.1f}%'
            ]
            conditions = None
        
        return {
            'decision': 'APPROVE',
            'category': category,
            'total_score': score,
            'justification': justification,
            'conditions': conditions
        }
    
    @staticmethod
    def _approve_with_conditions(score: float, category: str, profit_ratio: float, ratios: Dict, language: str, reason: str) -> Dict:
        """Logic for conditional approval when minor weaknesses are present."""
        
        if language == 'es':
            justification = [
                f'Calificación crediticia: {score:.1f}/100 (Categoría {category})'
            ]
            
            if reason == "insufficient_profit_coverage":
                justification.append(f'Cobertura de utilidad: {profit_ratio:.2f}x (por debajo del requisito 2:1)')
                justification.append('Requiere garantías adicionales o plazo más corto')
            elif reason == "marginal_score":
                justification.append(f'Cobertura de utilidad: {profit_ratio:.2f}x')
                justification.append('Algunas áreas financieras requieren monitoreo')
            
            conditions = [
                'Garantía: Colateral adicional a razón 2.5:1',
                'Plazo máximo: 18 meses',
                'Presentación de estados financieros trimestrales',
                'Tasa de interés: Rango superior de categoría'
            ]
        else:  # English
            justification = [
                f'Credit score: {score:.1f}/100 (Category {category})'
            ]
            
            if reason == "insufficient_profit_coverage":
                justification.append(f'Profit coverage: {profit_ratio:.2f}x (below 2:1 requirement)')
                justification.append('Requires additional collateral or shorter term')
            elif reason == "marginal_score":
                justification.append(f'Adequate profit coverage: {profit_ratio:.2f}x')
                justification.append('Some financial areas require monitoring')
            
            conditions = [
                'Collateral: Additional collateral at 2.5:1 ratio',
                'Maximum term: 18 months',
                'Quarterly financial statement submission',
                'Interest rate: Upper range of category'
            ]
        
        return {
            'decision': 'APPROVE_WITH_CONDITIONS',
            'category': category,
            'total_score': score,
            'justification': justification,
            'conditions': conditions
        }
    
    @staticmethod
    def _reject(score: float, category: str, profit_ratio: float, ratios: Dict, language: str) -> Dict:
        """Logic for rejection when risk thresholds are exceeded."""
        
        if language == 'es':
            justification = [
                f'Calificación crediticia débil: {score:.1f}/100 (Categoría {category})',
            ]
            
            if profit_ratio < 2.0:
                justification.append(f'Cobertura de utilidad insuficiente: {profit_ratio:.2f}x (requisito: 2:1)')
            
            if ratios.get('current_ratio', 0) < 1.0:
                justification.append(f'Preocupaciones de liquidez: Ratio circulante {ratios.get("current_ratio", 0):.2f}')
            
            justification.append('Perfil de riesgo crediticio alto')
            
            conditions = [
                'No aprobado en este momento',
                'Recomendación: Fortalecer posición financiera',
                'Plazo sugerido para reaplica: 6-12 meses',
                'Considerar: Reducir monto solicitado o aumentar capital'
            ]
        else:  # English
            justification = [
                f'Weak credit score: {score:.1f}/100 (Category {category})',
            ]
            
            if profit_ratio < 2.0:
                justification.append(f'Insufficient profit coverage: {profit_ratio:.2f}x (requirement: 2:1)')
            
            if ratios.get('current_ratio', 0) < 1.0:
                justification.append(f'Liquidity concerns: Current ratio {ratios.get("current_ratio", 0):.2f}')
            
            justification.append('High credit risk profile')
            
            conditions = [
                'Not approved at this time',
                'Recommendation: Strengthen financial position',
                'Suggested reapplication timeframe: 6-12 months',
                'Consider: Reduce loan amount or increase equity'
            ]
        
        return {
            'decision': 'REJECT',
            'category': category,
            'total_score': score,
            'justification': justification,
            'conditions': conditions
        }
