export interface User {
    id: number;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
}

export interface CompanyInfo {
    name: string;
    industry?: string;
    years_in_business?: number;
}

export interface FinancialRatios {
    current_ratio?: number;
    debt_to_assets?: number;
    leverage_ratio?: number;
    roe?: number;
    roa?: number;
    profit_margin?: number;
    ebitda_margin?: number;
    interest_coverage?: number;
    asset_turnover?: number;
    dso?: number;
    dio?: number;
    dpo?: number;
    cash_conversion_cycle?: number;
}

export interface SWOTAnalysis {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
}

export interface CreditRecommendation {
    decision: 'APPROVE' | 'APPROVE_WITH_CONDITIONS' | 'REJECT';
    category: 'A' | 'B' | 'C' | 'D' | 'E';
    total_score: number;
    justification: string[];
    conditions?: string[];
}

export interface AnalysisData {
    id: number;
    company_id: number;
    company_name: string;
    credit_category: string;
    total_credit_score: number;
    recommendation: string;
    swot_analysis?: SWOTAnalysis;
    justification?: string | string[];
    conditions?: string | string[];
    current_ratio?: number;
    roe?: number;
    roa?: number;
    debt_to_assets?: number;
    profit_margin?: number;
    ebitda_margin?: number;
    leverage_ratio?: number;
    interest_coverage?: number;
    company_industry?: string;
    years_in_business?: number;
    top_clients?: string;
    fiscal_status?: string;
    created_at?: string;
}

export interface AnalysisListItem {
    id: number;
    company_name: string;
    credit_score: number;
    category: string;
    recommendation: string;
    created_at: string;
}

export interface FinancialIndicatorsProps {
    ratios: {
        current_ratio?: number;
        debt_to_assets?: number;
        roe?: number;
        roa?: number;
        profit_margin?: number;
        ebitda_margin?: number;
        interest_coverage?: number;
    };
}

export interface SWOTAnalysisProps {
    swot: {
        strengths?: string[];
        weaknesses?: string[];
        opportunities?: string[];
        threats?: string[];
    };
}

export interface RecommendationProps {
    recommendation: string;
    category?: string;
    score?: number;
    justification: string | string[];
    conditions?: string | string[];
}
