# Security Infrastructure & Mitigations

Academic integrity and data protection are core components of the UAQS architecture. The system employs a "Defense in Depth" strategy across several layers.

---

## 1. Input Hardening (XSS / Injection)
The system treats all user-provided text as untrusted. 
- **Recursive Sanitization**: The `sanitizeInput` utility recursively removes HTML tags and encoded script fragments to prevent nested injection.
- **Protocol Stripping**: Specifically targets `javascript:` and `on...` event handlers.

## 2. Brute-Force & Bot Mitigation
- **Access Code Entropoy**: While 4-digit codes are user-friendly, they are vulnerable to enumeration.
- **Join Cooldowns**: Clients implement a 5-attempt threshold. Upon breach, a 30-second security lockout is enforced.
- **Honeypot Checks**: Join forms include invisible fields to detect and reject automated bot submissions.

## 3. Session Integrity
- **App Check**: Integration with **Firebase App Check (reCAPTCHA v3)** ensures that only requests coming from the verified UMak web application are accepted by the Realtime Database.
- **Client Fingerprinting**: Every join operation generates a unique fingerprint based on `userAgent` and `language`. This prevents a single participant from easily submitting multiple counts or responses without device modification.

## 4. Production Hardening
- **Console Obfuscation**: The `secureLog` utility ensures that diagnostic data is only visible on `localhost`. Production logs are suppressed to prevent leaking internal session IDs or payloads to the browser console.
- **Firebase Rules**: Root-level rules enforce that only the session host can terminate a session, while participants are restricted to `push` operations on the `allResponses` branch.

---
*© 2026 University of Makati - Security Operations Group*
