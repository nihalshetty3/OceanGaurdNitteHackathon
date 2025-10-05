const mongoose = require("mongoose")

const hazardschema = new mongoose.Schema({
    title:{type:String, require:true},
    type:{type:String, require:true},
    description:{type:String, require:true},
    location:{type:String, require:true},
    photo:{type:String}
});

module.exports = mongoose.model("Hazard", hazardschema); 
