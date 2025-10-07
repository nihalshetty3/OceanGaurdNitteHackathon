const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const axios = require('axios');

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

router.get('/', (req, res) => {
  try {
    const reports = readReports().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read reports', details: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { category, title, type, description, location, pincode } = req.body || {};
    if (!category || !title || !description) {
      return res.status(400).json({ error: 'category, title and description are required' });
    }

    const now = new Date().toISOString();
    const report = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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


