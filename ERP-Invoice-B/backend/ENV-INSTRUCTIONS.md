# Environment & startup instructions (backend)

1) Copy the environment file

```powershell
cd backend
cp .env.example .env
```

2) Update `.env` values
- Open `.env` and replace placeholders with real values — especially `DATABASE`, `JWT_SECRET`, and other integrations keys.

3) Start in development
- Install dependencies (if not already):

```powershell
cd backend
npm install
```

- Start the dev server (nodemon):

```powershell
npm run dev
```

4) Run the setup script (create default admin & settings)

```powershell
npm run setup
```

5) Reset data (delete sample admin & settings)

```powershell
npm run reset

8) Verify DB connection (quick check)

```powershell
npm run db:check
```

This script connects to the configured `DATABASE` and lists the collections. If there are no collections, this may mean you haven’t run `npm run setup` yet or the app connected to a different database.

9) Install MongoDB on Windows (local run)

- Download & install from MongoDB Community Server: https://www.mongodb.com/try/download/community
- During install, if you configure it as a Windows Service, MongoDB will start automatically and you can run `net start MongoDB` to start if needed.
- If using a manual `mongod` start: create a data folder and run (PowerShell):

```powershell
mkdir C:\data\db -Force
mongod --dbpath C:\data\db
```

Alternatively, install MongoDB via a package manager or tools like `choco`.

10) View DB collections (GUI)

- Use MongoDB Compass (official GUI) to connect to `mongodb://localhost:27017` and see the `billstack-db` database.
- If you prefer CLI: run MongoDB Shell (mongosh):

```powershell
mongosh mongodb://localhost:27017/billstack-db
show dbs
use billstack-db
show collections
```

11) If you cannot see expected collections

- Ensure you connected to the correct database uri from `.env`.
- If you haven't populated default records yet, run:

```powershell
npm run setup
```

- Run the DB check script to verify connection and list collections:

```powershell
npm run db:check
```

- If this script fails:
	- Check MongoDB is running and listening on `localhost:27017`.
	- Check firewall or port conflicts.
	- Check the `DATABASE` value in `.env`.
```

6) Starting in production (PowerShell)

- To temporarily set NODE_ENV and start the server in PowerShell:

```powershell
$env:NODE_ENV='production'; npm start
```

- To set NODE_ENV persistently in Windows (set it once):

```powershell
setx NODE_ENV "production"
```

7) Additional notes
- Avoid committing real secrets into the repo. Use `.env` local file and ensure it's in `.gitignore`.
- If your production environment requires different env var values, keep them in a secure place (secret manager) and/or a different `.env` that you deploy separately.
