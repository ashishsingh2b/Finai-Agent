# Moskalti Capital - Excel Template Complete Analysis

**Based on**: Ejemplo para hacer un analisis.xlsx  
**Analysis Date**: January 16, 2026  
**Company**: TA SOLUCIONES (Sample)

---

## 📊 Executive Summary

The Excel template contains **7 worksheets** with **713 formulas** that automate:
- Balance sheet analysis (BG)
- Income statement analysis (ER)  
- Financial ratio calculations (RF)
- Credit scoring model (Modelo de Crédito)
- Interest rate matrix (Matriz de Credito y Tasas)
- Du Pont analysis framework
- Client/supplier analytics (Analiticas)

---

## 📑 Sheet Structure Overview

| # | Sheet Name | Purpose | Rows | Cols | Formulas |
|---|-----------|---------|------|------|----------|
| 1 | **Du Pont** | Du Pont analysis framework | 58 | 21 (U) | 21 |
| 2 | **Analiticas** | Client/supplier breakdown | 132 | 7 (G) | 18 |
| 3 | **BG** | Balance General (Balance Sheet) | 157 | 11 (K) | 179 |
| 4 | **ER** | Estado de Resultados (Income Statement) | 173 | 20 (T) | 81 |
| 5 | **RF** | Razones Financieras (Financial Ratios) | 41 | 14 (N) | 184 |
| 6 | **Modelo de Crédito** | Credit Scoring Model | 79 | 45 (AS) | 147 |
| 7 | **Matriz de Credito y Tasas** | Interest Rate Matrix | 46 | 26 (Z) | 102 |

**Total Formulas**: 732

---

## 📋 Sheet 1: Du Pont Analysis

### Purpose
Implements Du Pont analysis framework to break down ROE into components.

### Key Data Points
- Ventas (Sales): Pulls from `ER!D10`
- Costo de Ventas (COGS): Pulls from `ER!D11`
- Gastos Operativos: Pulls from `ER!#REF!*-1` (has broken reference!)
- Gastos por Intereses: Pulls from `ER!D27*-1`

### Key Formulas
```excel
# Utilidad antes de Impuestos (Pre-tax Profit)
Cell H11: =D4-D9-D14-D19-D24

# Margen Neto (Net Margin)
Cell L14: =IFERROR(H11/H17,0)

# Rotación de Activos (Asset Turnover)
Cell L34: =IFERROR(H31/H37,0)

# Apalancamiento Financiero (Financial Leverage)
Cell P54: =IFERROR(L51/L57,0)

# Rendimiento del Capital (ROE)
Cell T39: =P24*P54
```

### Data Sources
- Links to `BG` (Balance Sheet): Cells D21, D23, D35, D40, D45, D50, D54, D62
- Links to `ER` (Income Statement): Cells D10, D11, D27

### Alert
⚠️ **Broken Reference**: Cell D14 contains `=+ER!#REF!*-1` which needs fixing

---

## 📋 Sheet 2: Analiticas (Client/Supplier Analytics)

### Purpose
Breakdown of clients and suppliers for relationship analysis and concentration risk assessment.

### Structure
**Years**: 2021, 2022, 2023 (Columns C, D, E)

### Sections
1. **Clientes (Clients)** - Rows 4-21
   - Lists major clients
   - Total formulas: `=SUM(C7:C20)` for each year

2. **Proveedores (Suppliers)** - Rows 24-52
   - Lists major suppliers
   - Total formulas: `=SUM(C25:C50)` for each year

3. **Accionistas (Shareholders)** - Rows 56-59
   - Shareholder composition
   - Total formulas: `=SUM(C56:C58)` for each year

4. **Ventas por Linea de Producto (Sales by Product Line)** - Rows 66-78

5. **Servicios (Services)** - Rows 80-91

6. **Total Lineas de Financiamiento** - Row 93
   - Formula: `=+C78+C91` (combines products + services)

### Key Insights
- Pure data aggregation sheet
- Uses only SUM formulas (15 total)
- No cross-sheet references
- Manually populated client/supplier names

---

## 📋 Sheet 3: BG (Balance General / Balance Sheet)

### Purpose
**Core financial data input sheet** - Balance sheet for multiple years with variation analysis.

