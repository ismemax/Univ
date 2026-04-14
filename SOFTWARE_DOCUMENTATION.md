# Software Documentation: University of Makati Academic Questionnaire System

## 1. Executive Summary
The University of Makati Academic Questionnaire System (UAQS) is a real-time, web-based platform designed to facilitate interactive academic assessments, polls, and research surveys within the university community. It provides faculty members with tools to create structured assessments and students with a low-friction interface for participation.

## 2. System Architecture

### 2.1 Technology Stack
*   **Frontend Framework**: React 18 with TypeScript.
*   **Build Tool**: Vite.
*   **Real-time Database**: Firebase Realtime Database (RTDB) for live session synchronization.
*   **Local Persistence**: Browser LocalStorage for faculty-side assessment drafts and bundle management.
*   **PDF Generation**: jsPDF for academic reporting.
*   **QR Integration**: qrcode.react for session access.

### 2.2 Core Modules
*   **Entry Portal (Home)**: Dual-entry system for Faculty and Students.
*   **Faculty Dashboard**: A management interface for organizational control of assessment bundles and work-in-progress drafts.
*   **Questionnaire Creator**: A comprehensive form builder supporting Multiple Choice, True/False, Rating Scales, Short Answer, Essay, and Ranking question types.
*   **Live Session Control**: A real-time instructor interface for controlling assessment flow, monitoring participation, and visualizing results.
*   **Student Poll Interface**: A responsive participant view for real-time response submission.
*   **Global Feedback System**: A unified notification and modal service managing all user-facing alerts and confirmations.

## 3. Features and Functionality

### 3.1 Faculty Subsystem
*   **Assessment Management**: Create, edit, and delete assessment bundles.
*   **Draft Vault**: Automatic saving of work-in-progress assessments to prevent data loss during the creation process.
*   **Real-time Control Panel**: Ability to start/pause sessions, navigate between questions, and monitor live results.
*   **Academic Reporting**: On-demand generation of official PDF reports containing summarized assessment data and participant details.
*   **Session Access**: Automatic 4-digit access code generation and QR code display for student onboarding.

### 3.2 Student Subsystem
*   **Anonymous/Identified Participation**: Flexible session configuration allowing for anonymous responses or verified name collection.
*   **Real-time Synchronization**: Instant updates as the instructor moves through the assessment.
*   **Visual Feedback**: Confirmation of successful submission and session progress tracking.

## 4. Operational Benefits (Pros)
*   **Low Friction**: Students join via simple 4-digit codes without requiring account registration.
*   **Real-time Interaction**: Synchronous data exchange between instructor and students enhances classroom engagement.
*   **Visual Consistency**: The interface adheres strictly to University of Makati branding guidelines, instilling academic trust.
*   **Data Portability**: Integrated PDF exporting allows for immediate archiving of academic records.
*   **Resilience**: Auto-save features and error boundary management ensure a stable user experience.

## 5. System Limitations (Cons)
*   **Device Dependency**: Faculty drafts are stored in LocalStorage, meaning work started on one device is not immediately accessible on another without manual export/import.
*   **Concurrent Session Capacity**: The 4-digit access code system limits the architecture to 10,000 unique concurrent sessions globally.
*   **Self-Reported Identity**: Unless integrated with a university SSO, student names are self-reported and subject to human error or falsification.

## 6. Security Analysis

### 6.1 Vulnerabilities
*   **Brute-Force Attack Surface**: The 4-digit access code is susceptible to automated guessing. While entry cooldowns are implemented, the low entropy of the code remains a theoretical risk.
*   **Client-side Data Integrity**: LocalStorage is accessible via browser dev tools, allowing technically proficient users to manipulate stored drafts or session pointers.
*   **XSS (Cross-Site Scripting)**: Dynamic rendering of user-provided question text requires strict sanitation to prevent execution of malicious javascript.

### 6.2 Implemented Mitigations
*   **Input Sanitation**: All user-provided strings pass through a sanitization utility before rendering or persistence.
*   **Join Cooldowns**: Implementation of a rate-limiting mechanism in the join flow to prevent rapid-fire access code attempts.
*   **Firebase Security Rules**: Granular database rules ensure that students can only write to their specific response nodes and instructors can only manage their active sessions.
*   **Secure Logging**: Internal utilities for obscure logging of sensitive operations to prevent console-based data leaks.

## 7. Development and Maintenance
The system is built with a modular component architecture, making it highly extensible. Future maintenance should focus on:
1.  **Cloud Sync Integration**: Moving faculty drafts from LocalStorage to a cloud-authenticated store for cross-device access.
2.  **SSO Integration**: Implementing University-wide single sign-on for verified student identity.
3.  **Advanced Analytics**: Expanding the reporting engine to include longitudinal data analysis.
