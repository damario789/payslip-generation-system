# payslip-generation-system

Payslip Generation System is a Node.js/Express application for managing employee payslips, built with TypeScript, Prisma ORM, PostgreSQL.

---

## Table of Contents

- [Getting Started](#getting-started)
- [API Usage](#api-usage)
- [Software Architecture](#software-architecture)
- [Development](#development)

---

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone https://github.com/damario789/payslip-generation-system.git
   cd payslip-generation-system
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in required values.

4. **Generate Prisma Client:**
   ```sh
   npm run generate
   ```

5. **Set up the database:**
   ```sh
   npm run migrate
   npm run seed
   ```

6. **Start the development server:**
   ```sh
   npm run dev
   ```

---

## API Usage

The API is documented and ready to test in Postman.  
**View and test all endpoints here:**  
[Postman Documentation](https://documenter.getpostman.com/view/16511646/2sB2x5HtHC)

### Example Endpoints

- **POST /employee/login**  
  Authenticate an employee and receive a JWT token.

- **POST /reimbursement**  
  Submit a new reimbursement.

- **POST /payslip**  
  Generate a new payslip.

> For full details, request/response examples, and authentication, see the [Postman Documentation](https://documenter.getpostman.com/view/16511646/2sB2x5HtHC).

---

## Software Architecture

- **Backend:** Node.js with Express, TypeScript
- **ORM:** Prisma for database access
- **Database:** PostgreSQL
- **Authentication:** JWT-based
- **Validation:** class-validator and class-transformer
- **Password Hashing:** bcrypt

![ER Diagram](./postgres%20-%20dealls.png)

---

## Development

- Use `npm run dev` for hot-reloading with nodemon.
- Update Prisma schema in `prisma/schema.prisma` and run `npm run migrate` after changes.
- Use TypeScript for all source files.

---

For more details, see the source code and comments in each file.