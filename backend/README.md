# Urban Ease Home Service Web Application - Backend Documentation

## Project Overview

The Urban Ease Home Service Web Application backend is a RESTful API service based on Node.js and Express, providing user management, booking management, messaging system, payment processing, and review systems. The backend uses MongoDB for data storage and provides complete authentication and authorization mechanisms.

## Technology Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM (Object Document Mapping) tool
- **JWT** - JSON Web Token authentication
- **Bcrypt** - Password encryption
- **Nodemailer** - Email service

## System Architecture

The backend adopts an MVC (Model-View-Controller) architecture, organized as follows:

- **`models/`** - Data model definitions
- **`controllers/`** - Business logic processing
- **`routes/`** - API route definitions
- **`middleware/`** - Middleware (e.g., authentication)
- **`config/`** - Configuration files
- **`utils/`** - Common utility functions

## Data Models

The system includes the following main data models:

- **User** - User information
- **Booking** - Booking information
- **Payment** - Payment information
- **Conversation** - Conversation records
- **Message** - Message content
- **Review** - Review information
- **Report** - Issue reports

## API Documentation

### Authentication API

#### User Registration
- **Endpoint:** `POST /api/auth/register`
- **Description:** Register a new user
- **Request Body:**
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "securepassword",
  "role": "customer" 
}
```
- **Response:** Newly created user information and verification email sending status

#### User Login
- **Endpoint:** `POST /api/auth/login`
- **Description:** User login to obtain token
- **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```
- **Response:** User information and JWT token

#### Get Current User
- **Endpoint:** `GET /api/auth/me`
- **Description:** Get current logged-in user information
- **Authentication:** Requires JWT token
- **Response:** Detailed user information

#### Update User Profile
- **Endpoint:** `PUT /api/auth/me`
- **Description:** Update current user information
- **Authentication:** Requires JWT token
- **Request Body:** User updatable fields
- **Response:** Updated user information

#### Email Verification
- **Endpoint:** `GET /api/auth/verify-email`
- **Description:** Verify user email
- **Query Parameters:** `token` - Email verification token
- **Response:** Verification result

### User API

#### Get Service Provider List
- **Endpoint:** `GET /api/users/providers`
- **Description:** Get all service providers list
- **Response:** List of service providers

#### Search Service Providers
- **Endpoint:** `POST /api/users/providers/search`
- **Description:** Search service providers based on criteria
- **Request Body:** Search criteria
- **Response:** Matching service providers list

#### Get Service Provider Details
- **Endpoint:** `GET /api/users/providers/:id`
- **Description:** Get detailed information for a specific service provider
- **Parameters:** `id` - Service provider ID
- **Response:** Service provider detailed information

#### Get Provider Availability
- **Endpoint:** `GET /api/users/providers/:id/availability`
- **Description:** Get service provider's available times
- **Parameters:** `id` - Service provider ID
- **Authentication:** Requires JWT token
- **Response:** Service provider availability information

#### Update Provider Availability
- **Endpoint:** `PUT /api/users/providers/:id/availability`
- **Description:** Update service provider's available times
- **Parameters:** `id` - Service provider ID
- **Authentication:** Requires JWT token
- **Request Body:** New availability information
- **Response:** Updated availability information

### Booking API

#### Create Booking
- **Endpoint:** `POST /api/bookings`
- **Description:** Create a new booking
- **Authentication:** Requires JWT token
- **Request Body:** Booking details
- **Response:** Created booking information

#### Get Customer Bookings
- **Endpoint:** `GET /api/bookings/my-bookings`
- **Description:** Get all bookings for the current logged-in customer
- **Authentication:** Requires JWT token
- **Response:** List of bookings

#### Get Provider Bookings
- **Endpoint:** `GET /api/bookings/provider-bookings`
- **Description:** Get all bookings for the current logged-in service provider
- **Authentication:** Requires JWT token
- **Response:** List of bookings

#### Get Booking Details
- **Endpoint:** `GET /api/bookings/:id`
- **Description:** Get detailed information for a specific booking
- **Parameters:** `id` - Booking ID
- **Authentication:** Requires JWT token
- **Response:** Booking detailed information

#### Update Booking Status
- **Endpoint:** `PATCH /api/bookings/:id/status`
- **Description:** Update booking status
- **Parameters:** `id` - Booking ID
- **Authentication:** Requires JWT token
- **Request Body:** New status information
- **Response:** Updated booking information

#### Update Booking Payment Status
- **Endpoint:** `PATCH /api/bookings/:id/payment`
- **Description:** Update booking payment status
- **Parameters:** `id` - Booking ID
- **Authentication:** Requires JWT token
- **Request Body:** Payment status information
- **Response:** Updated booking information

#### Update Booking Information
- **Endpoint:** `PUT /api/bookings/:id`
- **Description:** Update booking detailed information
- **Parameters:** `id` - Booking ID
- **Authentication:** Requires JWT token
- **Request Body:** Booking update information
- **Response:** Updated booking information

#### Delete Booking
- **Endpoint:** `DELETE /api/bookings/:id`
- **Description:** Delete a booking
- **Parameters:** `id` - Booking ID
- **Authentication:** Requires JWT token
- **Response:** Deletion result

### Payment API

