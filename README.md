# 🏢 BillStack: Enterprise Resource Planning & Invoicing System

![BillStack](https://img.shields.io/badge/BillStack-ERP%20%26%20Invoicing-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

**BillStack** is a comprehensive, production-ready full-stack ERP and Invoicing solution designed for maximum efficiency, scalability, and financial integrity. It seamlessly integrates a powerful Node.js/Express backend with a modern React/Vite frontend to deliver a top-notch experience for managing clients, inventory, quoting, and billing.

---

## ✨ Core Functionality & Features

*   **🧾 Advanced Invoicing & Quoting**: Create, customize, and manage invoices and quotes. Easily convert quotes to invoices with a single click. Includes automated PDF generation (Pug + html-pdf) with full Indian GST and HSN code support.
*   **📦 Intelligent Inventory Management**: Track real-time stock movements (in, out, adjustments) linked directly to sales, utilizing strict role-based access.
*   **🤝 Comprehensive CRM**: Manage client profiles, billing/shipping addresses, and associated financial histories.
*   **💳 Financial Integrity & Payments**: Track partial and full payments. Deleting a payment automatically and atomically reverses invoice credits and recalculates payment statuses.
*   **⚙️ Dynamic Configuration**: Manage application settings (currency, date formats, PDF themes, company information) directly from the UI without touching code.
*   **📧 Multi-Tier Email Service**: Automated dispatch of invoices, quotes, and OTPs using a robust email chain (Primary: SMTP/Gmail → Fallback: Resend API).

---

## 🏗️ Architecture & Code Structure

The project is divided into two highly decoupled and scalable repositories:

### 1. Backend (`ERP-Invoice-B`)
*   **Framework**: Node.js, Express.js, Mongoose.
*   **Auto-Discovery API**: A highly elegant factory pattern automatically discovers Mongoose schemas and generates full CRUD REST APIs dynamically. Adding a new entity requires zero boilerplate route code.
*   **Modular Architecture**: Clean separation of `models`, `controllers`, `routes`, `middlewares`, and `handlers`.

### 2. Frontend (`ERP-Invoice-F`)
*   **Framework**: React 18, Vite, Ant Design (Pro Layout), Redux Toolkit.
*   **Generic CRUD UI Engine**: Employs a DRY (Don't Repeat Yourself) architecture where a single `CrudModule` dynamically renders data tables, side panels, and forms based on a simple configuration object.
*   **State Separation**: Intelligently splits global data state (Redux) from local UI toggle state (React Context) for peak rendering performance.

---

## 🚀 Efficiency, Latency & Database Power

BillStack is engineered for speed and data reliability:

*   **Atomic Database Transactions**: Inventory stock movements use MongoDB sessions and atomic transactions (`session.startTransaction()`). This guarantees that product quantities and stock logs remain perfectly synchronized, even under heavy concurrent load.
*   **Parallel Processing**: Extensive use of `Promise.all()` for simultaneous database queries (e.g., verifying user tokens while fetching session data, or fetching list data alongside document counts) drastically reduces API latency.
*   **Lightning-Fast Frontend**: Utilizing **Vite** for optimized building and HMR, combined with **React.lazy / Suspense** for route-level code splitting, ensuring the initial JavaScript payload is incredibly small and load times are near-instant.
*   **Optimized Caching**: The frontend leverages Redux Toolkit and `storePersist` (localStorage) to cache session and settings data, minimizing redundant API calls.

---

## 🔒 Security Posture

*   **Robust JWT Authentication**: Implements true server-side token invalidation. Issued JWTs are tracked in a `loggedSessions` database array; logging out explicitly removes the token, instantly revoking access globally.
*   **Strict Role-Based Access Control (RBAC)**: Enforces precise permissions. Destructive or sensitive actions (like adjusting inventory or deleting payments) are strictly locked to `owner`, `admin`, or `inventory_manager` roles.
*   **Data Validation & Sanitization**: Every incoming backend request is rigorously validated against strict **Joi** schemas before reaching the database controllers, preventing NoSQL injection and malformed data entry.
*   **Path Traversal Protection**: Static file and PDF download routes implement strict directory boundary checking to prevent unauthorized filesystem access.

---

## 🏁 How to Start (Local Development)

Follow these steps to get the full BillStack application running locally.

### Prerequisites
*   Node.js (v20.9.0 or higher)
*   MongoDB (Local or Atlas URI)

### 1. Backend Setup
```bash
# Navigate to the backend directory
cd ERP-Invoice-B

# Install dependencies
npm install

# Environment Configuration
# Copy .env.template to .env and update the DATABASE URI and JWT_SECRET
cp .env.template .env

# Run the database setup script (Seeds Admin, Bank Accounts, Settings)
npm run setup

# Start the backend server (Runs on port 8888 by default)
npm run dev
```

### 2. Frontend Setup
```bash
# Open a new terminal and navigate to the frontend directory
cd ERP-Invoice-F

# Install dependencies
npm install

# Environment Configuration
# Ensure .env is set to point to the local backend:
# VITE_BACKEND_SERVER="http://localhost:8888/"
# VITE_FILE_BASE_URL="http://localhost:8888/"

# Start the frontend development server (Runs on port 3000 by default)
npm run dev
```

### 3. Access the Application
Open your browser and navigate to `http://localhost:3000`. 
*   **Default Admin Email**: `admin@admin.com`
*   **Default Password**: `admin123`

*(Note: Ensure you change these credentials in a production environment!)*

---

*Engineered for performance. Designed for scale. Built with modern JavaScript.*