### Structure
**Company**: TA SOLUCIONES  
**Years**: 2021-2026 (Columns B-G)  
**Variation Columns**: % 23-24, %24-25, %25-26 (Columns I-K)

### Key Sections

#### 1. ACTIVO (Assets) - Rows 9-31
**Activo Circulante (Current Assets)** - Rows 10-21:
- Efectivo, equivalentes de efectivo (Cash)
- Clientes (Accounts Receivable)
- Inventario (Inventory)
- Proyectos en proceso (Work in Progress)
- Partes relacionadas (Related Parties)
- Impuestos al valor agregado (VAT)
- Pagos anticipados (Prepaid)
- Impuestos por acreditar (Tax Credits)
- Otras cuentas por cobrar (Other Receivables)

**Total Activo Circulante** - Row 21: `=SUM(B11:B20)`

**Activo Fijo (Fixed Assets)** - Rows 22-24:
Formula: `=SUM(B22:B23)` 

**Activo Diferido (Deferred Assets)** - Rows 25-30

**Total del Activo** - Row 31: `=SUM(B21:B30)`

#### 2. PASIVO (Liabilities) - Rows 33-54
**Pasivo Circulante (Current Liabilities)** - Rows 34-42  
**Pasivo Largo Plazo (Long-term Liabilities)** - Rows 44-46  
**Otros Pasivos (Other Liabilities)** - Rows 48-52  
**Total del Pasivo** - Row 54

#### 3. CAPITAL CONTABLE (Equity) - Rows 55-63
- Capital Social (Share Capital)
- Aportaciones (Contributions)
- Utilidades Retenidas (Retained Earnings)
- Utilidad del Ejercicio (Current Year Profit)

**Total Capital Contable** - Row 62: `=SUM(B56:B61)`

**Total Pasivo y Capital** - Row 63: Balance check

### Variation Formulas

Every financial line item has year-over-year variation:
```excel
# Example for Cash (Row 11)
Cell I11: =+E11/D11-1  # 2024 vs 2023
Cell J11: =+F11/E11-1  # 2025 vs 2024
Cell K11: =+G11/F11-1  # 2026 vs 2025
```

**Total Variation Formulas**: 179 (one for each financial line across 3 comparison periods)

### Critical Data Points
This sheet is **THE SOURCE** for:
- `RF` sheet (Financial Ratios) - pulls all balance sheet data
- `Modelo de Crédito` sheet - pulls key ratios and totals
- `Du Pont` sheet - pulls asset/liability/equity figures

---

## 📋 Sheet 4: ER (Estado de Resultados / Income Statement)

### Purpose
**Income statement data input** for multiple years with variation analysis.

### Structure
**Company**: TA SOLUCIONES  
**Years**: 2021-2026 (Columns B-G)  
**Variation Columns**: % 23-24, %24-25, %25-26 (Columns I-K)

### Key Line Items

1. **Ingresos (Revenue)** - Row 10
   - Primary revenue line

2. **Costo de Ventas (COGS)** - Row 12
   - Currently shows 0 for all years in template

3. **Utilidad Bruta (Gross Profit)** - Row 14
   - Formula: `=+B10-B12` (Revenue - COGS)

4. **Gastos de Operación (Operating Expenses)** - Rows 16-19
   - Formula for total: `=SUM(B18:B19)`
   - Gastos de Operación (Operating Expenses)
   - Gastos Administrativos (Administrative Expenses)

5. **Utilidad antes de Productos Financieros** - Row 21
   - Formula: `=+B14-B16`

6. **Productos Financieros (Financial Income)** - Row 23

7. **Utilidad Cambiaria (FX Gain/Loss)** - Row 25

8. **Utilidad antes de otros ingresos/gastos** - Row 28
   - Combines operating profit + financial products + FX

9. **Utilidad antes de impuestos (Pre-tax Profit)** - Row 32

10. **ISR / PTU (Income Taxes)** - Rows 34-35

11. **Utilidad Neta (Net Profit)** - Final line

###Formula Patterns
**Variation formulas** (same as BG):
```excel
Cell I10: =+E10/D10-1  # YoY % change
Cell J10: =+F10/E10-1
Cell K10: =+G10/F10-1
```

