import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/ui/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Onboarding } from './pages/Onboarding';
import { Settings } from './pages/Settings';
import { ResumeResults } from './pages/ResumeResults';
import { ResumeUpload } from './pages/ResumeUpload';
import { Profile } from './pages/Profile';
import { SkillAnalysis } from './pages/SkillAnalysis';
import { Roadmap } from './pages/Roadmap';
import { JobRecommendations } from './pages/JobRecommendations';
import { ProjectBuilder } from './pages/ProjectBuilder';
import { SkillTest } from './pages/SkillTest';
import { VisualizedGrowth } from './pages/VisualizedGrowth';
import { InterviewPrep } from './pages/InterviewPrep';
import { AnimatePresence } from 'framer-motion';

function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/upload-resume" element={<ResumeUpload />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Nav placeholders */}
            <Route path="/courses" element={<Dashboard />} />
            <Route path="/quests" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/resume-results" element={<ResumeResults />} />
            <Route path="/skills" element={<SkillAnalysis />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/jobs" element={<JobRecommendations />} />
            <Route path="/project-builder" element={<ProjectBuilder />} />
            <Route path="/test" element={<SkillTest />} />
            <Route path="/vg" element={<VisualizedGrowth />} />
            <Route path="/interview" element={<InterviewPrep />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;
