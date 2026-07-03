# Product Requirements Document (PRD)
## Hospital Management System (HMS)

**Version:** 1.0 (Draft — contains open decisions, see Section 11)
**Stack:** React.js (frontend) + NestJS (backend) + MongoDB (database)

---

## 1. Overview

A web application to manage core hospital operations: patient records, doctor scheduling, appointments, prescriptions, billing, and medicine inventory.

**What this system is NOT (until you say otherwise):**
- Not a multi-hospital / multi-branch system — single hospital instance assumed
- Not integrated with insurance claim processing
- Not handling lab equipment integration (lab charges are manually entered line items, not automated results)
- Not a telemedicine platform (no video consultation)

If any of these are actually in scope, say so — they change the data model significantly.

---

## 2. Users & Roles

| Role | Core Responsibility | Gap in your original doc |
|---|---|---|
| Admin | Full system control, manage doctors/patients/appointments, view reports | — |
| Receptionist | **Undefined in your original spec** | You listed this role but gave it no module. Assumption below. |
| Doctor | View appointments, patient details, add diagnosis/prescription | — |
| Patient | Register, view own appointments/prescriptions/bills | — |

**Assumption (flag if wrong):** Receptionist has Admin-lite permissions: can book/manage appointments and register patients, but cannot manage doctors, view financial reports, or manage medicine stock.

---

## 3. Functional Requirements

### 3.1 Authentication & Access Control
- Email/password login for all roles
- Password hashing (bcrypt)
- JWT access token (short-lived, 15 min) + refresh token (7 days, HttpOnly cookie)
- Role-based route guards (NestJS Guards + Decorators)
- Logout invalidates refresh token
- **Open question:** Does Patient self-register, or does Receptionist/Admin create patient accounts? These produce different registration flows. Assumed: patients can self-register; staff accounts are created by Admin only.

### 3.2 Admin Module
- Manage doctors: create, edit, deactivate (not hard delete — see 3.7)
- Manage patients: view, edit, deactivate
- Manage appointments: view all, override status, reassign doctor
- View reports (see 3.8)
- Manage staff accounts (Receptionist)

### 3.3 Doctor Module
- View only appointments assigned to self (not all appointments — access control matters here)
- View patient medical history for patients with an appointment with them (not all patients in the system — this is a privacy boundary you need to enforce, not just a UI filter)
- Add diagnosis (free text + structured fields: symptoms, diagnosis code if you want ICD-10 later)
- Add prescription: medicine name, dosage, duration, notes
- **Gap flagged:** Your original doc doesn't say whether a doctor can edit a past diagnosis/prescription after saving. Medical records typically require an audit trail, not silent edits. Assumption: prescriptions are append-only; corrections create a new version, old version retained.

### 3.4 Patient Module
- Registration (self-service): name, DOB, contact, emergency contact, medical history intake (optional fields)
- View own appointments (upcoming + history)
- View own prescriptions
- View own bills + payment status
- **Missing from original doc:** cancel/reschedule own appointment. Recommend adding this — without it, every reschedule becomes a phone call to reception, defeating the purpose of the module.

### 3.5 Appointment Module
- Book appointment: select doctor, date, time slot
- Slot availability must be doctor-defined (working hours + existing bookings), not open-ended free text
- **Critical gap — double-booking:** Original doc never addresses what happens when two patients try to book the same doctor/slot simultaneously.
  - **Required fix:** Use a unique compound index in MongoDB on (doctorId, date, timeSlot) with status != cancelled, and handle the duplicate-key error as "slot no longer available" on the booking endpoint. This must be enforced at the database level, not just checked in application code before insert — concurrent requests will race past an application-only check.
- Status flow: Pending → Confirmed → Completed / Cancelled
  - **Undefined:** who moves Pending → Confirmed? Auto-confirm on booking, or does Receptionist/Doctor approve first? Assumption: auto-confirm on booking; Admin/Receptionist can cancel.
- Cancellation reason field (recommended, not in original — needed for reporting on no-shows vs. cancellations)

### 3.6 Billing Module
- Create bill per completed appointment
- Line items: consultation fee, medicine charges, lab charges (optional)
- **Missing from original doc — must decide before build:**
  - Tax handling (flat rate? none?)
  - Discount / waiver capability, and who can apply it
  - Partial payment support, or is it strictly Paid/Unpaid?
  - Refund flow for cancelled billed appointments
- Payment status: Paid / Unpaid (Partial — recommend adding if partial payments are realistic for your hospital)
- Bill generation as PDF (recommended addition — "generate final bill" implies a printable/downloadable artifact, not just a database record)

### 3.7 Medicine Module
- Add medicine: name, unit price, stock quantity, expiry date (expiry not in original doc but standard for any pharmacy inventory — flag if intentionally excluded)
- Update stock: manual adjustment + automatic decrement on prescription dispense (decide: does prescribing a medicine auto-deduct stock, or is dispensing a separate action?)
- View available medicines with low-stock indicator
- **Soft delete, not hard delete**, for medicines and doctors — historical bills/prescriptions reference these records; deleting them breaks past records. Use an `isActive` flag instead.

