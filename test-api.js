import handler from "./api/index.js";

// Mock request and response objects
class MockRes {
  constructor() {
    this.statusCode = 200;
    this.headers = {};
    this.body = null;
  }

  setHeader(key, value) {
    this.headers[key] = value;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  json(obj) {
    this.body = obj;
    console.log(`[${this.statusCode}] ${JSON.stringify(obj, null, 2)}`);
  }

  end() {
    console.log("Response ended");
  }
}

const mockReq = {
  url: "/api/health",
  method: "GET",
  headers: {},
  body: null,
};

const mockRes = new MockRes();

console.log("Testing health endpoint...");
await handler(mockReq, mockRes);
console.log("\n✓ Test completed\n");
