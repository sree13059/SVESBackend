const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Employee = require('./models/Employee');
const Student = require('./models/Student');
const FacultyApplication = require('./models/FacultyApplication');
const PlacementEnquiry = require('./models/PlacementEnquiry');

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sves';
const uploadsDir = path.join(__dirname, 'uploads');

// Ensure uploads folder exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Function to download an HTTP/HTTPS file
const downloadFile = (url, filepath) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download: ${res.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
};

// Function to process and convert data (base64 or remote URL) to local file
const processToLocalFile = async (dataString, prefix = 'file') => {
  if (!dataString || typeof dataString !== 'string') return null;

  // 1. Handle base64 data
  if (dataString.startsWith('data:')) {
    try {
      const matches = dataString.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) return null;

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      let extension = 'bin';
      if (mimeType.includes('png')) extension = 'png';
      else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
      else if (mimeType.includes('gif')) extension = 'gif';
      else if (mimeType.includes('pdf')) extension = 'pdf';
      else if (mimeType.includes('plain')) extension = 'txt';
      else if (mimeType.includes('word') || mimeType.includes('msword')) extension = 'doc';
      else if (mimeType.includes('officedocument.wordprocessingml')) extension = 'docx';

      const filename = `${prefix}_local_${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);
      return `/uploads/${filename}`;
    } catch (err) {
      console.error('Failed to parse base64 data:', err.message);
      return null;
    }
  }

  // 2. Handle HTTP/HTTPS URLs
  if (dataString.startsWith('http://') || dataString.startsWith('https://')) {
    try {
      let extension = 'png';
      if (dataString.toLowerCase().endsWith('.jpg') || dataString.toLowerCase().endsWith('.jpeg')) extension = 'jpg';
      else if (dataString.toLowerCase().endsWith('.png')) extension = 'png';
      else if (dataString.toLowerCase().endsWith('.gif')) extension = 'gif';
      else if (dataString.toLowerCase().endsWith('.pdf')) extension = 'pdf';
      else if (dataString.toLowerCase().endsWith('.txt')) extension = 'txt';
      else if (dataString.toLowerCase().endsWith('.docx')) extension = 'docx';
      else if (dataString.toLowerCase().endsWith('.doc')) extension = 'doc';
      else if (dataString.includes('unsplash.com')) extension = 'jpg';
      else if (dataString.includes('randomuser.me')) extension = 'jpg';

      const filename = `${prefix}_download_${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;
      const filePath = path.join(uploadsDir, filename);

      console.log(`Downloading: ${dataString}`);
      await downloadFile(dataString, filePath);
      console.log(`Saved locally to: ${filename}`);
      return `/uploads/${filename}`;
    } catch (err) {
      console.error(`Failed to download remote file (${dataString}):`, err.message);
      return null;
    }
  }

  return null;
};

async function migrateAll() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully. Starting assets download migration...');

    let count = 0;

    // 1. Migrate Employee Avatars & Documents
    console.log('\n--- Processing Employees ---');
    const employees = await Employee.find();
    for (const emp of employees) {
      let updated = false;
      if (emp.avatar && (emp.avatar.startsWith('http') || emp.avatar.startsWith('data:'))) {
        const localPath = await processToLocalFile(emp.avatar, 'emp_avatar');
        if (localPath) {
          emp.avatar = localPath;
          updated = true;
        }
      }
      if (emp.document && (emp.document.startsWith('http') || emp.document.startsWith('data:'))) {
        const localPath = await processToLocalFile(emp.document, 'emp_doc');
        if (localPath) {
          emp.document = localPath;
          updated = true;
        }
      }
      if (updated) {
        await emp.save();
        console.log(`Migrated Employee: ${emp.name}`);
        count++;
      }
    }

    // 2. Migrate Student Avatars
    console.log('\n--- Processing Students ---');
    const students = await Student.find();
    for (const stud of students) {
      if (stud.avatar && (stud.avatar.startsWith('http') || stud.avatar.startsWith('data:'))) {
        const localPath = await processToLocalFile(stud.avatar, 'stud_avatar');
        if (localPath) {
          stud.avatar = localPath;
          await stud.save();
          console.log(`Migrated Student: ${stud.name}`);
          count++;
        }
      }
    }

    // 3. Migrate Faculty Application Resume Links
    console.log('\n--- Processing Faculty Applications ---');
    const facultyApps = await FacultyApplication.find();
    for (const appRecord of facultyApps) {
      if (appRecord.resumeLink && (appRecord.resumeLink.startsWith('http') || appRecord.resumeLink.startsWith('data:'))) {
        const localPath = await processToLocalFile(appRecord.resumeLink, 'fac_resume');
        if (localPath) {
          appRecord.resumeLink = localPath;
          await appRecord.save();
          console.log(`Migrated Faculty App: ${appRecord.name}`);
          count++;
        }
      }
    }

    // 4. Migrate Placement Enquiry Resume Links
    console.log('\n--- Processing Placement Enquiries ---');
    const placements = await PlacementEnquiry.find();
    for (const place of placements) {
      if (place.resumeLink && (place.resumeLink.startsWith('http') || place.resumeLink.startsWith('data:'))) {
        const localPath = await processToLocalFile(place.resumeLink, 'placement_resume');
        if (localPath) {
          place.resumeLink = localPath;
          await place.save();
          console.log(`Migrated Placement Resume: ${place.studentName}`);
          count++;
        }
      }
    }

    console.log(`\nMigration completed successfully! Processed and updated ${count} records.`);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

migrateAll();
