# Moskalti Capital - Financial Formulas Reference

**Purpose**: Exact formula mapping from Moskalti's Excel template to Python implementation  
**Source**: Client PDF documentation and Excel template analysis

---

## 📐 Financial Ratio Formulas

### Solvencia y Viabilidad (Solvency & Viability)

#### 1. Activos Totales (Total Assets)
```python
total_assets = activo_circulante + activo_fijo + otros_activos
```

#### 2. Deuda Total / Activos Totales (Debt-to-Assets Ratio)
```python
debt_to_assets_ratio = total_liabilities / total_assets
```

#### 3. Apalancamiento (Leverage Ratio)
```python
leverage_ratio = total_liabilities / shareholder_equity
# Alternative formula:
leverage_ratio = total_assets / shareholder_equity
```

#### 4. Activos Fijos / Activos Totales (Fixed Assets Ratio)
```python
fixed_assets_ratio = fixed_assets / total_assets
```

---

### Ciclo (Business Cycle Ratios)

#### 5. Rotación de Cuentas por Cobrar (días) - Accounts Receivable Turnover (days)
```python
accounts_receivable_turnover_days = (accounts_receivable / annual_sales) * 365
```

#### 6. Rotación de Inventarios (días) - Inventory Turnover (days)
```python
inventory_turnover_days = (inventory / cost_of_goods_sold) * 365
```

#### 7. Rotación de Cuentas por Pagar (días) - Accounts Payable Turnover (days)
```python
accounts_payable_turnover_days = (accounts_payable / cost_of_goods_sold) * 365
```

---

### Rentabilidad y Liquidez (Profitability & Liquidity)

#### 8. Activo Circulante / Pasivo a Corto Plazo (Current Ratio)
```python
current_ratio = current_assets / current_liabilities
```

#### 9. Ventas / Activos Totales (Asset Turnover Ratio)
```python
asset_turnover = annual_sales / total_assets
```

#### 10. Ciclo Financiero (Financial Cycle - days)
```python
financial_cycle_days = (
    accounts_receivable_turnover_days + 
    inventory_turnover_days - 
    accounts_payable_turnover_days
)
```

#### 11. Margen Utilidad (Profit Margin %)
```python
profit_margin = (net_profit / annual_sales) * 100
```

#### 12. Margen UAFIR (EBITDA Margin %)
```python
# UAFIR = Utilidad Antes de Financiamiento, Impuestos y Resultado
# Equivalent to EBITDA
ebitda_margin = (ebitda / annual_sales) * 100
```

#### 13. ROA (Return on Assets %)
```python
roa = (net_profit / total_assets) * 100
```

#### 14. ROE (Return on Equity %)
```python
roe = (net_profit / shareholder_equity) * 100
```

---

## 💵 Payment Capacity Indicators

### 15. Margen de Utilidad / Préstamo (Profit-to-Loan Ratio)
```python
# Using 3-year average profit
avg_profit_3yr = (profit_year1 + profit_year2 + profit_year3) / 3

# Coverage ratio
profit_to_loan_ratio = avg_profit_3yr / requested_loan_amount

# Approval threshold: ratio should be >= 2.0
is_sufficient_capacity = profit_to_loan_ratio >= 2.0
```

### 16. Préstamo Anual (Annual Loan Payment)
```python
# Simplified calculation (without interest)
annual_loan_payment = requested_loan_amount / (loan_term_months / 12)

# With interest (more accurate)
monthly_interest_rate = annual_interest_rate / 12
n_payments = loan_term_months

monthly_payment = (
    requested_loan_amount * 
    (monthly_interest_rate * (1 + monthly_interest_rate)**n_payments) /
    ((1 + monthly_interest_rate)**n_payments - 1)
)

annual_loan_payment = monthly_payment * 12
```

### 17. Promedio Últimos 3 Años (3-Year Average Profit)
```python
avg_profit_3yr = (profit_year1 + profit_year2 + profit_year3) / 3
```

