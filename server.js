const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Employee = require('./models/Employee');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
const Event = require('./models/Event');
const Student = require('./models/Student');
const College = require('./models/College');
const Gallery = require('./models/Gallery');

const admissionRoutes = require('./routes/admissionRoutes');
const contactRoutes = require('./routes/contactRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const eventRoutes = require('./routes/eventRoutes');
const studentRoutes = require('./routes/studentRoutes');
const collegeRoutes = require('./routes/collegeRoutes');
const placementRoutes = require('./routes/placementRoutes');
const examRoutes = require('./routes/examRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const examinationRoutes = require('./routes/examinationRoutes');
const resultRoutes = require('./routes/resultRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
const mongoUri = process.env.MONGO_URI && !process.env.MONGO_URI.includes('<db_password>')
  ? process.env.MONGO_URI
  : 'mongodb://127.0.0.1:27017/sves';

function sanitizeMongoUri(uri) {
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/, '$1*****$3');
}

console.log(`Connecting to MongoDB at: ${sanitizeMongoUri(mongoUri)}`);

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB connection established successfully.');
    seedDatabase();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    if (process.env.MONGO_URI) {
      console.log('Check your Atlas user/password and ensure the URI in Backend/.env is correct.');
    } else {
      console.log('No MONGO_URI found in .env; ensure local MongoDB is running or set a valid MongoDB connection string.');
    }
  });

