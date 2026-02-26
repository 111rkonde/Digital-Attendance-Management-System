# Digital Attendance Management System

A modern, full-stack web application for managing student attendance efficiently. Built with Node.js, Express, React, and PostgreSQL.

## Features

- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Three User Roles**: Admin (Principal), Teachers, and Students
- **Class Management**: Create and manage classes, sections, and academic years
- **Student Management**: Add, edit, and manage student records with parent information
- **Subject Management**: Organize subjects and assign teachers
- **Attendance Marking**: Quick daily attendance marking with Present/Absent/Late status
- **Bulk Attendance**: Mark attendance for entire class at once
- **Audit Logs**: Track attendance edits with timestamps and user information
- **Dashboard Analytics**: Visual charts and statistics for attendance overview
- **Automated Email Reports**: Daily attendance reports sent automatically to Principal's email
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

### Backend
- Node.js
- Express.js
- PostgreSQL (with Sequelize ORM)
- JWT Authentication
- SendGrid Email Service
- Node-cron for scheduled tasks

### Frontend
- React 18
- Vite
- Tailwind CSS
- Chart.js for analytics
- React Router DOM
- Axios

## Project Structure

```
Digital Attendance Management System/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and email configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Authentication and validation
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Server entry point
│   ├── .env.example        # Environment variables template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main app component
│   └── package.json
└── database/
    └── schema.sql          # Database schema
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- SendGrid account (for email features)

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=attendance_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h
   
   SENDGRID_API_KEY=your_sendgrid_api_key
   EMAIL_FROM=noreply@yourdomain.com
   PRINCIPAL_EMAILS=principal@school.edu
   
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. Create the PostgreSQL database:
   ```sql
   CREATE DATABASE attendance_db;
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and go to `http://localhost:5174`

## Default Demo Credentials

After setting up the database, you can register users or use these demo credentials:

- **Admin**: admin@school.edu / admin123
- **Teacher**: teacher@school.edu / teacher123
- **Student**: student@school.edu / student123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Classes
- `GET /api/classes` - List all classes
- `POST /api/classes` - Create new class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Students
- `GET /api/students` - List all students
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Attendance
- `GET /api/attendance/class/:classId/:date` - Get attendance for a class
- `POST /api/attendance/mark` - Mark attendance
- `POST /api/attendance/bulk` - Bulk mark attendance
- `GET /api/attendance/report` - Get attendance reports

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

## Automated Email Reports

The system automatically sends daily attendance reports to the Principal's email at 6:00 PM every day. Configure the principal email addresses in the `.env` file:

```env
PRINCIPAL_EMAILS=rkonde91@gmail.com,ykonde9665522587@gmail.com
```

## AWS Aurora SQL Support

To use AWS Aurora SQL instead of local PostgreSQL, update your `.env` file:

```env
DB_HOST=your-cluster.cluster-xyz.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=attendance_db
DB_USER=admin
DB_PASSWORD=your_aws_password
DB_SSL=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