### 18. Promedio Últimos 2 Años (2-Year Average Profit)
```python
# Used for loans > 12 months with current year consideration
avg_profit_2yr = (profit_year2 + profit_year3) / 2
```

---

## 📊 Variation Analysis Formulas

### Year-over-Year Percentage Change
```python
def calculate_variation(current_year, previous_year):
    """
    Calculate percentage variation between years
    Returns variation percentage
    """
    if previous_year == 0:
        return "N/A" if current_year == 0 else "Infinite"
    
    variation = ((current_year - previous_year) / abs(previous_year)) * 100
    return round(variation, 2)

# Example:
# 2024 value: 208,259
# 2023 value: 208,259
# Variation: 0.00% ← RED FLAG for deeper analysis
```

### Multi-Year Comparison
```python
def analyze_variations(year1, year2, year3):
    """
    Analyze variations across 3 years
    Returns dict with variation percentages and alerts
    """
    variations = {
        'var_year2_vs_year1': calculate_variation(year2, year1),
        'var_year3_vs_year2': calculate_variation(year3, year2),
        'var_year3_vs_year1': calculate_variation(year3, year1)
    }
    
    # Flag if all variations are 0%
    all_zero = all(v == 0.00 for v in variations.values() if isinstance(v, float))
    
    return {
        **variations,
        'alert': all_zero,
        'alert_message': 'No variation across all years - requires investigation' if all_zero else None
    }
```

---

## 🎯 Credit Scoring Model

### Three-Component Scoring System

#### Component 1: Historial Crediticio y Administración (40% weight)
```python
def score_credit_history(bureau_data):
    """
    Score based on Bureau de Crédito data
    Returns score out of 100 (will be weighted by 0.40)
    """
    # Factors to consider:
    # - Payment history (on-time vs late)
    # - Number of active credits
    # - Credit utilization
    # - Age of credit history
    # - Recent inquiries
    
    # Example scoring logic (customize based on client criteria):
    score = 100
    
    if bureau_data['late_payments'] > 0:
        score -= (bureau_data['late_payments'] * 10)
    
    if bureau_data['credit_utilization'] > 0.80:
        score -= 15
    
    if bureau_data['defaults'] > 0:
        score -= 30
    
    return max(0, min(100, score))
```

#### Component 2: Solvencia y Viabilidad (30% weight)
```python
def score_solvency_viability(financial_ratios):
    """
    Score based on solvency and viability ratios
    Returns score out of 100 (will be weighted by 0.30)
    """
    score = 0
    
    # Debt-to-Assets scoring (lower is better)
    debt_to_assets = financial_ratios['debt_to_assets_ratio']
    if debt_to_assets < 0.30:
        score += 30
    elif debt_to_assets < 0.50:
        score += 20
    elif debt_to_assets < 0.70:
        score += 10
    else:
        score += 0
    
    # Leverage scoring
    leverage = financial_ratios['leverage_ratio']
    if leverage < 1.5:
        score += 30
    elif leverage < 2.5:
        score += 20
    elif leverage < 3.5:
        score += 10
    else:
        score += 0
    
    # Current ratio scoring
    current_ratio = financial_ratios['current_ratio']
    if current_ratio > 2.0:
        score += 40
    elif current_ratio > 1.5:
        score += 30
    elif current_ratio > 1.0:
        score += 15
    else:
        score += 0
    
    return min(100, score)
```

#### Component 3: Rentabilidad, Liquidez y Momentum (30% weight)
```python
def score_profitability_liquidity(financial_ratios, trends):
    """
    Score based on profitability, liquidity, and growth
    Returns score out of 100 (will be weighted by 0.30)
    """
    score = 0
    
    # ROE scoring (higher is better)
    roe = financial_ratios['roe']
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
    
    # Profit margin scoring
    profit_margin = financial_ratios['profit_margin']
    if profit_margin > 15:
        score += 25
    elif profit_margin > 10:
        score += 20
    elif profit_margin > 5:
        score += 10
    else:
        score += 0
    
    # Revenue growth trend (3-year CAGR)
    revenue_growth = trends['revenue_cagr']
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
    
    # Profit growth trend
    profit_growth = trends['profit_cagr']
    if profit_growth > 15:
        score += 25
    elif profit_growth > 10:
        score += 15
    elif profit_growth > 0:
        score += 10
    else:
        score += 0
    
    return min(100, score)
```

