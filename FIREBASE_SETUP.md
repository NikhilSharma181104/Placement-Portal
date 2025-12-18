# Firebase Setup Guide

This guide will help you set up Firebase for the Placement Portal project.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `placement-portal` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Configure Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. Click "Save"

## Step 3: Set up Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

### Firestore Security Rules (for production)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Students can read/write their own student document
    match /students/{studentId} {
      allow read, write: if request.auth != null && request.auth.uid == studentId;
    }
    
    // Jobs are readable by authenticated users, writable by TPOs
    match /jobs/{jobId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // Add TPO role check in production
    }
    
    // Applications are readable by the student who created them and TPOs
    match /applications/{applicationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 4: Configure Storage

1. Go to **Storage**
2. Click "Get started"
3. Choose "Start in test mode"
4. Select the same location as Firestore
5. Click "Done"

### Storage Security Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /resumes/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 5: Get Configuration Keys

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon (</>) to add a web app
4. Enter app nickname: "Placement Portal"
5. Click "Register app"
6. Copy the configuration object

## Step 6: Update Project Configuration

1. In your project, open `placement-portal/src/firebase-config.js`
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Step 7: Test the Setup

1. Start your development server:
   ```bash
   cd placement-portal
   npm start
   ```

2. Open `http://localhost:3000`
3. Try creating a new account
4. Check Firebase Console to see if user was created

## Optional: Environment Variables

For better security, create a `.env` file in the `placement-portal` directory:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

Then update `firebase-config.js` to use environment variables:

```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
```

## Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/configuration-not-found)"**
   - Check that your API key is correct
   - Ensure Authentication is enabled in Firebase Console

2. **"Missing or insufficient permissions"**
   - Check Firestore security rules
   - Ensure user is authenticated

3. **Storage upload fails**
   - Check Storage security rules
   - Verify file size limits

### Getting Help

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)

## Production Deployment

For production deployment:

1. Update security rules to be more restrictive
2. Set up proper user roles (student/TPO)
3. Configure custom domain
4. Set up Firebase Hosting (optional)
5. Enable Firebase Analytics
6. Set up proper backup strategies

---

**Note**: Keep your Firebase configuration keys secure and never commit them to public repositories!