**Profit calculations**:
```excel
# Gross Profit
Cell B14: =+B10-B12

# Operating Expenses Total
Cell B16: =SUM(B18:B19)

# Operating Profit
Cell B21: =+B14-B16
```

**Total Formulas**: 81

### Critical Data Points
This sheet feeds:
- `RF` sheet (Razones Financieras) - pulls revenue, COGS, expenses, profit
- `Du Pont` sheet - pulls sales and expenses
- `Modelo de Crédito` - pulls profit and revenue trends

---

## 📋 Sheet 5: RF (Razones Financieras / Financial Ratios)

### Purpose
**THE CORE ANALYSIS SHEET** - Calculates all financial ratios by pulling data from BG and ER sheets.

### Structure
**Company**: TA SOLUCIONES  
**Years**: 2021-2026 (Columns B-G)  
**Variation Columns**: Var% 21 vs 22 through Var% 25 vs 26 (Columns I-M)

### Ratio Categories

---

#### 1. Solvencia y Viabilidad (Solvency & Viability) - Rows 10-15

**Activos Totales (Total Assets)**:
```excel
Cell B12: =+BG!B31  # Pulls from Balance Sheet total assets
Cell C12: =+BG!C31  # For each year
...
```

**Deuda total / Activos Totales (Debt-to-Assets Ratio)**:
```excel
Cell B13: =SUM(BG!B43)/RF!B12
Cell C13: =SUM(BG!C34+BG!C44)/RF!C12  # Current + Long-term liabilities
```

**Apalancamiento (Leverage Ratio)**:
```excel
Cell B14: =SUM(BG!B42+BG!B46)/BG!B62  # Total Debt / Equity
Cell C14: =SUM(BG!C42+BG!C46+BG!C52)/BG!C62
```

**Activos Fijos / Activos Totales (Fixed Asset Ratio)**:
```excel
Cell B15: =+BG!B23/BG!B31  # Fixed Assets / Total Assets
```

---

#### 2. Ciclo (Business Cycle Ratios) - Rows 17-21

**Rotación de cuentas por cobrar (días)** - Days Sales Outstanding:
```excel
Cell B19: =SUM(BG!B13/ER!B10)*360  # (Receivables / Sales) * 360 days
Cell C19: =SUM(BG!C12/ER!C10)*360
```

**Rotación de inventarios (días)** - Days Inventory Outstanding:
```excel
Cell B20: =(+BG!B15/ER!B12)*360  # (Inventory / COGS) * 360 days
Cell C20: =(+BG!C13/ER!C12)*360
```

**Rotación de Cuentas por Pagar (días)** - Days Payable Outstanding:
```excel
Cell B21: =(BG!B33/ER!B12)*360  # (Payables / COGS) * 360 days
```

---

#### 3. Rentabilidad y Liquidez (Profitability & Liquidity) - Rows 25-35

**Activo Circulante/Pasivo a Corto Plazo (Current Ratio)**:
```excel
Cell B26: =+BG!B21/BG!B42  # Current Assets / Current Liabilities
```

**Ventas / Activos Totales (Asset Turnover)**:
```excel
Cell B27: =+ER!B10/RF!B12  # Sales / Total Assets
```

**Ventas Anuales (Annual Sales)**:
```excel
Cell B28: =+ER!B10  # Direct pull from Income Statement
```

**Utilidad del Ejercicio (Net Profit)**:
```excel
Cell B29: =+ER!B37  # Pulls net profit from ER sheet
```

**Ciclo Financiero (Cash Conversion Cycle)**:
```excel
Cell B30: =+RF!B19+RF!B20-RF!B21  # DSO + DIO - DPO
```

**Margen Utilidad (Profit Margin %)**:
```excel
Cell B31: =+RF!B29/RF!B28  # Net Profit / Sales
```

**Margen UAFIR (EBITDA Margin)**:
```excel
Cell B32: =+ER!B21/ER!B10  # EBITDA / Sales
```

**ROA (Return on Assets %)**:
```excel
Cell B33: =+RF!B29/RF!B12  # Net Profit / Total Assets
```

**ROE (Return on Equity %)**:
```excel
Cell B34: =+RF!B29/BG!B62  # Net Profit / Equity
```

