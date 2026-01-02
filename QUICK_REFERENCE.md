# Quick Reference Guide

## 🚀 Start Backend
```bash
npm run dev      # Development mode (port 5050)
npm start        # Production mode
```

## 🔑 Default Admin Login
```
Email: admin@example.com
Password: AdminPass123!
```

## 📱 Key API Endpoints

### Authentication
```
POST   /api/users/login              - User login
POST   /api/users                    - Register user
POST   /api/users/password-change    - Change password (auth required)
```

### Doctors
```
POST   /api/doctors                  - Register doctor
GET    /api/doctors                  - List all doctors (auth required)
GET    /api/doctors/:id              - Get doctor details
PUT    /api/doctors/me/availability  - Update availability (doctor auth)
```

### Appointments
```
POST   /api/appointments             - Create appointment (patient auth)
GET    /api/appointments             - Get my appointments (auth)
GET    /api/appointments/:id         - Get appointment (auth)
PUT    /api/appointments/:id         - Update appointment (auth)
DELETE /api/appointments/:id         - Cancel appointment (auth)
```

### Payments
```
POST   /api/payments                 - Create payment (auth)
GET    /api/payments                 - Get payments (auth)
GET    /api/payments/:id             - Get payment details (auth)
PUT    /api/payments/:id             - Update payment (auth)
DELETE /api/payments/:id             - Delete payment (auth)
```

### Reviews
```
POST   /api/reviews                  - Create review (auth)
GET    /api/reviews/doctor/:id       - Get doctor reviews
```

### Admin
```
GET    /api/admin/doctors/pending    - Pending doctors (admin auth)
PUT    /api/admin/doctors/:id/verify - Approve/reject doctor (admin)
GET    /api/admin/appointments       - All appointments (admin)
GET    /api/admin/payments           - All payments (admin)
```

## 🔐 Authentication Header
```
Authorization: Bearer <token>
```

## 📊 User Roles
- **PATIENT** - Can book appointments, write reviews
- **DOCTOR** - Can manage availability, view appointments
- **ADMIN** - Full access to all resources

## 💾 Database
```bash
npx prisma studio           # View/manage database
npx prisma migrate deploy   # Apply migrations
npx prisma migrate reset    # Reset database
```

## 📝 Logging In

### As Patient
1. Register: `POST /api/users` with role="PATIENT"
2. Login: `POST /api/users/login`
3. Use returned token in Authorization header

### As Doctor
1. Register: `POST /api/doctors`
2. Wait for admin approval
3. Login: Use email and password

### As Admin
- Default: admin@example.com / AdminPass123!
- Or seed: `node seedadmin.js`

## ⚙️ Environment Variables (.env)
```env
PORT=5050
DATABASE_URL=postgres://postgres:root@localhost:5432/appointment
JWT_SECRET=123ABC
```

## 🧪 Test with curl

### Login Example
```bash
curl -X POST http://localhost:5050/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"AdminPass123!"}'
```

### Create Appointment
```bash
curl -X POST http://localhost:5050/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"doctorId":2,"scheduledAt":"2026-01-15T10:00:00Z"}'
```

## 📚 Documentation Files
- `README.md` - Full API documentation
- `SETUP_GUIDE.md` - Installation and troubleshooting
- `API_TESTING.md` - Complete testing examples
- `COMPLETION_SUMMARY.md` - What was completed

## 🔧 Troubleshooting

### Port in use?
Change PORT in .env

### Database connection error?
Check DATABASE_URL is correct and PostgreSQL is running

### JWT errors?
Ensure JWT_SECRET is in .env

### Module not found?
```bash
npm install
```

## 📋 Checklist Before Deployment
- [ ] Database is backed up
- [ ] .env has correct DATABASE_URL
- [ ] JWT_SECRET is strong and secure
- [ ] All migrations applied: `npx prisma migrate deploy`
- [ ] Test endpoints with curl or Postman
- [ ] Frontend points to correct API URL
- [ ] CORS is configured properly

## 🚀 Deploy to Production
1. Set up production database
2. Update .env with production values
3. Run migrations: `npx prisma migrate deploy`
4. Use process manager (PM2):
   ```bash
   npm install -g pm2
   pm2 start main.js --name "doctor-api"
   ```
5. Set up reverse proxy (Nginx)
6. Enable HTTPS/SSL

## 📞 Support Resources
- Express: https://expressjs.com/
- Prisma: https://www.prisma.io/docs/
- PostgreSQL: https://www.postgresql.org/docs/
- JWT: https://jwt.io/

---

For detailed information, see the full documentation files.
