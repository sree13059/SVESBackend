const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Employee = require('./models/Employee');
const Student = require('./models/Student');
const FacultyApplication = require('./models/FacultyApplication');
const PlacementEnquiry = require('./models/PlacementEnquiry');

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sves';
const uploadsBaseDir = path.join(__dirname, 'uploads');
const photosDir = path.join(uploadsBaseDir, 'photos');
const filesDir = path.join(uploadsBaseDir, 'files');

// Ensure subfolders exist
if (!fs.existsSync(photosDir)) fs.mkdirSync(photosDir, { recursive: true });
if (!fs.existsSync(filesDir)) fs.mkdirSync(filesDir, { recursive: true });

console.log('Photos and files subdirectories are configured.');

// Helper to determine the target folder and file path based on file characteristics
const getTargetSubfolderAndMove = (relativeUrl) => {
  if (!relativeUrl || typeof relativeUrl !== 'string' || !relativeUrl.startsWith('/uploads/')) {
    return null;
  }

  // If it's already categorized, skip
  if (relativeUrl.startsWith('/uploads/photos/') || relativeUrl.startsWith('/uploads/files/')) {
    return null;
  }

  const filename = relativeUrl.replace('/uploads/', '');
  const sourcePath = path.join(uploadsBaseDir, filename);

  // Check if file exists
  if (!fs.existsSync(sourcePath)) {
    console.warn(`File does not exist: ${sourcePath}`);
    return null;
  }

  // Determine subfolder based on file extension or prefix
  let subfolder = 'files';
  const ext = path.extname(filename).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].includes(ext)) {
    subfolder = 'photos';
  } else if (filename.includes('avatar') || filename.includes('photo')) {
    subfolder = 'photos';
  }

  const destinationDir = subfolder === 'photos' ? photosDir : filesDir;
  const destinationPath = path.join(destinationDir, filename);

  try {
    fs.renameSync(sourcePath, destinationPath);
    console.log(`Moved: ${filename} -> uploads/${subfolder}/${filename}`);
    return `/uploads/${subfolder}/${filename}`;
  } catch (err) {
    console.error(`Failed to move file ${filename}:`, err.message);
    return null;
  }
};

async function migrateToSubfolders() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected. Starting database update to subfolder paths...');

    let updatedCount = 0;

    // 1. Employees
    const employees = await Employee.find();
    for (const emp of employees) {
      let updated = false;
      if (emp.avatar && emp.avatar.startsWith('/uploads/') && !emp.avatar.startsWith('/uploads/photos/') && !emp.avatar.startsWith('/uploads/files/')) {
        const newPath = getTargetSubfolderAndMove(emp.avatar);
        if (newPath) {
          emp.avatar = newPath;
          updated = true;
        }
      }
      if (emp.document && emp.document.startsWith('/uploads/') && !emp.document.startsWith('/uploads/photos/') && !emp.document.startsWith('/uploads/files/')) {
        const newPath = getTargetSubfolderAndMove(emp.document);
        if (newPath) {
          emp.document = newPath;
          updated = true;
        }
      }
      if (updated) {
        await emp.save();
        console.log(`Updated Employee: ${emp.name}`);
        updatedCount++;
      }
    }

    // 2. Students
    const students = await Student.find();
    for (const stud of students) {
      if (stud.avatar && stud.avatar.startsWith('/uploads/') && !stud.avatar.startsWith('/uploads/photos/') && !stud.avatar.startsWith('/uploads/files/')) {
        const newPath = getTargetSubfolderAndMove(stud.avatar);
        if (newPath) {
          stud.avatar = newPath;
          await stud.save();
          console.log(`Updated Student: ${stud.name}`);
          updatedCount++;
        }
      }
    }

    // 3. Faculty Applications
    const facultyApps = await FacultyApplication.find();
    for (const appRec of facultyApps) {
      if (appRec.resumeLink && appRec.resumeLink.startsWith('/uploads/') && !appRec.resumeLink.startsWith('/uploads/photos/') && !appRec.resumeLink.startsWith('/uploads/files/')) {
        const newPath = getTargetSubfolderAndMove(appRec.resumeLink);
        if (newPath) {
          appRec.resumeLink = newPath;
          await appRec.save();
          console.log(`Updated Faculty App: ${appRec.name}`);
          updatedCount++;
        }
      }
    }

    // 4. Placement Enquiries
    const placements = await PlacementEnquiry.find();
    for (const place of placements) {
      if (place.resumeLink && place.resumeLink.startsWith('/uploads/') && !place.resumeLink.startsWith('/uploads/photos/') && !place.resumeLink.startsWith('/uploads/files/')) {
        const newPath = getTargetSubfolderAndMove(place.resumeLink);
        if (newPath) {
          place.resumeLink = newPath;
          await place.save();
          console.log(`Updated Placement Resume: ${place.studentName}`);
          updatedCount++;
        }
      }
    }

    console.log(`\nSubfolder categorization complete! Updated ${updatedCount} records.`);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

migrateToSubfolders();
