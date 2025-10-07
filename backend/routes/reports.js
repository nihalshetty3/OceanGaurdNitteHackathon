const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const router = express.Router();
const axios = require('axios');

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'reports.json');

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ reports: [] }, null, 2), 'utf-8');
  }
}

function readReports() {
  ensureStorage();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  try {
    const parsed = JSON.parse(raw || '{"reports":[]}');
    return Array.isArray(parsed.reports) ? parsed.reports : [];
  } catch {
    return [];
  }
}

function writeReports(reports) {
  ensureStorage();
  fs.writeFileSync(DATA_FILE, JSON.stringify({ reports }, null, 2), 'utf-8');
}

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Check for duplicate reports by same user for same location/pincode/type on same day
function checkDuplicateReport(userId, location, pincode, category, type) {
  const reports = readReports();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  return reports.some(report => {
    if (report.userId !== userId) return false;
    if (report.category !== category) return false;
    
    // Check if report was submitted today
    const reportDate = new Date(report.createdAt).toISOString().split('T')[0];
    if (reportDate !== today) return false;
    
    // Check location match (case insensitive)
    const reportLocation = (report.location || '').toLowerCase().trim();
    const inputLocation = (location || '').toLowerCase().trim();
    
    // Check pincode match
    const reportPincode = String(report.pincode || '').trim();
    const inputPincode = String(pincode || '').trim();
    
    // Check type match (case insensitive)
    const reportType = (report.type || '').toLowerCase().trim();
    const inputType = (type || '').toLowerCase().trim();
    
    return reportLocation === inputLocation && 
           reportPincode === inputPincode && 
           reportType === inputType;
  });
}

router.get('/', (req, res) => {
  try {
    const reports = readReports().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read reports', details: err.message });
  }
});

// GET /api/reports/hazards - Only AI-positive hazard reports
// Optional query params:
//  - minConfidence: number (default 0.7)
//  - type: string (exact match)
//  - pincode: string (exact match)
router.get('/hazards', (req, res) => {
  try {
    const minConfidence = Math.max(0, Math.min(1, parseFloat(req.query.minConfidence))) || 0.7;
    const typeFilter = (req.query.type || '').toString().trim().toLowerCase();
    const pinFilter = (req.query.pincode || '').toString().trim();

    const reports = readReports()
      .filter((r) => {
        const conf = typeof r?.ai?.confidence === 'number' ? r.ai.confidence : null;
        const isHazard = r?.ai?.isHazard === true || (conf !== null && conf >= minConfidence);
        if (!isHazard) return false;
        if (typeFilter && String(r?.type || '').toLowerCase() !== typeFilter) return false;
        if (pinFilter && String(r?.pincode || '') !== pinFilter) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read hazard reports', details: err.message });
  }
});

// GET /api/reports/check-duplicate - Check if user has already submitted a report for location/pincode/type today
router.get('/check-duplicate', verifyToken, (req, res) => {
  try {
    const { location, pincode, category, type } = req.query;
    
    if (!location || !pincode || !category || !type) {
      return res.status(400).json({ error: 'location, pincode, category, and type are required' });
    }

    const isDuplicate = checkDuplicateReport(req.userId, location, pincode, category, type);
    
    res.json({ 
      isDuplicate,
      message: isDuplicate 
        ? `You have already submitted a ${type} report for this location and pincode today.` 
        : 'No duplicate report found for today.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check for duplicate reports', details: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { category, title, type, description, location, pincode } = req.body || {};
    if (!category || !title || !description) {
      return res.status(400).json({ error: 'category, title and description are required' });
    }

    // Check for duplicate reports
    if (checkDuplicateReport(req.userId, location, pincode, category, type)) {
      return res.status(409).json({ 
        error: 'Duplicate report detected', 
        message: `You have already submitted a ${type} report for this location and pincode today. Please wait until tomorrow to submit another ${type} report for the same area.` 
      });
    }

    const now = new Date().toISOString();
    const report = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: req.userId, // Add user ID to track who submitted the report
      category, // 'criminal' | 'municipality' | 'ocean'
      title,
      type: type || 'Other',
      description,
      location: location || '',
      pincode: pincode || '',
      createdAt: now,
      status: 'submitted',
      ai: undefined
    };

    // Call AI service to get confidence (non-blocking if service is down)
    try {
      const aiRes = await axios.post('http://localhost:8000/verify-hazard', {
        description: report.description,
        type: report.type,
        location: report.location,
        pincode: report.pincode
      }, { timeout: 5000 });
      const ai = aiRes.data || {};
      report.ai = {
        isHazard: !!ai.isHazard,
        confidence: typeof ai.confidence === 'number' ? ai.confidence : null,
        components: ai.components || null
      };
      console.log(`[reports] AI ok: id=${report.id} conf=${report.ai.confidence}`);
    } catch (e) {
      // If AI is unavailable, continue without blocking persistence
      console.warn(`[reports] AI unavailable for id=${report.id}:`, e.message);
      report.ai = { isHazard: null, confidence: null, components: null, error: 'ai_unavailable' };
    }

    const reports = readReports();
    reports.push(report);
    writeReports(reports);
    res.status(201).json({ message: 'Report saved', report });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save report', details: err.message });
  }
});

module.exports = router;


