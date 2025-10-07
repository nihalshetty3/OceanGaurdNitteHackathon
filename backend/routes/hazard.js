const express = require("express");
const multer = require("multer");
const Hazard = require("../models/hazard");

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// POST /api/hazards/add
router.post("/add", upload.single("photo"), async (req, res) => {
    console.log("POST /add hit!"); // <--- add this
    try {
      const { title, type, description, location } = req.body;
      console.log({ title, type, description, location, file: req.file }); // <--- add this
  
      const newHazard = new Hazard({
        title,
        type,
        description,
        location,
        photo: req.file ? req.file.filename : null,
      });
  
      await newHazard.save();
  
      res.status(201).json({ message: "Hazard report saved", hazard: newHazard });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Something went wrong!" });
    }
  });
  

// GET /api/hazards (all hazards)
router.get("/", async (req, res) => {
  try {
    const hazards = await Hazard.find().sort({ createdAt: -1 });
    res.json(hazards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong!" });
  }
});

module.exports = router;
