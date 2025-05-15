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

## Deployment (To Be Completed)

WENZHE to complete this section

## Notes

- Ensure the backend service is started during local development
- For pages requiring Google Maps functionality, a valid API key must be configured
