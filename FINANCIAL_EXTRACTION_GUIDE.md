# Financial Extraction Guide: Moskalti FinAI Agent

To ensure the AI agent correctly extracts data from your Excel and PDF files, please follow these structure and naming conventions.

## 1. Sheet Names (Excel Only)
The system looks for two primary sheets:
- `BG`: Balance General (Balance Sheet)
- `ER`: Estado de Resultados (Profit & Loss / Income Statement)

---

## 2. Keywords Mapping (Spanish & English)
The system scans **Column A** for the following keywords (case-insensitive) to find the appropriate rows. You can use any of the synonyms listed.

### Balance Sheet (BG)
| Field | Accepted Keywords |
| :--- | :--- |
| **Cash** | efectivo, caja, disponibilidades, efectivo y equivalentes |
| **Accounts Receivable** | clientes, cuentas por cobrar |
| **Inventory** | inventarios, mercancías, almacén |
| **Current Assets** | total activo circulante, total activo corriente, suma activo circulante |
| **Fixed Assets** | activo fijo, propiedades planta, activos no corrientes |
| **Total Assets** | total del activo, suma del activo, activo total |
| **Current Liabilities** | total pasivo circulante, pasivo a corto plazo, suma pasivo circulante |
| **Total Liabilities** | total del pasivo, suma del pasivo, pasivo total |
| **Equity** | total capital contable, patrimonio neto, capital social |

### Income Statement (ER)
| Field | Accepted Keywords |
| :--- | :--- |
| **Revenue** | ventas, ingresos netos, ventas totales |
| **Cost of Sales** | costo de ventas, costo de lo vendido |
| **Gross Profit** | utilidad bruta, margen bruto |
| **Operating Expenses** | gastos de operación, gastos generales |
| **EBITDA** | ebitda, utilidad de operación + depreciación |
| **Operating Income** | utilidad de operación, ebit, utilidad operativa |
| **Net Income** | utilidad neta, resultado del ejercicio |

---

## 3. Date & Year Detection
- The system automatically detects years between **2000 and 2100** in the header rows (Rows 1-10).
- Data should be organized in columns, with one column per year.

---

## 4. PDF Requirements
- Use high-resolution PDFs.
- If the PDF is a scan (image), the system will automatically trigger **OCR (Optical Character Recognition)** to read the text.
- Ensure the tables are legible and follow the keyword conventions above.
