import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { VideoMeetComponent } from '../pages/VideoMeet.jsx';
import AuthenticationPage from '../pages/AuthenticationPage.jsx';
import HomePage from '../pages/LandingPage.jsx';
import MeetingHistory from '../pages/MeetingHistory.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import MeetingSummaryPage from '../pages/MeetingSummaryPage.jsx';

function AppRoutes() {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("token") !== null;

    return (
        <Routes>
            <Route path="/" element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <HomePage />
            } />
            <Route path="/dashboard" element={
                isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />
            } />
            <Route path="/auth" element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <AuthenticationPage />
            } />
            <Route path="/meeting/:meetingId" element={<VideoMeetComponent />} />
            <Route path="/history" element={
                isAuthenticated ? <MeetingHistory /> : <Navigate to="/auth" />
            } />
            <Route path="/meeting-summary/:meetingId" element={<MeetingSummaryPage />} />
            <Route path="/join/:meetingId" element={<Navigate to={window.location.pathname.replace('/join/', '/meeting/')} />} />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default AppRoutes;