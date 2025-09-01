
# DRK Student Portal

<img width="1902" height="1064" alt="Screenshot 2025-09-01 222147" src="https://github.com/user-attachments/assets/b7345a67-c531-470e-8b19-e332c3db1abd" />
<img width="1900" height="1079" alt="Screenshot 2025-09-01 222156" src="https://github.com/user-attachments/assets/b09730be-c4da-4248-8bed-679218dc51f0" />
<img width="1899" height="1079" alt="Screenshot 2025-09-01 222225" src="https://github.com/user-attachments/assets/e5a80e85-2f23-4cc0-8c74-d81ec5f508d0" />
<img width="1900" height="1065" alt="Screenshot 2025-09-01 222430" src="https://github.com/user-attachments/assets/a8c867f6-3511-4899-a1ba-cd8d494810d5" />
<img width="1668" height="813" alt="Screenshot 2025-09-01 222449" src="https://github.com/user-attachments/assets/f0f4d52c-0d23-4745-b285-55671ae03238" />
<img width="1894" height="1058" alt="Screenshot 2025-09-01 222521" src="https://github.com/user-attachments/assets/c31b567d-2a90-470a-aaed-b10daa9badb2" />







A full-stack web application for managing student information, academic results, and course materials. This portal provides students with a centralized platform to access their academic data, view syllabus information, and manage their personal details.

## Project Overview

The DRK Student Portal consists of two main components:
- **Frontend**: A React-based web interface for students to interact with the portal
- **Backend**: An Express.js API that handles authentication, data management, and integrates with external services

## Features

- **User Authentication**: Secure registration and login system for students
- **Academic Results**: Integration with JNTUH results service to fetch and display academic performance
- **Student Dashboard**: Personalized dashboard showing student information and performance metrics
- **Syllabus Viewer**: Access to course syllabi in PDF format
- **Profile Management**: Ability to manage personal information like phone number, email, and address

## Tech Stack

### Frontend
- React 19
- React Router v7
- Material UI (MUI Joy)
- Axios for API requests
- PDF.js for document viewing

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- bcrypt for password hashing
- Multer for file uploads

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd student-backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/DRKstudents
   ```
4. Start the server:
   ```
   node server.js
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd student-frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
4. The application will be available at http://localhost:3000

## API Endpoints

- `POST /api/register`: Register a new student
- `POST /api/login`: Authenticate a student
- `GET /api/student/:rollNumber`: Fetch student academic results

## Project Structure

```
DRK-STUDENT-PORTAL-3/
├── student-frontend/     # React frontend application
│   ├── public/           # Static files
│   ├── src/              # React source code
│   │   ├── components/   # React components
│   │   ├── App.js        # Main application component
│   └── package.json      # Frontend dependencies
│
└── student-backend/      # Express.js backend
    ├── server.js         # Main server file
    ├── .env              # Environment variables
    └── package.json      # Backend dependencies
```

## Future Enhancements

- Email verification for new registrations
- Password reset functionality
- File upload for assignments and projects
- Notification system for important announcements
- Mobile application version

## Created By

V. Vamsi Krishna (23N71A0558) ,
G. Aneel (23N71A0521) ,
D . Mourish Varma (23N71A0566) .

## License

This project is licensed under the ISC License. 