---

#### 4. Payment Capacity Indicators - Rows 37-40

**Margen de utilidad/Préstamo (Profit-to-Loan Ratio)**:
```excel
# This appears to be manually calculated or needs loan amount input
```

**Préstamo anual (Annual Loan Payment)**:
```excel
# Manually entered loan amount
```

**Promedio últimos 3 años (3-Year Average Profit)**:
```excel
Cell E39: =AVERAGE(B29:D29)  # Average net profit over 3 years
Cell F40: =AVERAGE(C29:E29)  # Rolling 3-year average
```

**Promedio últimos 2 años (2-Year Average)**:
```excel
Cell E40: =AVERAGE(C29:D29)
Cell F40: =AVERAGE(D29:E29)
```

---

### Variation Analysis Formulas

Every ratio has year-over-year variation:
```excel
# Example for Total Assets (Row 12)
Cell I12: =(+C12/B12)-1  # 2022 vs 2021
Cell J12: =(+D12/C12)-1  # 2023 vs 2022
Cell K12: =(+E12/D12)-1  # 2024 vs 2023
Cell L12: =(+F12/E12)-1  # 2025 vs 2024
Cell M12: =(+G12/F12)-1  # 2026 vs 2025
```

**Total Formulas**: 184

### Critical Insights
- **No manual input** - all ratios auto-calculate from BG and ER
- **Fully linked** - changes in BG or ER automatically update all ratios
- **Variation tracking** - every ratio shows YoY % change
- **Payment capacity** - includes profit averaging for loan coverage assessment

---

## 📋 Sheet 6: Modelo de Crédito (Credit Scoring Model)

### Purpose
**Final credit scoring** using the 40-30-30 weighted model to generate a score (0-100) and category (A-E).

### Structure
**Company**: TA SOLUCIONES  
**Dimensions**: 79 rows x 45 columns (AS)

### Credit Scoring Categories

#### Category Ranges (Rows 3-7)
| Category | Score Range | Label |
|----------|-------------|-------|
| A | 90-100 | Excellent |
| B | 80-90 | Solid |
| C | 70-80 | Acceptable |
| D | 60-70 | Weak |
| E | 50-60 | Not Viable |

---

### Component 1: Historial Crediticio y de Administración (40% Weight) - Rows 9-21

**Peso Específico (Specific Weight)** in Column A, **Factor** in Column B, **Resultado** in Column C.

**Scoring Criteria** (Columns D-H rated 1-5):

1. **Historial Buro de Crédito (20%)** - Row 11-12
   ```excel
   Cell A11: 0.2  # Weight
   Cell C11: =+D12  # Result (picks from score selection)
   Cell D12: =$A$11*1  # Score 1 (best)
   Cell E12: =$A$11*0.75  # Score 2
   Cell F12: =$A$11*0.5  # Score 3
   Cell G12: =$A$11*0.25  # Score 4
   Cell H12: 0  # Score 5 (worst)
   ```

   **Criteria**:
   - 1: No late payments, clean credit history
   - 2: No late payments, minor issues
   - 3: Maximum 1 late payment
   - 4: Maximum 2 late payments
   - 5: Recurring late payments

2. **Historial Buro de Crédito Socios (10%)** - Row 13-14
   - Same structure as above
   - Evaluates shareholder credit history

3. **Historial con Moskalti (10% - implied from 0.1+0.05+0.05)**  - Row 15-16
   - Previous relationship credit history
   - Payment behavior with Moskalti

4. **Calidad de la Información (5%)** - Row 17-18
   - Quality and reliability of financial information provided

5. **Calidad de Administración (5%)** - Row 19-20
   - Management quality and experience

**Component 1 Total**: Sum of all sub-scores = 40% max

---

### Component 2: Solvencia y Viabilidad (30% Weight) - Rows 23-43

Pulls ratio data from `RF` sheet to score financial health.

**Key Ratios Evaluated**:

1. **Activos Totales (Total Assets)** - Row 25
   - Links to `RF!B12` (Total Assets from Ratios sheet)

2. **Deuda Total / Activos Totales** - Row 27
   - Links to `RF!B13` (Debt-to-Assets ratio)
   - Lower is better

