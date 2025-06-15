# 🧠 Online Learning Management System (OLMS)

A full-featured, scalable **Online Learning Management System** built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). This system supports course enrollment, media integration, role-based dashboards, payment handling, and a student doubt system.

---

## 📌 Table of Contents

- [🚀 Features](#-features)
- [🛠️ Tech Stack](#-tech-stack)
- [📷 Screenshots](#-screenshots)
- [📦 Installation](#-installation)
- [⚙️ Usage](#-usage)
- [🔐 Roles & Permissions](#-roles--permissions)
- [📁 Project Structure](#-project-structure)
- [📈 Future Enhancements](#-future-enhancements)
- [📝 License](#-license)

---

## 🚀 Features

- 🔒 **JWT Authentication**  
- 🧑‍💼 **Admin & Student Roles**
- 📚 **Course Management & Enrollment**
- 💬 **Doubt Submission & Resolution System**
- 💳 **Payment Gateway Integration (Razorpay)**
- 📦 **Cloudinary for Media Storage**
- 📊 **Role-Based Dashboards**
- 📱 **Fully Responsive UI** (Mobile, Tablet, Desktop)

---

## 🛠️ Tech Stack

**Frontend:**  
- React.js  
- Tailwind CSS  

**Backend:**  
- Node.js  
- Express.js  
- MongoDB (Mongoose)  

**Other Integrations:**  
- Cloudinary (Image & Video Uploads)  
- Razorpay (Secure Payments)  
- JWT (Authentication & Authorization)  

---

## 📦 Installation

### Prerequisites
- Node.js & npm
- MongoDB running locally or MongoDB Atlas
- Cloudinary account
- Razorpay account

### 1. Clone the Repository

```bash
git clone https://github.com/vipinyadav01/onlineLearningManagementSystem.git
cd onlineLearningManagementSystem
````

### 2. Setup Environment Variables

Create `.env` files in both the `client/` and `server/` directories.

#### Example for `/server/.env`

```
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### 3. Run the Application

#### Admin Dashboard
```bash
cd admin
npm install
npm run dev
```

#### Backend (Node.js/Express)

```bash
cd server
npm install
npm run dev
```

#### Frontend (React.js)

```bash
cd client
npm install
npm run dev
```

---

## ⚙️ Usage

* Register/Login as a user or admin
* Browse and enroll in courses
* Ask doubts and view replies
* Make secure payments for premium content
* Admins can create/edit/delete courses and manage users

---

## 🔐 Roles & Permissions

| Role    | Permissions                                   |
| ------- | --------------------------------------------- |
| Admin   | Manage users, courses, doubts, etc.           |
| Student | Enroll in courses, access content, ask doubts |

---

## 📁 Project Structure

```
olms/
├── admin/ # React Admin Dashboard
│ └── src/
│ ├── components/
│ ├── pages/
│ └── context/
├── client/ # React Client (Student) Frontend
│ └── src/
│ ├── components/
│ ├── pages/
│ └── context/
├── server/ # Node/Express Backend
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ └── utils/
├── README.md
```

---

## 📈 Future Enhancements

* 📝 Quiz & Assessment System
* 🏆 Certificate Generation
* 🔔 Notifications System
* 📬 Real-Time Messaging
* 📊 Course Progress Tracking

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

> 💬 For contributions, issues, or enhancements — feel free to open a PR or create an issue!

```

---

If you want, I can generate the file and customize the sections (like screenshots or links) for your GitHub repo. Let me know if you're deploying to Vercel or Render too, I can add deployment instructions.
```
