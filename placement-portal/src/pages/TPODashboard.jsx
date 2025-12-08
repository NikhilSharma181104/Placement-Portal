import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase-config";
import { signOut } from "firebase/auth";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import Navbar from "../components/Navbar";
// import Sidebar from "../components/Sidebar";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const TPODashboard = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    placed: 0,
    notPlaced: 0,
  });
  const [filters, setFilters] = useState({
    cgpaMin: "",
    branch: "",
    skill: "",
    placementStatus: "all",
  });
  const [branchStats, setBranchStats] = useState({});
  const [cgpaRangeStats, setCgpaRangeStats] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate("/");
          return;
        }

        const studentsRef = collection(db, "students");
        const studentsSnap = await getDocs(studentsRef);
        const studentsData = [];

        studentsSnap.forEach((doc) => {
          const student = { id: doc.id, ...doc.data() };

          // Normalize skills
          if (student.skills && Array.isArray(student.skills)) {
            student.skills = student.skills.map(skill => skill.toUpperCase());
          }

          // Normalize branch
          if (student.branch && typeof student.branch === "string") {
            student.branch = student.branch.toUpperCase();
          }

          studentsData.push(student);
        });


        setStudents(studentsData);
        setFilteredStudents(studentsData);

        // Calculate stats
        const placed = studentsData.filter((student) => student.isPlaced).length;
        setStats({
          total: studentsData.length,
          placed,
          notPlaced: studentsData.length - placed,
        });

        // Calculate branch stats
        const branchData = {};
        studentsData.forEach((student) => {
          if (student.branch) {
            if (!branchData[student.branch]) {
              branchData[student.branch] = { total: 0, placed: 0 };
            }
            branchData[student.branch].total += 1;
            if (student.isPlaced) {
              branchData[student.branch].placed += 1;
            }
          }
        });
        setBranchStats(branchData);

        // Calculate CGPA range stats
        const cgpaData = {
          "< 6.0": { total: 0, placed: 0 },
          "6.0 - 7.0": { total: 0, placed: 0 },
          "7.0 - 8.0": { total: 0, placed: 0 },
          "8.0 - 9.0": { total: 0, placed: 0 },
          "> 9.0": { total: 0, placed: 0 },
        };

        studentsData.forEach((student) => {
          const cgpa = parseFloat(student.cgpa);
          if (!isNaN(cgpa)) {
            let range;
            if (cgpa < 6.0) range = "< 6.0";
            else if (cgpa < 7.0) range = "6.0 - 7.0";
            else if (cgpa < 8.0) range = "7.0 - 8.0";
            else if (cgpa < 9.0) range = "8.0 - 9.0";
            else range = "> 9.0";

            cgpaData[range].total += 1;
            if (student.isPlaced) {
              cgpaData[range].placed += 1;
            }
          }
        });
        setCgpaRangeStats(cgpaData);
      } catch (error) {
        console.error("Error fetching students data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [navigate]);

  useEffect(() => {
    // Apply filters
    let result = [...students];

    if (filters.cgpaMin) {
      result = result.filter(
        (student) => parseFloat(student.cgpa) >= parseFloat(filters.cgpaMin)
      );
    }

    if (filters.branch) {
      result = result.filter(
        (student) =>
          student.branch &&
          student.branch.toLowerCase().includes(filters.branch.toLowerCase())
      );
    }

    if (filters.branch) {
      const inputBranch = filters.branch.toUpperCase();
      result = result.filter(
        (student) =>
          student.branch &&
          student.branch.includes(inputBranch)
      );
    }


    if (filters.placementStatus !== "all") {
      const isPlaced = filters.placementStatus === "placed";
      result = result.filter((student) => student.isPlaced === isPlaced);
    }

    setFilteredStudents(result);
  }, [filters, students]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleTogglePlacementStatus = async (studentId, currentStatus) => {
    try {
      const studentRef = doc(db, "students", studentId);
      await updateDoc(studentRef, {
        isPlaced: !currentStatus,
      });

      // Update local state
      const updatedStudents = students.map((student) =>
        student.id === studentId
          ? { ...student, isPlaced: !currentStatus }
          : student
      );

      setStudents(updatedStudents);

      // Recalculate stats
      const placed = updatedStudents.filter((student) => student.isPlaced).length;
      setStats({
        total: updatedStudents.length,
        placed,
        notPlaced: updatedStudents.length - placed,
      });
    } catch (error) {
      console.error("Error updating placement status:", error);
    }
  };

  // Prepare chart data
  const placementChartData = {
    labels: ["Placed", "Not Placed"],
    datasets: [
      {
        data: [stats.placed, stats.notPlaced],
        backgroundColor: ["#10B981", "#F59E0B"],
        borderWidth: 1,
      },
    ],
  };

  const branchChartData = {
    labels: Object.keys(branchStats),
    datasets: [
      {
        label: "Total Students",
        data: Object.values(branchStats).map((stat) => stat.total),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Placed Students",
        data: Object.values(branchStats).map((stat) => stat.placed),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  const cgpaChartData = {
    labels: Object.keys(cgpaRangeStats),
    datasets: [
      {
        label: "Total Students",
        data: Object.values(cgpaRangeStats).map((stat) => stat.total),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Placed Students",
        data: Object.values(cgpaRangeStats).map((stat) => stat.placed),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* <Sidebar /> */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onLogout={handleLogout} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6 md:p-8">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-blue-800 mb-8 fade-in">TPO Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Students</h2>
                    <p className="text-4xl font-bold text-blue-600">{stats.total}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Placed</h2>
                    <p className="text-4xl font-bold text-green-600">{stats.placed}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Not Placed</h2>
                    <p className="text-4xl font-bold text-yellow-600">{stats.notPlaced}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Placement Status</h2>
                <div className="h-72 flex items-center justify-center">
                  <Pie data={placementChartData} options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          font: {
                            size: 14,
                            weight: 'bold'
                          },
                          padding: 20
                        }
                      }
                    }
                  }} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Branch-wise Statistics</h2>
                <div className="h-72">
                  <Bar
                    data={branchChartData}
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            font: {
                              size: 12
                            },
                            padding: 20
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 mb-8 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-900">CGPA Range Statistics</h2>
              </div>
              <div className="h-72">
                <Bar
                  data={cgpaChartData}
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          font: {
                            size: 12
                          },
                          padding: 20
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="flex items-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-900">Filters</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <label className="block text-sm font-medium text-blue-700 mb-2 uppercase tracking-wide">
                    Min CGPA
                  </label>
                  <input
                    type="number"
                    name="cgpaMin"
                    value={filters.cgpaMin}
                    onChange={handleFilterChange}
                    className="shadow-sm border border-blue-200 rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="Enter minimum CGPA"
                    min="0"
                    max="10"
                    step="0.1"
                  />
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <label className="block text-sm font-medium text-purple-700 mb-2 uppercase tracking-wide">
                    Branch
                  </label>
                  <input
                    type="text"
                    name="branch"
                    value={filters.branch}
                    onChange={handleFilterChange}
                    className="shadow-sm border border-purple-200 rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white"
                    placeholder="Search by branch"
                  />
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <label className="block text-sm font-medium text-indigo-700 mb-2 uppercase tracking-wide">
                    Skill
                  </label>
                  <input
                    type="text"
                    name="skill"
                    value={filters.skill}
                    onChange={handleFilterChange}
                    className="shadow-sm border border-indigo-200 rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    placeholder="Search by skill"
                  />
                </div>
                <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                  <label className="block text-sm font-medium text-teal-700 mb-2 uppercase tracking-wide">
                    Placement Status
                  </label>
                  <select
                    name="placementStatus"
                    value={filters.placementStatus}
                    onChange={handleFilterChange}
                    className="shadow-sm border border-teal-200 rounded-lg w-full py-2.5 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-teal-500 focus:border-teal-500 bg-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="placed">Placed</option>
                    <option value="notPlaced">Not Placed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-900">Student Data</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50 border-b border-blue-100"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50 border-b border-blue-100"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50 border-b border-blue-100"
                      >
                        CGPA
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50 border-b border-blue-100"
                      >
                        Branch
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50 border-b border-blue-100"
                      >
                        Skills
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50 border-b border-blue-100"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50 border-b border-blue-100"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-blue-50/30 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {student.name || "Not provided"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{student.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {student.cgpa || "Not provided"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {student.branch || "Not provided"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {student.skills && student.skills.length > 0 ? (
                                student.skills.slice(0, 3).map((skill, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm"
                                  >
                                    {skill}
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500 italic">None</span>
                              )}
                              {student.skills && student.skills.length > 3 && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-800 shadow-sm">
                                  +{student.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium shadow-sm ${student.isPlaced
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                }`}
                            >
                              {student.isPlaced ? "Placed" : "Not Placed"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() =>
                                handleTogglePlacementStatus(student.id, student.isPlaced)
                              }
                              className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white shadow-sm hover:shadow-md transition-all ${student.isPlaced
                                ? "bg-yellow-500 hover:bg-yellow-600"
                                : "bg-green-500 hover:bg-green-600"
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${student.isPlaced
                                  ? "focus:ring-yellow-500"
                                  : "focus:ring-green-500"
                                }`}
                            >
                              {student.isPlaced ? (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Mark as Not Placed
                                </>
                              ) : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Mark as Placed
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-600 text-lg font-medium">No students found matching the filters</p>
                            <p className="text-gray-500 mt-1">Try adjusting your filter criteria</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TPODashboard;