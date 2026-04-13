# University of Makati Academic Questionnaire System
# Comprehensive Technical Specification and Master Documentation

## Document Information
*   Project Title: UMak Academic Questionnaire System
*   Version: 1.2.0
*   Date: April 13, 2026
*   Institution: University of Makati (UMak)
*   Status: Formal Technical Release

---

## 1. Executive Summary

The University of Makati Academic Questionnaire System is a custom-engineered, real-time assessment platform designed to facilitate instantaneous pedagogical feedback during live classroom sessions. The system allows faculty to orchestrate synchronized polls, collect identified or anonymous responses, and generate institutional-grade archival reports. It is built on a high-availability, low-latency architecture specifically optimized for large-scale institutional use.

---

## 2. System Architecture and Technology Stack

### 2.1 Technology Stack
The application is built using a modern, serverless architecture to ensure rapid performance and minimal maintenance overhead:
*   Frontend Framework: React 19 (utilizing concurrent rendering features).
*   Build Engine: Vite (for optimized asset delivery and modular HMR).
*   Backend / Database: Firebase Realtime Database (RTDB) via WebSockets.
*   Styling: Tailwind CSS with a strict semantic color palette for institutional branding.
*   Type Safety: TypeScript 5.0+, ensuring robust data structures across the application.

### 2.2 Architectural Pattern: Replicate-to-Client
The system employs a "Global State Synchronization" model. The primary state of any live assessment resides in a specific node within the Firebase Realtime Database. All connected student and faculty clients maintain a persistent WebSocket connection. When the instructor (host) modifies a state variable—such as advancing to the next question—the change is propagated to all clients in under 100ms.

---

## 3. Technical Implementation Details

### 3.1 Absolute Reference Timing
To eliminate the impact of network latency and local machine clock drift, the system does not use traditional interval-based countdowns. Instead, it uses an "Absolute Reference" method:
1.  Initiation: When a question starts, the host stores a Unix timestamp (startTime) in the database.
2.  Synchronization: Every student device calculates the remaining time by comparing the current global time with the stored startTime and the question's specific duration.
3.  Resiliency: If a student joins a session or reloads their page mid-question, the timer instantly synchronizes to the exact second of the live session.

### 3.2 State Management and Prop-Syncing
The application is designed to prevent "State Divergence." While the Faculty view manages the session flow, the Student view is reactive. Student components are driven by properties (props) that are directly bound to the Firebase listener. This ensures that a student cannot see a question until the host has explicitly unlocked it in the database.

---

## 4. Security protocols and Data Integrity

The system implements multi-layered defensive protocols to protect against unauthorized access and academic dishonesty.

### 4.1 Firebase Security Rules: Incremental Validation
The database is protected by a high-security rule set that enforces "Incremental Validation." This prevents API direct injection and "ballot stuffing" through the following methods:
*   Atomic Increments: Counter fields (like participant counts or MCQ selection totals) can only be increased by exactly one per request. Attempts to add larger numbers are rejected at the database edge.
*   Append-Only Arrays: For short-answer and ranking responses, the system validates that new data is appended to the existing collection without modifying or deleting previous entries.
*   Immutability: Critical metadata, including Session IDs, Access Codes, and question text, are locked once the session is initialized and cannot be modified by any participant.

### 4.2 Brute-Force Prevention
The session-joining logic includes a client-side rate limiter:
*   Attempt Tracking: The system monitors consecutive failed entry attempts.
*   Security Lockout: After five incorrect Access Code entries, the specific device is subject to a 30-second security lockout to prevent automated session guessing.

### 4.3 Data Sanitization
All user-generated content, including instructor prompts and student text responses, is processed through a strict sanitization utility. This utility removes all potentially malicious HTML tags and scripts, effectively neutralizing Cross-Site Scripting (XSS) threats.

### 4.4 Session Fingerprinting
The system utilizes local browser fingerprints to manage "Multiple Response Prevention." When an instructor enables the response limit, the system verifies the device fingerprint against the submission register to prevent duplicate voting from the same device.

---

## 5. User Manual and Operational Workflows

### 5.1 Installation and Environment Configuration
The system is designed for easy deployment within the UMak infrastructure.
1.  Deployment: Provision the source code and run `npm install`.
2.  Environment: Configure the `.env.local` file with authorized Firebase credentials.
3.  Initialization: Run `npm run dev` for local testing or `npm run build` for production deployment.

### 5.2 Faculty Operational Guide
The faculty interface (Faculty Access) is designed for distraction-free session management.
1.  Assessment Creation: Instructors define titles, prompts, and modalities (MCQ, Short Answer, Ranking, etc.).
2.  Identity Management: Instructors can toggle "Collect Student Name" to require verified participant identification.
3.  Live Orchestration: Instructors control the "Academic Start," monitor the "Live Trend Charts," and can pause the session at any time for spontaneous classroom discussion.
4.  Archival: Upon conclusion, the system generates a PDF report containing aggregated analytics and the verified participant registry.

### 5.3 Student Participation Guide
1.  Entry: Students join via a 4-digit Access Code or QR scan.
2.  Identity Gate: If mandated by the instructor, students must enter their full legal name before the assessment content is revealed.
3.  Response: Students submit their responses once the question is live. The UI provides real-time feedback on remaining time and submission status.

---

## 6. Technical Data Models

### 6.1 Assessment Object
Identifies the template from which sessions are launched.
*   id: String (Unique UUID)
*   title: String (Official assessment name)
*   questions: Array (Collection of question objects with time limits and types)
*   requireStudentName: Boolean (Mandatory identity flag)

### 6.2 Session Object
Represents a live, active assessment instance.
*   accessCode: 4-digit String (Join credential)
*   status: Enum (waiting, active, paused, ended)
*   allResponses: Object (Structured map containing counts, text arrays, and student IDs)

---

## 7. Version History

### v1.2.0 - Technical Hardening Release
*   Implementation of high-security Firebase rules with incremental validation.
*   Integration of brute-force prevention and security lockout logic.
*   Addition of mandatory student identity gate and host-side participant registry.
*   Simplification of institutional navigation and decommissioning of legacy login gates.

### v1.1.0 - Core Synchronization Release
*   Introduction of absolute-reference timing logic.
*   Implementation of synchronized pause and resume functionality.
*   Initial release of the system documentation suite.

---
© 2026 University of Makati
Academic Portal Project
