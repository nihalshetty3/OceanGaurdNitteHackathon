const { Worker } = require('bullmq');
const axios = require('axios');
const mongoose = require('mongoose');
const Hazard = require('../models/hazard'); // Adjust path if necessary
require('dotenv').config({ path: '../.env' }); // Load .env from backend root

// --- Database & Redis Connection ---
const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
};

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Worker connected to MongoDB Atlas.'))
  .catch((err) => console.error('Worker MongoDB connection error:', err));


// --- The Worker Logic ---
const worker = new Worker('ai-verification', async (job) => {
  const { reportIds, description, location } = job.data;
  console.log(`[WORKER] Processing job ${job.id}: Verifying ${reportIds.length} reports.`);

  try {
    // 1. Call your Python AI service, now with location data
    // This is the slow part that runs in the background.
    const aiResponse = await axios.post('http://localhost:8000/verify-hazard', { 
      description,
      location // Send the whole location object
    });
    
    const { isHazard, confidence } = aiResponse.data;

    // 2. Determine the final status based on the AI's response
    const finalStatus = isHazard ? 'verified' : 'rejected';

    // 3. Update the reports in the database
    await Hazard.updateMany(
      { _id: { $in: reportIds } },
      { $set: { status: finalStatus } }
    );
    console.log(`[WORKER] Job ${job.id} complete. Reports updated to: ${finalStatus} with confidence ${confidence}`);
  } catch (error) {
    console.error(`[WORKER] Job ${job.id} failed:`, error.message);
    // This will cause the job to be retried if it fails
    throw error;
  }
}, { connection: redisConnection });

console.log("✅ Verification worker is running and waiting for jobs...");

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});
