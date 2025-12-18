# Security Guidelines

## 🔒 Environment Variables

This project uses environment variables to store sensitive configuration data like Firebase API keys. **Never commit these to version control.**

### Setup Instructions

1. **Copy the example file:**
   ```bash
   cp placement-portal/.env.example placement-portal/.env
   ```

2. **Update with your Firebase credentials:**
   Edit `placement-portal/.env` with your actual Firebase project credentials.

3. **Verify .gitignore:**
   Ensure `.env` files are listed in `.gitignore` to prevent accidental commits.

## 🚨 What NOT to Commit

- ❌ `.env` files with real credentials
- ❌ Firebase private keys
- ❌ Database passwords
- ❌ API secrets
- ❌ Personal access tokens

## ✅ What IS Safe to Commit

- ✅ `.env.example` with placeholder values
- ✅ Configuration templates
- ✅ Public Firebase config (client-side keys are meant to be public)

## 🔧 Firebase Security Best Practices

### 1. Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Students can only access their own profile
    match /students/{studentId} {
      allow read, write: if request.auth != null && request.auth.uid == studentId;
    }
    
    // Jobs are readable by authenticated users
    match /jobs/{jobId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && isTPO();
    }
    
    // Applications are readable by the applicant and TPOs
    match /applications/{applicationId} {
      allow read, write: if request.auth != null && 
        (resource.data.studentId == request.auth.uid || isTPO());
    }
    
    function isTPO() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'tpo';
    }
  }
}
```

### 2. Storage Security Rules
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

### 3. Authentication Security
- Enable only required sign-in methods
- Set up proper password policies
- Implement email verification
- Use Firebase Auth UI for consistent security

## 🛡️ Production Deployment Security

### Environment Variables for Production
- Use your hosting platform's environment variable system
- Never hardcode credentials in production builds
- Rotate API keys regularly

### Recommended Hosting Platforms
- **Vercel**: Automatic environment variable support
- **Netlify**: Built-in environment variable management
- **Firebase Hosting**: Integrated with Firebase services
- **Heroku**: Environment variable configuration

### Pre-deployment Checklist
- [ ] All sensitive data moved to environment variables
- [ ] `.env` files added to `.gitignore`
- [ ] Firebase security rules configured
- [ ] Authentication properly set up
- [ ] Storage permissions configured
- [ ] API keys restricted to specific domains (in production)

## 🚨 If Credentials Are Compromised

1. **Immediately rotate all API keys**
2. **Update Firebase security rules**
3. **Check Firebase usage logs**
4. **Update all deployment environments**
5. **Review recent commits for exposed data**

## 📞 Reporting Security Issues

If you discover a security vulnerability, please:
1. **DO NOT** open a public issue
2. Email the maintainer directly
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before public disclosure

---

**Remember: Security is everyone's responsibility. When in doubt, err on the side of caution.**