#### Final Credit Score Calculation
```python
def calculate_total_credit_score(credit_history_score, solvency_score, profitability_score):
    """
    Calculate weighted total credit score
    Returns final score (0-100) and category (A-E)
    """
    total_score = (
        credit_history_score * 0.40 +
        solvency_score * 0.30 +
        profitability_score * 0.30
    )
    
    # Determine category
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
```

---

## 🎯 Credit Recommendation Logic

```python
def generate_recommendation(total_score, category, profit_to_loan_ratio, financial_ratios):
    """
    Generate final credit recommendation
    Returns: APPROVE, APPROVE_WITH_CONDITIONS, or REJECT
    """
    # Base decision on category
    if category in ['A', 'B']:
        if profit_to_loan_ratio >= 2.0:
            return {
                'decision': 'APPROVE',
                'justification': [
                    f'Excellent credit score: {total_score:.2f} (Category {category})',
                    f'Profit coverage ratio: {profit_to_loan_ratio:.2f}x (exceeds 2:1 requirement)',
                    f'Strong liquidity: Current ratio {financial_ratios["current_ratio"]:.2f}',
                    f'Healthy profitability: ROE {financial_ratios["roe"]:.1f}%'
                ],
                'conditions': None
            }
        else:
            return {
                'decision': 'APPROVE_WITH_CONDITIONS',
                'justification': [
                    f'Good credit score: {total_score:.2f} (Category {category})',
                    f'Profit coverage ratio: {profit_to_loan_ratio:.2f}x (below 2:1 requirement)',
                    'Requires additional collateral or shorter term'
                ],
                'conditions': [
                    'Increase collateral to 2.5:1 ratio',
                    'Reduce loan term to 12 months or less',
                    'Personal guarantee from shareholders'
                ]
            }
    
    elif category == 'C':
        if profit_to_loan_ratio >= 2.0 and financial_ratios['current_ratio'] >= 1.5:
            return {
                'decision': 'APPROVE_WITH_CONDITIONS',
                'justification': [
                    f'Acceptable credit score: {total_score:.2f} (Category {category})',
                    f'Adequate profit coverage: {profit_to_loan_ratio:.2f}x',
                    'Some financial areas require monitoring'
                ],
                'conditions': [
                    'Term: Maximum 18 months',
                    'Collateral: Personal guarantee required',
                    'Quarterly financial statement submission',
                    'Interest rate: Upper range of category C'
                ]
            }
        else:
            return {
                'decision': 'REJECT',
                'justification': [
                    f'Marginal credit score: {total_score:.2f} (Category {category})',
                    f'Insufficient profit coverage: {profit_to_loan_ratio:.2f}x (requirement: 2:1)',
                    f'Liquidity concerns: Current ratio {financial_ratios["current_ratio"]:.2f}'
                ],
                'recommendation': 'Re-apply after improving profitability or reducing loan amount'
            }
    
    else:  # Category D or E
        return {
            'decision': 'REJECT',
            'justification': [
                f'Weak credit score: {total_score:.2f} (Category {category})',
                'Insufficient financial capacity',
                'High credit risk profile'
            ],
            'recommendation': 'Not approved at this time. Consider strengthening financial position and re-applying in 6-12 months.'
        }
```

---

## 📈 Trend Analysis Formulas

### CAGR (Compound Annual Growth Rate)
```python
def calculate_cagr(start_value, end_value, num_years):
    """
    Calculate CAGR over multiple years
    """
    if start_value <= 0:
        return None
    
    cagr = ((end_value / start_value) ** (1 / num_years) - 1) * 100
    return round(cagr, 2)

# Example: 3-year revenue CAGR
revenue_cagr = calculate_cagr(
    start_value=revenue_2023,
    end_value=revenue_2025,
    num_years=2  # 2023 to 2025 is 2 periods
)
```

