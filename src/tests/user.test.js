import request from "supertest";
import app from "../app.js";

describe("User API Endpoints", () => {
  // You can use a random string to avoid duplicate emails
  const randomEmail = `user${Date.now()}@test.com`;

  const userPayload = {
    userName: "Test User",
    email: randomEmail,
    password: "password123",
    role: "user",
  };

  it("should register a user", async () => {
    const res = await request(app).post("/api/v1/user").send(userPayload);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "User registered successfully");
    expect(res.body.data).toHaveProperty("email", randomEmail);
  });

  it("should fail registration with missing fields", async () => {
    const res = await request(app).post("/api/v1/user").send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("should login the registered user", async () => {
    const res = await request(app).post("/api/v1/user/login").send({
      email: userPayload.email,
      password: userPayload.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "User login successfully");
    expect(res.body.data).toHaveProperty("accessToken");
    expect(res.body.data.user).toHaveProperty("email", randomEmail);
  });

  it("should reject login with wrong password", async () => {
    const res = await request(app).post("/api/v1/user/login").send({
      email: userPayload.email,
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });
});
