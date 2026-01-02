# Best Practices & Development Guide

## 🎯 Architecture Overview

The Doctor Appointment System follows a clean, layered architecture:

```
Request → Routes → Middleware → Controller → Database (Prisma)
  ↑                                           ↓
  └─────────── Response ←─────────────────────┘
```

### Layers

1. **Routes** (`src/routes/`) - Define API endpoints
2. **Middleware** (`src/middleware/`) - Handle authentication & authorization
3. **Controllers** (`src/controller/`) - Business logic
4. **Database** (`prisma/`) - Data models and migrations

## 🔐 Security Best Practices

### 1. Authentication
- Always use JWT tokens with Bearer prefix
- Tokens expire after 100 hours (configurable)
- Never expose JWT_SECRET in code or client

### 2. Password Hashing
- Passwords hashed with bcrypt (10 salt rounds)
- Never store plain text passwords
- Use strong password validation

### 3. Authorization
- Use role-based access control (RBAC)
- Check user role in middleware before processing
- Verify resource ownership for user-specific operations

### 4. Input Validation
```javascript
// Example: Validate user input
if (!email || !password) {
  return res.status(400).json({ error: "Email and password required" });
}

// Check enum values
if (!["PATIENT", "DOCTOR", "ADMIN"].includes(role)) {
  return res.status(400).json({ error: "Invalid role" });
}
```

### 5. Error Handling
```javascript
try {
  // Operation
} catch (error) {
  console.error(error);
  return res.status(500).json({ error: "Internal server error" });
}
```

## 💾 Database Best Practices

### 1. Use Transactions for Critical Operations
```javascript
const result = await prisma.$transaction([
  prisma.model1.update(...),
  prisma.model2.create(...)
]);
```

### 2. Select Only Required Fields
```javascript
// ✅ Good - Only fetch needed fields
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: { id: true, name: true, email: true }
});

// ❌ Bad - Fetches entire record with password
const user = await prisma.user.findUnique({ where: { id: 1 } });
```

### 3. Use Proper Relationships
```javascript
// ✅ Include related data efficiently
const appointment = await prisma.appointment.findUnique({
  where: { id: 1 },
  include: {
    doctor: { select: { id: true, name: true } },
    patient: { select: { id: true, name: true } }
  }
});
```

### 4. Pagination for Large Results
```javascript
const page = Math.max(1, parseInt(req.query.page || '1', 10));
const perPage = Math.min(50, parseInt(req.query.perPage || '10', 10));
const skip = (page - 1) * perPage;

const results = await prisma.model.findMany({
  skip,
  take: perPage,
  orderBy: { createdAt: 'desc' }
});
```

## 📝 Code Conventions

### 1. Naming Conventions
```javascript
// Controllers
export const createAppointment = async (req, res) => { }
export const getAppointments = async (req, res) => { }
export const updateAppointment = async (req, res) => { }
export const deleteAppointment = async (req, res) => { }

// Variables
const userId = parseInt(req.params.id);
const doctorName = doctor.name;

// Routes
router.get("/", getAll);
router.post("/", create);
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", delete);
```

### 2. Error Responses
```javascript
// Format: { error: "message" } or { message: "message" }
res.status(400).json({ error: "Invalid input" });
res.status(401).json({ message: "Unauthorized" });
res.status(404).json({ error: "Not found" });
```

### 3. Success Responses
```javascript
// Include message and data
res.status(201).json({
  message: "Created successfully",
  appointment: appointmentData
});

// Or just data
res.json(appointments);
```

## 🔄 Common Patterns

### Pattern 1: CRUD Operations
```javascript
export const create = async (req, res) => {
  try {
    // Validate input
    if (!req.body.required) return res.status(400).json({ error: "Required field" });
    
    // Create
    const item = await prisma.model.create({ data: req.body });
    
    // Response
    res.status(201).json({ message: "Created", item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Pattern 2: Protected Routes
```javascript
// In routes file
router.post("/", auth, isDoctor, controller.create);

// In middleware
export const isDoctor = (req, res, next) => {
  if (req.user.role !== "DOCTOR") {
    return res.status(403).json({ message: "Doctor only" });
  }
  next();
};
```

### Pattern 3: Resource Ownership Verification
```javascript
// Ensure user can only access their own resources
const resource = await prisma.appointment.findUnique({ 
  where: { id } 
});

