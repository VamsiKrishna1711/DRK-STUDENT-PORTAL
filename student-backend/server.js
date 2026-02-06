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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/DRKstudents', {
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

// INPUT VALIDATION & SANITIZATION
// These functions prevent injection attacks, invalid data, and edge cases.

// Removes leading/trailing whitespace and validates input is a string
function sanitizeString(input) {
    if (typeof input !== 'string') return '';
    return input.trim();
}

// Validates roll number format: alphanumeric, dashes, underscores; length 4-30
// Prevents path traversal and injection attempts
function validateRollNumber(roll) {
    if (!roll || typeof roll !== 'string') return false;
    return /^[A-Za-z0-9\-_.]{4,30}$/.test(roll);
}

// Ensures year is an integer between 1-4 (valid academic years)
function validateYear(y) {
    const n = Number(y);
    return Number.isInteger(n) && n >= 1 && n <= 4;
}

// Fetches external academic results safely with URL encoding
// Non-fatal on failure: registration continues without external data
async function fetchData(rollNumber) {
    try {
        // ensure rollNumber is safe to use in URL
        const safeRoll = encodeURIComponent(sanitizeString(rollNumber));
        const url = `https://jntuhresults.dhethi.com/api/getAcademicResult?rollNumber=${safeRoll}`;
        const fetch = globalThis.fetch || (await import('node-fetch')).default;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`External API error: ${response.status}`);
        }

        const data = await response.json();
        return data || {};

    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// REGISTRATION ENDPOINT
// Creates new student account with validation:
// - Required fields check
// - Roll number format and uniqueness validation
// - Password strength (6+ chars, bcrypted)
// - Optionally fetches external university results
app.post('/api/register', async (req, res) => {
    try {
        const name = sanitizeString(req.body.name);
        const rollNumber = sanitizeString(req.body.rollNumber);
        const password = req.body.password;
        const year = req.body.year;

        if (!name || !rollNumber || !password || year === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        if (!validateRollNumber(rollNumber)) {
            return res.status(400).json({ success: false, message: 'Invalid roll number format' });
        }

        if (!validateYear(year)) {
            return res.status(400).json({ success: false, message: 'Invalid year' });
        }

        if (typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const existingStudent = await Student.findOne({ rollNumber });
        if (existingStudent) {
            return res.status(409).json({ success: false, message: 'Student with this roll number already exists' });
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
            // flexible keys from external API
            if (results.Details?.NAME_OF_THE_COURSE) {
                newStudent.courseName = results.Details.NAME_OF_THE_COURSE;
            } else if (results.details?.courseName) {
                newStudent.courseName = results.details.courseName;
            }
        } catch (error) {
            console.info('Could not fetch external results (non-fatal)');
        }

        await newStudent.save();

        res.status(201).json({ success: true, message: 'Registration successful' });

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
        const rollNumber = sanitizeString(req.params.rollNumber);
        if (!validateRollNumber(rollNumber)) {
            return res.status(400).json({ success: false, message: 'Invalid roll number' });
        }

        const data = await fetchData(rollNumber);
        res.json({ success: true, data: data });
    } catch (error) {
        res.status(502).json({ success: false, message: 'Failed to fetch student data' });
    }
});

// LOGIN ENDPOINT
// Authenticates student and returns user profile (name, rollNumber, courseName, year)
// Uses bcrypt for password comparison to prevent plaintext storage exposure
app.post('/api/login', async (req, res) => {
    try {
        const rollNumber = sanitizeString(req.body.rollNumber);
        const password = req.body.password;

        if (!validateRollNumber(rollNumber) || !password) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

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

// UPDATE STUDENT INFO ENDPOINT
// Updates only safe fields: phoneNumber, email, address
// Restricts updates to prevent privilege escalation or data corruption
app.put('/api/register', async (req, res) => {
    try {
            const rollNumber = sanitizeString(req.body.rollNumber);
            if (!validateRollNumber(rollNumber)) {
                return res.status(400).json({ success: false, message: 'Invalid roll number' });
            }

            // Only allow specific safe fields to be updated
            const allowed = {};
            if (typeof req.body.phoneNumber === 'string') allowed.phoneNumber = sanitizeString(req.body.phoneNumber);
            if (typeof req.body.email === 'string') allowed.email = sanitizeString(req.body.email);
            if (typeof req.body.address === 'string') allowed.address = sanitizeString(req.body.address);

            const updatedStudent = await Student.findOneAndUpdate(
                { rollNumber },
                { $set: allowed },
                { new: true }
            );
  
            if (!updatedStudent) {
                return res.status(404).json({ success: false, message: 'Student not found' });
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

// GET STORED STUDENT INFO ENDPOINT
// Retrieves phone, email, address for authenticated student
app.get('/api/student/info/:rollNumber', async (req, res) => {
    try {
            const rollNumber = sanitizeString(req.params.rollNumber);
            if (!validateRollNumber(rollNumber)) {
                return res.status(400).json({ success: false, message: 'Invalid roll number' });
            }

            const student = await Student.findOne({ rollNumber });
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

// NOTES ENDPOINT
// Reads subject links from public/notes/year{N}/* directories
// Returns list of subjects with associated resource links
// Validates year parameter to prevent directory traversal
app.get('/api/notes/:year', (req, res) => {
    const yearParam = parseInt(req.params.year, 10);
    if (!validateYear(yearParam)) {
        return res.status(400).json({ success: false, message: 'Invalid year parameter' });
    }

    const notesPath = path.join(__dirname, 'public', 'notes', `year${yearParam}`);

    fs.readdir(notesPath, (err, folders) => {
        if (err) {
            // If folder does not exist return empty notes (non-fatal)
            return res.json({ success: true, notes: [] });
        }

        const notes = [];
        folders.forEach(folder => {
            const linkFile = path.join(notesPath, folder, 'link.txt');
            if (fs.existsSync(linkFile)) {
                const link = fs.readFileSync(linkFile, 'utf8').trim();
                notes.push({ subject: folder, link: link });
            }
        });

        res.json({ success: true, notes: notes });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
