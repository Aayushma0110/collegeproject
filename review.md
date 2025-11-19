# Code Review: Doctor Appointment System
Here is a review of the Doctor Appointment System project. The codebase has a solid foundation with a clear separation of concerns using Express, Prisma, and a role-based user system.

This review identifies several key areas for improvement, focusing on fixing bugs, removing redundant code, and correctly implementing the intended features. Each point includes a "What to do" section with a pseudo-solution.

---

### 1. Critical Bug: Non-Existent `History` Model

**Observation**: The `history.controller.js` attempts to query a `History` model (e.g., `prisma.history.findMany`). However, this model is not defined in your `prisma/schema.prisma` file, which will cause the application to crash whenever history-related endpoints are called.

Based on our discussion, the "history" feature is meant to show a user's appointment history. The `Appointment` model already contains all the necessary data for this (patient, doctor, status, date). The `history` controller and routes are therefore redundant.

**Suggestion**: Remove the unnecessary `history` files and create new, correct API endpoints for fetching appointment history from the `Appointment` model.

**What to do**:

1.  **Delete Unused Files**:
    *   `src/controller/history.controller.js`
    *   `src/routes/history.routes.js`

2.  **Create New API Endpoints for Appointment History**:
    *   **In `src/routes/user.router.js`**, add a route for a user to get their own appointment history.
      ```javascript
      // Pseudo-solution for user.router.js
      // ... existing routes
      router.get("/me/appointments", auth, getMyAppointmentHistory); 
      ```

    *   **In `src/controller/user.controller.js`**, add the controller logic. This single function can serve both patients and doctors.
      ```javascript
      // Pseudo-solution for user.controller.js
      export const getMyAppointmentHistory = async (req, res) => {
          const userId = req.user.id;
          const userRole = req.user.role;

          let whereCondition = {};
          if (userRole === 'PATIENT') {
              whereCondition = { patientId: userId };
          } else if (userRole === 'DOCTOR') {
              whereCondition = { doctorId: userId };
          } else {
              // Admins can see all appointments, or you can restrict this
              whereCondition = {}; 
          }

          const appointments = await prisma.appointment.findMany({
              where: whereCondition,
              include: {
                  doctor: { select: { name: true, specialty: true } },
                  patient: { select: { name: true } }
              },
              orderBy: { scheduledAt: 'desc' }
          });

          res.json(appointments);
      };
      ```

---

### 2. Feature Implementation: Doctor Reviews and Ratings

**Observation**: The `User` model has a `ratings` field, but there is no mechanism to submit or calculate ratings. A robust system should tie reviews to specific, completed appointments.

**Suggestion**: Create a new `Review` model and the associated APIs to allow patients to review doctors after an appointment is completed. The doctor's average rating can then be calculated and updated.

**What to do**:

1.  **Update `prisma/schema.prisma`**:
    *   Add a `Review` model.
    *   Add relations to the `User` and `Appointment` models.

      ```prisma
      // Pseudo-solution for schema.prisma

      model User {
        // ... existing fields
        reviewsGiven    Review[] @relation("ReviewsGiven")
        reviewsReceived Review[] @relation("ReviewsReceived")
      }

      model Appointment {
        // ... existing fields
        review Review?
      }

      model Review {
        id            Int      @id @default(autoincrement())
        rating        Int      // A rating from 1 to 5
        comment       String?
        
        appointment   Appointment @relation(fields: [appointmentId], references: [id])
        appointmentId Int      @unique // One review per appointment

        reviewer      User     @relation("ReviewsGiven", fields: [reviewerId], references: [id])
        reviewerId    Int      // The patient who wrote the review

        doctor        User     @relation("ReviewsReceived", fields: [doctorId], references: [id])
        doctorId      Int      // The doctor being reviewed

        createdAt     DateTime @default(now())
      }
      ```
    *   Run `npx prisma migrate dev --name add_review_model` to apply the schema changes.

2.  **Create Review Files**:
    *   `src/controller/review.controller.js`
    *   `src/routes/review.routes.js`

3.  **Implement Review Logic**:
    *   **In `review.controller.js`**:
      ```javascript
      // Pseudo-solution for review.controller.js
      
      // 1. Function to create a review
      export const createReview = async (req, res) => {
          const { appointmentId, rating, comment } = req.body;
          const patientId = req.user.id;

          // 1. Check if appointment exists and is COMPLETED
          // 2. Check if the logged-in user was the patient for this appointment
          // 3. Create the review in the database
          // 4. Recalculate and update the doctor's average rating
      };

      // 2. Function to get reviews for a doctor
      export const getDoctorReviews = async (req, res) => {
          const { doctorId } = req.params;
          // Fetch all reviews for the given doctorId
      };
      ```

