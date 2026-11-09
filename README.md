# VaultCheck — Password Breach Checker

A beginner-friendly full-stack project inspired by Have I Been Pwned, with a distinct interface.

## Requirements
- Node.js 18 or newer
- Internet connection for the Have I Been Pwned Passwords API lookup

## Run the project
1. Extract this ZIP.
2. Open the `backend` folder in VS Code.
3. Open a terminal in that folder.
4. Run:
   ```bash
   npm start
   ```
5. Open `http://localhost:5000` in your browser.

No API key is required for the public Pwned Passwords range endpoint.

## API routes

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/check` | Check a password against HIBP |
| GET | `/api/history` | Read check history |
| PUT | `/api/history/:id` | Replace editable record fields (`label`, `favorite`) |
| PATCH | `/api/history/:id` | Partially update `label` and/or `favorite` |
| GET | `/api/health` | Check whether the server is running |

### Example requests

POST `/api/check`
```json
{ "password": "example-password" }
```

PATCH `/api/history/RECORD_ID`
```json
{ "label": "My renamed check" }
```

PUT `/api/history/RECORD_ID`
```json
{ "label": "Updated check", "favorite": false }
```

## Security notes
- The browser sends the password to your own backend over the app's API request.
- The backend calculates a SHA-1 hash in memory and sends only the first five hash characters to HIBP's range endpoint.
- The original password and full hash are never stored in the history file or written to application logs.
- History stores only a generated record ID, label, breach count, favorite flag, and timestamp.
- Use HTTPS in production. This demo uses local HTTP during development.
- SHA-1 is used because it is the format required by this HIBP lookup protocol; it is not used to store passwords.
- A zero result means no match in this dataset, not proof that a password is universally safe.
- The JSON history file is suitable for learning/demo use, not a multi-user production deployment.
