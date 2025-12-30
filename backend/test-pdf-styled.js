import fs from 'fs';
import { generateJournalPDF } from './utils/pdfGenerator.js';

console.log('🧪 Testing Professional PDF Generation...');

const mockJournal = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Morning Reflection',
  createdAt: new Date(),
  mood: 'Anxious',
  sentiment: 'Negative',
  stressLevel: 'High',
  summary: 'The patient expressed concern about upcoming deadlines and social interactions. They mentioned feeling overwhelmed but are trying to use breathing exercises to cope. Sleep quality was reported as poor last night.',
  content: "I woke up feeling really heavy today. I have that big presentation coming up on Thursday and I just can't stop thinking about it. What if I freeze up? I tried to do the breathing exercise you recommended, the 4-7-8 one. It helped a little bit, but my chest still feels tight. I didn't sleep well either, maybe 4 hours. I just want this week to be over."
};

const mockUser = {
  name: 'Alex Thompson',
  email: 'alex.thompson@example.com'
};

try {
  const doc = generateJournalPDF(mockJournal, mockUser);
  const writeStream = fs.createWriteStream('professional-report.pdf');
  
  doc.pipe(writeStream);
  doc.end();
  
  writeStream.on('finish', () => {
    console.log('✅ PDF generated successfully: professional-report.pdf');
    console.log('   This report includes styling, colors, and a structured layout.');
  });
  
  writeStream.on('error', (err) => {
    console.error('❌ Error writing PDF file:', err);
  });

} catch (error) {
  console.error('❌ Error generating PDF:', error);
}
