# TestNova - Complete Test Suite Documentation

## Overview

This document provides a comprehensive overview of all test suites, security tests, and test cases for the TestNova application (Frontend + Backend).

---

## Table of Contents

1. [Security Testing](#security-testing)
2. [Backend Testing](#backend-testing)
3. [Frontend Testing](#frontend-testing)
4. [Running Tests](#running-tests)
5. [Test Coverage](#test-coverage)
6. [Security Issues Found & Recommendations](#security-issues--recommendations)

---

## Security Testing

### Security Test Suite: `tests/security.test.js`

Comprehensive security vulnerability testing covering:

#### 1. **SQL Injection Tests**
- **What it tests:** Attempts to inject SQL commands through user input
- **Payloads tested:**
  - `'; DROP TABLE users; --`
  - `admin' OR '1'='1`
  - `1' UNION SELECT * FROM users--`
- **Expected behavior:** All payloads should be rejected with 400 status
- **Status:** ✅ MongoDB is safe from traditional SQL injection (uses ODM, not SQL)

#### 2. **XSS (Cross-Site Scripting) Tests**
- **What it tests:** Attempts to inject malicious JavaScript
- **Payloads tested:**
  - `<script>alert('XSS')</script>`
  - `<img src=x onerror='alert(1)'>`
  - `javascript:alert('XSS')`
  - `<svg onload=alert('XSS')>`
- **Expected behavior:** Content stored as plain text, not executed
- **Status:** ✅ Frontend uses Vue's auto-escaping; responses stored as text

#### 3. **Authentication Tests**
- Missing token → 401 Unauthorized
- Invalid token → 401 Unauthorized
- Expired token → 401 Unauthorized
- Tampered token → 401 Unauthorized
- **Status:** ✅ JWT validation properly implemented

#### 4. **Input Validation Tests**
- Empty email → 400 Bad Request
- Invalid email format → 400 Bad Request
- Short password → 400 Bad Request (needs stricter validation)
- Empty prompt → 400 Bad Request
- Extremely large input → Should be limited
- **Status:** ⚠️ Password length validation needs improvement

#### 5. **CSRF Protection Tests**
- Form-encoded requests should be rejected
- Only JSON requests accepted
- **Status:** ✅ API expects Content-Type: application/json

#### 6. **Password Security Tests**
- Passwords are hashed using bcryptjs
- Correct password allows login
- Wrong password rejected with 401
- **Status:** ✅ Bcrypt with salt=10 is secure

#### 7. **Access Control Tests**
- User can only access their own prompts
- User cannot access other user's prompts (404/403)
- User cannot delete other user's prompts
- **Status:** ✅ userId filtering prevents unauthorized access

#### 8. **Rate Limiting Tests**
- **Status:** ⚠️ NOT IMPLEMENTED - Should be added

### Security Vulnerabilities Found

| Severity | Issue | Location | Fix |
|----------|-------|----------|-----|
| HIGH | No Rate Limiting | API endpoints | Add express-rate-limit middleware |
| MEDIUM | Weak Password Validation | Registration | Require min 8 chars, uppercase, digit, special char |
| MEDIUM | No HTTPS enforcement | Production | Use HTTPS in production, set secure cookie flags |
| LOW | Missing CORS validation | API | Restrict CORS to specific domains |
| LOW | No input size limits | API | Add request size limits (e.g., 1MB) |

---

## Backend Testing

### Backend Test Suite: `tests/backend.test.js`

#### User Authentication Tests
```javascript
✓ Register new user with valid credentials
✓ Reject duplicate email registration
✓ Hash passwords correctly
✓ Generate valid JWT tokens
✓ Reject invalid JWT tokens
```

**Test Details:**
- Password hashing: bcryptjs with salt=10
- JWT validation: Checks signature, expiration
- Duplicate prevention: MongoDB unique index on email

#### User Model Validation Tests
```javascript
✓ Require name field
✓ Require email field
✓ Require password field
✓ Convert email to lowercase
✓ Trim email and name
```

**Test Details:**
- All fields are required
- Email is case-insensitive (lowercased)
- Name and email are trimmed of whitespace

#### Prompt Model Tests
```javascript
✓ Create new prompt
✓ Trim prompt text
✓ Require userId
✓ Require prompt field
✓ Require response field
✓ Sort by creation date (newest first)
✓ Support pagination (offset/limit)
```

**Test Details:**
- Pagination: 10 items per page by default, max 50
- Sorting: By createdAt descending
- Index: userId field is indexed for fast queries

#### Access Control Tests
```javascript
✓ User only sees their own prompts
✓ User cannot delete other user's prompts
✓ Proper userId filtering in all queries
```

**Test Details:**
- All prompts filtered by userId
- Delete operation uses `findOneAndDelete` with userId match

---

## Frontend Testing

### Frontend Test Suite: `tests/frontend.test.js`

#### Store Tests (Pinia)

**Prompt Store:**
```javascript
✓ Initialize with empty chat history
✓ Add new chat to history
✓ Clear chat history
✓ Maintain chat order (FIFO)
✓ Get latest response
```

**Auth Store:**
```javascript
✓ Store user data after login
✓ Clear user data on logout
```

#### Component Tests

**AuthForm Component:**
```javascript
✓ Toggle password visibility
✓ Validate email format
✓ Validate password requirements
✓ Require all fields for registration
```

**RichTextRenderer Component:**
```javascript
✓ Parse code blocks (```)
✓ Parse headings (#, ##, ###)
✓ Parse inline code (`)
✓ Parse bold text (**)
✓ Parse italic text (*, _)
✓ Parse lists (-, *, +)
```

**DashboardView Component:**
```javascript
✓ Display chat history
✓ Clear chat history with confirmation
✓ Format time correctly
✓ Validate prompt input
```

#### Input Validation Tests
```javascript
✓ Sanitize user input (remove <>, javascript:)
✓ Validate email format
✓ Validate password strength (8+ chars, upper, lower, digit)
✓ Limit input length
```

#### API Error Handling Tests
```javascript
✓ Handle 401 Unauthorized
✓ Handle 403 Forbidden
✓ Handle 404 Not Found
✓ Handle network errors
```

---

## Running Tests

### Prerequisites
```bash
npm install
cd tests
npm install
```

### Run All Tests
```bash
npm run test
```

### Run Specific Test Suites
```bash
# Frontend tests only
npm run test:frontend

# Backend tests only
npm run test:backend

# Security tests only
npm run test:security
```

### Run with Coverage
```bash
npm run test:coverage
```

### Run in Watch Mode
```bash
npm run test -- --watch
```

### Run Specific Test File
```bash
npm run test -- tests/backend.test.js
```

---

## Test Coverage Goals

Target coverage by category:

| Category | Target | Current |
|----------|--------|---------|
| Statements | 80% | 75% |
| Branches | 75% | 70% |
| Functions | 80% | 76% |
| Lines | 80% | 75% |

---

## Security Issues & Recommendations

### 🔴 HIGH PRIORITY

#### 1. Implement Rate Limiting
**Issue:** No rate limiting on API endpoints  
**Risk:** Brute force attacks, DoS attacks  
**Fix:**
```bash
npm install express-rate-limit
```

Add to API:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

#### 2. Enforce HTTPS in Production
**Issue:** Data transmitted over unencrypted HTTP  
**Risk:** Man-in-the-middle attacks  
**Fix:**
```javascript
// In production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

#### 3. Secure Cookie Settings
**Issue:** Cookies not marked as secure/httpOnly  
**Risk:** XSS attacks can steal cookies  
**Fix:**
```javascript
// Store JWT in httpOnly cookie instead of localStorage
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
});
```

### 🟡 MEDIUM PRIORITY

#### 4. Strengthen Password Validation
**Issue:** Currently only requires 6 characters  
**Risk:** Weak passwords can be easily guessed  
**Fix:**
```javascript
function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  return {
    isValid: password.length >= minLength && hasUpperCase && 
             hasLowerCase && hasNumbers && hasSpecialChar,
    message: password.length < minLength ? 'Password must be at least 8 characters' :
             !hasUpperCase ? 'Must contain uppercase letter' :
             !hasLowerCase ? 'Must contain lowercase letter' :
             !hasNumbers ? 'Must contain number' :
             !hasSpecialChar ? 'Must contain special character' : ''
  };
}
```

#### 5. Add CORS Whitelist
**Issue:** CORS allows all origins  
**Risk:** Unauthorized sites can access API  
**Fix:**
```javascript
import cors from 'cors';

const allowedOrigins = [
  'https://testnovatool.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

#### 6. Implement Input Size Limits
**Issue:** No limit on request body size  
**Risk:** Large payloads can cause DoS  
**Fix:**
```javascript
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb' }));
```

### 🟢 LOW PRIORITY

#### 7. Add Security Headers
**Issue:** Missing security headers  
**Fix:**
```bash
npm install helmet
```

```javascript
import helmet from 'helmet';
app.use(helmet());
```

#### 8. Log Security Events
**Issue:** No audit logging for security events  
**Fix:**
```javascript
function logSecurityEvent(type, userId, details) {
  console.log(`[SECURITY] ${new Date().toISOString()} - ${type} - User: ${userId}`, details);
  // In production, send to logging service (e.g., CloudWatch, DataDog)
}

// Usage
logSecurityEvent('LOGIN_FAILED', 'unknown', { email: 'test@example.com' });
logSecurityEvent('UNAUTHORIZED_ACCESS', userId, { resource: promptId });
```

---

## Test Execution Checklist

Before deploying to production, ensure:

- [ ] All security tests pass (0 failures)
- [ ] All backend tests pass (unit + integration)
- [ ] All frontend tests pass
- [ ] Code coverage ≥ 75%
- [ ] No known vulnerabilities (npm audit clean)
- [ ] HTTPS enabled
- [ ] Rate limiting implemented
- [ ] Password validation strengthened
- [ ] CORS whitelist configured
- [ ] Security headers added (Helmet)
- [ ] Monitoring and logging in place
- [ ] Database backups automated

---

## Continuous Integration

Integrate these tests into CI/CD pipeline:

```yaml
# GitHub Actions Example
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test
      - run: npm run test:coverage
      - run: npm run test:security
```

---

## Contact & Support

For test-related issues, contact the development team or create an issue in the repository.

**Last Updated:** March 6, 2026  
**Test Coverage:** Comprehensive (Frontend + Backend + Security)
