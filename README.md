# Doctor Appointment System - Backend

A comprehensive RESTful API backend for managing doctor appointments, payments, and reviews. Built with Node.js, Express, and PostgreSQL.

## Features

- **User Management**: Register, login, and manage users with different roles (Patient, Doctor, Admin)
- **Doctor Management**: Doctor registration, profile management, and availability scheduling
- **Appointment Booking**: Patients can book appointments with doctors
- **Payment Processing**: Support for multiple payment methods (Cash, Card, Stripe, Esewa, Khalti)
- **Reviews & Ratings**: Patients can review and rate doctors
- **Admin Dashboard**: Admin can manage doctors, appointments, and payments
- **Authentication**: JWT-based authentication for secure API access

## Prerequisites

- Node.js v16+
- PostgreSQL Database
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=5050
   DATABASE_URL=postgres://username:password@localhost:5432/appointment
   JWT_SECRET=your_secret_key_here
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate deploy
   ```

5. **Seed admin user (optional)**
   ```bash
   node seedadmin.js
   ```

## Running the Server

### Development mode with hot-reload:
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5050`

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (requires auth)
- `POST /api/users/login` - User login
- `POST /api/users/password-change` - Change password (requires auth)
- `DELETE /api/users/:id` - Delete user

### Doctors
- `POST /api/doctors` - Register as a doctor
- `GET /api/doctors` - Get all doctors (requires auth)
- `GET /api/doctors/:id` - Get doctor by ID
- `PUT /api/doctors/me/availability` - Update doctor availability (doctor only, requires auth)

### Appointments
- `POST /api/appointments` - Create appointment (patient only, requires auth)
- `GET /api/appointments` - Get user's appointments (requires auth)
- `GET /api/appointments/:id` - Get appointment by ID (requires auth)
- `PUT /api/appointments/:id` - Update appointment (requires auth)
- `DELETE /api/appointments/:id` - Cancel appointment (requires auth)

### Payments
- `POST /api/payments` - Create payment (requires auth)
- `GET /api/payments` - Get all payments (requires auth)
- `GET /api/payments/:id` - Get payment by ID (requires auth)
- `PUT /api/payments/:id` - Update payment status (requires auth)
- `DELETE /api/payments/:id` - Delete payment (requires auth)

### Reviews
- `POST /api/reviews` - Create review (requires auth)
- `GET /api/reviews/doctor/:doctorId` - Get reviews for a doctor

### Patients
- `GET /api/patients` - Get patient profile (requires auth)
- `PUT /api/patients/:id` - Update patient profile (requires auth)

### Admin
- `GET /api/admin/doctors/pending` - Get pending doctors (admin only, requires auth)
- `PUT /api/admin/doctors/:id/verify` - Approve/reject doctor (admin only, requires auth)
- `GET /api/admin/appointments` - Get all appointments (admin only, requires auth)
- `GET /api/admin/payments` - Get all payments (admin only, requires auth)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

## User Roles

- **PATIENT**: Can book appointments, write reviews, manage their profile
- **DOCTOR**: Can manage availability, view appointments, receive reviews
- **ADMIN**: Full access to manage doctors, appointments, and payments

## Request/Response Examples

### Login
```bash
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login Successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "phoneNumber": ["1234567890"]
  }
}
```

### Create Appointment
```bash
POST /api/appointments
Content-Type: application/json
Authorization: Bearer <token>

{
  "doctorId": 2,
  "scheduledAt": "2026-01-15T10:00:00.000Z"
}

Response:
{
  "message": "Appointment created successfully",
  "appointment": {
    "id": 1,
    "patientId": 1,
    "doctorId": 2,
    "scheduledAt": "2026-01-15T10:00:00.000Z",
    "status": "PENDING",
    "mode": "IN_PERSON",
    "createdAt": "2026-01-02T...",
    "duration": null
  }
}
```

## Error Handling

All API responses follow a consistent error format:

```json
{
  "error": "Error description",
  "message": "User-friendly error message"
}
```

Common HTTP Status Codes:
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key models:

- **User**: Stores patient, doctor, and admin information
- **Appointment**: Manages appointment bookings
- **Payment**: Tracks payment transactions
- **Review**: Stores patient reviews for doctors

See [schema.prisma](./prisma/schema.prisma) for the complete schema.

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Verify DATABASE_URL in .env is correct
- Run migrations: `npx prisma migrate deploy`

### JWT Token Issues
- Ensure JWT_SECRET is set in .env
- Check token format in Authorization header (Bearer <token>)
- Tokens expire after 100 hours

### Port Already in Use
- Change PORT in .env file
- Or kill the process using the port

## Development

### Run migrations
```bash
npx prisma migrate dev --name <migration_name>
```

### View database (Prisma Studio)
```bash
npx prisma studio
```

### Generate Prisma Client
```bash
npx prisma generate
```

## License

ISC
