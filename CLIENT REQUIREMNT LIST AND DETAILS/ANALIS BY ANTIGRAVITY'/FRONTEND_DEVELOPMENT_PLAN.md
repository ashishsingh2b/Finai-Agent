# Frontend Development Plan - Moskalti Capital AI Credit Analysis System

**Project**: AI-Powered Credit Analysis Platform  
**Phase**: Frontend Development  
**Duration**: 4-5 days  
**Stack**: React.js, TypeScript, Vite, TailwindCSS, Recharts

---

## 🎯 Frontend Development Goals

Build a modern,intuitive UI that:
- ✅ Allows users to log in and upload financial files
- ✅ Displays interactive credit analysis dashboard (matching mockup)
- ✅ Shows all financial indicators with color-coded status
- ✅ Visualizes trends with dynamic charts
- ✅ Displays SWOT analysis in quadrant format
- ✅ Shows credit recommendation with justification
- ✅ Allows PDF/Excel report downloads
- ✅ Supports Spanish/English language switching
- ✅ Fully responsive (desktop, tablet, mobile)

---

## 📋 Phase 1: Project Setup & Authentication UI (Day 1)

### 1.1 Initialize React Project with Vite

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

### 1.2 Install Dependencies

```bash
# UI Framework & Styling
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Routing
npm install react-router-dom

# State Management
npm install zustand  # Lightweight state management

# API Communication
npm install axios

# Charts
npm install recharts

# Forms
npm install react-hook-form zod @hookform/resolvers

# Icons
npm install lucide-react

# i18n (Multi-language)
npm install i18next react-i18next

# UI Components (optional headless UI)
npm install @headlessui/react

# Utilities
npm install clsx tailwind-merge
npm install date-fns  # Date formatting
```

### 1.3 Configure TailwindCSS

**Update `tailwind.config.js`**:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
    },
  },
  plugins: [],
}
```

**Update `src/index.css`**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}
```

### 1.4 Project Structure

```
frontend/
├── src/
│   ├── assets/          # Images, logos
│   ├── components/      # Reusable components
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── FinancialIndicators.tsx
│   │   │   ├── FinancialCharts.tsx
│   │   │   ├── SWOTAnalysis.tsx
│   │   │   └── Recommendation.tsx
│   │   ├── upload/
│   │   │   └── FileUpload.tsx
│   │   └── common/
│   │       ├── Navbar.tsx
│   │       ├── Loader.tsx
│   │       └── LanguageToggle.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── UploadPage.tsx
│   │   └── ReportsPage.tsx
│   ├── services/
│   │   └── api.ts          # Axios API client
│   ├── store/
│   │   └── authStore.ts    # Zustand store
│   ├── i18n/
│   │   ├── config.ts
│   │   ├── en.json
│   │   └── es.json
│   ├── types/
│   │   └── index.ts        # TypeScript interfaces
│   ├── utils/
│   │   └── helpers.ts
│   ├── App.tsx
│   └── main.tsx
```

### 1.5 API Service

**Create `src/services/api.ts`**:
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', new URLSearchParams({ username: email, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }),
  
  register: (data: { email: string; full_name: string; password: string }) =>
    api.post('/auth/register', data),
  
  me: () => api.get('/auth/me'),
};

// Analysis APIs
export const analysisAPI = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/analysis/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  getAnalysis: (id: number) => api.get(`/analysis/${id}`),
  
  downloadPDF: (id: number) => api.get(`/analysis/report/${id}/pdf`, {
    responseType: 'blob'
  }),
  
  downloadExcel: (id: number) => api.get(`/analysis/report/${id}/excel`, {
    responseType: 'blob'
  }),
};

export default api;
```

### 1.6 Auth Store

**Create `src/store/authStore.ts`**:
```typescript
import { create } from 'zustand';
import { authAPI } from '../services/api';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  loading: false,
  
  login: async (email, password) => {
    set({ loading: true });
    try {
      const response = await authAPI.login(email, password);
      const { access_token } = response.data;
      
      localStorage.setItem('access_token', access_token);
      
      // Fetch user profile
      const userResponse = await authAPI.me();
      set({
        token: access_token,
        user: userResponse.data,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  checkAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }
    
    try {
      const response = await authAPI.me();
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem('access_token');
      set({ isAuthenticated: false });
    }
  },
}));
```

### 1.7 Login Component

**Create `src/components/auth/LoginForm.tsx`**:
```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Moskalti Capital</h1>
          <p className="text-gray-600 mt-2">AI Credit Analysis System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-lg"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};
