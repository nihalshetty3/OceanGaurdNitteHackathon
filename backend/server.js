const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');  
const hazardRoutes = require("./routes/hazard");
const authRoutes = require("./routes/auth");


dotenv.config();
const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use("/hazards", hazardRoutes);
app.use("/auth", authRoutes);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.get("/", (req, res) => {
      res.send("<h1>Server is running ✅ </h1>");
  }); 




app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
});