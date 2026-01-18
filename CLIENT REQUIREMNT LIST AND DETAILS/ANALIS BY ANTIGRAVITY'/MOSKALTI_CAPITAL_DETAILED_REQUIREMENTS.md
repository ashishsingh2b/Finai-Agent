# Moskalti Capital - Detailed Requirements & Current Process Documentation

**Document Date**: January 16, 2026  
**Source**: Client-provided PDF documentation  
**Purpose**: Complete reference for AI Credit Analysis System implementation

---

## 📑 Table of Contents

1. [Company Information](#company-information)
2. [Financial Products Offered](#financial-products-offered)
3. [Current Excel Template Structure](#current-excel-template-structure)
4. [Financial Ratios & Calculations](#financial-ratios-calculations)
5. [Credit Scoring Model](#credit-scoring-model)
6. [Interest Rate Matrix](#interest-rate-matrix)
7. [AI Agent Requirements](#ai-agent-requirements)
8. [Template Visual References](#template-visual-references)

---

## 🏢 Company Information

### About Moskalti Capital

**Company Type**: SOFOM (Sociedad Financiera de Objeto Múltiple)  
**Years in Operation**: Almost 3 years  
**Market Focus**: SMEs (Small and Medium Enterprises)  
**Current Target**: Exclusively legal entities (Personas Morales)

---

## 💰 Financial Products Offered

### Credit Product Details

| Parameter | Value |
|-----------|-------|
| **Product Type** | Simple credit with collateral (prendaria or hipotecaria) |
| **Loan-to-Value Ratio (Aforo)** | 2:1 (Collateral must be 2x the loan amount) |
| **Maximum Loan Amount** | $5,000,000 MXN |
| **Loan Term Range** | 6 to 24 months |
| **Origination Fee** | 2% |
| **Interest Rate Range** | 19% - 30% annual |
| **Average Interest Rate** | ~26% annual |
| **Accepted Sectors** | All except agriculture (agro) |
| **Geographic Coverage** | National (Mexico) |
| **Minimum Business Age** | 1 year of operation |

---

## 📊 Current Excel Template Structure

Moskalti Capital uses an internally-designed Excel template with 5 sheets for credit analysis:

---

### Sheet 1: Balance General (Balance Sheet)

#### Key Characteristics:

**Fixed Accounts** (Cannot be modified - marked in light blue):
- These accounts feed formulas in the "RF" (Financial Ratios) sheet
- Must remain unchanged to maintain calculation integrity

**Flexible Accounts**:
- Can be adjusted or modified per client
- Adapt to client-specific account structures

#### Variation Analysis Table

Located beside the Balance Sheet, this table:
- **Compares changes** between fiscal years
- **Calculates percentage variation** (increase, decrease, or equal)
- **Identifies anomalies**: Accounts with zero variation are flagged for detailed review

**Example Account Structures**:

**Example 1 - General Structure**:
```
Activo
  Activo circulante:
    - Efectivo, equivalentes de efectivo y efectivo restringido
    - Clientes
    - Inventario
    - Deudores Diversos
    - Impuestos a Favor
    - Funcionarios
    - IVA acreditable
    - Impuestos por acreditar
    - Anticipo de proveedores
```

**Example 2 - Alternative Structure**:
```
Activo
  Activo circulante:
    - Efectivo, equivalentes de efectivo y efectivo restringido
    - Clientes
    - Inventario
    - Proyectos en proceso
    - Partes relacionadas
    - Impuestos al valor agregado
    - Pagos anticipados
    - Impuestos por acreditar
    - Otras cuentas por cobrar
```

**Alert Indicator**: Accounts repeating year after year without changes require deeper analysis.

---

### Sheet 2: Estado de Resultados (Income Statement)

**Purpose**:
- Input financial data directly from client's income statements
- Serves as data source for formulas in subsequent sheets
- Year-over-year variation analysis

**Function**:
- Pure data entry sheet
- No calculations, only raw financial data
- Feeds all downstream analysis

---

### Sheet 3: Razones Financieras (Financial Ratios)

This sheet contains the core financial analysis formulas.

#### Structure:
- **Year-by-year results** with automated calculations
- **Comparative annual table** showing variations
- **Objective**: Identify trends and detect financial alerts

#### Financial Ratios Calculated:

**Solvencia y Viabilidad (Solvency & Viability)**:
- `Activos Totales` (Total Assets)
- `Deuda total / Activos Totales` (Total Debt / Total Assets)
- `Apalancamiento` (Leverage)
- `Activos Fijos / Activos Totales` (Fixed Assets / Total Assets)

**Ciclo (Business Cycle)**:
- `Rotación de cuentas por cobrar (días)` (Accounts Receivable Turnover - days)
- `Rotación de inventarios` (Inventory Turnover)
- `Rotación de Cuentas por Pagar` (Accounts Payable Turnover)

**Rentabilidad y Liquidez (Profitability & Liquidity)**:
- `Activo Circulante / Pasivo a Corto Plazo` (Current Ratio)
- `Ventas / Activos Totales` (Sales / Total Assets)
- `Ventas Anuales` (Annual Sales)
- `Utilidad del Ejercicio` (Net Profit)
- `Ciclo Financiero` (Financial Cycle)
- `Margen Utilidad` (Profit Margin)
- `Margen UAFIR` (EBITDA Margin)
- `ROA` (Return on Assets)
- `ROE` (Return on Equity)

---

### Additional Payment Capacity Indicators

#### Profit-to-Loan Coverage Ratio (2:1 Criterion)

**Evaluation Principle**:
- Profit should be **at least 2x the requested loan amount**

**Example**:
- Profit: $1,250,000 MXN
- Requested Loan: $3,000,000 MXN at 12 months
- Analysis: Insufficient capacity (ratio < 2:1)

**Methodology**:

1. **Calculate Average Profit**:
   - For loans ≤ 12 months: 3-year average
   - For loans > 12 months: Last 3 full years OR 2 full years + current year

2. **Compute Coverage Indicator**:
   ```
   Coverage Ratio = Average Profit / Requested Loan Amount
   ```

**Indicators Calculated**:
- `Margen de utilidad/Préstamo` (Profit Margin / Loan)
- `Préstamo anual` (Annual Loan)
- `Promedio últimos 3 años` (3-year average)
- `Promedio últimos 2 años` (2-year average)

---

### Sheet 4: Modelo de Crédito (Credit Scoring Model)

**Purpose**: Generate the final credit score and recommendation.

**Data Source**: Directly linked to Sheet 3 (Financial Ratios)

#### Three Main Scoring Tables:

**Table 1: Historial Crediticio y de Administración (40% weight)**
- **Data Source**: Bureau de Crédito (Credit Bureau)
- **Evaluates**: Historical payment behavior and administrative management

**Table 2: Solvencia y Viabilidad (30% weight)**
- **Evaluates**: Ability to meet financial obligations
- **Focus**: Business stability and sustainability

**Table 3: Rentabilidad, Liquidez y Momentum (30% weight)**
- **Evaluates**: Profit margins, liquidity, and growth trends
- **Focus**: Favorable conditions to assume credit

---

#### Credit Scoring Scale

| Category | Score Range | Interpretation |
|----------|-------------|----------------|
| **A** | 90 - 100 | Excellent credit profile |
| **B** | 80 - 89 | Solid profile with low risk |
| **C** | 70 - 79 | Acceptable profile with areas to review |
| **D** | 60 - 69 | Weak profile, requires adjustments |
| **E** | 50 - 59 | Not viable for credit |

**Example Output**:
- Score: 73.84 out of 100
- Category: **C**
- Interpretation: Acceptable profile, but elements require detailed review before proceeding

---

### Sheet 5: Tasas Indicativas (Indicative Interest Rates)

**Purpose**: Interest rate matrix based on collateral and credit score.

#### Rate Determination Factors:

1. **TIIE 28 días** (28-day Interbank Equilibrium Interest Rate)
   - Updated **daily**
   - Baseline for rate calculation

2. **Collateral Type**
   - Quality and type of guarantees
   - Higher quality collateral → Lower interest rate

3. **Credit Category** (A, B, C, D, E)
   - Better score → Lower interest rate

**Dynamic Pricing**:
- Rates adjust based on market conditions (TIIE)
- Risk profile of the applicant
- Collateral strength

---

## 🤖 AI Agent Requirements

### Core Objective

**Goal**: Optimize time and improve result quality by automating the credit analysis process.

**Current Manual Processes** (to be automated):
- ✅ Financial ratio calculations
- ✅ Credit scoring
- ✅ SWOT analysis generation
- ✅ Executive report creation
- ✅ Interactive dashboard generation

---

### AI Agent Functions

From an Excel spreadsheet or predefined template, upload the company's financial statements and generate the following outputs:

1. **Financial and Credit Analysis**
   - Comprehensive financial health evaluation
   - Credit risk assessment

2. **Calculation of Financial Ratios**
   - All ratios from Sheet 3 (Solvency, Cycle, Profitability, Liquidity)
   - Payment capacity indicators

3. **Risk Assessment and Evaluation of Payment Capacity**
   - Credit scoring using the 3-table model (40%-30%-30%)
   - Profit-to-loan coverage analysis

4. **Generation of Dashboard and Executive Report**
   - Interactive web dashboard
   - PDF executive report
   - Excel export with all data and calculations

5. **Issuance of Credit Recommendation**
   - **Approve**: Low risk, strong financials
   - **Approve with Conditions**: Moderate risk, specify terms
   - **Reject**: High risk, insufficient capacity

6. **SWOT Analysis** (Strengths, Weaknesses, Opportunities, Threats)
   - AI-powered qualitative analysis
   - Based on financial data and industry context

---

## 📸 Template Visual References

### Financial Ratios Template Structure

![Financial Ratios Sheet - Moskalti](C:/Users/ashis/.gemini/antigravity/brain/6ab1f27d-ae90-46cf-965e-16f5efc25a80/uploaded_image_0_1768586941637.png)

*Shows the layout of Sheet 3 with solvency, cycle, profitability, and liquidity ratios for years 2023-2025.*

---

### Year-over-Year Variation Analysis

![Variation Analysis Table](C:/Users/ashis/.gemini/antigravity/brain/6ab1f27d-ae90-46cf-965e-16f5efc25a80/uploaded_image_1_1768586941637.png)

*Demonstrates the comparative analysis showing percentage changes between fiscal years.*

---

### Balance Sheet Account Structure Examples

![Account Structure Examples](C:/Users/ashis/.gemini/antigravity/brain/6ab1f27d-ae90-46cf-965e-16f5efc25a80/uploaded_image_2_1768586941637.png)

*Shows two different account structures (Ejemplo 1 and Ejemplo 2) with variation tables and highlighting zero-variance accounts.*

---

### Credit Scoring Model & Interest Rate Matrix

![Credit Model & Rates](C:/Users/ashis/.gemini/antigravity/brain/6ab1f27d-ae90-46cf-965e-16f5efc25a80/uploaded_image_3_1768586941637.png)

*Displays the 5-tier scoring scale (A-E) and the interest rate matrix based on TIIE + collateral type.*

---

### Expected Dashboard Output

![AI Agent Dashboard Example](C:/Users/ashis/.gemini/antigravity/brain/6ab1f27d-ae90-46cf-965e-16f5efc25a80/uploaded_image_4_1768586941637.png)

*Reference mockup showing the desired dashboard layout with company info, financial indicators, charts, SWOT matrix, and recommendation section.*

---

## 🔑 Key Implementation Insights

### Critical Business Rules

1. **Fixed Accounts in Balance Sheet**
   - System must recognize and preserve specific account names
   - Blue-highlighted accounts are non-negotiable
   - Other accounts are flexible per client

2. **Variation Analysis Red Flags**
   - Accounts with 0% variation across years = Alert
   - Triggers deeper investigation
   - Must be highlighted in dashboard

3. **Credit Scoring Weights**
   - Credit History & Administration: **40%**
   - Solvency & Viability: **30%**
   - Profitability, Liquidity & Momentum: **30%**

4. **Profit Coverage Rule (2:1)**
   - Average 3-year profit must be **≥ 2x loan amount**
   - Failing this ratio = automatic flag in recommendation

5. **Dynamic Interest Rates**
   - Daily TIIE 28-day rate update
   - Matrix adjustment based on:
     - Credit category (A-E)
     - Collateral quality

6. **Multi-Year Analysis**
   - Always analyze **3 fiscal years minimum**
   - For loans > 12 months: consider current year trends

---

## 📋 Data to Extract from Client Files

### Required Balance Sheet Data

**Assets (Activo)**:
- Current assets (Activo Circulante)
- Fixed assets (Activo Fijo)
- Total assets (Activos Totales)

**Liabilities (Pasivo)**:
- Current liabilities (Pasivo a Corto Plazo)
- Long-term liabilities (Pasivo a Largo Plazo)
- Total liabilities (Pasivo Total)

**Equity (Capital)**:
- Shareholder equity (Capital Contable)

### Required Income Statement Data

**Revenue**:
- Net sales (Ventas Netas)
- Annual sales (Ventas Anuales)

**Expenses**:
- Cost of goods sold (Costo de Ventas)
- Operating expenses (Gastos de Operación)
- Interest expense (Gastos Financieros)

**Profit**:
- EBITDA / UAFIR
- Net profit (Utilidad del Ejercicio)

---

## 🎯 Success Criteria Alignment

### What the AI Agent Must Replicate

**From Current Manual Process**:
1. ✅ All financial ratio calculations (Sheet 3)
2. ✅ Variation analysis with alerts
3. ✅ 3-table credit scoring model (Sheet 4)
4. ✅ Profit-to-loan coverage check
5. ✅ Category assignment (A-E)

**New AI-Enhanced Features**:
1. ✅ Automated SWOT generation
2. ✅ Executive report creation
3. ✅ Interactive dashboard
4. ✅ Natural language recommendations
5. ✅ Multi-format output (PDF, Excel, Web)

---

## 📝 Notes for Development

### Database Fields to Store

**Company Profile**:
- Company name
- Industry sector
- Years in operation
- Fiscal status
- Top clients

**Financial Data** (3 years):
- Complete balance sheet
- Complete income statement
- Cash flow statement (if available)

**Analysis Results**:
- All calculated ratios
- Credit score (0-100)
- Category (A-E)
- SWOT analysis
- Recommendation (Approve/Conditional/Reject)
- Conditions and terms (if applicable)

**External Data**:
- Bureau de Crédito information
- Payment history
- TIIE 28-day rate (for interest calculation)

---

## 🔄 Workflow Summary

```
1. Upload Excel with 3-year financial statements
   ↓
2. Extract Balance Sheet + Income Statement data
   ↓
3. Calculate Sheet 3 ratios (Solvency, Cycle, Profitability)
   ↓
4. Compute variation analysis (flag 0% changes)
   ↓
5. Apply Sheet 4 credit scoring model (40-30-30 weights)
   ↓
6. Check profit-to-loan coverage (2:1 rule)
   ↓
7. Generate SWOT analysis (AI-powered)
   ↓
8. Determine recommendation (Approve/Conditional/Reject)
   ↓
9. Calculate applicable interest rate (TIIE + category)
   ↓
10. Generate outputs:
    - Interactive dashboard
    - PDF executive report
    - Excel file with all calculations
```

---

## 🌐 Multi-Language Considerations

All outputs must support:
- **Spanish** (primary language - client is in Mexico)
- **English** (secondary language - per client request)

**Key Terms to Translate**:
- Financial ratio names
- Account names
- SWOT categories
- Recommendation labels
- Report sections

---

## ✅ Validation Requirements

### Data Accuracy
- Cross-check all ratio calculations
- Verify profit-to-loan coverage math
- Ensure credit score weights sum to 100%

### Output Consistency
- Same numbers across PDF, Excel, and Web dashboard
- Year labels match (2023, 2024, 2025)
- Currency format: Mexican Pesos (MXN)

### Business Logic
- Credit category ranges (A: 90-100, B: 80-89, etc.)
- Interest rate matrix alignment
- TIIE rate integration

---

## 📚 Additional Reference Files Pending

**Client mentioned**: 2 more PDF files to be shared
- Await additional documentation
- May contain:
  - Sample financial statements
  - Bureau de Crédito report examples
  - Additional business rules

---

**Document Status**: ✅ Complete based on current information  
**Next Update**: Upon receipt of additional PDF files from client  
**Created by**: Ashish Singh  
**For**: Moskalti Capital AI Credit Analysis System
