import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase-config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Navbar from '../components/Navbar';
import { signOut } from 'firebase/auth';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentResumeUrl, setCurrentResumeUrl] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentResume = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/');
          return;
        }

        const studentDoc = await getDoc(doc(db, 'students', user.uid));
        if (studentDoc.exists()) {
          const data = studentDoc.data();
          setCurrentResumeUrl(data.resumeUrl || '');
        }
      } catch (error) {
        console.error('Error fetching resume:', error);
      }
    };

    fetchCurrentResume();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        setMessage('');
      } else {
        setMessage('Please select a PDF file or image.');
        setFile(null);
      }
    }
  };

  const extractTextFromFile = async (file) => {
    try {
      // This is a placeholder for OCR functionality
      // In a real implementation, you would use Tesseract.js or similar
      if (file.type === 'application/pdf') {
        return 'PDF text extraction would be implemented here';
      } else if (file.type.startsWith('image/')) {
        // For images, you could use Tesseract.js
        return 'Image OCR would be implemented here';
      }
      return '';
    } catch (error) {
      console.error('Error extracting text:', error);
      return '';
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/');
        return;
      }

      // Upload file to Firebase Storage
      const storageRef = ref(storage, `resumes/${user.uid}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Extract text from file (placeholder implementation)
      const text = await extractTextFromFile(file);
      setExtractedText(text);

      // Update student document with resume URL
      await updateDoc(doc(db, 'students', user.uid), {
        resumeUrl: downloadURL,
        resumeFileName: file.name,
        resumeUploadedAt: new Date(),
        extractedText: text
      });

      setCurrentResumeUrl(downloadURL);
      setMessage('Resume uploaded successfully!');
      setFile(null);
    } catch (error) {
      console.error('Error uploading resume:', error);
      setMessage('Error uploading resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={handleLogout} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resume Upload</h1>
          <button
            onClick={() => navigate('/student-dashboard')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Current Resume Section */}
          {currentResumeUrl && (
            <div className="mb-8 p-6 bg-blue-50 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Current Resume</h2>
              <div className="flex items-center justify-between">
                <span className="text-blue-600">Resume uploaded successfully</span>
                <div className="space-x-4">
                  <a
                    href={currentResumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-block"
                  >
                    View Resume
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {currentResumeUrl ? 'Update Resume' : 'Upload Resume'}
            </h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              
              <div className="mb-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-500 font-medium">
                    Click to upload
                  </span>
                  <span className="text-gray-500"> or drag and drop</span>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                />
              </div>
              
              <p className="text-sm text-gray-500">PDF or image files up to 10MB</p>
              
              {file && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Selected: <span className="font-medium">{file.name}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>

            {message && (
              <div className={`mt-4 p-4 rounded-lg ${
                message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}>
                {message}
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                {uploading ? 'Uploading...' : 'Upload Resume'}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Upload Guidelines</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Supported formats: PDF, JPG, PNG</li>
              <li>• Maximum file size: 10MB</li>
              <li>• Ensure your resume is clear and readable</li>
              <li>• Include your contact information, education, and experience</li>
              <li>• Your resume will be automatically processed for job matching</li>
            </ul>
          </div>

          {extractedText && (
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Extracted Text Preview</h3>
              <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {extractedText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;