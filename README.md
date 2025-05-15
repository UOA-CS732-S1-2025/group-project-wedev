# Urban Ease - Home Service Web Application



<p align="center">
  <img src="https://urbaneaseproject.s3.us-east-1.amazonaws.com/UEase.png" alt="Urban Ease Logo" width="200"/><br>
  🚀 <strong>Urban Ease is now live!</strong><br>
  Explore the full application here:<br>
  <a href="https://wedevv.vercel.app/" target="_blank">
    Urban Ease
  </a>
</p>



## About Urban Ease

Urban Ease is a full-stack service booking platform that allows users to register as service providers or service consumers. Consumers can browse services, book appointments, and make payments, while service providers can manage bookings and receive payments. The platform also provides real-time messaging functionality, allowing communication between users, as well as a review and reporting system.

## Team Members

| Name           | Email                        | Role
|----------------|------------------------------|------
| Cheng Li       | cli807@aucklanduni.ac.nz     | Full-Stack
| Yunfei Xu      | yxu378@aucklanduni.ac.nz     | Backend
| Wenzhe Pang    | wpan273@aucklanduni.ac.nz    | Full-Stack
| Ashutosh Singh | nisa367@aucklanduni.ac.nz    | Frontend
| Zoe Zhong      | pzho670@aucklanduni.ac.nz    | Backend
| Yi Ji          | yji850@aucklanduni.ac.nz     | Backend
| Meize Zhou     | mzho097@aucklanduni.ac.nz    | Frontend

## Meeting Log

Summary of group meeting minutes: [Urban Ease Project – Meeting Log](https://github.com/UOA-CS732-S1-2025/group-project-wedev/wiki)

## Features

### User Management
- User registration and login
- Email verification
- User profile management
- Authentication and authorization

### Services and Bookings
- Service browsing and search
- Booking creation and management
- Booking status tracking
- Schedule management

### Messaging System
- Real-time messaging between users
- Conversation management
- Unread message notifications

### Payment System
- Secure payment processing
- Transaction history
- Payment status management

### Reviews and Reports
- Service review submission
- Issue reporting
- Review management

### Admin Features
- User management
- Booking monitoring
- Payment monitoring
- Report handling

## Technology Stack

### Frontend
- **React 19** - Latest version of the React UI library
- **React Router v7** - For page routing management
- **Chakra UI v3** - Component library providing modern, customizable UI components
- **Zustand** - Lightweight state management library
- **Axios** - HTTP client for API request handling
- **Vite** - Fast frontend build tool
- **Vitest** - Unit testing framework
- **@vis.gl/react-google-maps** - Google Maps integration library
- **date-fns** - Date handling utility library
- **react-hot-toast** - Notification toast component

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - Object Data Modeling
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service

## Installation Guide

### Prerequisites
- Node.js (latest LTS version recommended, Development version: V20.14.0)
- MongoDB instance (local or Atlas)

### Installation Steps

1. Clone the repository
```bash
git clone https://github.com/UOA-CS732-S1-2025/group-project-wedev.git
cd group-project-wedev
```

2. Set up environment variables

Update the `.env` file in the backend directory with necessary environment variables:
```
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
EMAIL_FROM="sender name" <your_email_address>

VITE_FRONTEND_URL=http://localhost:5173          # The frontend base URL. Used in email links and CORS settings
                                                 # Replace with your deployed frontend URL (e.g. https://your-app.vercel.app)
```
 
Update the `.env.local` file in the frontend directory with necessary environment variables:

```
GOOGLE_MAPS_API_KEY=your_google_maps_api_key     # Google Maps API key for map display

VITE_API_URL=http://localhost:3000               # Backend API base URL
                                                 # Replace with your Render backend URL when deployed
```

3. Install backend dependencies
```bash
cd backend
npm install
```

4. Install frontend dependencies
```bash
cd frontend
npm install
```

## Usage Guide

### Development Mode

1. Start the backend server
```bash
cd backend
npm run dev
```

2. Start the frontend development server
```bash
cd frontend
npm run dev
```

The frontend will run at http://localhost:5173
The backend will run at http://localhost:3000

### Testing

Before running the backend test, need to configure the environment(`server.js`)

<pre>
  // Development environment 
  // app.listen(PORT, () => { 
  // connectDB(); 
  // console.log(`Server is running on http://localhost:${PORT}`); 
  // }); 

  // Test environment
 export default app; 
  
</pre>


Run backend tests
```bash
cd backend
npm test
```

Run frontend tests
```bash
cd frontend
npm test
```

## API Documentation

Detailed API documentation can be found in [backend/README.md](./backend/README.md), including information about messages, conversations, and other endpoints.

## Frontend Guide

The frontend is a React-based interface built with Vite and Chakra UI. It communicates with the backend via RESTful APIs. For implementation details and developer setup instructions, see [frontend/README.md](./frontend/README.md)



