# QR Safety Reporting System

Staff-focused electrical safety reporting portal with QR entry, voice reporting, tool/PPE checks, emergency contacts, admin dashboard, PostgreSQL support and SMTP notifications.

## Run frontend
```bash
cd frontend
npm install
npm run build
npm run dev
```

## Run backend
```bash
cd backend
./mvnw spring-boot:run
```
Windows: `mvnw.cmd spring-boot:run`

## Frontend environment
`VITE_API_BASE_URL=http://localhost:8080`

## Production backend
Set PostgreSQL variables from `backend/.env.example` plus SMTP variables.

## Email
Multiple recipients are supported; use commas, semicolons, or new lines. See `MULTI_EMAIL_SETUP.md`.

## Important
Do not commit `.env`, database passwords, SMTP passwords, or other secrets.
