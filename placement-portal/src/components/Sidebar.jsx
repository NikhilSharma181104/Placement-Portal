import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { auth, db } from "../firebase-config";
import { doc, getDoc } from "firebase/firestore";
import ManageJobs from "../pages/ManageJobs";

const Sidebar = () => {
  const [userType, setUserType] = useState("student");
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchUserType = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const tpoRef = doc(db, "tpo", user.uid);
        const tpoSnap = await getDoc(tpoRef);

        setUserType(tpoSnap.exists() ? "tpo" : "student");
      } catch (error) {
        console.error("Error fetching user type:", error);
      }
    };

    fetchUserType();
  }, []);

  return (
    <>
      {/* Hamburger Button (only when sidebar is closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-2 left-2 z-[100] text-3xl text-white bg-blue-600 p-2 rounded-md shadow-md"
        >
          ☰
        </button>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-[0px] h-[calc(100%-5px)] w-64 bg-[#1F2937] text-white space-y-6 py-7 px-4 shadow-xl transform transition-transform duration-300 ease-in-out z-[60] rounded-r-xl
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-white text-2xl"
        >
          ✕
        </button>

        {/* Logo */}
        <div className="flex items-center space-x-3 px-2 mt-8">
          <span className="text-3xl font-bold tracking-wide">
            🎓 Placement Portal
          </span>
        </div>

        {/* Nav Links */}
        <nav className="mt-6 space-y-2">
          {userType === "student" ? (
            <>
              <SidebarLink to="/student-dashboard" active={isActive("/student-dashboard")}>
                📊 Dashboard
              </SidebarLink>
              <SidebarLink to="/resume-upload" active={isActive("/resume-upload")}>
                📁 Resume Upload
              </SidebarLink>
              <SidebarLink to="/job-listings" active={isActive("/job-listings")}>
                💼 Job Listings
              </SidebarLink>
            </>
          ) : (
            <>
              <SidebarLink to="/tpo-dashboard" active={isActive("/tpo-dashboard")}>
                📊 Dashboard
              </SidebarLink>
              <SidebarLink to="/manage-jobs" active={isActive("/manage-jobs")}>
                🛠 Manage Jobs
              </SidebarLink>
              <SidebarLink to="/post-job" active={isActive("/post-job")}>
                📝 Post Job
              </SidebarLink>
              <SidebarLink to="/company-profiles" active={isActive("/company-profiles")}>
                🏢 Companies
              </SidebarLink>
            </>
          )}
          <Link
            to="/"
            className="block py-2 px-4 rounded-lg transition font-medium hover:bg-gray-700 hover:text-red-400"
          >
            🚪 Logout
          </Link>
        
        </nav>
      </div>
    </>
  );
};

// Sidebar link component
const SidebarLink = ({ to, children, active }) => (
  <Link
    to={to}
    className={`block py-2 px-4 rounded-lg transition font-medium ${
      active
        ? "bg-blue-600 text-white"
        : "hover:bg-gray-700 hover:text-blue-300"
    }`}
  >
    {children}
  </Link>
);

export default Sidebar;
