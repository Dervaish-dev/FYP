import fs from 'fs';
import { generateJournalPDF } from './utils/pdfGenerator.js';

console.log('🧪 Testing PDF Generation...');

const mockJournal = {
  _id: 'mock_journal_id',
  title: 'Test Journal Entry',
  createdAt: new Date(),
  mood: 'Happy',
  sentiment: 'Positive',
  stressLevel: 'Low',
  summary: 'This is a generated summary for the test PDF.',
  content: 'This is the full transcript/content of the journal entry. It should appear in the PDF report along with the analysis metadata.'
};

const mockUser = {
  name: 'John Doe'
};

try {
  const doc = generateJournalPDF(mockJournal, mockUser);
  const writeStream = fs.createWriteStream('test-report.pdf');
  
  doc.pipe(writeStream);
  doc.end();
  
  writeStream.on('finish', () => {
    console.log('✅ PDF generated successfully: test-report.pdf');
    console.log('   Check this file to verify the layout and content.');
  });
  
  writeStream.on('error', (err) => {
    console.error('❌ Error writing PDF file:', err);
  });

} catch (error) {
  console.error('❌ Error generating PDF:', error);
}