### Year-over-Year Growth
```python
def calculate_yoy_growth(current_year, previous_year):
    """
    Calculate simple year-over-year growth percentage
    """
    if previous_year == 0:
        return None
    
    growth = ((current_year - previous_year) / abs(previous_year)) * 100
    return round(growth, 2)
```

---

## 🏦 Interest Rate Calculation

### Dynamic Rate Based on TIIE + Spread
```python
def calculate_interest_rate(category, collateral_type, tiie_28_day):
    """
    Calculate applicable interest rate
    
    Parameters:
    - category: Credit category (A, B, C, D, E)
    - collateral_type: Type of collateral (hipotecaria, prendaria)
    - tiie_28_day: Current 28-day TIIE rate (updated daily)
    
    Returns: Annual interest rate (%)
    """
    # Spread matrix (to be added to TIIE)
    # These are example values - client should provide actual matrix
    spread_matrix = {
        'A': {'hipotecaria': 5.0, 'prendaria': 6.0},
        'B': {'hipotecaria': 7.0, 'prendaria': 8.0},
        'C': {'hipotecaria': 9.0, 'prendaria': 10.0},
        'D': {'hipotecaria': 11.0, 'prendaria': 12.0},
        'E': {'hipotecaria': 13.0, 'prendaria': 14.0}
    }
    
    spread = spread_matrix[category][collateral_type]
    applicable_rate = tiie_28_day + spread
    
    # Ensure rate is within business limits (19% - 30%)
    final_rate = max(19, min(30, applicable_rate))
    
    return {
        'base_tiie': tiie_28_day,
        'spread': spread,
        'calculated_rate': applicable_rate,
        'final_rate': final_rate
    }
```

---

## 🚩 Alert Indicators

### Red Flags to Highlight

```python
def identify_red_flags(financial_data, variations, ratios):
    """
    Identify and flag potential issues
    Returns list of alerts
    """
    alerts = []
    
    # 1. Zero variation accounts
    for account, var in variations.items():
        if var['all_years_identical']:
            alerts.append({
                'severity': 'HIGH',
                'category': 'DATA_QUALITY',
                'message': f'{account} shows no variation across 3 years',
                'recommendation': 'Verify data accuracy and request clarification from client'
            })
    
    # 2. Negative profit
    if ratios['net_profit'] < 0:
        alerts.append({
            'severity': 'CRITICAL',
            'category': 'PROFITABILITY',
            'message': 'Company showing losses',
            'recommendation': 'High risk - likely REJECT recommendation'
        })
    
    # 3. Low current ratio
    if ratios['current_ratio'] < 1.0:
        alerts.append({
            'severity': 'HIGH',
            'category': 'LIQUIDITY',
            'message': f'Current ratio below 1.0 ({ratios["current_ratio"]:.2f})',
            'recommendation': 'Liquidity risk - may struggle to meet short-term obligations'
        })
    
    # 4. High leverage
    if ratios['leverage_ratio'] > 3.0:
        alerts.append({
            'severity': 'MEDIUM',
            'category': 'LEVERAGE',
            'message': f'High leverage ratio ({ratios["leverage_ratio"]:.2f})',
            'recommendation': 'Monitor debt levels closely'
        })
    
    # 5. Declining revenue trend
    if ratios['revenue_cagr'] < 0:
        alerts.append({
            'severity': 'MEDIUM',
            'category': 'GROWTH',
            'message': 'Declining revenue trend',
            'recommendation': 'Investigate market conditions and competitive position'
        })
    
    return alerts
```

---

## 🔢 Example Calculation Workflow

### Complete Analysis for Sample Company

