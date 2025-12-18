import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase-config';
import { doc, getDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Navbar from '../components/Navbar';

const JobApply = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    additionalInfo: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/');
          return;
        }

        // Fetch job details
        const jobDoc = await getDoc(doc(db, 'jobs', jobId));
        if (!jobDoc.exists()) {
          navigate('/job-listings');
          return;
        }
        setJob({ id: jobDoc.id, ...jobDoc.data() });

        // Fetch student data
        const studentDoc = await getDoc(doc(db, 'students', user.uid));
        if (studentDoc.exists()) {
          setStudentData(studentDoc.data());
        }

        // Check if already applied
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('jobId', '==', jobId),
          where('studentId', '==', user.uid)
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        setAlreadyApplied(!applicationsSnapshot.empty);

      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/job-listings');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleInputChange = (e) => {
    setApplicationData({
      ...applicationData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!studentData?.resumeUrl) {
      setMessage('Please upload your resume before applying.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const user = auth.currentUser;
      
      await addDoc(collection(db, 'applications'), {
        jobId: jobId,
        studentId: user.uid,
        studentName: studentData.name,
        studentEmail: studentData.email,
        studentCGPA: studentData.cgpa,
        studentBranch: studentData.branch,
        studentSkills: studentData.skills || [],
        resumeUrl: studentData.resumeUrl,
        coverLetter: applicationData.coverLetter,
        additionalInfo: applicationData.additionalInfo,
        status: 'pending',
        appliedAt: new Date(),
        jobTitle: job.title,
        company: job.company
      });

      setMessage('Application submitted successfully!');
      setAlreadyApplied(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/job-listings');
      }, 2000);

    } catch (error) {
      console.error('Error submitting application:', error);
      setMessage('Error submitting application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!job || !studentData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar onLogout={handleLogout} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Unable to load application</h1>
            <button
              onClick={() => navigate('/job-listings')}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Back to Job Listings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={handleLogout} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(`/job-details/${jobId}`)}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Job Details
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Apply for Position</h1>
            <p className="text-xl text-green-100">{job.title} at {job.company}</p>
          </div>

          <div className="px-8 py-6">
            {alreadyApplied ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Applied</h2>
                <p className="text-gray-600 mb-6">You have already submitted an application for this position.</p>
                <button
                  onClick={() => navigate('/job-listings')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                  Browse More Jobs
                </button>
              </div>
            ) : (
              <>
                {/* Student Profile Summary */}
                <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Profile Summary</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{studentData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{studentData.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">CGPA</p>
                      <p className="font-medium">{studentData.cgpa || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Branch</p>
                      <p className="font-medium">{studentData.branch || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  {studentData.skills && studentData.skills.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {studentData.skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Resume</p>
                    {studentData.resumeUrl ? (
                      <a
                        href={studentData.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Resume
                      </a>
                    ) : (
                      <div className="text-red-600">
                        <p>No resume uploaded</p>
                        <button
                          onClick={() => navigate('/resume-upload')}
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          Upload Resume
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Application Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter
                    </label>
                    <textarea
                      id="coverLetter"
                      name="coverLetter"
                      rows={6}
                      value={applicationData.coverLetter}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Write a brief cover letter explaining why you're interested in this position and what makes you a good fit..."
                    />
                  </div>

                  <div>
                    <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Information (Optional)
                    </label>
                    <textarea
                      id="additionalInfo"
                      name="additionalInfo"
                      rows={4}
                      value={applicationData.additionalInfo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any additional information you'd like to share..."
                    />
                  </div>

                  {message && (
                    <div className={`p-4 rounded-lg ${
                      message.includes('Error') || message.includes('Please upload') 
                        ? 'bg-red-50 text-red-700' 
                        : 'bg-green-50 text-green-700'
                    }`}>
                      {message}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      disabled={submitting || !studentData.resumeUrl}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium"
                    >
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/job-details/${jobId}`)}
                      className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApply;