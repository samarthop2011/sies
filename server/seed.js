const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('./models/User');
const Result = require('./models/Result');
const Notification = require('./models/Notification');

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Marathi', 'Social Studies', 'Computer Science'];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Result.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing data');

    // Create principal
    const principal = await User.create({
      name: 'Dr. Sharma',
      email: 'principal@sies.edu',
      password: 'password123',
      role: 'principal'
    });
    console.log('✅ Principal created: principal@sies.edu / password123');

    // Create teachers
    const teachers = await User.create([
      { name: 'Mrs. Anjali Deshmukh', email: 'anjali@sies.edu', password: 'password123', role: 'teacher', subjects: ['Mathematics', 'Science'] },
      { name: 'Mr. Rajesh Patil', email: 'rajesh@sies.edu', password: 'password123', role: 'teacher', subjects: ['English', 'Hindi', 'Marathi'] },
      { name: 'Ms. Priya Kulkarni', email: 'priya@sies.edu', password: 'password123', role: 'teacher', subjects: ['Social Studies', 'Computer Science'] }
    ]);
    console.log('✅ 3 Teachers created');

    // Create students
    const studentData = [];
    const classes = ['8', '9', '10'];
    const sections = ['A', 'B'];
    let studentCount = 0;

    for (const cls of classes) {
      for (const sec of sections) {
        for (let i = 1; i <= 5; i++) {
          studentCount++;
          studentData.push({
            name: `Student ${studentCount}`,
            email: `student${studentCount}@sies.edu`,
            password: 'password123',
            role: 'student',
            class: cls,
            section: sec
          });
        }
      }
    }

    const students = await User.create(studentData);
    console.log(`✅ ${students.length} Students created`);

    // Create results for each student
    const examTypes = ['unit1', 'midterm'];
    const results = [];

    for (const student of students) {
      for (const examType of examTypes) {
        const subjects = SUBJECTS.map(name => ({
          name,
          marksObtained: Math.floor(Math.random() * 60) + 40, // 40-100
          totalMarks: 100
        }));

        results.push({
          student: student._id,
          studentName: student.name,
          examType,
          class: student.class,
          section: student.section,
          subjects,
          remarks: 'Good performance',
          uploadedBy: teachers[0]._id
        });
      }
    }

    await Result.create(results);
    console.log(`✅ ${results.length} Results created`);

    // Create notifications
    for (const student of students) {
      await Notification.create({
        user: student._id,
        message: 'Welcome to SIES! Your account has been created.',
        type: 'system'
      });
    }
    console.log('✅ Notifications created');

    console.log('\n🎉 Seed complete!');
    console.log('\nLogin credentials:');
    console.log('  Principal: principal@sies.edu / password123');
    console.log('  Teacher:   anjali@sies.edu / password123');
    console.log('  Student:   student1@sies.edu / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
