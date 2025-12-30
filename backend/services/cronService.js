import cron from 'node-cron';
import mongoose from 'mongoose';
import Caregiver from '../models/Caregiver.js';
import User from '../models/User.js';
import Journal from '../models/Journal.js'; // Note: Check if this model is exported correctly in your project
import Task from '../models/Task.js'; // Assuming Task model exists
import Emotion from '../models/Emotion.js'; // Assuming Emotion model exists
import { generateWeeklyReportPDF } from '../utils/pdfGenerator.js';
import { sendEmail } from '../utils/mailer.js';

// Helper to get start of last week
const getLastWeekDate = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
};

export const initCronJobs = () => {
  console.log('⏰ Initializing Cron Jobs...');

  // Run every Monday at 9:00 AM
  cron.schedule('0 9 * * 1', async () => {
    console.log('📅 Starting Weekly Report Generation...');
    
    try {
      const caregivers = await Caregiver.find({ isActive: true }).populate('patients');
      
      for (const caregiver of caregivers) {
        if (!caregiver.email || !caregiver.patients || caregiver.patients.length === 0) continue;

        for (const patient of caregiver.patients) {
          try {
            await generateAndSendReport(caregiver, patient);
          } catch (err) {
            console.error(`❌ Error generating report for patient ${patient.name}:`, err);
          }
        }
      }
      console.log('✅ Weekly reports completed.');
    } catch (error) {
      console.error('❌ Cron Job Error:', error);
    }
  });
};

async function generateAndSendReport(caregiver, patient) {
  const startDate = getLastWeekDate();
  
  // 1. Fetch Data
  // Note: Adjust model names/paths if they differ in your actual project structure
  // I'm assuming standard Mongoose models based on previous context
  
  // Journals
  const journals = await Journal.find({
    userId: patient._id,
    createdAt: { $gte: startDate }
  }).sort({ createdAt: -1 });

  // Tasks
  const tasks = await Task.find({
    userId: patient._id,
    createdAt: { $gte: startDate }
  });

  // Emotions
  const emotions = await Emotion.find({
    userId: patient._id,
    timestamp: { $gte: startDate } // Note: Emotion model uses 'timestamp', not 'createdAt'
  }).sort({ timestamp: -1 });

  // 2. Calculate Stats
  const journalCount = journals.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done' || t.completed).length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate Avg Stress (if available)
  let avgStress = 'N/A';
  const stressMap = { 'low': 1, 'medium': 2, 'high': 3 };
  const stressScores = journals
    .map(j => stressMap[j.stressLevel?.toLowerCase()] || 0)
    .filter(s => s > 0);
  
  if (stressScores.length > 0) {
    const avg = stressScores.reduce((a, b) => a + b, 0) / stressScores.length;
    avgStress = avg < 1.5 ? 'Low' : avg < 2.5 ? 'Medium' : 'High';
  }

  const reportData = {
    startDate: startDate.toLocaleDateString(),
    endDate: new Date().toLocaleDateString(),
    journalCount,
    totalTasks,
    completedTasks,
    taskCompletionRate,
    avgStress,
    journals,
    emotions
  };

  // 3. Generate PDF
  const doc = generateWeeklyReportPDF(caregiver, patient, reportData);
  
  // 4. Buffer PDF
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', async () => {
    const pdfBuffer = Buffer.concat(buffers);
    
    // 5. Send Email
    await sendEmail({
      to: caregiver.email,
      subject: `Weekly Wellness Report: ${patient.name}`,
      text: `Hello ${caregiver.name},\n\nPlease find attached the weekly wellness report for ${patient.name}.\n\nPeriod: ${reportData.startDate} - ${reportData.endDate}\n\nBest regards,\nNeuroCompanion Team`,
      attachments: [
        {
          filename: `Weekly-Report-${patient.name.replace(/\s+/g, '-')}.pdf`,
          content: pdfBuffer
        }
      ]
    });
    console.log(`📧 Weekly report sent to ${caregiver.email} for ${patient.name}`);
  });
  doc.end();
}
