# Admin/Owner Registration - Frontend Required Fields

## 📋 Overview

To register/create an admin (owner) in your Billstack ERP/CRM system, the frontend must call the admin creation endpoint with specific required fields.

---

## 🔗 API Endpoint

**URL:** `/api/admin/create`

**Method:** `POST`

**Content-Type:** `application/json`

---

## ✅ Required Fields

### Field Details

| Field | Type | Required | Min Length | Description |
|-------|------|----------|-----------|-------------|
| `name` | String | ✅ YES | 1 char | First name of admin |
| `email` | String | ✅ YES | Valid email | Email address (must be unique) |
| `password` | String | ✅ YES | 6 chars | Password (minimum 6 characters) |
| `surname` | String | ❌ NO | - | Last name of admin |
| `role` | String | ❌ NO | - | Always "owner" for admins (default) |

---

## 📤 Request Example

### Minimal Request (Required Fields Only)
```json
{
  "name": "John",
  "email": "admin@company.com",
  "password": "SecurePassword123"
}
```

### Complete Request (All Fields)
```json
{
  "name": "John",
  "surname": "Doe",
  "email": "john.doe@company.com",
  "password": "SecurePassword123",
  "role": "owner"
}
```

---

## 📥 Response Example

### Success Response (Status 200)
```json
{
  "success": true,
  "result": {
    "_id": "665d1f2a8c1b2e3f4g5h6i7j",
    "name": "John",
    "surname": "Doe",
    "email": "john.doe@company.com",
    "photo": null,
    "role": "owner",
    "enabled": true,
    "removed": false,
    "created": "2025-12-05T11:30:00.000Z"
  },
  "message": "Successfully Created the user"
}
```

### Error Response - Duplicate Email (Status 409)
```json
{
  "success": false,
  "result": null,
  "message": "This email is already registered."
}
```

### Error Response - Invalid Fields (Status 409)
```json
{
  "success": false,
  "result": null,
  "message": "Invalid/Missing required fields for user create.",
  "errorMessage": "\"email\" must be a valid email"
}
```

---

## 🔐 Validation Rules

### Name
- **Type:** String
- **Required:** Yes
- **Min Length:** 1 character
- **Validation:** Must be a non-empty string

### Email
- **Type:** String
- **Required:** Yes
- **Format:** Valid email format (user@domain.com)
- **Unique:** Must not exist in database
- **Validation:** RFC-compliant email validation

### Password
- **Type:** String
- **Required:** Yes
- **Min Length:** 6 characters
- **Validation:** No special rules, but strong passwords recommended
- **Note:** Automatically hashed before storage

### Surname
- **Type:** String
- **Required:** No
- **Default:** null/empty
- **Can be:** Empty string or null

### Role
- **Type:** String
- **Required:** No
- **Allowed Values:** "owner"
- **Default:** "owner"
- **Note:** Currently only "owner" role is supported

---

## 📝 Frontend Implementation Examples

### JavaScript/Fetch
```javascript
async function registerAdmin(formData) {
  try {
    const response = await fetch('/api/admin/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.firstName,
        surname: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: 'owner'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Admin created:', data.result);
      // Redirect to login or dashboard
    } else {
      console.error('Error:', data.message);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}
```

### Axios
```javascript
async function registerAdmin(formData) {
  try {
    const response = await axios.post('/api/admin/create', {
      name: formData.firstName,
      surname: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: 'owner'
    });

    console.log('Admin created:', response.data.result);
  } catch (error) {
    console.error('Error:', error.response.data.message);
  }
}
```

### React Hook Form Example
```javascript
import { useForm } from 'react-hook-form';

function AdminRegistration() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await fetch('/api/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.firstName,
          surname: data.lastName,
          email: data.email,
          password: data.password,
          role: 'owner'
        })
      });

      const result = await response.json();
      if (result.success) {
        // Success handling
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input 
        {...register('firstName', { required: true })} 
        placeholder="First Name" 
      />
      <input 
        {...register('lastName')} 
        placeholder="Last Name (Optional)" 
      />
      <input 
        {...register('email', { required: true })} 
        type="email" 
        placeholder="Email" 
      />
      <input 
        {...register('password', { required: true, minLength: 6 })} 
        type="password" 
        placeholder="Password (Min 6 chars)" 
      />
      <button type="submit">Register Admin</button>
    </form>
  );
}
```

