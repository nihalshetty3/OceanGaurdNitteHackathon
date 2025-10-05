const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');  // 👈 Import mongoose
const hazardRoutes = require("./routes/hazard");


dotenv.config();
const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use("/hazards", hazardRoutes);


// ✅ Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Schema Example
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});
const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
      res.send("<h1>Server is running ✅ </h1>");
  }); 


// ✅ Routes
app.post("/register", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ Get all users
app.get("/users", async (req, res) => {
      try {
          const users = await User.find();
          res.json(users);   // 👈 Important: send JSON back
      } catch (err) {
          res.status(500).json({ error: err.message });
      }
  });

  app.post("/users", async (req, res) => {
      const { Nihal, nihal10 } = req.body;
      const newUser = new User({ Nihal, nihal10});
      await newUser.save();
      res.json({ message: "User added successfully!", user: newUser });
  });
  

app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
});