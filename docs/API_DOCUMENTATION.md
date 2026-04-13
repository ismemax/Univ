# API Documentation: Firebase Realtime Database Structure

Since the **UMak Academic Questionnaire System** is a serverless application utilizing **Firebase Realtime Database**, the "API" comprises the data paths and the JSON structures used for real-time synchronization.

## 1. Authentication
The application currently uses an anonymous/open access model restricted by institutional security rules. Future iterations will integrate UMak's Google Workspace OAuth.

## 2. Endpoints (Data Paths)

### `active_session/`
The root path for the current live assessment.

#### **GET /active_session**
Retrieves the entire state of the active session.

**Response Structure:**
```json
{
  "id": "string (unique uuid)",
  "accessCode": "string (4-digit)",
  "status": "waiting | active | paused | ended",
  "currentQuestionIndex": "number",
  "startTime": "number (Unix timestamp)",
  "pausedAt": "number | null",
  "participantsCount": "number",
  "questions": [
    {
      "id": "string",
      "text": "string",
      "type": "string (enum)",
      "timeLimit": "number",
      "options": ["string"]
    }
  ],
  "allResponses": {
    "questionIndex": {
      "optionIndex": "number (count)",
      "text": ["string"],
      "rankings": [[number]]
    }
  }
}
```

#### **UPDATE /active_session**
Used by the faculty to control the session state.

**Payload Examples:**
- **Pause**: `{ "status": "paused", "pausedAt": 17123456789 }`
- **Resume**: `{ "status": "active", "startTime": 17123457000, "pausedAt": null }`
- **Next Question**: `{ "currentQuestionIndex": 1, "startTime": 17123456000, "status": "active", "pausedAt": null }`

#### **UPDATE /active_session/allResponses/{questionIndex}**
Used by students to submit answers.

**Payload Examples (Multiple Choice):**
- `{ "0": 1 }` (Increments option index 0)
- `{ "text": ["My answer"] }` (Appends to text array)

---

## 3. Security Rules
The API is governed by Firebase Security Rules that validate:
1. Session existence.
2. Modifiable status (writes only allowed if status is `active`, `paused`, etc.).
3. Data types (e.g., `participantsCount` must be a number).

---
*Refer to `docs/SYSTEM_DOCUMENTATION.md` for UML data models.*
