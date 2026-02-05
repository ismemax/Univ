# 📝 Project Changelog - UMak Academic Portal

This log tracks all major architectural, visual, and functional changes made to the University of Makati Academic Questionnaire System.

---

## 📅 Current Session (February 5, 2026)

### 🏛️ Visual Identity & Branding
- **Official Color Palette**: Implemented `umak-blue` (#004A98), `umak-navy` (#01244E), and `umak-yellow` (#FDB813) across all UI components.
- **Institutional Typography**: Integrated `Marcellus` for academic headings and `Montserrat` for functional body text.
- **Unified Branding**: Applied consistent themes to:
  - `Header.tsx` (University logotype).
  - `Home.tsx` (Hero branding).
  - `Login.tsx` (SSO Portal aesthetic).
  - `FacultyDashboard.tsx` (Management interface).
  - `StudentPoll.tsx` (Participant interface).

### 🛠️ Core Functionality & Logic
- **Enhanced Data Visualization**:
  - Updated `LiveSession.tsx` Pie Charts to support weighted scoring for **Ranking Questions**.
  - Added empty-state placeholders to charts to improve user experience when no responses are present.
- **Robust PDF Reporting**:
  - Re-engineered `jsPDF` logic to include official UMak headers and color-coordinated results.
- **Universal Fixes**:
  - Resolved **"Double Encoding" bug**: Fixed `securityUtils.ts` to allow apostrophes (`'`) and other characters to render correctly while maintaining XSS protection.
  - **Asset Localization**: Updated all components to reference a local `/umak-logo.png` asset for better reliability.

### 📄 Documentation & Governance
- **Created Documentation Suite**:
  - `TECH_STACK.md`: Full breakdown of languages (TS/HTML/CSS) and frameworks (React/Vite/Firebase).
  - `DATABASE_SCHEMA.md`: Documentation of the real-time NoSQL JSON tree.
  - `IMPLEMENTATION_PLAN.md`: Strategic roadmap and architectural overview.

---

## 📊 Summary of Modified Files
- `index.html`: Branding configuration and font imports.
- `App.tsx`: Navigation logic and Firebase synchronization.
- `components/Header.tsx`, `Home.tsx`, `Login.tsx`: Visual overhauls.
- `components/LiveSession.tsx`: Chart logic and PDF exports.
- `components/StudentPoll.tsx`: Response interaction UI.
- `utils/securityUtils.ts`: Sanitization and integrity logic.

---
*End of Log*
