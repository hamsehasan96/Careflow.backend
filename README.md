# CareFlow Backend

A Node.js backend service for the CareFlow application, providing APIs for managing participants, appointments, staff, and other healthcare-related functionalities.

## Features

- RESTful API endpoints
- JWT Authentication
- Role-based access control
- File upload handling
- Email notifications
- Audit logging
- Analytics
- Security features (CSRF, XSS protection, rate limiting)

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=careflow
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

# Sentry Configuration
SENTRY_DSN=your_sentry_dsn

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
CSRF_SECRET=your_csrf_secret
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/careflow-backend.git
cd careflow-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run database migrations:
```bash
npm run migrate
```

## Development

Start the development server:
```bash
npm run dev
```

## Production

Build and start the production server:
```bash
npm run build
npm start
```

## Deployment on Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: Copy all variables from `.env.example` and set their values
4. Add a PostgreSQL database from Render's dashboard
5. Update the database connection variables in Render's environment variables

## Health Check

The application provides a health check endpoint at `/api/health` that returns a 200 status code when the service is running properly.

## API Documentation

API documentation is available at `/api-docs` when running the server.

## Security

- All API endpoints are protected with JWT authentication
- CSRF protection is enabled for all routes
- Rate limiting is implemented to prevent abuse
- XSS protection is enabled
- Input sanitization is implemented
- Security headers are configured using Helmet

## License

ISC 