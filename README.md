# CareFlow Frontend

A modern, user-friendly frontend for the CareFlow NDIS service provider platform.

## Features

- **Authentication**: Secure login and registration system
- **Dashboard**: Overview of appointments, clients, and staff
- **Client Management**: Add, edit, and view client profiles
- **Appointment Booking**: Calendar view with appointment creation and editing
- **Staff Management**: Add, view, and edit support workers
- **Settings**: Update profile, organization, and notification preferences

## Tech Stack

- Next.js (React framework)
- TailwindCSS (Styling)
- NextAuth.js (Authentication)
- Axios (API requests)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/careflow-frontend.git
cd careflow-frontend
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Environment Variables

- `NEXT_PUBLIC_API_URL`: URL of your backend API
- `NEXTAUTH_SECRET`: A secure random string for NextAuth.js
- `NEXTAUTH_URL`: URL of your deployed frontend

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard page
│   ├── clients/          # Client management
│   ├── appointments/     # Appointment booking
│   ├── staff/            # Staff management
│   └── settings/         # Settings pages
├── components/           # Reusable components
├── lib/                  # Utilities and services
│   ├── api/              # API services
│   └── auth.ts           # Authentication configuration
└── types/                # TypeScript type definitions
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