```

### 1.8 Protected Route

**Create `src/components/common/ProtectedRoute.tsx`**:
```tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};
```

### 1.9 Routing

**Create `src/App.tsx`**:
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/auth/LoginForm';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

**✅ Day 1 Deliverable**: Login/authentication UI working with backend

---

## 📋 Phase 2: File Upload Interface (Day 2)

### 2.1 File Upload Component

**Create `src/components/upload/FileUpload.tsx`**:
```tsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { analysisAPI } from '../../services/api';

export const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Please upload an Excel file (.xlsx or .xls)');
    }
  }, []);
  
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError('');
    
    try {
      const response = await analysisAPI.uploadFile(file);
      const { company_id, analysis_id } = response.data;
      
      // Navigate to dashboard with analysis results
      navigate(`/dashboard?analysis=${analysis_id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Upload Financial Statement</h1>
      
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-primary-500 transition cursor-pointer"
      >
        <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        
        {file ? (
          <div className="flex items-center justify-center gap-2 text-lg">
            <FileSpreadsheet className="w-6 h-6 text-green-600" />
            <span className="font-medium">{file.name}</span>
          </div>
        ) : (
          <>
            <p className="text-xl font-medium text-gray-700 mb-2">
              Drag and drop your Excel file here
            </p>
            <p className="text-gray-500">or click to browse</p>
          </>
        )}
        
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
          id="file-input"
        />
      </div>
      
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="mt-6 w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Analyzing...' : 'Upload and Analyze'}
      </button>
    </div>
  );
};
```

**✅ Day 2 Deliverable**: File upload with drag-and-drop working

---

## 📋 Phase 3: Dashboard Layout & Financial Indicators (Day 3)

### 3.1 TypeScript Interfaces

**Create `src/types/index.ts`**:
```typescript
export interface CompanyInfo {
  name: string;
  industry: string;
  years_in_business: number;
  fiscal_status: string;
  top_clients: string[];
}

export interface FinancialRatios {
  current_ratio: number;
  debt_to_assets: number;
  leverage_ratio: number;
  roe: number;
  roa: number;
  profit_margin: number;
  ebitda_margin: number;
  interest_coverage: number;
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
  company: CompanyInfo;
  ratios: FinancialRatios;
  swot: SWOTAnalysis;
  recommendation: CreditRecommendation;
  applicable_interest_rate: number;
}
```

### 3.2 Dashboard Main Component

**Create `src/pages/DashboardPage.tsx`**:
```tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { FinancialIndicators } from '../components/dashboard/FinancialIndicators';
import { FinancialCharts } from '../components/dashboard/FinancialCharts';
import { SWOTAnalysis } from '../components/dashboard/SWOTAnalysis';
import { Recommendation } from '../components/dashboard/Recommendation';
import { analysisAPI } from '../services/api';
import { AnalysisData } from '../types';

export const DashboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const analysisId = searchParams.get('analysis');
  
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (analysisId) {
      fetchAnalysis(parseInt(analysisId));
    }
  }, [analysisId]);
  
  const fetchAnalysis = async (id: number) => {
    try {
      const response = await analysisAPI.getAnalysis(id);
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch analysis', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!data) {
    return <div className="flex items-center justify-center h-screen">No analysis found</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Business Credit Analysis</h1>
          <div className="text-sm text-gray-600">File: {data.company.name}</div>
        </div>
      </header>
      
      {/* Main Dashboard */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Company Info */}
          <div className="col-span-12 lg:col-span-3">
            <Sidebar company={data.company} />
          </div>
          
          {/* Center & Right - Analysis */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            {/* Financial Indicators */}
            <FinancialIndicators ratios={data.ratios} />
            
            {/* Charts */}
            <FinancialCharts />
            
            {/* SWOT */}
            <SWOTAnalysis swot={data.swot} />
            
            {/* Recommendation */}
            <Recommendation recommendation={data.recommendation} />
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 3.3 Financial Indicators Component

**Create `src/components/dashboard/FinancialIndicators.tsx`**:
```tsx
import React from 'react';
import { FinancialRatios } from '../../types';

interface Props {
  ratios: FinancialRatios;
}

const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
  if (value >= thresholds.good) return 'bg-green-100 text-green-800 border-green-300';
  if (value >= thresholds.warning) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  return 'bg-red-100 text-red-800 border-red-300';
};

export const FinancialIndicators: React.FC<Props> = ({ ratios }) => {
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-6">Financial Indicators</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Liquidity */}
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(ratios.current_ratio, { good: 1.5, warning: 1.0 })}`}>
          <div className="text-sm font-medium mb-1">Liquidity</div>
          <div className="text-2xl font-bold">{ratios.current_ratio.toFixed(2)}</div>
          <div className="text-xs mt-1">
            {ratios.current_ratio >= 1.5 ? 'Adequate' : ratios.current_ratio >= 1.0 ? 'Acceptable' : 'Risk'}
          </div>
        </div>
        
        {/* ROE */}
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(ratios.roe, { good: 15, warning: 10 })}`}>
          <div className="text-sm font-medium mb-1">ROE</div>
          <div className="text-2xl font-bold">{ratios.roe.toFixed(1)}%</div>
          <div className="text-xs mt-1">
            {ratios.roe >= 15 ? 'Profitable' : ratios.roe >= 10 ? 'Moderate' : 'Low'}
          </div>
        </div>
        
        {/* Debt / Assets */}
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(100 - ratios.debt_to_assets * 100, { good: 50, warning: 30 })}`}>
          <div className="text-sm font-medium mb-1">Debt / Assets</div>
          <div className="text-2xl font-bold">{(ratios.debt_to_assets * 100).toFixed(0)}%</div>
          <div className="text-xs mt-1">
            {ratios.debt_to_assets < 0.5 ? 'Moderate' : ratios.debt_to_assets < 0.7 ? 'High' : 'Very High'}
          </div>
        </div>
        
        {/* Interest Coverage */}
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(ratios.interest_coverage, { good: 3, warning: 2 })}`}>
          <div className="text-sm font-medium mb-1">Interest Coverage</div>
          <div className="text-2xl font-bold">{ratios.interest_coverage.toFixed(1)}x</div>
          <div className="text-xs mt-1">
            {ratios.interest_coverage >= 3 ? 'Acceptable' : ratios.interest_coverage >= 2 ? 'Caution' : 'Risk'}
          </div>
        </div>
      </div>
    </div>
  );
};
```

**✅ Day 3 Deliverable**: Dashboard layout with financial indicators matching mockup

---

## 📋 Phase 4: Charts & SWOT Visualization (Day 4)

### 4.1 Financial Charts

**Create `src/components/dashboard/FinancialCharts.tsx`**:
```tsx
import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const revenueData = [
  { year: '2022', revenue: 12000, profit: 1200 },
  { year: '2023', revenue: 13500, profit: 1350 },
  { year: '2024', revenue: 15000, profit: 1500 },
];

