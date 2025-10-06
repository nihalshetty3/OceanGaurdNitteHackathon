const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        password: { type: String, required: true, minlength: 6, select: false },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);


