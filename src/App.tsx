import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/appStore';

import Login from './pages/Login';
import Home from './pages/Home';
import Layout from './components/Layout';
import ChooseReportType from './pages/ChooseReportType';
import BuildRequest from './pages/BuildRequest';
import ReviewRequest from './pages/ReviewRequest';
import GenerateReport from './pages/GenerateReport';
import ReportSummary from './pages/ReportSummary';
import Notifications from './pages/Notifications';

// Magic Mode Pages
import Overview from './pages/magic/Overview';
import Catalogue from './pages/magic/Catalogue';
import AiScoring from './pages/magic/AiScoring';
import Weightage from './pages/magic/Weightage';
import BuildRoadmap from './pages/magic/BuildRoadmap';
import GtmInsights from './pages/magic/GtmInsights';

export default function App() {
  const { loadThreads, user } = useAppStore();

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        user ? <Layout /> : <Navigate to="/login" replace />
      }>
        <Route index element={<Navigate to="/new" replace />} />
        <Route path="reports" element={<Home />} />
        <Route path="new" element={<ChooseReportType />} />
        <Route path="new/tech" element={<BuildRequest />} />
        <Route path="new/tech/review" element={<ReviewRequest />} />
        <Route path="report/:id/generating" element={<GenerateReport />} />
        <Route path="report/:id" element={<ReportSummary />} />
        <Route path="notifications" element={<Notifications />} />

        {/* Magic Mode Routes */}
        <Route path="overview" element={<Overview />} />
        <Route path="catalogue" element={<Catalogue />} />
        <Route path="ai-scoring" element={<AiScoring />} />
        <Route path="weightage" element={<Weightage />} />
        <Route path="build-roadmap" element={<BuildRoadmap />} />
        <Route path="gtm-insights" element={<GtmInsights />} />

        {/* Support prefixed /magic/* routes as well */}
        <Route path="magic/overview" element={<Overview />} />
        <Route path="magic/catalogue" element={<Catalogue />} />
        <Route path="magic/ai-scoring" element={<AiScoring />} />
        <Route path="magic/weightage" element={<Weightage />} />
        <Route path="magic/roadmap" element={<BuildRoadmap />} />
        <Route path="magic/gtm-insights" element={<GtmInsights />} />
      </Route>
    </Routes>
  );
}
