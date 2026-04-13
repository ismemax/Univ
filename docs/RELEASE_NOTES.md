# Release Notes: UMak Academic Questionnaire System

## [v1.2.0] - 2026-04-13
### Added
- **Student Identification System**: Instructors can now mandate that participants provide their legal names before entering an assessment.
- **Participant Registry**: Added a live host-side dashboard showing the names of verified participants as they submit responses.
- **Identifiable Reports**: PDF reports now include a "Verified Participants" section for official academic record-keeping.
- **Modernized Header**: Simplified navigation menu for improved pedagogical focus, removing redundant links while preserving core functionality.
- **Open-Access Model**: Removed the mock login system and credential gating to allow immediate, frictionless access to academic tools for all faculty members.

### Improved
- **Student Onboarding**: Integrated a dedicated "Identity Gate" UI for students with validation check (min 3 characters).
- **Lobby Experience**: Students now see their active login identity while waiting for the session to start.

## [v1.1.0] - 2026-04-13
### Added
- **Synchronized Pausing**: Instructors can now pause and resume the live timer across all student devices simultaneously.
- **Time Drift Compensation**: Resuming a session now accurately accounts for the duration it was paused, ensuring no time is lost or gained unfairly.
- **Enhanced UI Feedback**: Host controls now explicitly show "Paused" and "Updating" states to confirm successful database interaction.
- **Comprehensive Documentation**: Added API, System, and Product documentation suites formatted to industry standards.

### Fixed
- **Timer Sync Bug**: Resolved an issue where the student countdown would continue running even when the instructor paused the question locally.
- **State Confusion**: Fixed a race condition where the "Resume" button would occasionally revert to its previous state after being clicked.
- **Security Rule Conflicts**: Added `'paused'` to the list of modifiable states in the database security protocols.

## [v1.0.0] - 2024-04-01
### Initial Release
- **Multiple Question Formats**: Support for MCQs, Short Answer, Essay, and Ranking.
- **Real-time Synchronization**: Instant data delivery via Firebase Websockets.
- **Institutional Branding**: Custom UI tokens tailored for University of Makati.
- **PDF Reporting**: On-demand generation of academic assessment reports.

---
*For version history details, refer to the commit logs in the source repository.*