3. **Apalancamiento (Leverage)** - Row 29
   - Links to `RF!B14` (Leverage ratio)

4. **Activos Fijos / Activos Totales** - Row 31
   - Links to `RF!B15` (Fixed Asset ratio)

**Scoring Matrix**: Similar 1-5 scale based on ratio thresholds (specific thresholds defined in columns D-H).

**Component 2 Total**: 30% max

---

### Component 3: Rentabilidad, Liquidez y Momentum (30% Weight) - Rows 45-72

Evaluates profitability, liquidity, and growth trends.

**Key Metrics**:

1. **Activo Circulante / Pasivo Corto Plazo (Current Ratio)** - Row 47
   - Links to `RF!B26`
   - Threshold: >1.5 is good, <1.0 is risk

2. **Cobertura Utilidad a Monto Solicitado (Profit Coverage)** - Row 49
   - Links to `RF!B37` (Profit-to-Loan ratio)
   - **Critical**: Must be ≥ 2.0 (2:1 rule)

3. **Ventas / Activos Totales** - Row 51
   - Links to `RF!B27` (Asset turnover)

4. **Tendencia en Ventas vs Periodo Anterior (Revenue Trend)** - Row 53
   - Positive growth = higher score

5. **Tendencia Utilidad vs Periodo Anterior (Profit Trend)** - Row 55
   - Positive growth = higher score

6. **Margen Utilidad (Profit Margin)** - Row 63
   - Links to `RF!B31`

7. **Margen UAFIR (EBITDA Margin)** - Row 65
   - Links to `RF!B32`

8. **ROE (Return on Equity)** - Row 67
   - Links to `RF!B34`

9. **ROA (Return on Assets)** - Row 69
   - Links to `RF!B33`

**Component 3 Total**: 30% max

---

### Final Scoring Calculation

**Total Score Formula** (not explicitly shown in analysis but implied):
```
Total Score = (Component 1 * 0.40) + (Component 2 * 0.30) + (Component 3 * 0.30)
```

**Category Assignment**:
- 90-100 → A (Excellent)
- 80-89 → B (Solid, low risk)
- 70-79 → C (Acceptable, review areas)
- 60-69 → D (Weak, requires adjustments)
- 50-59 → E (Not viable)

**Total Formulas**: 147

---

## 📋 Sheet 7: Matriz de Credito y Tasas (Interest Rate Matrix)

### Purpose
Dynamic interest rate calculation based on **credit category (A-E)** and **collateral type (1-5)**.

### Structure
**Dimensions**: 46 rows x 26 columns (Z)

### Credit-Guarantee Matrix (Rows 3-9)

**Matrix Layout**:
|  | Garantía 1 | Garantía 2 | Garantía 3 | Garantía 4 | Garantía 5 |
|---|-----------|-----------|-----------|-----------|-----------|
| **Crédito A** | A1 | A2 | A3 | A4 | A5 |
| **Crédito B** | B1 | B2 | B3 | B4 | B5 |
| **Crédito C** | C1 | C2 | C3 | C4 | C5 |
| **Crédito D** | D1 | D2 | D3 | D4 | D5 |
| **Crédito E** | E1 | E2 | E3 | E4 | E5 |

Each cell represents a unique risk profile combination.

---

### Sobretasas Indicativas (Indicative Spreads) - Rows 11-17

**TIIE + Basis Points**:

| Credit Category | Garantía 1 | Garantía 2 | Garantía 3 | Garantía 4 | Garantía 5 |
|----------------|-----------|-----------|-----------|-----------|-----------|
| **A** | 1000 bps | 1200 bps | 1600 bps | 2200 bps | 3000 bps |
| **B** | 1250 bps | 1450 bps | 1850 bps | 2450 bps | 3250 bps |
| **C** | 1750 bps | 1950 bps | 2350 bps | 2950 bps | 3750 bps |
| **D** | 2500 bps | 2700 bps | 3100 bps | 3700 bps | 4500 bps |
| **E** | 3500 bps | 3700 bps | 4100 bps | 4700 bps |5500 bps |

**Example**:
- Category C + Guarantee Type 3 = TIIE + 2350 bps (23.50%)

