import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase-config';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Navbar from '../components/Navbar';

const CompanyProfiles = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/');
          return;
        }

        // Fetch all jobs and extract unique companies
        const jobsQuery = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
        const jobsSnapshot = await getDocs(jobsQuery);
        const companiesMap = new Map();

        jobsSnapshot.forEach((doc) => {
          const job = doc.data();
          const companyName = job.company;
          
          if (companyName && !companiesMap.has(companyName)) {
            companiesMap.set(companyName, {
              name: companyName,
              description: job.companyInfo || 'No description available',
              location: job.location,
              jobCount: 1,
              latestJob: job.title,
              jobTypes: [job.jobType],
              createdAt: job.createdAt
            });
          } else if (companyName && companiesMap.has(companyName)) {
            const existing = companiesMap.get(companyName);
            existing.jobCount += 1;
            if (!existing.jobTypes.includes(job.jobType)) {
              existing.jobTypes.push(job.jobType);
            }
            // Update with latest job info if this job is newer
            if (job.createdAt > existing.createdAt) {
              existing.latestJob = job.title;
              existing.createdAt = job.createdAt;
            }
          }
        });

        const companiesArray = Array.from(companiesMap.values());
        setCompanies(companiesArray);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Company Profiles</h1>
          <button
            onClick={() => navigate('/student-dashboard')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search companies by name, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                {/* Company Header */}
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold mr-4">
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
                    <p className="text-sm text-gray-500">{company.location}</p>
                  </div>
                </div>

                {/* Company Description */}
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {company.description}
                </p>

                {/* Company Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{company.jobCount}</div>
                    <div className="text-sm text-blue-700">Open Positions</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{company.jobTypes.length}</div>
                    <div className="text-sm text-green-700">Job Types</div>
                  </div>
                </div>

                {/* Job Types */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Available Positions:</p>
                  <div className="flex flex-wrap gap-2">
                    {company.jobTypes.map((type, typeIndex) => (
                      <span key={typeIndex} className={`px-2 py-1 text-xs font-medium rounded-full ${
                        type === 'full-time' ? 'bg-green-100 text-green-800' :
                        type === 'part-time' ? 'bg-yellow-100 text-yellow-800' :
                        type === 'internship' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {type?.replace('-', ' ').toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Latest Job */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Latest Opening:</p>
                  <p className="font-medium text-gray-900">{company.latestJob}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate('/job-listings')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium"
                  >
                    View Jobs
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-lg text-sm font-medium">
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0V9a1 1 0 011-1h4a1 1 0 011 1v12m-6 0h6" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No companies found' : 'No companies available'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search terms to find companies.'
                : 'Companies will appear here when jobs are posted.'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Quick Stats */}
        {companies.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{companies.length}</div>
                <div className="text-sm text-gray-500">Total Companies</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {companies.reduce((sum, company) => sum + company.jobCount, 0)}
                </div>
                <div className="text-sm text-gray-500">Total Job Openings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {new Set(companies.map(c => c.location)).size}
                </div>
                <div className="text-sm text-gray-500">Cities</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {new Set(companies.flatMap(c => c.jobTypes)).size}
                </div>
                <div className="text-sm text-gray-500">Job Types</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyProfiles;