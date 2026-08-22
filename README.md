🚀 Overview

Human Resource Management System (HRMS) is a modern, responsive, and centralized platform designed to simplify everyday HR operations.

Instead of managing employee information, attendance, leave, payroll, notifications, and administrative activities across multiple systems, HRMS brings everything together into one unified platform.

🎯 Our Vision

Simplify HR. Empower Employees. Improve Decisions.

HRMS helps organizations reduce manual work, improve transparency, and provide HR teams with meaningful insights through a clean and intuitive dashboard.

💡 Why HRMS?
Traditional HR processes often involve:

📄 Manual employee records
⏱️ Time-consuming attendance tracking
📝 Paper-based leave management
💰 Difficult payroll monitoring
📊 Scattered HR reports
🔔 Missed employee notifications
🔍 Limited visibility into organizational activities

Our Solution

HRMS provides a centralized digital ecosystem where employees and administrators can efficiently manage their HR activities.

Employee Data
     ↓
Attendance ───┐
Leave ────────┤
Payroll ──────┼──→ HRMS PLATFORM ──→ Analytics & Reports
Notifications ┤
Administration┘

✨ Key Features
👤 Employee Management

Manage employee information efficiently from a centralized employee directory.

📋 Employee directory
👤 Employee profiles
📝 Profile information management
🟢 Employee status tracking
🏢 Department management
💼 Role information
📊 Employee dashboard
🕐 Attendance Management

Track employee attendance and working hours with ease.

✅ Daily attendance tracking
🟢 Check-in / Check-out
📅 Attendance history
📌 Attendance status
📊 Attendance statistics
📈 Attendance overview
🌴 Leave Management

Simplify the complete leave request and approval process.

📝 Leave application
⏳ Leave status tracking
📚 Leave history
🏖️ Leave balance
👨‍💼 Administrator leave management
🔔 Leave-related notifications
💰 Payroll Management

Provide centralized access to salary and payroll information.

💵 Salary information
📄 Payroll records
🧾 Payslip-related information
📊 Payroll overview
📈 Payroll insights
📊 Analytics & Reporting

Transform HR data into meaningful insights.

📈 HR analytics dashboard
👥 Employee statistics
🕐 Attendance insights
💰 Payroll insights
📊 Management-oriented reports
📉 Data-driven decision support
🔐 Authentication & Access Control

Designed with a role-aware application structure.

🔑 Authentication flow
🛡️ Protected application areas
👨‍💼 Admin-oriented views
👨‍💻 Employee-oriented views
🔒 Secure environment configuration
🔔 Smart Notifications

Keep employees and administrators informed.

🔔 Centralized notification drawer
🌴 Leave updates
👤 Employee updates
📢 HR-related notifications
⚡ Real-time-ready notification architecture
🛡️ Administration & Audit

Improve visibility and accountability across the system.

👨‍💼 Administrative dashboard
👥 Employee administration
📋 Audit log interface
🔍 System activity tracking
📊 Administrative insights
🎨 User Experience

HRMS focuses on delivering a clean and professional user experience.

UI Highlights
📱 Responsive design
🎨 Modern HR-focused dashboard
🧭 Sidebar navigation
🔝 Top navigation
🧩 Reusable UI components
💻 Desktop-friendly layouts
📱 Mobile-responsive layouts
⚡ Fast and smooth interactions


🏗️ System Architecture

                    ┌──────────────────────┐
                    │       HRMS UI        │
                    │   React + TypeScript │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     API / Server     │
                    │       Node.js        │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌──────────┐     ┌──────────┐     ┌──────────┐
        │ Employee │     │Attendance│     │  Leave   │
        │ Management│    │Management│     │Management│
        └──────────┘     └──────────┘     └──────────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌──────────┐     ┌──────────┐     ┌──────────┐
        │ Payroll  │     │Analytics │     │  Audit   │
        │Management│     │Reporting │     │   Logs   │
        └──────────┘     └──────────┘     └──────────┘
        
📂 Project Structure

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

🛠️ Technology Stack
Layer	Technologies
🎨 Frontend-React, TypeScript, CSS
⚡ Build - Tool	Vite
🖥️ Backend - Node.js
🔗 API - Server-side API architecture
📦 Package - Manager	Bun / npm
💻 Development -	VS Code
🔀 Version - Control	Git
☁️ Collaboration	- GitHub
⚙️ Getting - Started

