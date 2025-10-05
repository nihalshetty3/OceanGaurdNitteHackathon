const express = require("express");
const multer= require("multer");
const Hazard= require("../models/hazard");
const verifyToken = require("../middleware/authmiddleware");

const router = express.Router();
const storage= multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename:(req, file, cb) =>{
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({storage});

router.post("/add", verifyToken, upload.single("photo"), async(req, res) =>{
    try{
        const {title, type, description, location}= req.body;
        const newHazard = new Hazard({
            title,
            type,
            description,
            location,
            photo: req.file ? req.file.filename : null
        });

        await newHazard.save();
        res.status(201).json({message:"Hazard report saved", hazard:newHazard});
    }
    catch(err)
    {
        res.status(500).json({error:"Somethin went wrong!"});
    }
});

module.exports= router; 

