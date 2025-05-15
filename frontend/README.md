# Urban Ease Frontend

The frontend application for the Urban Ease service booking platform, built with React 19 and Vite.

## Project Overview

This is the frontend part of the Urban Ease home service web application, providing users with an intuitive interface to browse services, manage bookings, and engage in real-time chat. The frontend uses a modern React technology stack combined with Chakra UI to deliver a smooth and beautiful user experience.

## Technology Stack

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


## Main Features

### 1. User Authentication and Management
- User registration, login, and email verification
- User profile management
- Session management (cross-tab login/logout synchronization)

### 2. Service Browsing and Search
- Service provider listing
- Location and service type-based search and filtering
- Advanced filtering features (price range, ratings, etc.)

### 3. Booking Management
- Create and edit bookings
- Booking status tracking
- Service provider schedule and availability management

### 4. Real-time Communication
- Real-time messaging between users
- Conversation management and unread message notifications
- Message history

### 5. Service Reviews
- Submit service reviews
- View service provider reviews

### 6. Payment Process
- Secure payment processing
- Payment status management

## State Management

The project uses Zustand as the state management solution, primarily containing the following stores:

- **authStore** - User authentication state management
- **conversationStore** - Chat conversation management
- **userStore** - User information management
- **chatDialogStore** - Chat interface state management

## Route Structure

- `/` - Home page, displays service provider list
- `/login` - Login page
- `/signup` - Registration page
- `/booking` - Booking page
- `/profile` - User profile page
- `/inbox` - User messages page
- `/providerDetail/:id` - Service provider details page
- `/payment/:bookingId` - Payment page
- `/verify-email` - Email verification page

## Installation and Running

### Prerequisites
- Node.js (latest LTS version recommended)
- Backend service started and running at http://localhost:3000

### Installing Dependencies

```bash
cd frontend
npm install
```

### Environment Variable Configuration

Create a `.env` file and add the necessary environment variables:

```
GOOGLE_MAPS_API_KEY=<your_google_maps_api_key>
```

### Running in Development Mode

```bash
npm run dev
```

The application will start at http://localhost:5173

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI interface
npm run test:ui
```

## API Integration

The frontend communicates with the backend API via Axios. All API requests are configured with a unified base URL and automatic token injection. API request configuration is centrally managed in `src/lib/api.js`.

## 🌐 Deployment (Frontend – Vite + Vercel)

This section explains how to deploy the Vite-based frontend of this MERN project to production using [Vercel](https://vercel.com).

### 1. Requirements

- A [Vercel](https://vercel.com) account
- Your frontend project pushed to GitHub
- Vite already set up (which you do if you're here!)

### 2. Environment Variables

You must set the following environment variables in your **Vercel dashboard**:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_API_URL=https://your-backend-service.onrender.com
```

> 🔄 Replace the `VITE_API_URL` with your actual backend deployment URL.

To manage these in Vercel:

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard).
2. Navigate to **Settings → Environment Variables**.
3. Add each key-value pair for both **Production** and **Preview** environments.

### 3. Configure `vercel.json`

Create a `vercel.json` file in the root of your frontend project to handle Vite's client-side routing (which prevents 404s on refresh):

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

> This ensures that all routes fallback to `index.html`, enabling client-side routing to work correctly.

### 4. Deploy to Vercel

To deploy:

1. Push your frontend repo to GitHub (if not already).
2. Go to [Vercel.com](https://vercel.com) and click **"New Project"**.
3. Select your GitHub repo.
4. Set the environment variables as above.
5. Vercel will automatically detect Vite and build your project.

Once deployed, you will get a live URL such as:

```
https://your-project-name.vercel.app
```

Use this URL in your backend's `.env` file:

```env
VITE_FRONTEND_URL=https://your-project-name.vercel.app
```

✅ Your Vite frontend is now live on Vercel and connected to your backend API!

---

## Notes

- Ensure the backend service is started during local development
- For pages requiring Google Maps functionality, a valid API key must be configured
