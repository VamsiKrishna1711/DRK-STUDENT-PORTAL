const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/DRKstudents', {  
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Student Schema
const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rollNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    courseName: { type: String, default: 'B.Tech', required: false },
    year: { type: Number, required: true },
    results: { type: Object },
    phoneNumber: { type: String, default: '' },
    email: {type: String, default: ''},
    address: { type: String,  default: ''}
});

const Student = mongoose.model('Student', studentSchema);

async function fetchData(rollNumber) {
    try {
        const url = `https://jntuhresults.dhethi.com/api/getAcademicResult?rollNumber=${rollNumber}`;
        const fetch = globalThis.fetch || (await import('node-fetch')).default;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Registration endpoint
app.post('/api/register', async (req, res) => {
    try {
        console.log('Received registration data:', req.body);
        const { name, rollNumber, password, year } = req.body;

        const existingStudent = await Student.findOne({ rollNumber });
        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: 'Student with this roll number already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStudent = new Student({
            name,
            rollNumber,
            courseName: 'B.Tech',
            password: hashedPassword,
            year
        });

        try {
            const results = await fetchData(rollNumber);
            newStudent.results = results;
            if (results.Details?.NAME_OF_THE_COURSE) {
                newStudent.courseName = results.Details.NAME_OF_THE_COURSE;
            } else if (results.details?.courseName) {
                newStudent.courseName = results.details.courseName;
            }
        } catch (error) {
            console.log('Could not fetch JNTUH results:', error.message);
        }

        await newStudent.save();

        res.status(201).json({
            success: true,
            message: 'Registration successful'
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error during registration'
        });
    }
});

app.get('/api/student/:rollNumber', async (req, res) => {
    try {
        const { rollNumber } = req.params;
        const data = await fetchData(rollNumber);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { rollNumber, password } = req.body;

        const student = await Student.findOne({ rollNumber });
        if (!student) {
            return res.status(401).json({
                success: false,
                message: 'Invalid roll number or password'
            });
        }

        const validPassword = await bcrypt.compare(password, student.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid roll number or password'
            });
        }

        res.json({
            success: true,
            message: 'Login successful',
            student: {
                name: student.name,
                rollNumber: student.rollNumber,
                courseName: student.courseName,
                year: student.year
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login'
        });
    }
});

app.put('/api/register', async (req, res) => {
    try {
      const { rollNumber, ...updateFields } = req.body;

      const updatedStudent = await Student.findOneAndUpdate(
        { rollNumber },
        { $set: updateFields },
        { new: true }
      );
  
      if (!updatedStudent) {
        return res.status(404).json({
          success: false,
          message: 'Student not found'
        });
      }
  
      res.json({
        success: true,
        message: 'Information updated successfully',
        studentInfo: {
          phoneNumber: updatedStudent.phoneNumber,
          email: updatedStudent.email,
          address: updatedStudent.address
        }
      });
    } catch (error) {
      console.error('Error updating student:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
});

app.get('/api/student/info/:rollNumber', async (req, res) => {
    try {
      const student = await Student.findOne({ rollNumber: req.params.rollNumber });
      if (!student) {
        return res.status(404).json({ 
          success: false, 
          message: 'Student not found' 
        });
      }
  
      res.json({
        success: true,
        studentInfo: {
          phoneNumber: student.phoneNumber || '',
          email: student.email || '',
          address: student.address || ''
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Server error' 
      });
    }
});

// Notes endpoint - reads links from text files
app.get('/api/notes/:year', (req, res) => {
    const { year } = req.params;
    const notesPath = path.join(__dirname, 'public', 'notes', `year${year}`);
    
    fs.readdir(notesPath, (err, folders) => {
        if (err) {
            return res.json({ success: true, notes: [] });
        }
        
        const notes = [];
        folders.forEach(folder => {
            const linkFile = path.join(notesPath, folder, 'link.txt');
            if (fs.existsSync(linkFile)) {
                const link = fs.readFileSync(linkFile, 'utf8').trim();
                notes.push({
                    subject: folder,
                    link: link
                });
            }
        });
        
        res.json({ success: true, notes: notes });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
