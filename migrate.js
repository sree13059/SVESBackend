const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Employee = require('./models/Employee');

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sves';
const uploadsDir = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory.');
}

const saveBase64File = (base64String, prefix = 'file') => {
  if (!base64String || typeof base64String !== 'string' || !base64String.startsWith('data:')) {
    return null;
  }

  try {
    const matches = base64String.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }

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

    const filename = `${prefix}_migrated_${Date.now()}_${Math.floor(Math.random() * 1000)}.${extension}`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/${filename}`;
  } catch (err) {
    console.error('Error saving base64 file:', err);
    return null;
  }
};

async function runMigration() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully. Querying employees...');

    const employees = await Employee.find();
    console.log(`Found ${employees.length} employees. Starting migration...`);

    let migratedAvatars = 0;
    let migratedDocs = 0;

    for (const emp of employees) {
      let updated = false;

      // Migrate avatar
      if (emp.avatar && emp.avatar.startsWith('data:')) {
        const filePath = saveBase64File(emp.avatar, 'avatar');
        if (filePath) {
          emp.avatar = filePath;
          migratedAvatars++;
          updated = true;
        }
      }

      // Migrate document
      if (emp.document && emp.document.startsWith('data:')) {
        const filePath = saveBase64File(emp.document, 'doc');
        if (filePath) {
          emp.document = filePath;
          migratedDocs++;
          updated = true;
        }
      }

      if (updated) {
        await emp.save();
        console.log(`Updated employee: ${emp.name} (${emp.id})`);
      }
    }

    console.log(`Migration complete!`);
    console.log(`Migrated avatars: ${migratedAvatars}`);
    console.log(`Migrated documents: ${migratedDocs}`);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

runMigration();