const debtEquityData = [
  { name: 'Debt', value: 55, color: '#ef4444' },
  { name: 'Equity', value: 45, color: '#3b82f6' },
];

export const FinancialCharts: React.FC = () => {
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-6">Financial Charts</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue & Profit Trend */}
        <div>
          <h3 className="font-semibold mb-4">Revenue & Profit Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
              <Bar dataKey="profit" fill="#10b981" name="Net Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Debt / Equity Pie Chart */}
        <div>
          <h3 className="font-semibold mb-4">Debt vs Equity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={debtEquityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {debtEquityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
```

### 4.2 SWOT Analysis Component

**Create `src/components/dashboard/SWOTAnalysis.tsx`**:
```tsx
import React from 'react';
import { CheckCircle, AlertTriangle, TrendingUp, AlertOctagon } from 'lucide-react';
import { SWOTAnalysis as SWOTType } from '../../types';

interface Props {
  swot: SWOTType;
}

export const SWOTAnalysis: React.FC<Props> = ({ swot }) => {
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-6">SWOT Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {swot.strengths.map((item, idx) => (
              <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                <span className="text-green-600">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Opportunities */}
        <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Opportunities</h3>
          </div>
          <ul className="space-y-2">
            {swot.opportunities.map((item, idx) => (
              <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                <span className="text-blue-600">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Weaknesses */}
        <div className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-900">Weaknesses</h3>
          </div>
          <ul className="space-y-2">
            {swot.weaknesses.map((item, idx) => (
              <li key={idx} className="text-sm text-yellow-800 flex items-start gap-2">
                <span className="text-yellow-600">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Threats */}
        <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
          <div className="flex items-center gap-2 mb-3">
            <AlertOctagon className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Threats</h3>
          </div>
          <ul className="space-y-2">
            {swot.threats.map((item, idx) => (
              <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                <span className="text-red-600">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
```

**✅ Day 4 Deliverable**: Charts and SWOT visualization complete

---

## 📋 Phase 5: Recommendation & Multi-language (Day 5)

### 5.1 Recommendation Component

**Create `src/components/dashboard/Recommendation.tsx`**:
```tsx
import React from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { CreditRecommendation } from '../../types';

interface Props {
  recommendation: CreditRecommendation;
}

export const Recommendation: React.FC<Props> = ({ recommendation }) => {
  const getIcon = () => {
    switch (recommendation.decision) {
      case 'APPROVE':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'APPROVE_WITH_CONDITIONS':
        return <AlertCircle className="w-8 h-8 text-yellow-600" />;
      case 'REJECT':
        return <XCircle className="w-8 h-8 text-red-600" />;
    }
  };
  
  const getBgColor = () => {
    switch (recommendation.decision) {
      case 'APPROVE':
        return 'bg-green-50 border-green-200';
      case 'APPROVE_WITH_CONDITIONS':
        return 'bg-yellow-50 border-yellow-200';
      case 'REJECT':
        return 'bg-red-50 border-red-200';
    }
  };
  
  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-6">Evaluation & Recommendation</h2>
      
      <div className={`border-2 rounded-lg p-6 ${getBgColor()}`}>
        <div className="flex items-center gap-3 mb-4">
          {getIcon()}
          <div>
            <h3 className="text-2xl font-bold">
              {recommendation.decision.replace(/_/g, ' ')}
            </h3>
            <p className="text-sm text-gray-600">
              Score: {recommendation.total_score} / 100 (Category {recommendation.category})
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Justification:</h4>
          <ul className="space-y-1">
            {recommendation.justification.map((item, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <span>•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        {recommendation.conditions && recommendation.conditions.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Conditions:</h4>
            <ul className="space-y-1">
              {recommendation.conditions.map((item, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
```

### 5.2 Multi-language Support

**Create `src/i18n/en.json`**:
```json
{
  "login": "Login",
  "email": "Email",
  "password": "Password",
  "dashboard": "Dashboard",
  "upload": "Upload File",
  "financial_indicators": "Financial Indicators",
  "liquidity": "Liquidity",
  "roe": "ROE",
  "debt_assets": "Debt / Assets",
  "swot_analysis": "SWOT Analysis",
  "recommendation": "Recommendation",
  "approve": "Approve",
  "approve_conditions": "Approve with Conditions",
  "reject": "Reject"
}
```

**Create `src/i18n/es.json`**:
```json
{
  "login": "Iniciar Sesión",
  "email": "Correo Electrónico",
  "password": "Contraseña",
  "dashboard": "Panel de Control",
  "upload": "Subir Archivo",
  "financial_indicators": "Indicadores Financieros",
  "liquidity": "Liquidez",
  "roe": "ROE",
  "debt_assets": "Deuda / Activos",
  "swot_analysis": "Análisis FODA",
  "recommendation": "Recomendación",
  "approve": "Aprobar",
  "approve_conditions": "Aprobar con Condiciones",
  "reject": "Rechazar"
}
```

**✅ Day 5 Deliverable**: Complete dashboard with all components and multi-language support

---

## ✅ Frontend Development Checklist

- [ ] Day 1: Authentication UI & routing
- [ ] Day 2: File upload interface
- [ ] Day 3: Dashboard layout & financial indicators
- [ ] Day 4: Charts & SWOT visualization
- [ ] Day 5: Recommendation display & multi-language
- [ ] Responsive design testing
- [ ] Cross-browser testing
- [ ] Performance optimization

**Estimated Duration**: 4-5 days  
**Confidence Level**: High

---

**Next Step**: Start backend development, then integrate frontend!