---

### Ejemplo Tasas Indicativas (Example Rates) - Rows 19-25

**TIIE Rate** (Row 20):
```excel
Cell B20: =7.2886*100  # Current TIIE (728.86 bps or 7.29%)
```

**Calculated Interest Rates** (Rows 21-25):
```excel
# Category A rates
Cell C21: =($B$20+C13)/100  # TIIE + 1000 bps / 100 = 17.29%
Cell D21: =($B$20+D13)/100  # TIIE + 1200 bps / 100 = 19.29%
...

# Category B rates
Cell C22: =($B$20+C14)/100  # TIIE + 1250 bps / 100 = 19.79%
...
```

**Full Rate Matrix**:
| Category | Garantía 1 | Garantía 2 | Garantía 3 | Garantía 4 | Garantía 5 |
|----------|-----------|-----------|-----------|-----------|-----------|
| **A** | 17.29% | 19.29% | 23.29% | 29.29% | 37.29% |
| **B** | 19.79% | 21.79% | 25.79% | 31.79% | 39.79% |
| **C** | 24.79% | 26.79% | 30.79% | 36.79% | 44.79% |
| **D** | 32.29% | 34.29% | 38.29% | 44.29% | 52.29% |
| **E** | 42.29% | 44.29% | 48.29% | 54.29% | 62.29% |

---

### Dynamic Rate Lookup (Rows 4-8, Columns J-N)

**Formulas** to pull rates based on selection:
```excel
# Category A rates display
Cell J4: =C21  # Links to calculated rate
Cell K4: =D21
Cell L4: =E21
...

# Repeats for B, C, D, E
```

This allows user to select credit category and guarantee type, then see the applicable rate.

---

### Collateral Types (1-5)

Based on analysis, likely classifications:
1. **Garantía 1**: Strongest collateral (e.g., prime urban real estate, liquid assets)
2. **Garantía 2**: Strong collateral (e.g., equipment, inventory)
3. **Garantía 3**: Moderate collateral (e.g., accounts receivable)
4. **Garantía 4**: Weak collateral (e.g., secondary assets)
5. **Garantía 5**: Minimal/personal guarantee only

**Total Formulas**: 102

---

## 🔗 Sheet Interdependencies

### Data Flow Map

```
BG (Balance Sheet)  ────┬──→ RF (Ratios) ──┬──→ Modelo de Crédito ──→ Matriz de Tasas
                        │                  │
ER (Income Statement) ──┤                  │
                        │                  │
                        └──→ Du Pont       │
                                           │
Analiticas ────────────────────────────────┘ (manual supplement)
```

### Critical Reference Chains

1. **Balance Sheet → Ratios → Credit Model → Interest Rate**
   ```
   BG!B31 (Total Assets) 
     → RF!B12 (Assets ratio base)
       → Modelo!B25 (Solvency scoring)
         → Category A-E
           → Matriz!C21 (Interest rate)
   ```

2. **Income Statement → Ratios → Profit Coverage**
   ```
   ER!B37 (Net Profit)
     → RF!B29 (Profit for ratios)
       → RF!E39 (3-year average)
         → RF!B37 (Profit-to-loan ratio)
           → Modelo!B49 (Coverage scoring)
   ```

3. **Cross-Sheet ROE Calculation**
   ```
   ER!B37 (Net Profit) + BG!B62 (Equity)
     → RF!B34 (ROE calculation)
       → Modelo!B67 (ROE scoring)
   ```

---

## 🚨 Critical Issues Identified

### 1. Broken Cell Reference
**Location**: Du Pont sheet, Cell D14  
**Formula**: `=+ER!#REF!*-1`  
**Issue**: Reference to deleted/moved cell in ER sheet  
**Impact**: Du Pont analysis incomplete  
**Fix Needed**: Identify correct ER cell for operating expenses

### 2. Zero COGS Data
**Location**: ER sheet, Row 12 (Costo de Ventas)  
**Issue**: All years show 0  
**Impact**: Inventory turnover ratios divide by zero  
**Implication**: This company may be service-based (no inventory/COGS)

