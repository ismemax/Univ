# UMak Academic Questionnaire System
# Master Project Documentation and Technical Specification

---

## Table of Contents
1. Project Overview
2. User Manual and Operational Guide
3. System Architecture and Design
4. Technical Implementation Detail
5. Security and Data Integrity
6. Technical Reference (API and Database)
7. Release History and Versioning

---

## 1. Project Overview

### Introduction
The UMak Academic Questionnaire System is a professional-grade classroom assessment platform designed exclusively for the University of Makati. It enables instructors to conduct live, real-time assessments with instant data visualization, automated feedback, and institutional reporting.

The system is built to ensure a high-performance, low-latency experience in classroom environments, allowing for immediate pedagogical feedback during lectures.

### Core Features
- Real-time Synchronization: instant data delivery via Firebase Websockets.
- Support for Diverse Question Formats: MCQs, True/False, Rating Scales, Short Answer, Essay, and Ranking.
- Institutional Branding: Custom UI tokens tailored for University of Makati aesthetics.
- Open Academic Access: Frictionless entry for faculty with verified student identity gates for accountability.
- Professional Analytics: Integrated charting and automated PDF report generation.

---

## 2. User Manual and Operational Guide

### Installation and Setup
#### Prerequisites
- Node.js (v18 or higher)
- A Firebase Project (Realtime Database enabled)

#### Step-by-Step Installation
1. Repository Configuration: Clone the source code to your local machine.
2. Dependency Management: Run "npm install" in the root directory to provision all required libraries.
3. Environment Configuration: Create a .env.local file with your Firebase credentials to establish a secure bridge to the backend:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ```
4. Execution: Run "npm run dev" to initialize the Vite development server.

### Operational Guide for Instructors
#### Step 1: Accessing the Dashboard
Faculty members gain immediate access through the "Faculty Access" portal. The system bypasses complex onboarding to prioritize instructional speed, redirecting directly to the management dashboard.

#### Step 2: Creating Assessments
- Institutional Customization: Define titles, academic prompts, and assessment modalities.
- Student Identification: Instructors can toggle "Collect Student Name" to mandate participant identification, which is critical for attendance and academic accountability.
- Pacing Control: Set specific time limits per question (30s to 600s) to manage lecture flow.

#### Step 3: Running a Live Session
- Lobby Management: Launch sessions with an optional lobby for synchronized start.
- Live Orchestration: Control question advancement, pause/resume the timer for spontaneous discussion, and monitor results in real-time.
- Results Archiving: Generate official PDF reports upon session conclusion.

### Operational Guide for Students
- Verified Entry: Join via a 4-digit Access Code or QR scan. If prompted, entry into the Full Legal Name field is mandatory.
- Real-time Engagement: Participate in live polls with instant visual feedback once the time expires.

---

## 3. System Architecture and Design

### Architectural Overview
The system utilizes a Replicate-to-Client architecture. Firebase Realtime Database serves as the "Global State," while each connected workstation or mobile device maintains a refined local state. Changes are propagated via low-latency WebSockets (typically <100ms), ensuring all students see identical timers and content.

### Core Design Decisions
- React 19: Leverages the latest concurrent rendering features for a smooth, app-like feel.
- Prop-Driven Synchronization: To avoid local state conflicts during network lag, the "Student" view is driven primarily by props synchronized from the database.
- Institutional Design System: Styling is governed by a semantic palette (UMak Navy, UMak Blue, UMak Yellow) to maintain official branding.

---

## 4. Technical Implementation Detail

### Framework and Logic Layer
The application is a Single Page Application (SPA) built with TypeScript. It uses Vite for optimized bundling and HMR (Hot Module Replacement).

### Backend Integration (Firebase)
The system connects to Firebase RTDB using a persistent listener (onValue). This listener monitors the "active_session" node. When the host updates the "currentQuestionIndex" or "status," the listener triggers a re-render on all student devices simultaneously.

### Time Synchronization Logic
Unlike traditional timers that count down locally, this system uses an "Absolute Reference" method:
1. The host stores a "startTime" (Unix timestamp) in the DB.
2. Each client calculates: (Current_Time - startTime) - timeLimit.
3. This ensures that even if a student joins halfway through, their timer is perfectly in sync with the instructor.

---

## 5. Security and Data Integrity

The system implements several layers of security to ensure academic honesty and system stability:

### Firebase Security Rules
Access is gated at the database level. Rules allow writes only when the session status is "active" or "waiting." This prevents late submissions after a question has closed or the session has ended.

### Data Sanitization
All instructor prompts and student text responses undergo strict HTML sanitization before being stored or displayed to prevent Cross-Site Scripting (XSS) attacks.

### Session Integrity Fingerprinting
To prevent unauthorized users from hijacking a session or students from submitting multiple times:
- Local Storage Fingerprints: Each device is tagged with a unique session ID.
- Access Code Validation: Strict 4-digit numeric validation for session entry.
- Honeypots: Invisible fields in the join form detect and block automated bot entries.

### Multiple Response Prevention
If the "One Response Limit" is enabled, the system uses a local fingerprint to "lock" the student's view once a submission is detected, preventing duplicate votes for the same question.

---

## 6. Technical Reference (API and Database)

### Database Schema (Firebase RTDB)
The core data structure in Firebase is the "active_session":

```json
{
  "id": "uuid_string",
  "accessCode": "4000",
  "status": "active",
  "isStarted": true,
  "requireStudentName": true,
  "currentQuestionIndex": 0,
  "startTime": 17123456789,
  "participantsCount": 15,
  "allResponses": {
    "0": {
      "count_0": 5,
      "text": ["student answer"],
      "rankings": [[0, 1, 2]],
      "namedResponses": [
        { "name": "Lastname, Firstname", "answer": 0 }
      ]
    }
  }
}
```

---

## 7. Release History and Versioning

### [v1.2.0] - 2026-04-13
- Identification System: Mandated legal names for participation to support institutional grading.
- Open-Access Model: Removed the login gate for faculty to improve frictionless usage.
- Modernized Header: Simplified navigation for improved classroom focus.
- Participant Registry: Live host-side monitoring of verified student names.

### [v1.1.0] - 2026-04-13
- Synchronized Pausing: Universal timer control with pause/resume logic.
- Time Drift Compensation: Resuming accounts for pause duration automatically.
- Master Documentation Suite: Initial creation of technical manuals.

---
© 2026 University of Makati
