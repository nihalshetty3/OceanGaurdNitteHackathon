const express=require('express');
const cors=require('cors');
const dotenv=require('dotenv');

dotenv.config();
const app=express();
const port=5000;

app.use(express.json());
app.use(cors());



app.listen(port,()=>{
      console.log(`Server is running at http://localhost:${port}`);
})

