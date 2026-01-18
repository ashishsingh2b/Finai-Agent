# Moskalti Frontend

React + TypeScript frontend for AI Credit Analysis System

## Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will run at: http://localhost:5173

## Features

- ✅ Login & Authentication
- ✅ File Upload (Excel)
- ✅ Financial Indicators Display
- ✅ SWOT Analysis Visualization
- ✅ Credit Recommendation View
- ✅ Recent Analyses List

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **Zustand** for state management
- **Axios** for API calls
- **React Router** for navigation
- **Lucide React** for icons

## Project Structure

```
src/
├── components/        # React components
│   ├── auth/         # Login, register
│   ├── dashboard/    # Financial indicators, SWOT, etc
│   ├── upload/       # File upload
│   └── common/       # Shared components
├── pages/            # Page components
├── services/         # API service
├── store/            # Zustand stores
└── types/            # TypeScript interfaces
```

## Environment Variables

Create `.env.local`:
```
VITE_API_URL=http://localhost:8000/api/v1
```
