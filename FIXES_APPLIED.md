# QR Safety Reporting System — Fixed Version

## Important fixes
- Frontend no longer creates a fake success ticket when the backend is down.
- Report submission now requires a real successful `POST /api/reports` response.
- Emergency Directory uses `VITE_API_BASE_URL` for GET/POST/DELETE.
- Admin login no longer has a frontend-only bypass.
- Removed hard-coded admin credentials from the authentication logic.
- Removed automatic fake/sample safety reports at backend startup.
- Local development defaults to H2; production can use PostgreSQL through environment variables.
- Added `GET /health` for deployment health checks.
- Removed the fragile custom PostgreSQL URL parser; Spring Boot handles normal JDBC environment variables directly.

## Frontend environment
Create `frontend/.env.local` for local development if the backend is not served from the same origin:

```env
VITE_API_BASE_URL=http://localhost:8080
```

For Vercel, set the same variable to your deployed backend URL, for example:

```text
VITE_API_BASE_URL=https://YOUR-BACKEND.onrender.com
```

## Backend PostgreSQL environment
Set these on your backend host:

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://HOST:5432/DATABASE?sslmode=require
SPRING_DATASOURCE_DRIVER=org.postgresql.Driver
SPRING_DATASOURCE_USERNAME=YOUR_DB_USER
SPRING_DATASOURCE_PASSWORD=YOUR_DB_PASSWORD
SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect
SPRING_JPA_HIBERNATE_DDL_AUTO=update
ADMIN_PIN=YOUR_PIN
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YOUR_PASSWORD
```

## Local backend
From `backend`:

```powershell
.\mvnw.cmd spring-boot:run
```

Then open `http://localhost:8080/health`. It should return JSON with `status: UP`.

## Local frontend
From `frontend`:

```powershell
npm install
npm run dev
```

If the frontend is on Vite and backend on port 8080, use `VITE_API_BASE_URL=http://localhost:8080`.


## Final V6 changes
- Admin Email Setup restored; public report forms still have no email field.
- Witness name/details and recipientEmail removed from frontend/backend report DTOs and types.
- Tool Safety Checklist no longer contains predefined checklist items; admins add items manually and can delete them.
- Checklist submission requires at least one manually added item.
