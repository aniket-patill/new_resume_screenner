import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ResumeScreening from './pages/ResumeScreening';
import CodingRound from './pages/CodingRound';
import TechnicalInterview from './pages/TechnicalInterview';
import AptitudeRound from './pages/AptitudeRound';
import RecruitmentRoundsManager from './pages/RecruitmentRoundsManager';
import Candidates from './pages/Candidates';
import ScreenedCandidates from './pages/ScreenedCandidates';
import ResumeChat from './pages/ResumeChat';
import Analytics from './pages/Analytics';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import CandidateLayout from './layouts/CandidateLayout';
import CandidateLogin from './pages/candidate/CandidateLogin';
import InstructionsPage from './pages/candidate/InstructionsPage';
import CandidateCodingAssessment from './pages/candidate/CandidateCodingAssessment';
import CandidateAptitudeAssessment from './pages/candidate/CandidateAptitudeAssessment';

import VapiInterview from './pages/candidate/VapiInterview';
import CandidateStartPage from './pages/candidate/CandidateStartPage';

import Home from './pages/Home';
import GlobalSettings from './pages/GlobalSettings';
import ClerkAdminGuard from './components/ClerkAdminGuard';
import PremiumRouteGuard from './components/PremiumRouteGuard';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-dark text-white">
                <Routes>
                    {/* Public Home */}
                    <Route path="/" element={<Home />} />

                    {/* Public/Auth Routes */}
                    <Route path="/login" element={<Home />} />

                    {/* Admin Dashboard Routes - Protected by Clerk */}
                    <Route element={<ClerkAdminGuard><DashboardLayout /></ClerkAdminGuard>}>
                        {/* Dashboard (Admin Dashboard for Admin, User Portal for User) */}
                        <Route path="/dashboard" element={<Dashboard />} />
                        
                        {/* Premium Round Management */}
                        <Route path="/recruitment/rounds" element={<PremiumRouteGuard><RecruitmentRoundsManager /></PremiumRouteGuard>} />
                        <Route path="/coding-round" element={<PremiumRouteGuard><CodingRound /></PremiumRouteGuard>} />
                        <Route path="/aptitude-round" element={<PremiumRouteGuard><AptitudeRound /></PremiumRouteGuard>} />
                        <Route path="/technical-interview" element={<PremiumRouteGuard><TechnicalInterview /></PremiumRouteGuard>} />
                        <Route path="/candidates" element={<PremiumRouteGuard><Candidates /></PremiumRouteGuard>} />
                        <Route path="/analytics" element={<PremiumRouteGuard><Analytics /></PremiumRouteGuard>} />

                        {/* Free Routes */}
                        <Route path="/resume-screening" element={<ResumeScreening />} />
                        <Route path="/screened-candidates" element={<ScreenedCandidates />} />
                        <Route path="/resume-chat" element={<ResumeChat />} />
                        <Route path="/settings" element={<GlobalSettings />} />
                    </Route>

                    {/* Candidate Portal Routes - Isolated Environment */}
                    <Route path="/portal" element={<CandidateLayout />}>
                        <Route index element={<Navigate to="/portal/login" replace />} />
                        <Route path="login" element={<CandidateLogin />} />
                        <Route path="start" element={<CandidateStartPage />} />
                        <Route path="instructions" element={<InstructionsPage />} />
                        <Route path="assessment/coding" element={<CandidateCodingAssessment />} />
                        <Route path="assessment/aptitude" element={<CandidateAptitudeAssessment />} />
                        <Route path="assessment/interview" element={<VapiInterview />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
