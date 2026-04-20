# UAQS: University Academic Questionnaire System
> **Official Real-time Assessment Platform for the University of Makati**

[![Tech Stack](https://img.shields.io/badge/Stack-React_19_|_Firebase_|_Vite-blue)](docs/MASTER_DOCUMENTATION.md)
[![Documentation](https://img.shields.io/badge/Documentation-Master_Spec-green)](docs/MASTER_DOCUMENTATION.md)

---

## Overview
The **University Academic Questionnaire System (UAQS)** is a sophisticated, real-time polling and assessment engine designed to enhance classroom engagement at the University of Makati. Built with a focus on low-latency synchronization and academic integrity, it allows faculty to execute interactive assessments with seamless data visualization.

### Central Documentation
For detailed specifications, please refer to the modular documentation hub:
**[Documentation Index](docs/INDEX.md)**

1.  **[Vision & Strategy](docs/VISION.md)**
2.  **[Architecture](docs/ARCHITECTURE.md)**
3.  **[Database Schema](docs/DATABASE.md)**
4.  **[Security Protocol](docs/SECURITY.md)**
5.  **[Developer Setup](docs/SETUP.md)**

---

### 2.1 Technical Requirements
* Node.js (v16 or higher)
* NPM or Yarn
* Firebase Project (Realtime Database enabled)

### 2.2 Installation Steps
1. Clone the repository to your local machine.
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables in `.env.local`:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_DATABASE_URL=your_database_url
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 3. System Architecture

### 3.1 Technology Stack
* Frontend Framework: React 18 with TypeScript
* Build Tool: Vite
* Real-time Database: Firebase Realtime Database (RTDB) for live session synchronization
* Local Persistence: Browser LocalStorage for faculty-side assessment drafts and bundle management
* PDF Generation: jsPDF for academic reporting
* QR Integration: qrcode.react for session access

### 3.2 Core Modules
* Entry Portal (Home): Dual-entry system for Faculty and Students.
* Faculty Dashboard: A management interface for organizational control of assessment bundles and work-in-progress drafts.
* Questionnaire Creator: A comprehensive form builder supporting Multiple Choice, True/False, Rating Scales, Short Answer, Essay, and Ranking question types.
* Live Session Control: A real-time instructor interface for controlling assessment flow, monitoring participation, and visualizing results.
* Student Poll Interface: A responsive participant view for real-time response submission.
* Global Feedback System: A unified notification and modal service managing all user-facing alerts and confirmations.

## 4. Features and Functionality

### 4.1 Faculty Subsystem
* Assessment Management: Create, edit, and delete assessment bundles.
* Draft Vault: Automatic saving of work-in-progress assessments to prevent data loss during the creation process.
* Real-time Control Panel: Ability to start/pause sessions, navigate between questions, and monitor live results.
* Academic Reporting: On-demand generation of official PDF reports containing summarized assessment data and participant details.
* Session Access: Automatic 4-digit access code generation and QR code display for student onboarding.

### 4.2 Student Subsystem
* Anonymous/Identified Participation: Flexible session configuration allowing for anonymous responses or verified name collection.
* Real-time Synchronization: Instant updates as the instructor moves through the assessment.
* Visual Feedback: Confirmation of successful submission and session progress tracking.

## 5. Operational Evaluation

### 5.1 Benefits (Pros)
* Low Friction: Students join via simple 4-digit codes without requiring account registration.
* Real-time Interaction: Synchronous data exchange between instructor and students enhances classroom engagement.
* Visual Consistency: The interface adheres strictly to University of Makati branding guidelines, instilling academic trust.
* Data Portability: Integrated PDF exporting allows for immediate archiving of academic records.
* Resilience: Auto-save features and error boundary management ensure a stable user experience.

### 5.2 Limitations (Cons)
* Device Dependency: Faculty drafts are stored in LocalStorage, meaning work started on one device is not immediately accessible on another without manual sync.
* Concurrent Session Capacity: The 4-digit access code system limits the architecture to 10,000 unique concurrent sessions globally.
* Self-Reported Identity: Unless integrated with a university SSO, student names are self-reported and subject to human error or falsification.

## 6. Security Profile

### 6.1 Vulnerabilities
* Brute-Force Attack Surface: The 4-digit access code is susceptible to automated guessing. While entry cooldowns are implemented, the low entropy of the code remains a technical risk.
* Client-side Data Integrity: LocalStorage is accessible via browser dev tools, allowing manipulation of stored drafts or session pointers.
* XSS (Cross-Site Scripting): Dynamic rendering of user-provided text requires strict sanitation to prevent execution of malicious code.

### 6.2 Implemented Mitigations
* Input Sanitation: All user-provided strings pass through a sanitization utility before rendering or persistence.
* Join Cooldowns: Implementation of a rate-limiting mechanism in the join flow to prevent rapid-fire access code attempts.
* Firebase Security Rules: Granular database rules ensure data isolation between participants and instructors.
* Secure Logging: Internal utilities for obscure logging of sensitive operations to prevent console-based leaks.

## 7. Strategic Maintenance Roadmap
1. Cloud Sync Integration: Moving faculty drafts from LocalStorage to a cloud-authenticated store.
2. SSO Integration: Implementing University-wide single sign-on for verified identity.
3. Advanced Analytics: Expanding the reporting engine to include longitudinal data analysis.
