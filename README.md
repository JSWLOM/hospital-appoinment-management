# HospitaSync - Hospital Appointment Management System 🏥
## https://hospital-appoinment-management.onrender.com

A complete, lightweight, robust, and beautiful Hospital Appointment Management System tailored for handling Patients, Doctors, Appointments, and Billing efficiently. 

Designed with a sleek, modern glassmorphism UI and powered by a fast Node.js API.

## 🚀 Features
- **Authentication System**: Secure Role-Based Access Control (RBAC) via JWT tokens.
  - **Admin**: Full access including the securely locked Doctor Management directory.
  - **Receptionist**: Access to manage Patients, Appointments, and Invoices.
- **Interactive Dashboards**: Live data tracking for total patients, doctors, appointments, and hospital revenue.
- **Operations Modules**: Fully functional CRUD operations for Doctors and Patients.
- **Appointment Booking**: Dynamic dropdown assignment linking existing patients with active doctors.
- **Billing Engine**: Automatically generate bills tied directly to an appointment ID.

## 💻 Technology Stack
- **Frontend**: HTML5, Vanilla JS, Custom CSS (Glassmorphism & Medical Themes)
- **Backend API**: Node.js managed via Express.js routing
- **Database**: SQLite3 (Serverless, zero-configuration embedded relational SQL)
- **Security**: JWT (JSON Web Tokens) & bcrypt password hashing

## ⚙️ How to Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Setup Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/JSWLOM/hospital-appoinment-management.git
   cd hospital-appoinment-management
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the server**:
   ```bash
   npm start
   ```
4. **Access the application**:
   Open a browser and navigate to `http://localhost:3000`

## 🔐 Default Credentials
When the database is automatically generated on the first run, it seeds the following users:
- **Admin Role**
  - Username: `admin`
  - Password: `admin123`
- **Reception Role**
  - Username: `reception`
  - Password: `reception123`

## 👨‍💻 Created By
**Om Jaiswal** | Manipal University Jaipur  
- [LinkedIn Profile](https://www.linkedin.com/in/om-jaiswal-1b315126b/)
- [GitHub Profile](https://github.com/JSWLOM)
