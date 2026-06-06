# Smart Mart Frontend

A modern React + Vite frontend for the Smart Mart Management System.

## Features
- Secure staff and member login
- Role-aware dashboard
- Product inventory management
- Sales register and bill creation
- Member management
- Workforce management for admins
- Responsive glassmorphism UI

## Setup
1. Create a `.env` file in this folder.
2. Add the backend URL:

```env
VITE_API_URL=http://localhost:5000
```

3. Install dependencies:

```bash
npm install
```

4. Start the app:

```bash
npm run dev
```

## Notes
- The backend must be running before login.
- Product creation requires a valid `categoryId` because the backend schema currently enforces it.
- Member login and staff login use different auth endpoints.
