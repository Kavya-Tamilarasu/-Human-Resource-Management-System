# Human Resource Management System (HRMS)

A modern, full-stack **Human Resource Management System (HRMS)** designed to centralize employee management, attendance, leave, payroll, analytics, notifications, and administrative operations in a clean, responsive interface.

## 🚀 Features

### 👤 Employee Management

* Employee directory
* Employee profiles
* Profile information management
* Employee status tracking
* Department and role management
* Employee dashboard

### 🕐 Attendance Management

* Daily attendance tracking
* Check-in / check-out
* Attendance history
* Attendance status tracking
* Attendance overview and statistics

### 🌴 Leave Management

* Leave application
* Leave status tracking
* Leave history
* Leave balance management
* Administrative leave management

### 💰 Payroll Management

* Salary information
* Payroll records
* Payslip-related information
* Payroll overview

### 📊 Analytics & Reporting

* HR analytics dashboard
* Employee statistics
* Attendance insights
* Payroll insights
* Management-oriented reporting

### 🔐 Authentication & Access

* Authentication flow
* Role-aware application structure
* Protected application areas
* Employee and Admin-oriented views

### 🔔 Notifications

* Notification drawer
* HR-related notifications
* Leave and employee updates
* Centralized notification experience

### 🛡️ Administration & Audit

* Administrative dashboard
* Employee administration
* Audit log interface
* System activity tracking

### 🎨 User Interface

* Responsive design
* Clean HR-focused dashboard
* Consistent navigation
* Sidebar and top navigation
* Reusable UI components
* Responsive layouts for different screen sizes

---

## 🏗️ Project Structure

```text
Human-Resource-Management-System/
│
├── assets/
│
├── src/
│   ├── components/
│   │   ├── analytics/
│   │   ├── attendance/
│   │   ├── audit/
│   │   ├── auth/
│   │   ├── common/
│   │   ├── dashboard/
│   │   ├── employees/
│   │   ├── landing/
│   │   ├── layout/
│   │   ├── leaves/
│   │   ├── notifications/
│   │   ├── payroll/
│   │   └── profile/
│   │
│   ├── context/
│   │   └── AuthContext.tsx
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   └── utils.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
│
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── README.md
├── server.ts
├── tsconfig.json
├── vite.config.ts
└── bun.lock
```

---

## 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Vite
* CSS

### Backend

* Node.js
* Server-side API architecture

### Development Tools

* Git
* GitHub
* Bun / npm
* VS Code

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Kavya-Tamilarasu/-Human-Resource-Management-System.git
```

### 2. Navigate to the Project

```bash
cd -Human-Resource-Management-System
```

### 3. Install Dependencies

Using **Bun**:

```bash
bun install
```

Or using **npm**:

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
copy .env.example .env
```

Add the required environment variables to `.env`.

> ⚠️ Never commit `.env` or any sensitive credentials to GitHub.

### 5. Start the Development Server

Using Bun:

```bash
bun run dev
```

Or using npm:

```bash
npm run dev
```

The application will be available at the local development URL displayed in the terminal.

---

## 🔄 Development Workflow

This project is developed collaboratively by a **4-member development team** using the same GitHub repository and `main` branch.

### Before Starting Work

Always pull the latest changes:

```bash
git pull --rebase origin main
```

### After Completing a Task

Check your changes:

```bash
git status
```

Stage only the required files:

```bash
git add <your-files>
```

Commit your changes:

```bash
git commit -m "feat: describe your change"
```

Push to the repository:

```bash
git push origin main
```

---

## 👥 Team Responsibilities

| Member       | Responsibility                                                           |
| ------------ | ------------------------------------------------------------------------ |
| **Member 1** | Core application, context, libraries, types, integration & configuration |
| **Member 2** | Employee management                                                      |
| **Member 3** | Attendance & leave management                                            |
| **Member 4** | Administration, payroll & analytics                                      |

---

## 🤝 Collaboration Rules

1. Always pull the latest `main` before starting work.
2. Work only on assigned modules whenever possible.
3. Stage only files related to your task.
4. Never use `git push --force` on `main`.
5. Never overwrite another team member's changes.
6. Resolve merge conflicts before pushing.
7. Keep commits small and meaningful.
8. Test changes locally before pushing.
9. Communicate with team members before modifying shared files.
10. Maintain clean and readable code.

---

## 🔒 Security

Sensitive credentials and configuration values must **never** be committed to the repository.

Use:

```text
.env
```

for local secrets.

Use:

```text
.env.example
```

for documenting required environment variables without exposing their actual values.

Ensure `.env` remains listed in `.gitignore`.

---

## 🎯 Project Goals

The HRMS aims to provide a centralized platform for:

* Managing employee information
* Tracking employee attendance
* Managing leave requests
* Handling payroll information
* Monitoring HR activities
* Providing useful HR analytics
* Improving administrative efficiency
* Centralizing HR-related notifications
* Providing a responsive and user-friendly HR experience

---

## 🧪 Development Principles

### Responsive UI

The application should remain usable across desktops, tablets, and mobile devices.

### Reusable Components

Common UI elements and functionality should be implemented as reusable components to minimize duplication.

### Type Safety

TypeScript is used to improve code reliability and reduce runtime errors.

### Input Validation

User-provided information should be validated before processing.

### Modular Architecture

HR functionalities are organized into independent modules for easier maintenance and development.

### Version Control

Git and GitHub are used to support collaborative development and maintain project history.

### Maintainability

Components, utilities, and application logic should remain organized and easy to understand.

### Scalability

The architecture is designed so additional HR modules and features can be integrated in the future.

---

## 🔮 Future Enhancements

Potential future improvements include:

* Real-time attendance synchronization
* Automated payroll calculation
* PDF payslip generation
* Email notifications
* Advanced role-based access control
* Employee self-service portal
* Performance management
* Recruitment management
* Expense management
* Advanced HR reports
* Cloud deployment
* Database-backed persistent storage
* Mobile application support
* AI-powered HR analytics and insights

---

## 👥 Team

**Human Resource Management System — OODO Hackathon**

Developed collaboratively by a **4-member development team**.

---

## 📄 License

This project is developed for **educational and hackathon purposes**.