// Seeding Initial Data
async function seedDatabase() {
  try {
    // 1. Seed Colleges
    const collegeCount = await College.countDocuments();
    if (collegeCount < 7) {
      console.log('Seeding initial colleges...');
      await College.deleteMany({});
      const INITIAL_COLLEGES = [
        {
          id: 'inter',
          name: 'SVES Intermediate College',
          code: 'SVES-IC',
          established: '2012',
          principal: 'Dr. A. Raghavendra',
          email: 'inter.principal@sves.edu.in',
          phone: '9848022338',
          address: 'SVES Campus, Block A, Bangalore, Karnataka, 560001',
          location: 'Bangalore',
          groups: ['MPC', 'BiPC', 'CEC', 'HEC']
        },
        {
          id: 'degree',
          name: 'SVES Degree College',
          code: 'SVES-DC',
          established: '2015',
          principal: 'Dr. M. S. Prasad',
          email: 'degree.principal@sves.edu.in',
          phone: '9848022339',
          address: 'SVES Campus, Block B, Hyderabad, Telangana, 500001',
          location: 'Hyderabad',
          groups: ['B.Sc', 'B.Com', 'B.A', 'BBA']
        },
        {
          id: 'engineering',
          name: 'SVES Engineering College',
          code: 'SVES-EC',
          established: '2008',
          principal: 'Dr. S. Veerabhadra Jr.',
          email: 'principal@sves.edu.in',
          phone: '9848022337',
          address: 'SVES Campus, Block C & D, Bangalore, Karnataka, 560001',
          location: 'Bangalore',
          groups: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL']
        },
        {
          id: 'pg',
          name: 'SVES Postgraduate College',
          code: 'SVES-PG',
          established: '2018',
          principal: 'Mrs. V. Saraswathi',
          email: 'director@sves.edu.in',
          phone: '9848022340',
          address: 'SVES Campus, Block E, Hyderabad, Telangana, 500001',
          location: 'Hyderabad',
          groups: ['MCA', 'MBA', 'M.Sc', 'M.Tech']
        },
        {
          id: 'iti',
          name: 'SVES ITI College',
          code: 'SVES-ITI',
          established: '2020',
          principal: 'Dr. R. K. Sen',
          email: 'iti.principal@sves.edu.in',
          phone: '9848022341',
          address: 'SVES Campus, Block F, Mumbai, Maharashtra, 400001',
          location: 'Mumbai',
          groups: ['Fitter', 'Electrician', 'Welder']
        },
        {
          id: 'medical',
          name: 'SVES Medical College',
          code: 'SVES-MC',
          established: '2016',
          principal: 'Dr. S. K. Gupta',
          email: 'medical.principal@sves.edu.in',
          phone: '9848022342',
          address: 'SVES Campus, Block G, Kanpur, Uttar Pradesh, 208001',
          location: 'Kanpur',
          groups: ['MBBS', 'BDS', 'Nursing']
        },
        {
          id: 'polytechnic',
          name: 'SVES Polytechnic College',
          code: 'SVES-PC',
          established: '2014',
          principal: 'Dr. V. K. Rao',
          email: 'poly.principal@sves.edu.in',
          phone: '9848022343',
          address: 'SVES Campus, Block H, Delhi, Delhi NCR, 110001',
          location: 'Delhi',
          groups: ['Civil', 'Mechanical', 'Electrical']
        }
      ];
      await College.insertMany(INITIAL_COLLEGES);
      console.log('Seeded colleges successfully.');
    }

    // 2. Seed Employees
    const oldEmployeeCheck = await Employee.findOne({ department: 'Primary Division' });
    const missingBioCheck = await Employee.findOne({ id: 'SVES-1001', bio: { $exists: false } });
    if (oldEmployeeCheck || missingBioCheck) {
      console.log('Detected old or bio-less employee records. Clearing employee registry to re-seed...');
      await Employee.deleteMany({});
      await Attendance.deleteMany({});
      await Leave.deleteMany({});
    }

    const employeeCount = await Employee.countDocuments();
    if (employeeCount === 0) {
      console.log('Seeding initial employees...');
      const INITIAL_EMPLOYEES = [
        {
          id: 'SVES-1001',
          name: 'Dr. S. Veerabhadra Jr.',
          role: 'Principal & Correspondent',
          department: 'Administration',
          email: 'principal@sves.edu.in',
          joiningDate: '2020-06-01',
          salary: 95000,
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150',
          bio: 'Ph.D in Education Administration. Over 20 years guiding collegiate excellence and society expansion.'
        },
        {
          id: 'SVES-1002',
          name: 'Mrs. V. Saraswathi',
          role: 'Academic Director',
          department: 'Administration',
          email: 'director@sves.edu.in',
          joiningDate: '2020-06-01',
          salary: 85000,
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
          bio: 'Post Graduate in Engineering (CSE). Directs educational curriculum, teacher integrations, and branch standards.'
        },
        {
          id: 'SVES-1003',
          name: 'Mr. S. Krishna',
          role: 'Head of Computer Science & Robotics',
          department: 'Engineering Faculty',
          email: 'krishna.s@sves.edu.in',
          joiningDate: '2021-08-15',
          salary: 60000,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
          bio: 'M.Tech in CS. Specialized in Robotics, Web Standards, and Distributed Database Architectures.'
        },
        {
          id: 'SVES-1004',
          name: 'Mrs. K. Suma',
          role: 'English Literature Faculty',
          department: 'Degree Faculty',
          email: 'suma.k@sves.edu.in',
          joiningDate: '2022-05-10',
          salary: 55000,
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
          bio: 'M.A in English Literature. Promotes communication programs, debate societies, and inter-collegiate public speaking.'
        },
        {
          id: 'SVES-1005',
          name: 'Coach B. R. Prasad',
          role: 'Physical Education Director',
          department: 'Intermediate Faculty',
          email: 'prasad.pe@sves.edu.in',
          joiningDate: '2021-11-20',
          salary: 48000,
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
          bio: 'Master of Physical Education (M.P.Ed). Trains district-level track teams and leads indoor basketball coaching.'
        },
        {
          id: 'SVES-1006',
          name: 'Mrs. H. Nalini',
          role: 'Primary Arts & Craft Teacher',
          department: 'PG Faculty',
          email: 'nalini.arts@sves.edu.in',
          joiningDate: '2023-01-10',
          salary: 45000,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
          bio: 'Graduate in Fine Arts. Coordinates annual design displays, crafts seminars, and stage setup layouts.'
        },
        {
          id: 'SVES-1007',
          name: 'Mr. T. Ramesh',
          role: 'Senior Finance Officer',
          department: 'Administration',
          email: 'ramesh.accounts@sves.edu.in',
          joiningDate: '2022-02-15',
          salary: 52000,
          avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=150',
          bio: 'Senior financial consultant. Manages SVES institutional payroll, audit compliance, and accounting systems.'
        },
        {
          id: 'SVES-1008',
          name: 'Mr. K. Velu',
          role: 'Campus Facilities Manager',
          department: 'Support Staff',
          email: 'velu.care@sves.edu.in',
          joiningDate: '2020-07-01',
          salary: 30000,
          avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=150',
          bio: 'Oversees facilities operations, campus security coordination, and landscaping maintenance.'
        }
      ];
      await Employee.insertMany(INITIAL_EMPLOYEES);
      console.log('Seeded employees successfully.');
    }
    await Employee.updateMany({ department: { $in: ['Degree Faculty', 'PG Faculty'] }, campusLocation: { $exists: false } }, { $set: { campusLocation: 'Hyderabad' } });
    await Employee.updateMany({ campusLocation: { $exists: false } }, { $set: { campusLocation: 'Bangalore' } });

    // 3. Seed Attendance
    const attendanceCount = await Attendance.countDocuments();
    if (attendanceCount === 0) {
      console.log('Seeding initial attendance logs...');
      const INITIAL_ATTENDANCE = [
        { empId: 'SVES-1001', status: 'Present', checkIn: '08:15 AM', checkOut: '04:30 PM', hours: 8.25 },
        { empId: 'SVES-1002', status: 'Present', checkIn: '08:24 AM', checkOut: '04:15 PM', hours: 7.85 },
        { empId: 'SVES-1003', status: 'Present', checkIn: '08:05 AM', checkOut: '04:00 PM', hours: 7.92 },
        { empId: 'SVES-1004', status: 'Late', checkIn: '09:12 AM', checkOut: '04:00 PM', hours: 6.8 },
        { empId: 'SVES-1005', status: 'Present', checkIn: '07:15 AM', checkOut: '03:30 PM', hours: 8.25 },
        { empId: 'SVES-1007', status: 'Present', checkIn: '08:30 AM', checkOut: '05:00 PM', hours: 8.5 },
        { empId: 'SVES-1008', status: 'Present', checkIn: '07:30 AM', checkOut: '04:30 PM', hours: 9.0 }
      ];
      await Attendance.insertMany(INITIAL_ATTENDANCE);
      console.log('Seeded attendance successfully.');
    }

    // 4. Seed Leaves
    const leaveCount = await Leave.countDocuments();
    if (leaveCount === 0) {
      console.log('Seeding initial leaves...');
      const INITIAL_LEAVES = [
        {
          id: 'L-101',
          empId: 'SVES-1006',
          name: 'Mrs. H. Nalini',
          type: 'Sick Leave',
          start: '2026-06-30',
          end: '2026-07-02',
          days: 3,
          reason: 'Suffering from viral fever, advised bed rest for 3 days by clinician.',
          status: 'Pending',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'
        },
        {
          id: 'L-102',
          empId: 'SVES-1004',
          name: 'Mrs. K. Suma',
          type: 'Casual Leave',
          start: '2026-07-04',
          end: '2026-07-05',
          days: 1.5,
          reason: 'Required to attend a close family wedding ceremony in native place.',
          status: 'Approved',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'
        },
        {
          id: 'L-103',
          empId: 'SVES-1008',
          name: 'Mr. K. Velu',
          type: 'Annual Leave',
          start: '2026-07-10',
          end: '2026-07-15',
          days: 5,
          reason: 'Planned vacation and family function arrangements.',
          status: 'Pending',
          avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=150'
        }
      ];
      await Leave.insertMany(INITIAL_LEAVES);
      console.log('Seeded leaves successfully.');
    }

    // 5. Seed Events
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      console.log('Seeding initial institution events...');
      const INITIAL_EVENTS = [
        {
          day: '15',
          month: 'JUL',
          title: 'Annual Science Exhibition 2026',
          desc: 'Students showcase working science models, programming projects, and green energy innovations. Open to public.',
          image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400',
          order: 1
        },
        {
          day: '08',
          month: 'AUG',
          title: 'Inter-Institution Athletics Meet',
          desc: 'SVES hosts the regional athletics tournament featuring track, high jump, basketball, and football championships across its branches.',
          image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=400',
          order: 2
        },
        {
          day: '22',
          month: 'SEP',
          title: 'Admissions Seminar & Campus Tour',
          desc: 'Meet our Principal and academic heads, experience classrooms first-hand, and explore academic scholarships.',
          image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=400',
          order: 3
        }
      ];
      await Event.insertMany(INITIAL_EVENTS);
      console.log('Seeded institution events successfully.');
    }

    // 6. Seed Students
    const oldStudentCheck = await Student.findOne({ class: { $exists: true } });
    if (oldStudentCheck) {
      console.log('Detected old school-based student records. Clearing student registry...');
      await Student.deleteMany({});
    }

    const studentCount = await Student.countDocuments();
    if (studentCount === 0) {
      console.log('Seeding initial students...');
      const INITIAL_STUDENTS = [
        { id: 'SVES-S1001', name: 'Aarav Sharma', college: 'engineering', group: 'CSE', rollNo: '01', gender: 'Male', parentName: 'Rakesh Sharma', phone: '9876543210', email: 'aarav@gmail.com', admissionDate: '2023-06-01', avatar: 'https://randomuser.me/api/portraits/med/men/1.jpg' },
        { id: 'SVES-S1002', name: 'Diya Patel', college: 'engineering', group: 'ECE', rollNo: '01', gender: 'Female', parentName: 'Sanjay Patel', phone: '9876543211', email: 'diya@gmail.com', admissionDate: '2023-06-01', avatar: 'https://randomuser.me/api/portraits/med/women/2.jpg' },
        { id: 'SVES-S1003', name: 'Vivaan Reddy', college: 'degree', group: 'B.Sc', rollNo: '01', gender: 'Male', parentName: 'Mohan Reddy', phone: '9876543212', email: 'vivaan@gmail.com', admissionDate: '2022-06-01', avatar: 'https://randomuser.me/api/portraits/med/men/3.jpg' },
        { id: 'SVES-S1004', name: 'Ananya Rao', college: 'inter', group: 'MPC', rollNo: '01', gender: 'Female', parentName: 'Venkatesh Rao', phone: '9876543213', email: 'ananya@gmail.com', admissionDate: '2022-06-01', avatar: 'https://randomuser.me/api/portraits/med/women/4.jpg' },
        { id: 'SVES-S1005', name: 'Kabir Singh', college: 'pg', group: 'MCA', rollNo: '01', gender: 'Male', parentName: 'Jaspreet Singh', phone: '9876543214', email: 'kabir@gmail.com', admissionDate: '2021-06-01', avatar: 'https://randomuser.me/api/portraits/med/men/5.jpg' }
      ];
      await Student.insertMany(INITIAL_STUDENTS);
      console.log('Seeded students successfully.');
    }

    // 7. Seed Examinations & Results
    const Examination = require('./models/Examination');
    const Result = require('./models/Result');
    const examCount = await Examination.countDocuments();
    if (examCount === 0) {
      console.log('Seeding initial examinations...');
      const exam1 = await Examination.create({
        name: 'B.Tech CSE Semester I Regular Exams',
        college: 'engineering',
        group: 'CSE',
        semester: 'Semester I',
        date: '2026-07-20',
        subjects: ['Mathematics I', 'Computer Programming', 'Engineering Physics']
      });
      const exam2 = await Examination.create({
        name: 'B.Sc Semester III Midterm Exams',
        college: 'degree',
        group: 'B.Sc',
        semester: 'Semester III',
        date: '2026-07-25',
        subjects: ['Organic Chemistry', 'Physics II', 'Calculus']
      });

      console.log('Seeding initial examination results...');
      await Result.create([
        {
          examinationId: exam1._id,
          examName: exam1.name,
          studentName: 'Aarav Sharma',
          rollNo: '01',
          subject: 'Computer Programming',
          marksObtained: 85,
          maxMarks: 100,
          status: 'Pass'
        },
        {
          examinationId: exam1._id,
          examName: exam1.name,
          studentName: 'Aarav Sharma',
          rollNo: '01',
          subject: 'Engineering Physics',
          marksObtained: 78,
          maxMarks: 100,
          status: 'Pass'
        },
        {
          examinationId: exam1._id,
          examName: exam1.name,
          studentName: 'Diya Patel',
          rollNo: '01',
          subject: 'Computer Programming',
          marksObtained: 92,
          maxMarks: 100,
          status: 'Pass'
        },
        {
          examinationId: exam2._id,
          examName: exam2.name,
          studentName: 'Vivaan Reddy',
          rollNo: '01',
          subject: 'Calculus',
          marksObtained: 45,
          maxMarks: 100,
          status: 'Fail'
        }
      ]);
      console.log('Seeded examinations and results successfully.');
    }

    // 8. Seed Gallery Items
    const galleryCount = await Gallery.countDocuments();
    if (galleryCount === 0) {
      console.log('Seeding initial gallery images...');
      const INITIAL_GALLERY = [
        {
          category: 'college',
          title: 'Sri Veerabhadra Engineering Main Block',
          src: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800'
        },
        {
          category: 'college',
          title: 'SVES Degree Campus Courtyard',
          src: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800'
        },
        {
          category: 'college',
          title: 'Central Library Study Corridor',
          src: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=800'
        },
        {
          category: 'college',
          title: 'SVES PG Block & Seminar Plaza',
          src: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&q=80&w=800'
        },
        {
          category: 'labs',
          title: 'Advanced Robotics & Machine Learning Lab',
          src: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=800'
        },
        {
          category: 'labs',
          title: 'Chemistry Organic Analysis Lab',
          src: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800'
        },
        {
          category: 'labs',
          title: 'Computer Science Programming Terminal',
          src: 'https://images.unsplash.com/photo-1564951434112-64d74cc2a2d7?auto=format&fit=crop&q=80&w=800'
        },
        {
          category: 'labs',
          title: 'Biology Microscope Research Room',
          src: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&q=80&w=800'
        },
        {
          category: 'sports',
          title: 'Inter-Institution Basketball Finals',
          src: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800'
        },
        {
          category: 'sports',
          title: 'Annual Track & Field Sprint Meet',
          src: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800'
        },
        {
          category: 'sports',
          title: 'NSS Outdoor Athletics Training',
          src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800'
        },
        {
          category: 'cultural',
          title: 'Annual Stage Play Drama Fest',
          src: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800'
        },
        {
          category: 'cultural',
          title: 'Acoustic Guitar & Band Performance',
          src: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800'
        },
        {
          category: 'cultural',
          title: 'Fine Arts & Painting Exhibition',
          src: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800'
        }
      ];
      await Gallery.insertMany(INITIAL_GALLERY);
      console.log('Seeded gallery images successfully.');
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
}

// ==================== API ROUTES ====================

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Authentication Endpoint (handles both Admin and Employee portals)
app.post('/api/auth/login', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    if (role === 'admin') {
      if (username === 'SVES' && password === 'sves123') {
        return res.status(200).json({ 
          success: true, 
          role: 'admin', 
          user: { name: 'SVES Principal', id: 'SVES-1001' } 
        });
      } else {
        return res.status(401).json({ error: 'Invalid administrator credentials.' });
      }
    } else {
      // Find employee by username (Employee ID)
      const employee = await Employee.findOne({ id: username.trim() });
      if (!employee) {
        return res.status(404).json({ error: 'Employee registry record not found.' });
      }
      
      // Passwords can be employee's custom password (if set), registered email, or 'sves123' / 'employee123'
      const sanitizedPw = password.trim();
      const isCorrectPassword = 
        (employee.password && sanitizedPw === employee.password.trim()) ||
        sanitizedPw === employee.email || 
        sanitizedPw === 'sves123' || 
        sanitizedPw === 'employee123';

      if (isCorrectPassword) {
        return res.status(200).json({ 
          success: true, 
          role: 'employee', 
          user: employee 
        });
      } else {
        return res.status(401).json({ error: 'Invalid password. Hint: Use your email or sves123' });
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api/admissions', admissionRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/examinations', examRoutes);
app.use('/api/faculty-applications', facultyRoutes);
app.use('/api/exam-schedules', examinationRoutes);
app.use('/api/exam-results', resultRoutes);
app.use('/api/gallery', galleryRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
