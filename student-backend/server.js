const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
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
    courseName: { type: String, required: true },
    results: { type: Object } // To store JNTUH results if needed
});

const Student = mongoose.model('Student', studentSchema);

// Your existing fetchData function
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
        const { name, rollNumber, courseName, password } = req.body;

        // Check if student already exists
        const existingStudent = await Student.findOne({ rollNumber });
        if (existingStudent) {
            return res.status(400).json({ 
                success: false, 
                message: 'Student with this roll number already exists' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new student
        const newStudent = new Student({
            name,
            rollNumber,
            courseName,
            password: hashedPassword
        });
        console.log('Student object before saving:', newStudent);
        // Try to fetch JNTUH results
        try {
            const results = await fetchData(rollNumber);
            newStudent.results = results;
        } catch (error) {
            console.log('Could not fetch JNTUH results:', error);
            // Continue registration even if results fetch fails
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
            message: 'Error during registration'
        });
    }
});

// Your existing results endpoint
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

        // Find student
        const student = await Student.findOne({ rollNumber });
        if (!student) {
            return res.status(401).json({
                success: false,
                message: 'Invalid roll number or password'
            });
        }

        // Check password
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
                courseName: student.courseName
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
