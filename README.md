# ⚙️ Tender Management System – Backend

**API Base URL:** [https://tender-management-backend.onrender.com](https://tender-management-backend.onrender.com)

---

## 📖 Overview

This is the **backend** of the **Tender Management System**, built using **Node.js**, **Express**, and **MongoDB**.  
It powers the frontend deployed on Vercel and handles:
- User authentication (JWT)
- Role management (Super Admin, Admin, Vendor)
- Tender creation, editing, and deletion
- Cloudinary file uploads
- Bidding and notifications

---

## 🛠️ Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB + Mongoose**
- **Cloudinary**
- **Multer** (for file upload)
- **JWT Authentication**
- **CORS**
- **Render Deployment**

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone https://github.com/Argha782/tender_management_backend.git
cd tender_management_backend
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Create a `.env` file in the root folder
Add the following environment variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=https://tender-management-frontend.vercel.app
```

### 4️⃣ Start the development server
```bash
npm run dev
```

Server will run at [http://localhost:5000](http://localhost:5000)

---

## 📂 Folder Structure
```
tender_management_backend/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── utils/
├── public/
├── server.js
├── package.json
└── .env
```

---

## 🔗 Related Repositories
- **Frontend Repository:** [https://github.com/Argha782/tender_management_frontend](https://github.com/Argha782/tender_management_frontend)

---

## 🚀 Deployment
The backend is hosted on **Render**.  
Make sure your Render CORS settings allow requests from your frontend domain:
```
https://tender-management-frontend.vercel.app
```

---

## 👨‍💻 Author
**Argha Saha**  
📧 [arghasaha782@gmail.com]  
🌐 [[LinkedIn Profile](https://www.linkedin.com/in/argha-saha-80527a208/)]