```python
# Input data (from Excel upload)
company_data = {
    'name': 'TECNOSA S.A. de C.V.',
    'industry': 'Technology',
    'years_in_business': 8,
    'requested_loan': 3_000_000,  # MXN
    'loan_term_months': 18,
    'collateral_type': 'prendaria',
    
    'financial_statements': {
        '2023': {
            'current_assets': 5_000_000,
            'fixed_assets': 3_000_000,
            'total_assets': 8_000_000,
            'current_liabilities': 3_000_000,
            'total_liabilities': 4_000_000,
            'equity': 4_000_000,
            'annual_sales': 12_000_000,
            'cost_of_goods_sold': 7_000_000,
            'net_profit': 1_200_000,
            'ebitda': 1_800_000
        },
        '2024': {
            'current_assets': 5_500_000,
            'fixed_assets': 3_200_000,
            'total_assets': 8_700_000,
            'current_liabilities': 3_200_000,
            'total_liabilities': 4_300_000,
            'equity': 4_400_000,
            'annual_sales': 13_500_000,
            'cost_of_goods_sold': 7_500_000,
            'net_profit': 1_350_000,
            'ebitda': 2_000_000
        },
        '2025': {
            'current_assets': 6_000_000,
            'fixed_assets': 3_400_000,
            'total_assets': 9_400_000,
            'current_liabilities': 3_400_000,
            'total_liabilities': 4_600_000,
            'equity': 4_800_000,
            'annual_sales': 15_000_000,
            'cost_of_goods_sold': 8_000_000,
            'net_profit': 1_500_000,
            'ebitda': 2_200_000
        }
    }
}

# Step 1: Calculate ratios (using 2025 data)
ratios = {
    'current_ratio': 6_000_000 / 3_400_000,  # = 1.76
    'debt_to_assets': 4_600_000 / 9_400_000,  # = 0.49 (49%)
    'leverage_ratio': 4_600_000 / 4_800_000,  # = 0.96
    'roe': (1_500_000 / 4_800_000) * 100,  # = 31.25%
    'profit_margin': (1_500_000 / 15_000_000) * 100,  # = 10%
    'revenue_cagr': calculate_cagr(12_000_000, 15_000_000, 2)  # = 11.80%
}

# Step 2: Payment capacity
avg_profit_3yr = (1_200_000 + 1_350_000 + 1_500_000) / 3  # = 1,350,000
profit_to_loan_ratio = avg_profit_3yr / 3_000_000  # = 0.45 (BELOW 2:1 requirement!)

# Step 3: Credit scoring
credit_history_score = 75  # From Bureau de Crédito
solvency_score = 85  # Based on ratios
profitability_score = 80  # Based on margins and growth

total_score = (75 * 0.40) + (85 * 0.30) + (80 * 0.30)  # = 79.5 → Category C

# Step 4: Recommendation
# Category C + profit_to_loan_ratio < 2.0 → APPROVE_WITH_CONDITIONS or REJECT
```

---

## ✅ Quality Checks

### Pre-Report Generation Validation

```python
def validate_analysis_before_report(analysis_data):
    """
    Run quality checks before generating reports
    """
    checks = []
    
    # 1. All ratios calculated
    required_ratios = ['current_ratio', 'roe', 'roa', 'debt_to_assets', 'profit_margin']
    for ratio in required_ratios:
        if ratio not in analysis_data['ratios']:
            checks.append(('ERROR', f'Missing required ratio: {ratio}'))
    
    # 2. Score weights sum to 100%
    weights_sum = 0.40 + 0.30 + 0.30
    if abs(weights_sum - 1.0) > 0.001:
        checks.append(('ERROR', f'Scoring weights don\'t sum to 100%: {weights_sum}'))
    
    # 3. All 3 years of data present
    if len(analysis_data['financial_statements']) != 3:
        checks.append(('WARNING', 'Less than 3 years of financial data provided'))
    
    # 4. Consistency check: PDF, Excel, Dashboard should have same numbers
    # (Implement cross-format validation)
    
    return checks
```

---

**Last Updated**: January 16, 2026  
**Status**: Complete based on PDF documentation  
**Next**: Await actual Excel file from client for formula verification
