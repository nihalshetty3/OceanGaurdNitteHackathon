const express = require("express");
const multer = require("multer");
const Hazard = require("../models/hazard");
const Pincode = require("../models/pincode"); 

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


router.post("/add", upload.single("photo"), async (req, res) => {
  try {
    const { title, hazardType, description, pincode, reportedBy } = req.body;

    
    const validPin = await Pincode.findOne({ pincode: pincode.toString().trim() });

    if (!validPin) {
      return res.status(400).json({
        error: "Invalid pincode — this area is not registered in our database.",
      });
    }


    const location = {
      type: "Point",
      coordinates: [validPin.longitude, validPin.latitude], // [lng, lat]
    };

    // Step 3️⃣: Create new hazard document
    const newHazard = new Hazard({
      title,
      description,
      hazardType,
      location,
      reportedBy,
      photo: req.file ? req.file.filename : null,
    });

    // Step 4️⃣: Save hazard to DB
    await newHazard.save();

    res.status(201).json({
      message: "✅ Hazard report saved successfully!",
      hazard: newHazard,
    });

  } catch (err) {
    console.error("❌ Error saving hazard:", err);
    res.status(500).json({ error: "Something went wrong while submitting the report." });
  }
});


router.get("/", async (req, res) => {
  try {
    const hazards = await Hazard.find()
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(hazards);
  } catch (err) {
    console.error("❌ Error fetching hazards:", err);
    res.status(500).json({ error: "Something went wrong fetching hazards." });
  }
});

module.exports = router;
