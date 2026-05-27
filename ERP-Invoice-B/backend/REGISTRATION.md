# User registration & creation (Backend API)

This document describes how to register users (clients) and create admin accounts.

1) Login (Admin)
- Endpoint: POST /api/login
- Body JSON:
  {
    "email": "admin@admin.com",
    "password": "admin123"
  }
- Response: 200 success -> returns token in result.token

2) Create a Client (Admin only)
- Endpoint: POST /api/client/create
- Protection: Requires Authorization header with admin JWT: `Authorization: Bearer <token>`
- Body JSON (minimum fields):
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "country": "US",
    "address": "123 Road St"
  }
- Response: 200 success -> result contains the created client document

3) Create an Admin (Admin only — protected endpoint)
- Endpoint: POST /api/admin/create
- Protection: Requires Authorization header with admin JWT: `Authorization: Bearer <token>`
- Body JSON:
  {
    "name": "Admin Name",
    "email": "admin2@example.com",
    "password": "s3cret_pass",
    "surname": "Lastname",
    "role": "owner"
  }
- Note: This endpoint will create the Admin (in `Admin` collection) and a corresponding `AdminPassword` document with the hashed password.

4) Alternative Admin creation (setup script)
- Run `npm run setup` to seed one default admin (`admin@admin.com` / `admin123`) and default settings. This is for dev only.

5) Best practices & checks you should do
- Validate incoming data using Joi or express-validator (this repo uses Joi). Example checks:
  - Email: valid email, unique.
  - Password: strong enough (MIN length, complexity).
  - Name: required.
  - Role: only accept allowed roles.
- Prevent public access to admin creation endpoints (protect with admin token or use invite tokens).
- On client creation: set `createdBy` or `assigned` to `req.admin._id`, and validate `createdBy` exists.
- Logging and monitoring: log admin creation or client create events.
- Rate-limiting: add to login and registration endpoints to avoid abuse.
- Email verification: optionally create a flow to send verification via `Resend` and toggle `emailVerified`.

6) Example cURL commands
- Login:
```
curl -X POST http://localhost:8888/api/login -H 'Content-Type: application/json' -d '{"email":"admin@admin.com","password":"admin123"}'
```

- Create client:
```
curl -X POST http://localhost:8888/api/client/create -H 'Content-Type: application/json' -H "Authorization: Bearer <TOKEN>" -d '{"name":"John Doe","email":"john@example.com"}'
```

- Create admin:
```
curl -X POST http://localhost:8888/api/admin/create -H 'Content-Type: application/json' -H "Authorization: Bearer <TOKEN>" -d '{"name":"New Admin","email":"newadmin@example.com","password":"adminPass123"}'
```

7) If you need public self-registration
- Add a `publicRoutes` endpoint for clients such as `/api/public/register` that allows creating a `Client` with validation; protect admin creation and other operations.
- Ensure you rate-limit, validate fields, and verify emails if necessary.