if (resource.patientId !== req.user.id && req.user.role !== "ADMIN") {
  return res.status(403).json({ message: "Access denied" });
}
```

## 📊 Logging Best Practices

### 1. Log Important Operations
```javascript
console.log('User login attempt:', email);
console.log('Appointment created:', appointmentId);
console.log('Payment processed:', transactionId);
```

### 2. Log Errors with Details
```javascript
console.error('Database error:', error);
console.error('Payment API error:', error.message);
```

### 3. Use Appropriate Levels (if using logging library)
```javascript
logger.info('Operation successful');
logger.warn('Unusual activity detected');
logger.error('Critical error occurred');
```

## ♻️ DRY (Don't Repeat Yourself) Principles

### 1. Extract Common Validations
```javascript
// ✅ Good - Reusable validation
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Use in multiple controllers
if (!validateEmail(req.body.email)) {
  return res.status(400).json({ error: "Invalid email" });
}
```

### 2. Extract Common Database Queries
```javascript
// ✅ Good - Reusable query
const getAppointmentWithDetails = (id) => {
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      doctor: { select: { id: true, name: true, specialty: true } },
      patient: { select: { id: true, name: true, email: true } },
      payment: true,
      review: true
    }
  });
};
```

## 🚀 Performance Tips

### 1. Index Important Columns
```prisma
// In schema.prisma
model User {
  id String @id @default(cuid())
  email String @unique  // Already indexed for uniqueness
  role Role
  
  @@index([role])  // Add index for filtered queries
}
```

### 2. Cache Frequently Accessed Data
```javascript
// For frequently requested doctor list
const cachedDoctors = new Map();

export const getDoctors = async (req, res) => {
  if (cachedDoctors.has('all')) {
    return res.json(cachedDoctors.get('all'));
  }
  
  const doctors = await prisma.user.findMany({
    where: { role: "DOCTOR" }
  });
  
  cachedDoctors.set('all', doctors);
  res.json(doctors);
};
```

### 3. Use Pagination
```javascript
// Don't fetch all records at once
const appointments = await prisma.appointment.findMany({
  skip: (page - 1) * perPage,
  take: perPage
});
```

## 🧪 Testing Approach

### 1. Test Authentication
```bash
# Without token
curl http://localhost:5050/api/appointments

# With invalid token
curl -H "Authorization: Bearer invalid" http://localhost:5050/api/appointments

# With valid token
curl -H "Authorization: Bearer <valid_token>" http://localhost:5050/api/appointments
```

### 2. Test Validation
```bash
# Missing required field
curl -X POST http://localhost:5050/api/users -d '{"email":"test@test.com"}'

# Invalid data type
curl -X POST http://localhost:5050/api/appointments -d '{"doctorId":"abc"}'
```

### 3. Test Authorization
```bash
# Patient trying to approve doctors
curl -X PUT http://localhost:5050/api/admin/doctors/1/verify \
  -H "Authorization: Bearer <patient_token>"
```

## 📈 Monitoring & Debugging

### 1. Enable Detailed Logging
```javascript
// In main.js during development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}
```

### 2. Use Prisma Studio
```bash
npx prisma studio
```

### 3. Check Database Directly
```bash
psql "postgres://user:pass@localhost:5432/appointment"
SELECT * FROM "User" WHERE role = 'DOCTOR';
```

## 🔄 Deployment Checklist

### Before Deploying
- [ ] All tests passing
- [ ] No console.log() statements (or debug-only)
- [ ] Error handling implemented
- [ ] Database backups configured
- [ ] Environment variables set correctly
- [ ] HTTPS/SSL configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (Prisma handles this)
- [ ] CORS properly configured

### Production Configuration
```env
NODE_ENV=production
PORT=5050
DATABASE_URL=postgres://prod_user:secure_pass@prod_db:5432/appointment
JWT_SECRET=very_long_random_secret_key_here
```

## 📚 Further Learning

- **Express Best Practices**: https://expressjs.com/en/advanced/best-practice-performance.html
- **Prisma Best Practices**: https://www.prisma.io/docs/guides/performance
- **Security Headers**: https://cheatsheetseries.owasp.org/
- **REST API Design**: https://restfulapi.net/
- **Node.js Performance**: https://nodejs.org/en/docs/guides/nodejs-performance/

## 💡 Tips for Maintenance

1. **Keep Dependencies Updated**
   ```bash
   npm update
   npm audit
   ```

2. **Monitor Performance**
   - Use slow query logs
   - Monitor database connection pool
   - Track API response times

3. **Regular Backups**
   ```bash
   pg_dump appointment > backup_$(date +%Y%m%d).sql
   ```

4. **Documentation**
   - Keep README updated
   - Document API changes
   - Maintain changelog

---

Following these best practices ensures your backend is secure, performant, and maintainable!
