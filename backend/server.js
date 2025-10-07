const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const hazardRoutes = require("./routes/hazard");
const authRoutes = require("./routes/auth");
const connectDB = require('./config/db');


dotenv.config();
const app = express();
const port = 5000;

app.use(express.json());


// In development, reflect the request origin to avoid CORS issues across localhost/127.0.0.1/ports
const corsOptions = {
  origin: (origin, callback) => callback(null, true),
  credentials: true,
};

app.use(cors(corsOptions));
// Handle CORS preflight for all routes
// Express 5 doesn't accept bare '*' in routes; handle OPTIONS generically
// Let cors middleware handle preflight automatically

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.use("/uploads", express.static("uploads"));
app.use("/api/hazards", hazardRoutes);
app.use("/hazards", hazardRoutes);
app.use("/auth", authRoutes);



connectDB();

app.get("/", (req, res) => {
      res.send("<h1>Server is running ✅ </h1>");
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
      const { name, email, password } = req.body;
      const newUser = new User({ name, email, password });

      await newUser.save();
      res.json({ message: "User added successfully!", user: newUser });
  });
  
  const path = require("path");

  // Serve frontend HTML file
  app.get("/report", (req, res) => {
    res.sendFile(path.join(__dirname, "report.html")); // make sure report.html is in backend folder
  });


app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
});