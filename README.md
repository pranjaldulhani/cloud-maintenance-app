# Cloud Maintenance App

A simple Node.js + Express web application used to practice **maintenance and updates in a cloud environment** (SkillPilots Day 19 task).

## Maintenance Work Done

### 1. Bugs identified and fixed
- Fixed double-escaping bug: user names were escaped on the server and again on the page, so text like `<script>` appeared as `&lt;script&gt;`. Removed the server-side `.escape()`; the page now uses `textContent`, which is safe against XSS.
- Added a 404 handler so unknown routes return a clean JSON error.

### 2. New features added
- `GET /health` now returns status, uptime and current time (used by cloud platforms for monitoring).
- `GET /api/users/count` returns the total number of saved users.

### 3. Performance and security optimization
- Added `compression` middleware to reduce response size.
- Existing protections kept: Helmet security headers, rate limiting, input validation, prepared statements (SQL injection protection), HTTPS redirect in production.

### 4. Testing and debugging
- Tested locally: add users, XSS input, `/health`, `/api/users/count`, and unknown route (404).

### 5. Deployment of updates
- Code is pushed to GitHub. On a cloud platform (Render, Railway, etc.) connect this repository, set the start command to `npm start` and set `NODE_ENV=production`. Every `git push` redeploys the updated version.

## Project Structure

```
cloud-maintenance-app/
├── public/
│   ├── index.html
│   └── app.js
├── server.js
├── package.json
├── .gitignore
└── README.md
```

## How to Run

1. Install dependencies:
```
npm install
```
2. Start the server:
```
npm start
```
3. Open http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Server status and uptime |
| GET | /api/users | List all users |
| GET | /api/users/count | Total number of users |
| POST | /api/users | Add a new user (name, email) |

## Tech Stack
Node.js, Express, SQLite (better-sqlite3), Helmet, express-validator, compression