---

## 🧪 cURL Test Example

```bash
# Test admin registration
curl -X POST http://localhost:8888/api/admin/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "surname": "Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'

# Expected response (success):
# {
#   "success": true,
#   "result": {
#     "_id": "...",
#     "name": "John",
#     "surname": "Doe",
#     "email": "john@example.com",
#     "role": "owner",
#     "enabled": true
#   },
#   "message": "Successfully Created the user"
# }
```

---

## ⚠️ Important Notes

### 1. **Email Uniqueness**
- Each admin must have a **unique email**
- If email already exists, you'll get: `"This email is already registered."`
- Check for existing email before registration

### 2. **Password Requirements**
- Minimum **6 characters**
- No uppercase/lowercase requirements in validation
- But **recommend strong passwords** (8+ chars with mixed case & numbers)
- Password is **hashed** before storage (never stored in plain text)

### 3. **Role Field**
- Currently accepts "owner" or empty
- If not provided, defaults to "owner"
- Only "owner" role is supported for admin

### 4. **Optional Fields**
- `surname` is optional (can be empty string or null)
- `role` is optional (defaults to "owner")

### 5. **No Authentication Required**
- Admin creation endpoint is **public** (first admin registration)
- Once system is set up, you may want to add authorization

---

## 🔄 Complete Registration Flow

```
1. User fills registration form
   ├─ name (required)
   ├─ surname (optional)
   ├─ email (required, must be valid)
   └─ password (required, min 6 chars)

2. Frontend validates locally
   ├─ Check email format
   ├─ Check password length
   └─ Show errors if invalid

3. Frontend sends POST to /api/admin/create
   └─ Body: { name, surname, email, password, role }

4. Backend validates
   ├─ Validate all fields
   ├─ Check email not duplicate
   └─ Check password length

5. Backend creates admin
   ├─ Hash password
   ├─ Save admin record
   └─ Save password record

6. Return success response
   └─ Include admin details (without password)

7. Frontend handles response
   ├─ If success: redirect to login
   └─ If error: show error message
```

---

## 📊 Admin Model Structure

After successful registration, the admin record contains:

```javascript
{
  _id: ObjectId,           // Unique identifier
  name: String,            // Required
  surname: String,         // Optional
  email: String,           // Required, unique
  photo: String,           // Optional (for profile picture)
  role: String,            // Always "owner"
  enabled: Boolean,        // Always true on creation
  removed: Boolean,        // Always false on creation
  created: Date,           // Timestamp
  __v: Number              // Version field
}
```

---

## 🔗 Related Endpoints

### Login (After Registration)
```bash
POST /api/login
{
  "email": "admin@company.com",
  "password": "Password123"
}
```

### Update Admin Profile
```bash
PATCH /api/admin/profile/update
(Requires authentication token)
```

### Update Admin Password
```bash
PATCH /api/admin/profile/password
(Requires authentication token)
```

---

## ✅ Quick Checklist for Frontend

- [ ] Collect: name (required)
- [ ] Collect: surname (optional)
- [ ] Collect: email (required, validate format)
- [ ] Collect: password (required, min 6 chars)
- [ ] Validate: email format (RFC compliant)
- [ ] Validate: password length (min 6)
- [ ] Show password strength indicator (optional)
- [ ] POST to `/api/admin/create`
- [ ] Handle success response (redirect to login)
- [ ] Handle error response (show error message)
- [ ] Handle duplicate email error specifically
- [ ] Hash password on frontend? (No - backend does it)

---

## 🎯 Summary

**Minimum Required Fields:**
1. `name` - String (required)
2. `email` - Valid email (required, unique)
3. `password` - String min 6 chars (required)

**Optional Fields:**
- `surname` - String
- `role` - String (defaults to "owner")

**Endpoint:** `POST /api/admin/create`

**Response:** Admin object with `_id`, `name`, `email`, `role`, `enabled`, `created`

