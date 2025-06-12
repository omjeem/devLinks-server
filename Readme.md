# 🔐 Link Sharing App - Backend

This is the backend of the **Link Sharing App**, responsible for authentication, user management, OTP verification, and handling CRUD operations on user-submitted links.

Built using **Node.js**, **Express**, **MongoDB**, and follows a clean **MVC architecture** for scalable and maintainable code.

---

## ✨ Features

- Full user authentication:
  - Google Sign-In
  - Email & Password Sign-Up / Login
  - OTP-based login & verification
- JWT-based session management
- Secure password hashing
- Link CRUD (Create, Read, Update, Delete)
- Link reordering via API
- Environment-based configuration using `.env`
- CORS support for frontend integration
- Modular codebase using MVC pattern

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT
- Nodemailer (for OTPs)
- dotenv
- MVC architecture

---

## 📂 Folder Structure

/controllers
/models
/routes
/services
/middlewares
/utils


---

## ⚙️ Environment Setup

Create a `.env` file in the `backend/` folder using the example:

```bash
cp .env.example .env
```

## ⚙️ Run Locally

cd backend
npm install
npm run build
npm run start
