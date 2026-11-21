const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");

process.env.ADMIN_SIGNUP_CODE = "club-admin-2023";
delete process.env.MONGODB_URI;

const app = require("../app");
const { connectDatabase, disconnectDatabase } = require("../config/db");

let server;
let base;

before(async () => {
  await connectDatabase(""); // in-memory MongoDB with demo events
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.close();
  await disconnectDatabase();
});

// Minimal browser: keeps the session cookie and does not follow redirects.
function client() {
  let cookie = "";
  return async (path, { method = "GET", form, json } = {}) => {
    const headers = {};
    let body;
    if (cookie) headers.cookie = cookie;
    if (form) {
      headers["content-type"] = "application/x-www-form-urlencoded";
      body = new URLSearchParams(form).toString();
    }
    if (json) {
      headers["content-type"] = "application/json";
      body = JSON.stringify(json);
    }
    const res = await fetch(base + path, { method, headers, body, redirect: "manual" });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) cookie = setCookie.split(";")[0];
    return res;
  };
}

const student = (overrides = {}) => ({
  name: "Test Student",
  email: `student${Math.random().toString(36).slice(2)}@bmsce.ac.in`,
  usn: "1BM21CS001",
  section: "A",
  pass: "Password1",
  ...overrides,
});

test("logged-out users are redirected away from dashboards", async () => {
  const res = await client()("/secondpage");
  assert.equal(res.status, 302);
  assert.equal(res.headers.get("location"), "/index");
});

test("sign-up creates a regular student account and signs in", async () => {
  const browser = client();
  const res = await browser("/index", { method: "POST", form: student() });
  assert.equal(res.status, 302);
  assert.equal(res.headers.get("location"), "/secondpage");
  assert.equal((await browser("/secondpage")).status, 200);
  // Regular students cannot open the admin dashboard.
  assert.equal((await browser("/secondpage_admin")).headers.get("location"), "/secondpage");
});

test("an invalid admin code is rejected", async () => {
  const res = await client()("/index", { method: "POST", form: student({ isAdmin: "anything" }) });
  assert.equal(res.status, 403);
});

test("the correct admin code creates an admin", async () => {
  const res = await client()("/index", { method: "POST", form: student({ isAdmin: "club-admin-2023" }) });
  assert.equal(res.headers.get("location"), "/secondpage_admin");
});

test("duplicate e-mail addresses are refused", async () => {
  const details = student();
  await client()("/index", { method: "POST", form: details });
  const res = await client()("/index", { method: "POST", form: { ...details, email: details.email.toUpperCase() } });
  assert.equal(res.status, 409);
});

test("login checks the password and passwords are hashed", async () => {
  const details = student();
  await client()("/index", { method: "POST", form: details });
  const bad = await client()("/index2", { method: "POST", form: { email: details.email, pass: "wrong" } });
  assert.equal(bad.status, 401);
  const good = await client()("/index2", { method: "POST", form: { email: details.email, pass: details.pass } });
  assert.equal(good.headers.get("location"), "/secondpage");

  const { Users } = require("../models/userModel");
  const stored = await Users.findOne({ email: details.email });
  assert.notEqual(stored.password, details.pass);
  assert.match(stored.password, /^\$2[aby]\$/);
});

test("a signed-in user visiting the login page goes to their dashboard", async () => {
  const browser = client();
  await browser("/index", { method: "POST", form: student() });
  const res = await browser("/index");
  assert.equal(res.headers.get("location"), "/secondpage");
});

test("club pages render demo events and unknown clubs return 404", async () => {
  const res = await client()("/events/Code_IO");
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /Code Sprint 2023/);
  assert.match(html, /<title>Code I\/O \| BMSCE Clubs<\/title>/);
  assert.equal((await client()("/events/secondpage_admin")).status, 404);
  assert.equal((await client()("/events/..%2Findex")).status, 404);
});

test("only admins can add and remove events", async () => {
  const studentBrowser = client();
  await studentBrowser("/index", { method: "POST", form: student() });
  const forbidden = await studentBrowser("/events/robotics", { method: "POST", json: { eventName: "X", eventDesc: "Y" } });
  assert.equal(forbidden.status, 403);
  assert.equal((await client()("/events/robotics", { method: "POST", json: { eventName: "X", eventDesc: "Y" } })).status, 401);

  const admin = client();
  await admin("/index", { method: "POST", form: student({ isAdmin: "club-admin-2023" }) });
  const created = await admin("/events/robotics", { method: "POST", json: { eventName: "Maze Solver Challenge", eventDesc: "Fastest autonomous maze run wins." } });
  assert.equal(created.status, 201);
  const event = await created.json();
  assert.match(await (await client()("/events/robotics")).text(), /Maze Solver Challenge/);

  assert.equal((await admin(`/events/robotics/${event._id}`, { method: "DELETE" })).status, 204);
  assert.doesNotMatch(await (await client()("/events/robotics")).text(), /Maze Solver Challenge/);
});

test("event names are escaped when rendered", async () => {
  const admin = client();
  await admin("/index", { method: "POST", form: student({ isAdmin: "club-admin-2023" }) });
  await admin("/events/pentagram", { method: "POST", json: { eventName: "<script>alert(1)</script>", eventDesc: "x" } });
  const html = await (await client()("/events/pentagram")).text();
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

test("logout ends the session", async () => {
  const browser = client();
  await browser("/index", { method: "POST", form: student() });
  await browser("/logout");
  assert.equal((await browser("/secondpage")).headers.get("location"), "/index");
});
