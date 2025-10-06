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
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use("/hazards", hazardRoutes);
app.use("/auth", authRoutes);


connectDB();

app.get("/", (req, res) => {
      res.send("<h1>Server is running ✅ </h1>");
  }); 




app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
});