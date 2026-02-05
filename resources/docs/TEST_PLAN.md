# 🧪 Test Plan - UMak Academic Discussion Board

This document outlines the testing strategy and specific test cases to ensure the stability, security, and reliability of the UMak Academic Discussion Board.

---

## 1. Objectives
- Verify real-time synchronization between Faculty and Student views.
- Ensure 100% anonymity for student responses.
- Validate data accuracy in Pie Charts and PDF Reports.
- Test cross-device compatibility (Desktop for Proctoring, Mobile for Participating).

---

## 2. Test Environment
- **Platform**: Web-based (Responsive Mobile/Desktop).
- **Backend**: Firebase Realtime Database.
- **Tools**: Manual Browser Testing, Chrome DevTools (Network throttling for latency testing).

---

## 3. Core Test Phases

### Phase 1: Authentication & Navigation
| Test Case ID | Feature | Description | Expected Result |
|:--- |:--- |:--- |:--- |
| T-101 | Faculty Toggle | Click "Enter Faculty Mode" in footer/header. | Direct access to Faculty Dashboard; User role set to 'FACULTY'. |
| T-102 | Student Access | Enter valid 4-digit Proctor Code on Home. | Join session lobby; View shifts to 'STUDENT_POLL'. |
| T-103 | Deep Linking | Scan QR code or use URL `?access=CODE`. | Bypass Home page; Automatically join the specific session. |

### Phase 2: Live Interaction (The "Flight" Test)
| Test Case ID | Feature | Description | Expected Result |
|:--- |:--- |:--- |:--- |
| T-201 | Question Flash | Proctor advances to Question 2. | Student's phone immediately updates to show Question 2 without refresh. |
| T-202 | Real-time Tally | 3 students submit Answer 'A'. | Proctor's Pie Chart slice for 'A' grows instantly. |
| T-203 | Timer Expiry | Let question timer reach 0:00. | Student input locks; Pie Chart results automatically reveal on phone. |
| T-204 | Atomic Counting | 10 students submit simultaneously. | Total count in database equals exactly 10 (no lost votes). |

### Phase 3: Response Handling & Security
| Test Case ID | Feature | Description | Expected Result |
|:--- |:--- |:--- |:--- |
| T-301 | Anonymity Check | Review Firebase Database content. | Responses stored as tallies or text only; No User IDs or names attached. |
| T-302 | Sanitization | Student submits `<script>alert(1)</script>`. | Text renders as plain string in dashboard/PDF; no script execution. |
| T-303 | Double Submission | Refresh page after voting. | "Access Restricted" message appears; user cannot vote twice for same Q. |

### Phase 4: Output & Reporting
| Test Case ID | Feature | Description | Expected Result |
|:--- |:--- |:--- |:--- |
| T-401 | PDF Generation | Click "Generate PDF Report" after session. | Downloadable UMak-branded PDF containing all questions and stats. |
| T-402 | Asset Loading | Check logo display in Header/Live QR. | Official UMak Seal is visible and high-resolution. |

---

## 4. Regression Testing
Before every deployment, verify "The Golden Path":
1.  **Create** a 2-question assessment.
2.  **Launch** session and copy code.
3.  **Join** as a student on a second device.
4.  **Submit** responses and verify the **Pie Chart** movement on proctor screen.
5.  **End** session and verify **PDF Report** data matches the live tally.

---
*Created: February 5, 2026 | UMak Institutional Technology Division*
