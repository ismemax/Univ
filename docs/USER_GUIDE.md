# User Guide: Instructions for Host & Participants

This guide provides step-by-step instructions for installing and running the UMak Academic Questionnaire System, as well as operational workflows for instructors and students.

## 1. Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- A Firebase Project (Realtime Database enabled)

### Step-by-Step Installation
1. **Repository**: Clone the source code to your local machine.
2. **Dependencies**: Open a terminal in the root folder and run:
   ```bash
   npm install
   ```
3. **Configuration**: Create a `.env.local` file in the root directory and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ```
4. **Execution**: Start the development server:
   ```bash
   npm run dev
   ```
5. **Access**: Open `http://localhost:5173` in your browser.

---

## 2. Operational Guide for Instructors (Host)

### Step 1: Accessing the Dashboard
- Click **"Faculty Access"** (or the Faculty Portal card) on the home page.
- You will be redirected immediately to the management dashboard.

### Step 2: Creating Assessments
- Click **"Create Questionnaire"**.
- Input the title and add questions using the **"Add Question"** button.
- Define a time limit for each question to ensure class pacing.
- **Student Identification**: Toggle "Collect Student Name" in the Global Settings if you require participants to provide their legal names for grading or attendance.
- Save as a **Draft** if you need to review it later.

### Step 3: Running a Live Session
- Select an assessment and click **"Launch Live"**.
- Ask students to scan the **QR Code** or enter the **Access Code**.
- **Participant Registry**: View the list of verified student names in the "Participant Registry" section as they submit their responses.
- Control the timer using the **Pause/Resume** buttons.
- Click **"Next Question"** once the discussion for the current one is finished.

---

## 3. Operational Guide for Students (Participants)

### Step 1: Joining
- Visit the site and enter the 4-digit **Access Code** provided by your instructor.
- Alternatively, scan the QR code projected on the screen.
- **Identity Gate**: If the session requires it, you will be prompted to enter your Full Legal Name before joining the assessment.

### Step 2: Responding
- Once the instructor starts the question, the options will appear.
- Select your choice or type your response.
- Note: Your response is final and can only be submitted once per question.

---

## 4. Troubleshooting & FAQ

**Q: The Resume button gives a "Connection Error".**
A: This usually means your Firebase Security Rules are blocking the update. Ensure you have added `'paused'` to the `.write` rules in your Firebase Console.

**Q: Students cannot see the question.**
A: Ensure you have clicked **"Launch Assessment Now"** if you enabled a lobby in the settings.

**Q: Navigation links (Home, Questionnaires) are missing from the header.**
A: The UI has been simplified for better focus during live sessions. You can still return to the Home screen by clicking the **University of Makati** logo/title in the top-left corner.

---
*For technical support, contact the UMak IT Academic Division.*
