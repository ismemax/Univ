# Release Notes: UMak Academic Questionnaire System

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
