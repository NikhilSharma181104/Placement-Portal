import React from 'react';
import { useNavigate } from 'react-router-dom';



const StudentProfile = ({ studentData }) => {
  const navigate = useNavigate();

  const handleResumeUpload = () => {
    navigate('/resume-upload');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border-t-4 border-blue-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-blue-800">🎓 Student Profile</h2>
            <p className="text-sm text-gray-500 mt-1">Your academic and placement overview</p>
          </div>
          <span
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
              studentData.isPlaced
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-yellow-100 text-yellow-800 border-yellow-200"
            }`}
          >
            {studentData.isPlaced ? "✅ Placed" : "⌛ Not Yet Placed"}
          </span>
        </div>

        {/* Avatar + Details */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Profile Icon */}
          <div className="flex-shrink-0 bg-white rounded-2xl shadow-md p-4 border border-blue-100">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
              {studentData.name?.charAt(0).toUpperCase() || "S"}
            </div>
          </div>

          {/* Profile Details */}
          <div className="flex-1 bg-white rounded-2xl shadow-md p-4 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
            <div>
              <h4 className="text-sm text-gray-500">Full Name</h4>
              <p className="text-lg font-semibold">{studentData.name || "Not provided"}</p>
            </div>
            <div>
              <h4 className="text-sm text-gray-500">Email</h4>
              <p className="text-lg font-semibold">{studentData.email || "Not provided"}</p>
            </div>
            <div>
              <h4 className="text-sm text-gray-500">CGPA</h4>
              <p className="text-lg font-semibold">{studentData.cgpa || "N/A"}</p>
            </div>
            <div>
              <h4 className="text-sm text-gray-500">Branch</h4>
              <p className="text-lg font-semibold">{studentData.branch || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border-t-4 border-indigo-500">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          Skills & Expertise
        </h2>

        {studentData.skills?.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {studentData.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow hover:shadow-md transition-transform hover:-translate-y-0.5"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm bg-gray-50 border border-gray-200 p-6 rounded-xl text-center">
            <p className="mb-2">No skills added yet</p>
            <p className="text-xs text-gray-400">You can add skills by editing your profile</p>
          </div>
        )}
      </div>

      {/* Resume */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border-t-4 border-cyan-500">
        <h2 className="text-2xl font-bold text-cyan-700 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Resume
        </h2>

        {studentData.resumeUrl ? (
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <a
              href={studentData.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow hover:shadow-lg transition-transform hover:-translate-y-1"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View Resume
            </a>
            <button
              onClick={handleResumeUpload}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl font-medium shadow hover:shadow-lg transition-transform hover:-translate-y-1"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Update Resume
            </button>
          </div>
        ) : (
          <div className="text-center mt-6">
            <button
              onClick={handleResumeUpload}
              className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium shadow hover:shadow-lg transition-transform hover:-translate-y-1"
            >
              Upload Resume Now
            </button>
        
        
            <p className="text-sm text-gray-400 mt-2">Upload your resume to apply for jobs</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
