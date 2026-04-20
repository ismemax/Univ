# Installation & Development Setup

Follow these steps to initialize the UAQS environment for local development or production deployment.

---

## 1. Technical Prerequisites
- **Node.js**: Version 18.0.0 or higher.
- **Package Manager**: NPM (bundled with Node) or Yarn.
- **Firebase Project**: A Firebase project with **Realtime Database** and **App Check** enabled.

---

## 2. Configuration
The application uses environment variables for configuration. Create a `.env.local` file in the project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Security
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_v3_site_key
```

---

## 3. Development Workflow
1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Start Dev Server**:
    ```bash
    npm run dev
    ```
    *Local access: `http://localhost:5173`*

3.  **Build for Production**:
    ```bash
    npm run build
    ```
    *The output will be in the `/dist` directory.*

---

## 4. Deployment
The application is a stateless Single Page Application (SPA). It can be deployed to:
- **Vercel**: (Optimized for React/Vite)
- **Firebase Hosting**: (Recommended for tight integration)
- **GitHub Pages**: (Requires SPA routing fallback)