### 3.8 Reports Module
- Total patients, appointments, doctors, earnings, pending payments
- **"Basic reports" was too vague to build from — specify now:**
  - Date range filter (today / this week / this month / custom)?
  - Export format (CSV, PDF, on-screen only)?
  - Per-doctor earnings breakdown, or hospital-wide only?

---

## 4. Data Model (high-level — not final schema)

```
User (base)
 ├─ role: admin | receptionist | doctor | patient
 ├─ email, passwordHash, name, phone, isActive

Doctor (extends User)
 ├─ specialization, workingHours[], consultationFee

Patient (extends User)
 ├─ dob, emergencyContact, medicalHistory[]

Appointment
 ├─ patientId, doctorId, date, timeSlot, status, cancellationReason

Diagnosis
 ├─ appointmentId, doctorId, patientId, symptoms, notes, createdAt, version

Prescription
 ├─ diagnosisId, medicines[{medicineId, dosage, duration}], createdAt, version

Bill
 ├─ appointmentId, patientId, lineItems[], tax, discount, total, paymentStatus, paidAmount

Medicine
 ├─ name, unitPrice, stockQty, expiryDate, isActive
```

This needs to be reviewed against actual field requirements before development starts — this is a starting point, not a final schema.

---

## 5. Non-Functional Requirements (absent from original doc — added)

- **Data privacy:** Patient medical data (diagnosis, prescriptions) is sensitive. At minimum: encrypt data at rest (MongoDB Atlas encryption), restrict field-level access by role, log all access to medical records (who viewed what, when).
- **Audit trail:** Every create/update on Appointment, Diagnosis, Prescription, Bill should log actor + timestamp. Original doc has no audit requirement — this is a gap for any real hospital deployment, not just a nice-to-have.
- **Performance:** Paginate all list views (patient list, appointment list, medicine list) — no unbounded queries.
- **Availability:** Not specified — decide if this is single-instance/best-effort, or needs uptime guarantees. Changes hosting decisions materially.

---

## 6. Tech Stack

| Layer | Choice | Note |
|---|---|---|
| Frontend | React.js + Vite | — |
| Backend | NestJS | Modular structure: one module per resource (auth, users, appointments, billing, medicines) |
| Database | MongoDB (Atlas) | With Mongoose |
| Auth | JWT (access + refresh) | bcrypt for password hashing |
| Validation | class-validator + DTOs (NestJS-native pattern) | — |
| API docs | Swagger (NestJS built-in module) | — |

**Verify current stable versions via npm before locking package.json** — don't hardcode version numbers from any reference document, including this one.

---

## 7. Suggested Pages (from original doc, unchanged — reasonable as-is)

Login, Dashboard, Patient List, Add Patient, Doctor List, Add Doctor, Appointment List, Book Appointment, Prescription Page, Billing Page, Medicine List, Reports Page

**Addition needed:** a Patient-facing portal is implied by the Patient Module (section 3.4) but not listed here as separate pages. Add: Patient Dashboard, My Appointments, My Prescriptions, My Bills.

---

## 8. Success Metrics (missing from original doc)

Not defined. A PRD without success metrics can't be evaluated after launch. Suggest deciding on at least:
- % of appointments booked without double-booking incidents (target: 0)
- Average time to generate a bill after appointment completion
- Report generation accuracy vs. manual reconciliation (for the first few months of parallel-run, if replacing a manual system)

---

## 9. Out of Scope (explicit, to prevent scope creep)

- SMS/email appointment reminders (add as a phase 2 if needed — requires nodemailer/SMS gateway integration not in original stack)
- Insurance claims processing
- Multi-branch/multi-hospital support
- Lab equipment integration
- Mobile app (web-responsive only, per original stack choice)

---

## 10. Assumptions Made in This PRD (review each one)

1. Receptionist has booking/patient-registration permissions but no financial or doctor-management access.
2. Patients self-register; staff accounts are Admin-created only.
3. Doctors cannot edit past prescriptions/diagnoses — corrections create new versions.
4. Appointments auto-confirm on booking (no manual approval step).
5. Doctors/medicines are soft-deleted, never hard-deleted.
6. Bill payment status will need a "Partial" state — flagged as a recommendation, not yet confirmed.

---

## 11. Open Decisions You Need to Make Before Development Starts

1. Tax and discount rules for billing
2. Refund process for cancelled but billed appointments
3. Whether patients can cancel/reschedule their own appointments
4. Report export requirements (format, filters)
5. Data retention / compliance requirements for medical records in your jurisdiction
6. Whether medicine stock auto-decrements on prescription or requires a separate dispense action

None of these are small details — each one changes the data model or a core workflow. Building without answering them means the developer decides for you, by default, usually in the direction of least effort.