4.  **Add Routes**:
    *   **In `review.routes.js`**:
      ```javascript
      // Pseudo-solution for review.routes.js
      router.post("/", auth, isPatient, createReview);
      router.get("/doctor/:doctorId", getDoctorReviews);
      ```
    *   **In `src/routes/routes.js`**, register the new review routes: `router.use("/reviews", reviewRoutes);`.

---

### 3. Routing and Middleware Bugs

**Observation**: There are several issues with route definitions, middleware usage, and route registration that make parts of the API unreachable or incorrect.

*   `patient.routes.js` is never used.
*   `doctor.routes.js` uses `verifyToken`, which is not defined in that file. It should use the `auth` middleware.
*   `appointment.routes.js` has incorrect paths like `/appointment/me` and `/appointment/:id/status:id`.
*   `admin.routes.js` paths are redundant (e.g., `/api/admin/admin/doctor`).

**Suggestion**: Correct all route paths, ensure proper middleware is used, and register all route files in `routes.js`.

**What to do**:

1.  **Fix `src/routes/routes.js`**:
    *   Add the missing `patientRoutes`.
      ```javascript
      // Pseudo-solution for routes.js
      import patientRoutes from "./patient.routes.js";
      // ...
      router.use("/patients", patientRoutes);
      ```

2.  **Fix `src/routes/doctor.routes.js`**:
    *   Replace `verifyToken` with `auth`.
      ```javascript
      // Pseudo-solution for doctor.routes.js
      router.put("/me/availability", auth, isDoctor, updateAvailability); 
      ```

3.  **Fix `src/routes/appointment.routes.js`**:
    *   Correct the paths to be more RESTful and remove the invalid syntax.
      ```javascript
      // Pseudo-solution for appointment.routes.js
      router.post("/", auth, createAppointment); // Let's protect this route       
      router.get("/me", auth, getAppointments); // This should get the user's appointments, not all
      router.get("/:id", auth, getAppointmentById);    
      router.put("/:id", auth, updateAppointment); // Generic update for status or rescheduling     
      router.delete("/:id", auth, deleteAppointment);
      ```
      *Note: You will need to update the `getAppointments` controller to return appointments based on the logged-in user's role and ID, similar to the `getMyAppointmentHistory` function suggested above.*

4.  **Fix `src/routes/admin.routes.js`**:
    *   Remove the redundant `/admin` prefix from each path.
      ```javascript
      // Pseudo-solution for admin.routes.js
      router.get("/doctors/pending", auth, isAdmin, getPendingDoctors);
      router.put("/doctors/:id/verify", auth, isAdmin, verifyDoctor);
      router.get("/appointments", auth, isAdmin, getAllAppointments);
      router.get("/payments", auth, isAdmin, getAllPayments);
      ```

---

### 4. Code Quality and Minor Bugs

**Observation**: There are several smaller issues that affect code readability, maintainability, and correctness.

*   **File Uploads**: The `saveProfilePicture` function is commented out in `user.controller.js`, breaking file uploads.
*   **Inconsistent Naming**: The project has `user.router.js` (singular) and `doctor.routes.js` (plural). The `User` model uses `phoneNumber`, but the login response sends `phone_number`.
*   **Unused Code**: The `patient.js` middleware exists but is not used anywhere.

**Suggestion**: Clean up the code by fixing these inconsistencies, removing dead code, and re-enabling broken features.

**What to do**:

1.  **Fix File Uploads**:
    *   In `user.controller.js`, remove the commented-out `saveProfilePicture` function.
    *   Import it from `src/utils/upload.js` at the top of the file: `import { saveProfilePicture } from '../utils/upload.js';`.
    *   Ensure you have a package to handle file uploads, like `express-fileupload`. If not, install it (`npm install express-fileupload`) and register it in `main.js`:
      ```javascript
      import fileUpload from 'express-fileupload';
      app.use(fileUpload());
      ```

2.  **Standardize Naming**:
    *   Rename `user.router.js` to `user.routes.js` for consistency. Remember to update the import in `routes.js`.
    *   In `user.controller.js`, inside `loginUser`, change `phone_number` to `phoneNumber` to match the Prisma schema.

3.  **Apply `isPatient` Middleware**:
    *   In `appointment.routes.js`, ensure only patients can create appointments.
      ```javascript
      import { isPatient } from '../middleware/patient.js';
      router.post("/", auth, isPatient, createAppointment);
      ```