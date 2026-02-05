# 🛠️ Technology Stack - UMak Academic Portal

This document outlines the core technologies, languages, and libraries used in the development of the UMak Academic Questionnaire System.

## 1. Core Languages
- **TypeScript**: Used for all application logic to ensure type safety, reduce runtime errors, and improve developer experience with autocompletion and refactoring tools.
- **HTML5**: The semantic foundation for the web structure.
- **CSS3**: Enhanced with **Tailwind CSS** for rapid and modern UI development.

## 2. Frontend Framework & Tools
- **React 19**: The core library for building the interactive user interface, utilizing functional components and hooks (`useState`, `useEffect`, `useMemo`).
- **Vite 6**: A lightning-fast build tool and dev server that provides HMR (Hot Module Replacement) and optimized production builds.
- **Tailwind CSS**: A utility-first CSS framework used for implementing the UMak branding system, responsive design, and premium aesthetics.

## 3. Backend & Infrastructure
- **Firebase (v12)**:
  - **Realtime Database**: Used for instantaneous synchronization of session data between Faculty (presenters) and Students (participants).
  - **Firebase Hosting**: (Recommended) For deploying the static application.
  - **Security Rules**: Custom JSON rules to ensure academic integrity and data protection.

## 4. Key Libraries
- **Recharts**: For rendering high-performance, responsive result charts (Pie, Bar) in the Faculty Dashboard and Live Session view.
- **jsPDF**: For generating professional-grade UMak Assessment Reports in PDF format.
- **qrcode.react**: For generating dynamic access codes that students can scan to join live sessions instantly.
- **Lucide Icons / Custom SVGs**: For modern, consistent visual metaphors across the platform.

## 5. Design Assets
- **Google Fonts**:
  - `Marcellus`: For institutional serif headings (UMak Signature style).
  - `Montserrat`: For modern, clean sans-serif body text and interface elements.
- **Branding**: Official University of Makati color palette and logos stored in the `public/` directory.