#### Create Payment
- **Endpoint:** `POST /api/payments`
- **Description:** Initiate a new payment
- **Authentication:** Requires JWT token
- **Request Body:** Payment information
- **Response:** Created payment information

#### Update Payment
- **Endpoint:** `PATCH /api/payments/:id`
- **Description:** Update payment information
- **Parameters:** `id` - Payment ID
- **Authentication:** Requires JWT token
- **Request Body:** Payment update information
- **Response:** Updated payment information

#### Get Booking-Related Payment
- **Endpoint:** `GET /api/payments/booking/:bookingId`
- **Description:** Get payment information for a specific booking
- **Parameters:** `bookingId` - Booking ID
- **Authentication:** Requires JWT token
- **Response:** Booking-related payment information

### Message API

#### Send Message
- **Endpoint:** `POST /api/messages`
- **Description:** Send a new message; automatically creates a conversation if it doesn't exist
- **Request Body:**
```json
{
  "senderId": "66304ae6cfd94fc00c4911e8",
  "recipientId": "66304ae6cfd94fc00c4911e9",
  "content": "Hello, are you free to talk?"
}
```
- **Response:** Sent message information

#### Get User Conversations
- **Endpoint:** `GET /api/conversations?userId=<userId>`
- **Description:** Get all conversations for a user, including last message timestamp, other participant information, and unread count
- **Query Parameters:** `userId` - User ID
- **Response:** List of conversations

#### Get Conversation Messages
- **Endpoint:** `GET /api/conversations/:id/messages`
- **Description:** Get all messages in a specific conversation
- **Parameters:** `id` - Conversation ID
- **Response:** List of messages

#### Mark Conversation as Read
- **Endpoint:** `PUT /api/conversations/:id/read`
- **Description:** Mark all unread messages sent by others in a conversation as read
- **Parameters:** `id` - Conversation ID
- **Request Body:**
```json
{
  "userId": "66304ae6cfd94fc00c4911e8"
}
```
- **Response:** Update result

#### Get Unread Message Count
- **Endpoint:** `GET /api/messages/unread-count?userId=<userId>`
- **Description:** Get the count of all unread messages received by the user
- **Query Parameters:** `userId` - User ID
- **Response:** Unread message count

### Review API

#### Create Review
- **Endpoint:** `POST /api/reviews`
- **Description:** Create a new review
- **Request Body:** Review information
- **Response:** Created review information

#### Get Provider Reviews
- **Endpoint:** `GET /api/reviews/provider/:providerId`
- **Description:** Get all reviews for a specific service provider
- **Parameters:** `providerId` - Service provider ID
- **Response:** List of reviews

#### Get Booking Review
- **Endpoint:** `GET /api/reviews/booking/:bookingId`
- **Description:** Get review for a specific booking
- **Parameters:** `bookingId` - Booking ID
- **Response:** Review information

### Admin API

#### User Management
- **Endpoint:** `GET /api/admin/users`
- **Description:** Get list of all users
- **Response:** User list

#### Booking Management
- **Endpoint:** `GET /api/admin/bookings`
- **Description:** Get list of all bookings
- **Response:** Booking list

#### Payment Management
- **Endpoint:** `GET /api/admin/payments`
- **Description:** Get list of all payments
- **Response:** Payment list

#### Report Management
- **Endpoint:** `GET /api/admin/reports`
- **Description:** Get list of all reports
- **Response:** Report list

## Development Guide

### Environment Variables

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

### Run Development Server

```bash
npm run dev
```

### Run Tests

```bash
npm test
```

## 🚀 Deployment (Backend – Render)

This section explains how to deploy the backend server of this MERN project to production using [Render](https://render.com).

### 1. Requirements

- A [Render](https://render.com) account
- A GitHub repository connected to Render
- Your environment variables ready (see below)

### 2. Backend Scripts

Ensure your `package.json` in the backend includes the correct start command:

```json
"scripts": {
  "dev": "nodemon backend/server.js",
  "test": "jest --runInBand",
  "start": "node server.js"
}
```

### 3. Environment Variables (Required)

Set the following environment variables in Render dashboard under **Environment → Environment Variables**:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email_user
EMAIL_PASS=your_email_app_password
EMAIL_FROM="sender name" <your_email_address>

CLOUDINARY_URL=your_cloudinary_url
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

VITE_FRONTEND_URL=https://your-frontend-url.vercel.app
```

> 🔒 **Security Note**: Do NOT commit actual secrets to version control. Use `.env.example` to document required variables.

### 4. Deploy Steps on Render

1. Log into your [Render](https://render.com) account.
2. Click **"New Web Service"**, and connect your GitHub repository.
3. Set the following options:
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: set to `backend/` 
4. Add the environment variables listed above.
5. Click **"Create Web Service"** to deploy.

### 5. Starting Server Manually (Local Testing)

If testing locally, make sure the environment variables are set in a `.env` file, then run:

```bash
node server.js
```

Your backend should now be accessible via the Render-assigned URL, e.g. `https://your-backend-service.onrender.com`.

Use this backend URL in the frontend by setting:

```env
VITE_API_URL=https://your-backend-service.onrender.com
```

✅ Your MERN backend is now ready and deployed. Be sure to test all API endpoints in production!

---

## Notes

- All APIs requiring authentication need a valid JWT token in the request header
- Error handling follows HTTP status code standards
- Data validation is performed at the controller layer
