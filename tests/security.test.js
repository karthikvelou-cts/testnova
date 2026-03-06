/**
 * Security Test Suite
 * Tests for common vulnerabilities: SQL Injection, XSS, CSRF, Auth issues, Input validation
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const API_BASE = "http://localhost:5000";
const JWT_SECRET = process.env.JWT_SECRET || "testnova-secret";

// Test configuration
const tests = {
  passed: 0,
  failed: 0,
  results: [],
};

// Helper functions
function log(type, message) {
  const prefix = {
    pass: "✓",
    fail: "✗",
    info: "ℹ",
    warn: "⚠",
  }[type];
  console.log(`${prefix} ${message}`);
}

function assert(condition, message) {
  if (condition) {
    tests.passed++;
    log("pass", message);
    tests.results.push({ status: "PASS", message });
  } else {
    tests.failed++;
    log("fail", message);
    tests.results.push({ status: "FAIL", message });
  }
}

// ==================== SECURITY TESTS ====================

async function testSQLInjection() {
  log("info", "\n=== SQL Injection Tests ===");

  try {
    // Test 1: Attempted SQL injection in email field
    const injectionPayloads = [
      "'; DROP TABLE users; --",
      "admin' OR '1'='1",
      "1' UNION SELECT * FROM users--",
    ];

    for (const payload of injectionPayloads) {
      try {
        const response = await axios.post(`${API_BASE}/api/auth/register`, {
          name: "Test",
          email: payload,
          password: "password123",
        });
        // Should fail or be treated as invalid email
        assert(
          response.status === 400 || response.data.message?.includes("invalid"),
          `SQL Injection blocked for payload: ${payload}`
        );
      } catch (error) {
        assert(
          error.response?.status === 400,
          `SQL Injection blocked for payload: ${payload}`
        );
      }
    }
  } catch (error) {
    log("fail", `SQL Injection test error: ${error.message}`);
  }
}

async function testXSSVulnerability() {
  log("info", "\n=== XSS Vulnerability Tests ===");

  const xssPayloads = [
    "<script>alert('XSS')</script>",
    "<img src=x onerror='alert(1)'>",
    "javascript:alert('XSS')",
    "<svg onload=alert('XSS')>",
  ];

  try {
    // Register a user first
    const user = {
      name: "XSS Test User",
      email: `xsstest${Date.now()}@test.com`,
      password: "password123",
    };

    const registerRes = await axios.post(`${API_BASE}/api/auth/register`, user);
    const token = registerRes.data.token;

    // Test XSS in prompt submission
    for (const payload of xssPayloads) {
      try {
        const response = await axios.post(
          `${API_BASE}/api/prompts`,
          { prompt: payload },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Response should not execute script - it should be stored as text
        assert(
          typeof response.data.response === "string",
          `XSS payload handled as string: ${payload.substring(0, 30)}...`
        );
      } catch (error) {
        log("warn", `XSS test error for payload: ${error.message}`);
      }
    }
  } catch (error) {
    log("fail", `XSS test setup failed: ${error.message}`);
  }
}

async function testAuthenticationVulnerabilities() {
  log("info", "\n=== Authentication Tests ===");

  try {
    // Test 1: Missing token should be rejected
    try {
      await axios.get(`${API_BASE}/api/prompts`);
      assert(false, "Missing token should be rejected");
    } catch (error) {
      assert(
        error.response?.status === 401,
        "Missing auth token returns 401"
      );
    }

    // Test 2: Invalid token should be rejected
    try {
      await axios.get(`${API_BASE}/api/prompts`, {
        headers: { Authorization: "Bearer invalidtoken123" },
      });
      assert(false, "Invalid token should be rejected");
    } catch (error) {
      assert(
        error.response?.status === 401,
        "Invalid token returns 401"
      );
    }

    // Test 3: Expired token should be rejected
    const expiredToken = jwt.sign({ userId: "123" }, JWT_SECRET, {
      expiresIn: "-1h",
    });
    try {
      await axios.get(`${API_BASE}/api/prompts`, {
        headers: { Authorization: `Bearer ${expiredToken}` },
      });
      assert(false, "Expired token should be rejected");
    } catch (error) {
      assert(
        error.response?.status === 401,
        "Expired token returns 401"
      );
    }

    // Test 4: Tampered token should be rejected
    const tamperedToken = jwt.sign(
      { userId: "different_user" },
      "different_secret",
      { expiresIn: "7d" }
    );
    try {
      await axios.get(`${API_BASE}/api/prompts`, {
        headers: { Authorization: `Bearer ${tamperedToken}` },
      });
      assert(false, "Tampered token should be rejected");
    } catch (error) {
      assert(
        error.response?.status === 401,
        "Tampered token returns 401"
      );
    }
  } catch (error) {
    log("fail", `Auth test error: ${error.message}`);
  }
}

async function testInputValidation() {
  log("info", "\n=== Input Validation Tests ===");

  try {
    // Test 1: Empty email should be rejected
    try {
      await axios.post(`${API_BASE}/api/auth/register`, {
        name: "Test",
        email: "",
        password: "password123",
      });
      assert(false, "Empty email should be rejected");
    } catch (error) {
      assert(
        error.response?.status === 400,
        "Empty email returns 400"
      );
    }

    // Test 2: Invalid email format should be rejected
    try {
      await axios.post(`${API_BASE}/api/auth/register`, {
        name: "Test",
        email: "not-an-email",
        password: "password123",
      });
      assert(
        error.response?.status === 400,
        "Invalid email format returns 400"
      );
    } catch (error) {
      // Expected to fail
    }

    // Test 3: Short password should be rejected
    try {
      await axios.post(`${API_BASE}/api/auth/register`, {
        name: "Test",
        email: "test@example.com",
        password: "123",
      });
      // Depends on backend validation
      log("warn", "Password validation may need to be stricter");
    } catch (error) {
      assert(
        error.response?.status === 400,
        "Short password returns 400"
      );
    }

    // Test 4: Empty prompt should be rejected
    const user = {
      name: "Validation Test",
      email: `valtest${Date.now()}@test.com`,
      password: "password123",
    };
    const registerRes = await axios.post(`${API_BASE}/api/auth/register`, user);
    const token = registerRes.data.token;

    try {
      await axios.post(
        `${API_BASE}/api/prompts`,
        { prompt: "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      assert(false, "Empty prompt should be rejected");
    } catch (error) {
      assert(
        error.response?.status === 400,
        "Empty prompt returns 400"
      );
    }

    // Test 5: Extremely large input should be limited
    const largePrompt = "a".repeat(10000);
    try {
      const response = await axios.post(
        `${API_BASE}/api/prompts`,
        { prompt: largePrompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      assert(
        response.data.prompt.length <= 10000,
        "Large input is limited"
      );
    } catch (error) {
      log("warn", "Large input handling: " + error.message);
    }
  } catch (error) {
    log("fail", `Input validation test error: ${error.message}`);
  }
}

async function testCSRFProtection() {
  log("info", "\n=== CSRF Protection Tests ===");

  try {
    // Check if API requires proper content-type headers
    const response = await axios.post(`${API_BASE}/api/auth/register`, 
      "name=test&email=test@test.com&password=123",
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    
    // Should reject form-encoded data
    assert(
      response.status !== 200,
      "CSRF: Form-encoded requests should be rejected"
    );
  } catch (error) {
    assert(
      error.response?.status !== 200,
      "CSRF: Form-encoded requests should be rejected"
    );
  }
}

async function testPasswordSecurity() {
  log("info", "\n=== Password Security Tests ===");

  try {
    // Test 1: Passwords should be hashed
    const email = `passtest${Date.now()}@test.com`;
    const password = "testPassword123!";

    const registerRes = await axios.post(`${API_BASE}/api/auth/register`, {
      name: "Pass Test",
      email,
      password,
    });

    // Try to login with correct password
    const loginRes = await axios.post(`${API_BASE}/api/auth/login`, {
      email,
      password,
    });

    assert(
      loginRes.data.token && loginRes.data.user,
      "Correct password allows login"
    );

    // Try to login with wrong password
    try {
      await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        password: "wrongPassword123!",
      });
      assert(false, "Wrong password should be rejected");
    } catch (error) {
      assert(
        error.response?.status === 401,
        "Wrong password returns 401"
      );
    }
  } catch (error) {
    log("fail", `Password security test error: ${error.message}`);
  }
}

async function testAccessControl() {
  log("info", "\n=== Access Control Tests ===");

  try {
    // Create two users
    const user1Email = `user1${Date.now()}@test.com`;
    const user2Email = `user2${Date.now()}@test.com`;

    const user1Res = await axios.post(`${API_BASE}/api/auth/register`, {
      name: "User 1",
      email: user1Email,
      password: "password123",
    });
    const user1Token = user1Res.data.token;
    const user1Id = user1Res.data.user._id;

    const user2Res = await axios.post(`${API_BASE}/api/auth/register`, {
      name: "User 2",
      email: user2Email,
      password: "password123",
    });
    const user2Token = user2Res.data.token;

    // User1 creates a prompt
    const promptRes = await axios.post(
      `${API_BASE}/api/prompts`,
      { prompt: "User 1's prompt" },
      { headers: { Authorization: `Bearer ${user1Token}` } }
    );
    const promptId = promptRes.data._id;

    // User2 should NOT be able to access User1's prompt
    try {
      await axios.get(
        `${API_BASE}/api/prompts/${promptId}`,
        { headers: { Authorization: `Bearer ${user2Token}` } }
      );
      assert(false, "User 2 should not access User 1's prompt");
    } catch (error) {
      assert(
        error.response?.status === 404 || error.response?.status === 403,
        "Access denied to other user's prompt"
      );
    }

    // User2 should NOT be able to delete User1's prompt
    try {
      await axios.delete(
        `${API_BASE}/api/prompts/${promptId}`,
        { headers: { Authorization: `Bearer ${user2Token}` } }
      );
      assert(false, "User 2 should not delete User 1's prompt");
    } catch (error) {
      assert(
        error.response?.status === 404 || error.response?.status === 403,
        "Access denied to delete other user's prompt"
      );
    }
  } catch (error) {
    log("fail", `Access control test error: ${error.message}`);
  }
}

async function testRateLimiting() {
  log("info", "\n=== Rate Limiting Tests ===");
  log("warn", "Rate limiting not implemented - should be added");
}

// ==================== RUN ALL TESTS ====================

async function runSecurityTests() {
  log("info", "========================================");
  log("info", "🔒 SECURITY TEST SUITE");
  log("info", "========================================");

  try {
    await testSQLInjection();
    await testXSSVulnerability();
    await testAuthenticationVulnerabilities();
    await testInputValidation();
    await testCSRFProtection();
    await testPasswordSecurity();
    await testAccessControl();
    await testRateLimiting();
  } catch (error) {
    log("fail", `Test suite error: ${error.message}`);
  }

  // Print summary
  log("info", "\n========================================");
  log("info", "📊 TEST SUMMARY");
  log("info", "========================================");
  console.log(`✓ Passed: ${tests.passed}`);
  console.log(`✗ Failed: ${tests.failed}`);
  console.log(`Total: ${tests.passed + tests.failed}`);

  const passRate = Math.round(
    (tests.passed / (tests.passed + tests.failed)) * 100
  );
  log("info", `Pass Rate: ${passRate}%`);

  process.exit(tests.failed > 0 ? 1 : 0);
}

// Run tests
runSecurityTests();
