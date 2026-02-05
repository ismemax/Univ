# 📊 Database Schema - UMak Academic Portal

The system utilizes **Firebase Realtime Database** for dynamic, real-time synchronization. The schema is optimized for low latency during live assessments.

## 1. Data Structure Overview

The database is structured as a JSON tree with two primary root nodes: `assessments` and `sessions`.

### `assessments/{assessmentId}`
Stores the templates created by faculty members.
- `id`: (string) Unique identifier.
- `title`: (string) The name of the assessment.
- `questions`: (Array) List of question objects.
  - `id`: (string)
  - `text`: (string)
  - `type`: (enum: MULTIPLE_CHOICE, TRUE_FALSE, RATING_SCALE, SHORT_ANSWER, ESSAY, RANKING)
  - `options`: (Array) Choices for MCQs/Ranking.
  - `timeLimit`: (number) Seconds allowed for the response.
- `createdAt`: (timestamp)
- `isDraft`: (boolean) Whether the assessment is still being edited.
- `creatorId`: (string) ID of the faculty member who created it.
- `preventMultipleResponses`: (boolean) Security flag.

### `sessions/{sessionId}`
Stores the state of active/live assessments.
- `id`: (string) Matches the assessment ID or a unique session token.
- `accessCode`: (string) 6-digit code for student entry.
- `status`: (string) `waiting` | `active` | `paused` | `ended`.
- `currentQuestionIndex`: (number) The active question being shown to students.
- `participantsCount`: (number) Total students joined.
- `startTime`: (timestamp) When the current question was launched.
- `allResponses`: (Map)
  - `[questionIndex]`: (Object)
    - `[responseId]`: (any) The value submitted by the student.
- `isStarted`: (boolean) Flag for session initiation.

## 2. Security Logic
Security is enforced using **Firebase Security Rules** (`FIREBASE_SECURITY_RULES.json`).
- **Read Access**: Open for sessions (to allow students to join), restricted for private assessment drafts.
- **Write Access**: Restricted to Faculty for session control; restricted to unique submissions for students.
- **Integrity**: Validates that questions and responses match the required UMak Academic standards.

## 3. Storage Strategy
- **Local Storage**: Used for temporary faculty drafts and non-critical session history.
- **Realtime Database**: Used for all live interaction between multiple users.
