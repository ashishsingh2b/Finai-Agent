import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { ReportsPage } from './pages/ReportsPage';
import { ProfilePage } from './pages/ProfilePage';

import { LoginForm } from './components/auth/LoginForm';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { DocumentationPage } from './pages/DocumentationPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { GlobalLoader } from './components/common/GlobalLoader';
import { ToastContainer } from './components/common/Toast.tsx';
import { NotFoundPage } from './pages/NotFound';

import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

function App() {
    const { checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <BrowserRouter>
            <GlobalLoader />
            <ToastContainer />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginForm />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/upload"
                    element={
                        <ProtectedRoute>
                            <UploadPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/documentation"
                    element={
                        <ProtectedRoute>
                            <DocumentationPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/reports"
                    element={
                        <ProtectedRoute>
                            <ReportsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/dashboard/users"
                    element={
                        <ProtectedRoute>
                            <UserManagementPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/analysis/:id"
                    element={
                        <ProtectedRoute>
                            <AnalysisPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
