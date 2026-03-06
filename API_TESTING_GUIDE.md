# TestNova API Documentation & Testing Guide

This directory contains comprehensive API documentation, test suites, and security audit reports.

---

## 📚 Documentation Files

### 1. **Postman Collection** (`api-postman-collection.json`)
Complete Postman collection with all API endpoints pre-configured.

**How to Import:**
1. Open Postman
2. Click "Import"
3. Select `api-postman-collection.json`
4. Update variables:
   - `base_url`: Your API URL
   - `token`: JWT token from login

**Included Endpoints:**
- Health Check
- Authentication (Register, Login)
- Prompts (CRUD operations)

---

### 2. **Swagger/OpenAPI** (`swagger-openapi.yaml`)
Complete OpenAPI 3.0 specification for the API.

**View Swagger UI:**
- Upload to [Swagger Editor](https://editor.swagger.io/)
- Or deploy Swagger UI locally:
  ```bash
  npm install swagger-ui-express
  ```

**Features:**
- Interactive API testing
- Request/response schemas
- Error response documentation
- Security scheme documentation

---

## 🧪 Test Suites

### Backend Tests (`server/tests/api.test.js`)
Comprehensive integration tests for all API endpoints.

**Test Coverage:**
- Authentication (Register, Login)
- Prompts (Create, Read, Update, Delete)
- Authorization (Protected endpoints)
- Input validation
- Error handling
- Security tests

**Run Tests:**
```bash
npm test -- server/tests/api.test.js
```

**Test Count:** 30+ test cases

---

### Frontend Tests (`client/tests/unit.test.js`)
Component and store tests for Vue.js application.

**Test Coverage:**
- Authentication components (LoginView, RegisterView)
- Dashboard component
- Form validation
- Password visibility toggle
- Chat history management
- Error handling
- Responsive design
- Store state management

**Run Tests:**
```bash
npm run test:unit
```

**Test Count:** 25+ test cases

---

## 🔒 Security Audit (`SECURITY_AUDIT.md`)

Comprehensive security assessment with 18 identified issues organized by severity.

**Severity Levels:**
- 🔴 **CRITICAL (5):** Requires immediate action
- 🟠 **HIGH (5):** High priority fixes
- 🟡 **MEDIUM (5):** Should be addressed
- 🟢 **LOW (3):** Nice to have

**Key Issues:**
1. Missing rate limiting
2. No input validation
3. JWT secret management
4. CORS misconfiguration
5. Missing security headers

**Remediation:**
Each issue includes specific code examples and recommendations.

---

## 📋 API Endpoint Reference

### Authentication
```
POST   /api/auth/register    - Create new user
POST   /api/auth/login       - Authenticate user
```

### Prompts
```
GET    /api/prompts          - List user prompts (paginated)
POST   /api/prompts          - Create new prompt
GET    /api/prompts/:id      - Get specific prompt
DELETE /api/prompts/:id      - Delete prompt
```

### System
```
GET    /api/health           - Health check
```

---

## 🚀 Quick Start

### 1. **Test with Postman**
```bash
# Import the Postman collection
1. Open Postman
2. Click Import → Select api-postman-collection.json
3. Set base_url variable
4. Start testing endpoints
```

### 2. **View Swagger Docs**
```bash
# Upload swagger-openapi.yaml to Swagger Editor
https://editor.swagger.io/
```

### 3. **Run Automated Tests**
```bash
# Backend tests
npm test -- server/tests/api.test.js

# Frontend tests
npm run test:unit

# All tests
npm test
```

---

## 🔐 Security Testing

### Test Critical Security Issues
```bash
# Run only security tests
npm test -- --grep "Security"
```

### Security Checklist
- [ ] Rate limiting implemented
- [ ] Input validation enabled
- [ ] CORS properly configured
- [ ] Security headers added
- [ ] JWT secrets secured
- [ ] Passwords never logged
- [ ] Error messages sanitized
- [ ] HTTPS enforced (production)
- [ ] Account lockout implemented
- [ ] Audit logging enabled

---

## 📊 Test Results Summary

### Backend API Tests
- **Total Tests:** 30+
- **Authentication:** 7 tests
- **Prompts:** 13 tests
- **Security:** 10 tests

### Frontend Component Tests
- **Total Tests:** 25+
- **Auth Components:** 8 tests
- **Dashboard:** 7 tests
- **UI/UX:** 7 tests
- **Store:** 3 tests

---

## 🐛 Known Issues & Fixes

### Issue 1: Missing Rate Limiting
**Status:** ⚠️ NOT IMPLEMENTED
**Priority:** CRITICAL
**Fix:** Install `express-rate-limit`

### Issue 2: No Input Validation
**Status:** ⚠️ PARTIALLY IMPLEMENTED
**Priority:** CRITICAL
**Fix:** Add Joi schema validation

### Issue 3: JWT Token Expiration
**Status:** ✅ IMPLEMENTED
**Current:** 7 days
**Recommended:** 1-2 hours
**Action:** Update `JWT_EXPIRES_IN` in .env

---

## 📝 Environment Variables Required

For testing, ensure these variables are set:

```env
# Backend
MONGO_URI=mongodb://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
OLLAMA_API_URL=https://ollama.com/api/chat
OLLAMA_MODEL=devstral-small-2:24b
OLLAMA_API_KEY=your-api-key
CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

---

## 📞 Support & Contact

For issues or questions:
1. Check SECURITY_AUDIT.md for security concerns
2. Review test files for usage examples
3. Check swagger-openapi.yaml for API details
4. Import Postman collection for interactive testing

---

## 📅 Last Updated
March 6, 2026

## Next Review
June 6, 2026 (Quarterly Security Audit)
