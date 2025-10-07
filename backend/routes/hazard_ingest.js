const express = require('express');
const Hazard = require('../models/hazard');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const router = express.Router();

// Helper: get reporter id from token if present; else use/create a public user
async function resolveReporterId(req) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (!token) throw new Error('no_token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
    return decoded?.id || null;
  } catch {
    // Fallback to a public reporter user
    const email = 'public@oceanguard.local';
    let user = await User.findOne({ email });
    if (!user) {
      const hash = await bcrypt.hash('public-password', 10);
      user = await User.create({
        name: 'Public Reporter',
        email,
        phoneNumber: '0000000000',
        password: hash,
      });
    }
    return user._id;
  }
}

// POST /api/hazard-ingest - minimal ingestion for hazards (no uploads, json only)
router.post('/', async (req, res) => {
  try {
    const { title, hazardType, description, longitude, latitude, severity, pincode, locationText } = req.body || {};
    if (!title || !hazardType || !description) {
      return res.status(400).json({ error: 'title, hazardType and description are required' });
    }

    const reporterId = await resolveReporterId(req);

    // Keep the user-submitted label as-is without forcing enum
    const submittedTypeRaw = String(hazardType || '').trim();
    const normalizedType = submittedTypeRaw; // no enum coercion

    // If no coordinates provided but pincode exists, geocode it (best-effort)
    let lng = Number.isFinite(parseFloat(longitude)) ? parseFloat(longitude) : null;
    let lat = Number.isFinite(parseFloat(latitude)) ? parseFloat(latitude) : null;

    if ((!lng || !lat) && pincode) {
      try {
        const resp = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            postalcode: String(pincode),
            format: 'json',
            addressdetails: 0,
            countrycodes: 'in',
            limit: 1,
          },
          headers: { 'User-Agent': 'OceanGuard/1.0' },
          timeout: 5000,
        });
        const hit = Array.isArray(resp.data) && resp.data[0];
        if (hit) {
          lat = parseFloat(hit.lat);
          lng = parseFloat(hit.lon);
        }
      } catch (e) {
        console.warn('[hazard-ingest] geocode failed:', e.message);
      }
    }

    // Fallback to 0,0 if still missing
    if (!Number.isFinite(lng)) lng = 0;
    if (!Number.isFinite(lat)) lat = 0;

    const newReport = new Hazard({
      title,
      hazardType: normalizedType,
      submittedType: submittedTypeRaw,
      description,
      photo: null,
      reportedBy: reporterId,
      status: 'unverified',
      severity: severity || 'Low',
      location: { type: 'Point', coordinates: [lng, lat] },
      // store extra context
      pincode,
      locationText
    });

    await newReport.save();
    return res.status(201).json({ message: 'Hazard ingested', report: newReport });
  } catch (err) {
    console.error('[hazard-ingest] error:', err);
    return res.status(500).json({ error: 'Failed to ingest hazard', details: err?.message, kind: err?.name });
  }
});

module.exports = router;


