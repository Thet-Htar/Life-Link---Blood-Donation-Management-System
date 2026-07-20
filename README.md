# LifeLink

## Project Overview

LifeLink provides three main user experiences:

- **Administrator:** reviews hospital registrations, approves hospitals, and manages donor and hospital account access.
- **Hospital:** creates donation events, manages private donation bookings, tracks blood inventory, and reviews donor certificates.
- **Donor:** discovers donation events, registers for events, creates private bookings, views donation history, and accesses certificates.

The project uses a React frontend and a Spring Boot backend with JWT authentication and a MySQL database.

## Main Features

### Authentication and Access Control

- JWT access and refresh token authentication
- Role-based authorization for `ADMIN`, `HOSPITAL`, and `DONOR`
- Protected frontend routes
- Account lock and unlock controls
- Hospital approval workflow before portal access

### Administrator Portal

- Administrative dashboard overview
- Pending hospital approval management
- Hospital approval confirmation and email notification
- Search and pagination for hospital accounts
- Search and pagination for donor accounts
- Lock and unlock donor accounts
- Lock and unlock hospital accounts

### Hospital Portal

- Hospital dashboard overview
- Create donation events as drafts
- Publish completed donation events
- Edit draft and published events
- Manage registered donor outcomes
- Manage private donation bookings
- Add and manage blood inventory units
- Reserve, release, issue, expire, and discard blood units
- View and manage donor certificates
- Hospital profile management

### Donor Portal

- Donor dashboard and eligibility information
- Recommended donation events
- Register for and cancel event registration
- Create private hospital donation bookings
- View donor profile and donation history
- View donation certificates

### Public Features

- Public homepage with published donation events
- Public certificate verification
- Hospital and donor registration
- About LifeLink page

## Blood Inventory Workflow

Each blood bag is stored as one inventory record.

Supported statuses:

```text
AVAILABLE
RESERVED
ISSUED
EXPIRED
DISCARDED
```

Supported sources:

```text
MANUAL_ENTRY
DONATION_EVENT
PRIVATE_BOOKING
```

Main inventory rules:

- Only `AVAILABLE` units can be reserved.
- `AVAILABLE` or `RESERVED` units can be issued.
- A reserved unit can be released back to `AVAILABLE`.
- `EXPIRED` and `DISCARDED` units cannot be used.
- An `ISSUED` unit cannot be restored to `AVAILABLE`.
- The expiry date must be after the collection date.
- Hospitals can manage only their own inventory.
- One completed event registration can create at most one inventory unit.
- One completed private booking can create at most one inventory unit.

## Certificate Workflow

When a donation is completed, LifeLink creates one active donor certificate linked to the completed donation record.

Certificate data includes:

- Unique certificate number
- Public verification code
- Donor name and donor code
- Blood type
- Hospital name
- Donation event title
- Donation date
- Issued timestamp
- Certificate status

Example public verification endpoint:

```text
GET /api/lifelink/public/certificates/verify/{verificationCode}
```

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Zustand
- Lucide React

### Backend

- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- JWT authentication
- Jakarta Validation
- MySQL
- Java Mail

##Project Structure

```text
lifelink/
                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── types/
│   └── package.json
│
├── server/                 # Spring Boot backend
│   ├── src/main/java/
│   ├── src/main/resources/
│   └── pom.xml
│
└── README.md
```


## Prerequisites

Install the following tools before running the project:

- Java 17 or later
- Maven 3.9 or Maven Wrapper
- Node.js 18 or later
- npm
- MySQL 8 or later
- Git

## Database Setup

Create a MySQL database:

```sql
CREATE DATABASE lifelink
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

## Backend Configuration

Configure the backend using environment variables or your local Spring configuration file.

Example development configuration:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/lifelink
spring.datasource.username=YOUR_DATABASE_USERNAME
spring.datasource.password=YOUR_DATABASE_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

server.servlet.context-path=/api

app.jwt.secret=REPLACE_WITH_A_LONG_RANDOM_SECRET
app.jwt.access-token-expiration=900000
app.jwt.refresh-token-expiration=604800000
```

Example mail settings:

```properties
spring.mail.host=smtp.example.com
spring.mail.port=587
spring.mail.username=YOUR_MAIL_USERNAME
spring.mail.password=YOUR_MAIL_PASSWORD
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```


## Run the Backend

From the backend directory:

```bash
./mvnw spring-boot:run
```

On Windows:

```bash
mvnw.cmd spring-boot:run
```

Without the Maven Wrapper:

```bash
mvn spring-boot:run
```

The API is expected to run at:

```text
http://localhost:8080/api
```

## Frontend Configuration

Create a frontend environment file such as `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Make sure your Axios configuration uses the same base URL.

Example:

```ts
import axios from "axios";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ??
    "http://localhost:8080/api",
});
```

## Run the Frontend

From the frontend directory:

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Important Routes

### Public Routes

```text
/
/about
/login
/register
```

### Administrator Routes

```text
/admin/dashboard
/admin/approvals
/admin/hospitals
/admin/donors
```

### Hospital Routes

```text
/hospital/dashboard
/hospital/events
/hospital/bookings
/hospital/inventory
/hospital/certificates
/hospital/profile
```

### Donor Routes

```text
/donor
/donor/events
/donor/private-bookings
/donor/certificates
/donor/profile
```

## Typical Demo Workflow

### Hospital Registration and Approval

1. Register a hospital account.
2. Sign in as an administrator.
3. Open **Hospital Approvals**.
4. Approve the pending hospital.
5. Confirm that the approval email is sent.
6. Sign in using the approved hospital account.

### Donation Event Demonstration

1. Open the hospital event page.
2. Create and save an event as a draft.
3. Complete the required fields.
4. Publish the event.
5. Sign in as a donor.
6. Register for the event.
7. Return to the hospital account and review the registration.

### Blood Inventory Demonstration

1. Open **Blood Inventory**.
2. Add a blood unit using `MANUAL_ENTRY`, a completed event registration, or a completed private booking.
3. Reserve an available unit.
4. Release or issue the reserved unit.
5. Review the inventory summary by status and blood type.


Recommended conventions:

```text
Hospital: Mandalay LifeCare General Hospital
Patient Reference: DEMO-PATIENT-001
Blood Unit Code: DEMO-H2-0001
Notes: LifeLink demo record for presentation
```


## Future Improvements

- Automated inventory creation from completed donations
- QR codes for certificate verification
- Blood unit barcode support
- Notification preferences
- Event capacity waiting lists
- Advanced inventory expiry alerts
- Audit logs
- Reporting and export tools
- Automated testing coverage
- Docker deployment
- CI/CD workflow

## Disclaimer

LifeLink is a portfolio and educational project. All displayed people, hospitals, blood units, bookings, patient references, and certificates should be treated as fictional demonstration data. The software is not approved for medical, diagnostic, transfusion, emergency, or production healthcare use.


##Author

Built by Hnaung Thet Htar Wai Full Stack Java + React Developer

