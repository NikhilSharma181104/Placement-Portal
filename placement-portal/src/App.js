import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Import the actual components
import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/StudentDashboard";
import TPODashboard from "./pages/TPODashboard";
import ResumeUpload from "./pages/ResumeUpload";
import JobListings from "./pages/JobListings";
import JobDetails from "./pages/JobDetails";
import JobApply from "./pages/JobApply";
import JobPostForm from "./pages/JobPostForm";
import ManageJobs from "./pages/ManageJobs";
import JobApplications from "./pages/JobApplications";
import CompanyProfiles from "./pages/CompanyProfiles";
import IntroductionPage from "./pages/Introduction";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IntroductionPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/tpo-dashboard" element={<TPODashboard />} />
        <Route path="/resume-upload" element={<ResumeUpload />} />
        
        {/* Job related routes */}
        <Route path="/job-listings" element={<JobListings />} />
        <Route path="/job-details/:jobId" element={<JobDetails />} />
        <Route path="/job-apply/:jobId" element={<JobApply />} />
        <Route path="/post-job" element={<JobPostForm />} />
        <Route path="/edit-job/:jobId" element={<JobPostForm />} />
        <Route path="/post-jobs" element={<ManageJobs />} />
        <Route path="/job-applications/:jobId" element={<JobApplications />} />
        
        {/* Company related routes */}
        <Route path="/company-profiles" element={<CompanyProfiles />} />
      </Routes>
    </Router>
  );
}

export default App;
