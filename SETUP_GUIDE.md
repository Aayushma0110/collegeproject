# Doctor Appointment System - Setup Guide

## Quick Start

This guide will help you set up and run the Doctor Appointment System backend.

## Prerequisites

- **Node.js**: v16 or higher ([Download](https://nodejs.org/))
- **PostgreSQL**: v12 or higher ([Download](https://www.postgresql.org/download/))
- **npm**: Comes with Node.js
- **Git**: For cloning the repository

## Step-by-Step Setup

### 1. Database Setup

**Option A: Create Database Manually**
```sql
CREATE DATABASE appointment;
```

**Option B: PostgreSQL CLI**
```bash
createdb appointment
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Environment Configuration

Update the `.env` file in the backend root directory:

```env
PORT=5050
DATABASE_URL=postgres://postgres:root@localhost:5432/appointment
JWT_SECRET=123ABC
```

**Important**: Replace `postgres:root` with your PostgreSQL username and password.

### 4. Run Database Migrations

```bash
npx prisma migrate deploy
```

This creates all necessary tables in your PostgreSQL database.

### 5. Seed Admin User (Optional)

Create an initial admin user:

```bash
node seedadmin.js
```

**Default Admin Credentials:**
- Email: `admin@example.com`
- Password: `AdminPass123!`

### 6. Start the Server

**Development Mode** (with auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

The server will start on `http://localhost:5050`

## Verify Installation

### Test Server Connection
```bash
curl http://localhost:5050
```

Expected response:
```
Hello from Doctor Appointment System Backend!
```

### Test Health Check
```bash
curl http://localhost:5050/api/users
```

This should return an empty array `[]` if the database is properly connected.

## Database Management

### View Database Schema
```bash
npx prisma studio
```

Opens an interactive database browser at `http://localhost:5555`

### Create New Migration
```bash
npx prisma migrate dev --name migration_name
```

### Reset Database (WARNING: Deletes all data)
```bash
npx prisma migrate reset
```

## Common Issues & Solutions

### Issue: Port Already in Use
**Solution**: Change the PORT in `.env`:
```env
PORT=5051
```

Or kill the process using the port:
```bash
# Windows
netstat -ano | findstr :5050
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5050
kill -9 <PID>
```

### Issue: Database Connection Error
**Solution**: 
1. Ensure PostgreSQL is running
2. Verify DATABASE_URL format
3. Check username and password
4. Test connection:
```bash
psql "postgres://postgres:root@localhost:5432/appointment"
```

### Issue: JWT Secret Not Set
**Solution**: Add `JWT_SECRET` to `.env`:
```env
JWT_SECRET=your_secret_key_here
```

### Issue: Migrations Not Running
**Solution**:
```bash
npx prisma migrate reset
npx prisma migrate deploy
```

### Issue: Module Not Found Errors
**Solution**: Reinstall dependencies:
```bash
rm -rf node_modules
npm install
```

## Project Structure

```
backend/
├── main.js                 # Entry point
├── seedadmin.js           # Admin seeding script
├── package.json           # Dependencies
├── .env                   # Environment variables
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Migration files
├── src/
│   ├── controller/        # Business logic
│   ├── middleware/        # Authentication & authorization
│   ├── routes/           # API endpoints
│   ├── utils/            # Helper functions
│   └── public/           # Static files
└── node_modules/         # Dependencies (auto-generated)
```

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/users | No | Register user |
| POST | /api/users/login | No | Login |
| POST | /api/doctors | No | Register doctor |
| POST | /api/appointments | Yes | Book appointment |
| POST | /api/payments | Yes | Create payment |
| POST | /api/reviews | Yes | Create review |
| GET | /api/admin/... | Yes (Admin) | Admin endpoints |

## Development Best Practices

### Use Environment Variables
Always use `.env` for sensitive data, never hardcode secrets.

### Run Migrations Before Deploy
```bash
npx prisma migrate deploy
```

### Keep JWT_SECRET Secure
Use a strong, random string for production:
```bash
openssl rand -base64 32
```

### Monitor Logs
Check console output for errors:
```
npm run dev
```

### Test API Endpoints
Use tools like:
- **Postman**: GUI for API testing
- **curl**: Command-line HTTP client
- **Thunder Client**: VS Code extension

## Next Steps

1. **Start the backend**: `npm run dev`
2. **Test endpoints**: Use Postman or curl
3. **Connect frontend**: Update frontend API URL to `http://localhost:5050/api`
4. **Customize**: Modify `.env` and database schema as needed

## Production Deployment

For production deployment:

1. Use environment-specific `.env` files
2. Set `NODE_ENV=production`
3. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start main.js --name "doctor-appointment-api"
   ```
4. Set up reverse proxy (Nginx/Apache)
5. Enable HTTPS
6. Configure CORS properly
7. Set strong JWT_SECRET
8. Use environment variables for all secrets

## Support & Documentation

- **Prisma Documentation**: https://www.prisma.io/docs/
- **Express Documentation**: https://expressjs.com/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **JWT Documentation**: https://jwt.io/

## License

ISC

---

For additional help, check the main [README.md](./README.md) or consult the API documentation.