1️⃣ Clone the Repository
git clone https://github.com/Kavya-Tamilarasu/-Human-Resource-Management-System.git
2️⃣ Navigate to the Project
cd -Human-Resource-Management-System
3️⃣ Install Dependencies
Using Bun
bun install
Using npm
npm install
4️⃣ Configure Environment Variables

Create a .env file using the provided example:

copy .env.example .env

⚠️ Never commit .env to GitHub.
Store only example keys and configuration names in .env.example.

5️⃣ Start the Development Server
Using Bun
bun run dev
Using npm
npm run dev

The application will be available at the local development URL displayed in the terminal.

🔄 GitHub Collaboration Workflow

This project is developed collaboratively by 4 team members using a single main branch.

Before starting work
git pull --rebase origin main
After completing your task
git status
git add <your-files>
git commit -m "feat: describe your change"
git push origin main

⚠️ Important Rules
🔄 Always pull the latest main before starting work.
🎯 Work only on your assigned modules whenever possible.
📁 Stage only files related to your task.
🚫 Never use git push --force on main.
🤝 Never overwrite another member's changes.
🛠️ Resolve merge conflicts carefully.
💬 Keep commit messages meaningful.
🧪 Test your changes locally before pushing.
🔐 Never commit passwords, API keys, or secrets.
👥 Team Responsibilities
Member	Responsibility

👨‍💻 Member 1	Core application, context, libraries, types, integration & configuration
👩‍💻 Member 2	Employee Management
👨‍💻 Member 3	Attendance & Leave Management
👩‍💻 Member 4	Administration, Payroll & Analytics

One Repository • One Main Branch • Four Contributors • One Goal 🚀

🔒 Security

Security is an important part of the application architecture.

Environment Variables

Sensitive information should never be committed to GitHub.

Use:

.env

for local secrets.

Use:

.env.example

for documenting required environment variables.

Never commit
❌ Passwords
❌ API keys
❌ Access tokens
❌ Database credentials
❌ Private secrets
🎯 Project Goals

HRMS aims to:

👥 Centralize employee information
🕐 Digitize attendance tracking
🌴 Simplify leave management
💰 Organize payroll information
📊 Provide meaningful HR analytics
🔔 Improve HR communication
🛡️ Monitor administrative activities
⚡ Reduce manual HR operations
📈 Support data-driven decision making
😊 Improve the overall employee experience
🧪 Development Principles
📱 Responsive UI

Designed to work across different screen sizes.

🧩 Reusable Components

Reusable components reduce code duplication and improve maintainability.

🔷 Type Safety

TypeScript helps catch errors early and improves code reliability.

✅ Input Validation

User-provided information should be validated before processing.

🏗️ Modular Architecture

Each HR functionality is organized into independent modules.

🔀 Version Control

Git and GitHub enable effective collaborative development.

🔧 Maintainability

Organized components and utilities make the project easier to maintain.

📈 Scalability

The architecture allows additional HR modules to be added in the future.

🚀 Future Enhancements

The platform can be extended with:

🤖 AI-powered HR insights
📧 Automated email notifications
📱 Mobile application
🧠 AI-based employee analytics
💳 Automated payroll processing
📅 Calendar integration
📄 Automated payslip generation
📊 Advanced BI dashboards
🔐 Multi-factor authentication
☁️ Cloud deployment
🔔 Real-time push notifications
🏆 Hackathon Impact
Problem

Organizations often struggle with fragmented HR processes, manual operations, limited visibility, and inefficient employee communication.

Solution

HRMS unifies these operations into a single digital platform, enabling employees and administrators to access essential HR services from one place.

Impact
Manual Processes
       ↓
   HRMS Platform
       ↓
Automation + Centralization
       ↓
Better Efficiency
       ↓
Data-Driven Decisions
       ↓
Improved Employee Experience
👥 Team
Human Resource Management System — OODO Hackathon

Built with ❤️ by a 4-member development team.

┌─────────────────────────────────────┐
│             HRMS TEAM               │
├─────────────────────────────────────┤
│  👨‍💻 Member 1                       │
│  👩‍💻 Member 2                       │
│  👨‍💻 Member 3                       │
│  👩‍💻 Member 4                       │
└─────────────────────────────────────┘

📄 License

This project is developed for educational and hackathon purposes.

<p align="center">
🚀 Human Resource Management System

Centralize • Automate • Analyze • Empower

⭐ If you like this project, consider giving the repository a star!

</p>