### 3. Missing Loan Amount Input
**Location**: RF sheet, Row 37 (Margen de utilidad/Préstamo)  
**Issue**: No clear cell for loan amount input  
**Impact**: Profit-to-loan ratio not calculable  
**Fix Needed**: Add loan amount input cell and update formulas

---

## 🔑 Key Implementation Requirements

### 1. Input Cells to Create (User Entry)
- **Loan Amount** (for profit coverage calculation)
- **Loan Term** (months)
- **Collateral Type** (1-5 selection)
- **Bureau de Crédito Score** (manual input or API)
- **Management Quality Score** (manual assessment)
- **Information Quality Score** (manual assessment)

### 2. Formulas to Replicate

**Total formulas across all sheets**: 732

**Priority formula types**:
- SUM: 96 formulas
- Year-over-year variation: ~300 formulas
- Cross-sheet references: ~250 formulas
- AVERAGE: 2 formulas
- IFERROR: 4 formulas

### 3. Data Validation Needed
- Ensure Total Assets = Total Liabilities + Equity
- Validate all ratios are calculating correctly
- Check for division by zero errors
- Verify cross-sheet references are accurate

### 4. Output Reports to Generate
1. **Dashboard** - Visual representation of all key ratios
2. **PDF Executive Report** - Summary with category and recommendation
3. **Excel Export** - All sheets with formulas intact
4. **SWOT Analysis** - Based on ratio insights

---

## 📊 Data Entry Points (User Input Required)

### Sheet: BG (Balance General)
**Years**: 2021-2026 (Columns B-G)  
**All balance sheet accounts** - Manual entry

### Sheet: ER (Estado de Resultados)
**Years**: 2021-2026 (Columns B-G)  
**All income statement lines** - Manual entry

### Sheet: Modelo de Crédito
- Bureau de Crédito score selection (Rows 11-20)
- Management quality assessment (Rows 17-20)
- **Selected score** (pick from columns D-H)

### Sheet: Matriz de Tasas
- TIIE rate update (Cell B20) - Should auto-fetch daily
- Credit category (auto-determined from Modelo de Crédito)
- Collateral type (user selects 1-5)

---

## 🎯 System Automation Scope

### What AI Agent Should Automate:

✅ **If Excel Input**:
1. Parse BG and ER sheets
2. Auto-calculate all ratios (RF sheet)
3. Apply credit scoring model (Modelo de Crédito)
4. Determine category (A-E)
5. Calculate applicable interest rate (Matriz de Tasas)
6. Generate SWOT analysis
7. Create recommendation (Approve/Conditional/Reject)

✅ **If PDF Input** (if implemented):
1. Extract balance sheet data → populate BG sheet logic
2. Extract income statement data → populate ER sheet logic
3. Proceed with steps 2-7 above

### What Remains Manual:
- Bureau de Crédito score (external API or manual)
- Management quality assessment (qualitative)
- Information quality assessment (qualitative)
- TIIE rate (can be auto-fetched from Banxico API)

---

## 📝 Notes for Development

### Python Libraries Needed:
```python
import openpyxl  # Read/write Excel files
import pandas as pd  # Data manipulation
import numpy as np  # Calculations
```

### Excel Formula Translation Examples:

**Excel**: `=+BG!B31`  
**Python**: `balance_sheet.loc['Total_Assets', '2023']`

**Excel**: `=SUM(BG!B11:B20)`  
**Python**: `balance_sheet.loc['Current_Assets_Start':'Current_Assets_End', '2023'].sum()`

**Excel**: `=(+E12/D12)-1`  
**Python**: `(data[2024] / data[2023]) - 1`

**Excel**: `=IFERROR(H11/H17,0)`  
**Python**: `np.where(denominator != 0, numerator / denominator, 0)`

---

## ✅ Validation Checklist

Before implementing, confirm:
- [ ] All 7 sheets mapped correctly
- [ ] All 732 formulas documented
- [ ] Cross-sheet references understood
- [ ] Input cells identified
- [ ] Output format requirements clear
- [ ] Broken references fixed
- [ ] Client scoring criteria obtained
- [ ] TIIE API integration plan (if auto-update needed)

---

**Analysis Complete**: January 16, 2026  
**Total Documentation Pages**: This document  
**Next Step**: Confirm with client and begin implementation

