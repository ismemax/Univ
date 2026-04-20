# Database Schema & Data Models

The **University Academic Questionnaire System** utilizes **Firebase Realtime Database (RTDB)** for low-latency synchronization. Below is the specification for the data structure and interaction patterns.

---

## 1. Global State Structure
The root of the database is optimized for flat access to minimize synchronization payloads.

```json
{
  "active_session": {
    "id": "string (unique)",
    "accessCode": "string (4-digit)",
    "status": "waiting | active | paused | ended",
    "currentQuestionIndex": "number",
    "startTime": "number",
    "participantsCount": "number",
    "requireStudentName": "boolean",
    "questions": [],
    "allResponses": {
      "qIdx": {
        "choiceIdx": "count",
        "text": ["sanitized_answer"],
        "namedResponses": [{ "name": "string", "answer": "any" }]
      }
    }
  },
  "attendance": {
    "accessCode": {
      "sanitized_name_key": "Full Student Name"
    }
  }
}
```

---

## 2. Interaction Patterns

### 2.1 Host Operations
| Operation | Path | Method | Effect |
| :--- | :--- | :--- | :--- |
| **Launch** | `/active_session` | `SET` | Initializes the session state. |
| **Navigate** | `/active_session/currentQuestionIndex` | `UPDATE` | Triggers a view change for all students. |
| **Pause/Resume** | `/active_session/status` | `UPDATE` | Halts or resumes participant entry. |
| **End** | `/active_session` | `SET (null)` | Teardown of the active session. |

### 2.2 Participant Operations
| Operation | Path | Method | Effect |
| :--- | :--- | :--- | :--- |
| **Join** | `/active_session/participantsCount` | `INCREMENT` | Updates the live participation tally. |
| **Identify** | `/attendance/{code}/{name}` | `SET` | Registers student presence. |
| **Submit** | `/active_session/allResponses/{idx}` | `UPDATE` | Appends response to the session aggregate. |

---

## 3. Persistence Strategy
- **Cloud (Firebase)**: Used strictly for *volatile* live data (Active Sessions).
- **Local (Browser)**: Used for *persistent* faculty data (Questionnaire Drafts, Host History). This ensures the app remains cost-effective and doesn't require backend user management for faculty.
