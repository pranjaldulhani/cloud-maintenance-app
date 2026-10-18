const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const Database = require('better-sqlite3');
const path = require('path');
const compression = require('compression');

const app = express();
const db = new Database('data.db');

db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL
)`);

// HTTPS (cloud pe http ko https pe redirect)
app.set('trust proxy', 1);
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' &&
      req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect('https://' + req.headers.host + req.url);
  }
  next();
});

// Security headers + compression + logging + rate limit
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Validation, sanitization, prepared statement
app.post('/api/users',
  [
    body('name').trim().isLength({ min: 2, max: 50 })
      .withMessage('Name 2-50 characters ka hona chahiye'),
    body('email').trim().isEmail()
      .withMessage('Valid email daalo').normalizeEmail()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email } = req.body;
    // Prepared statement: ? placeholders se SQL injection nahi hota
    db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(name, email);
    res.status(201).json({ message: 'User saved' });
  }
);

app.get('/api/users', (req, res) => {
  res.json(db.prepare('SELECT id, name, email FROM users').all());
});

// New feature: total users count
app.get('/api/users/count', (req, res) => {
  const row = db.prepare('SELECT COUNT(*) AS total FROM users').get();
  res.json({ total: row.total });
});

// Health check (uptime ke saath)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()) + ' seconds',
    time: new Date().toISOString()
  });
});

// 404 handler (koi route match na ho to)
app.use((req, res) => {
  res.status(404).json({ error: 'Page not found' });
});

// Error handler (details user ko nahi dikhate)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));