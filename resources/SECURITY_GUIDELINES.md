# Android App Security - Coding Level Best Practices
## University of Makati - Official Academic Resource

This document outlines the mandatory security standards for clinical and academic mobile development.

### 1. Secure Data Storage
*   **Plain Text Warning**: Never store PII (Personally Identifiable Information), passwords, or tokens in plain text.
*   **Android Keystore**: Use for managing cryptographic keys so they cannot be extracted from the device.
*   **EncryptedSharedPreferences**: Use `Security-crypto` library for key-value storage.
*   **Database Encryption**: Implement SQLCipher for local SQLite instances.

### 2. Secure Network Communication
*   **TLS Protocol**: Enforce TLS 1.2+ for all API interactions.
*   **Cleartext Traffic**: Set `android:usesCleartextTraffic="false"` in manifest.
*   **Certificate Pinning**: Prevent Man-in-the-Middle (MITM) attacks by pinning trusted certificates.

### 3. Input Validation
*   **Sanitization**: All inputs from Intents, APIs, and Forms must be sanitized.
*   **SQL Injection**: Always use Parameterized Queries/ORMs.

### 4. WebView Security
*   **JavaScript**: Disable if not strictly required: `settings.setJavaScriptEnabled(false)`.
*   **File Access**: `settings.setAllowFileAccess(false)`.
*   **Safe Browsing**: Enable via `Manifest` and `WebView` settings.

### 5. Authentication & Session Management
*   **Standard Protocols**: Use OAuth 2.0 or OpenID Connect.
*   **Token Lifecycle**: Implement short-lived access tokens with secure refresh tokens stored in the Keystore.

### 6. Intent and Component Security
*   **Exported Components**: Set `android:exported="false"` unless external access is required.
*   **Implicit Intents**: Avoid for sensitive data transmission; use Explicit Intents.

### 7. Permission Management
*   **Least Privilege**: Request only the minimum permissions required for functionality.
*   **Runtime Requests**: Always check and request permissions at the time of use.

### 10. Error and Exception Handling
*   **Stack Traces**: Never expose internal logic or traces to the end-user.
*   **Generic Messages**: Provide user-friendly errors; log technical details only in secure, non-production logs.

---
*Created for the UMAK Academic Portal Security Initiative.*
