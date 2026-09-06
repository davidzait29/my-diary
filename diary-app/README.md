# 📖 My Private Diary

A complete, production-ready private digital diary web application.

- **Frontend**: React + Vite → GitHub Pages (free)
- **Backend**: Node.js + Express → Railway (free tier)
- **Database**: Supabase (free tier)
- **Auth**: bcrypt-hashed password + JWT sessions
- **Storage**: All diary data in private Supabase database (never in GitHub)

---

## Architecture

```
Browser (GitHub Pages)
        ↓ HTTPS
Express API (Railway)
        ↓ Service Role Key (server-side only)
Supabase Postgres
```

The password is **hashed with bcrypt** in the database. The backend verifies it and issues a **JWT token**. The token lives in `sessionStorage` (cleared when browser closes). No password or secret ever touches the frontend.

---

## Quick Start

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free)
- A [Railway](https://railway.app) account (free tier)
- A GitHub account

---

## Step 1 — Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a name, region, and password → **Create project**
3. In the left sidebar → **SQL Editor** → **New query**
4. Copy the entire contents of `supabase-schema.sql` and paste it → **Run**
5. Go to **Project Settings → API**
6. Copy:
   - **Project URL** → this is your `SUPABASE_URL`
   - **service_role** secret key → this is your `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ Never share or commit the service_role key. It has full database access.

---

## Step 2 — Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Connect your GitHub account and select your repository
3. Railway will detect the `backend/` folder. Set the **root directory** to `backend`
4. Go to **Variables** and add:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=paste-a-long-random-string-here
JWT_EXPIRES_IN=12h
FRONTEND_URL=https://yourusername.github.io
PORT=3001
```

To generate a JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

5. Railway will auto-deploy. Copy your public Railway URL (e.g. `https://diary-backend-xxxx.railway.app`)

---

## Step 3 — Deploy Frontend to GitHub Pages

1. Create a GitHub repository (can be public — your diary data is NOT in it)
2. Push this project to the repository:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

3. In GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**:
   - `VITE_API_URL` = your Railway backend URL (e.g. `https://diary-backend-xxxx.railway.app`)
   - `VITE_BASE_PATH` = `/your-repo-name/` (if using `username.github.io/repo-name`) OR `/` (for custom domain)

4. In GitHub repo → **Settings → Pages**:
   - Source: **GitHub Actions**

5. Push any commit to `main` — the GitHub Action builds and deploys automatically.

6. Your diary will be at: `https://yourusername.github.io/your-repo-name/`

---

## Step 4 — First-Time Setup

1. Open your diary URL
2. You'll see **"Welcome — Create your private diary password"**
3. Enter and confirm your password → **Create Private Diary**
4. You'll be taken to the lock screen
5. Enter your password → **Unlock**
6. Your diary is ready!

---

## 📅 Daily Diary Workflow

> **How to add a new diary entry every day**

### Step 1 — Create a TXT file on your computer

Name it with today's date:
```
2026-09-06.txt
```

Supported filename formats:
- `2026-09-06.txt` — date used automatically
- `2026-09-06-my-wonderful-day.txt` — date + title
- `my-day-2026-09-06.txt` — title + date
- `anything.txt` — you'll be asked to set the date

### Step 2 — Write your diary entry

Open the file in any text editor (Notepad, TextEdit, VS Code, etc.) and write freely. Supports English, Hindi, emojis, and any Unicode text.

```
Today was an incredible day. I went to the market early...

Met my old friend Priya after three years. We talked for hours
about everything — life, dreams, the small things we miss.

I feel grateful tonight.
```

Save the file.

### Step 3 — Upload to your diary

1. Open your diary website
2. Enter your PIN → Unlock
3. Click the **+** button (bottom-right corner on desktop, top-right on mobile)
4. Drag-and-drop your `.txt` file, or click to choose it
5. Edit the title if needed
6. Click **Save Entry**
7. Your entry appears instantly — no code changes, no redeployment needed ✓

---

## How to Edit an Entry

1. Open any diary entry
2. Click **Edit** (pencil icon in the top bar)
3. Edit the title, date, or content
4. Click **Save Entry**

---

## How to Delete an Entry

1. Open the entry
2. Click the **trash icon** (top right)
3. Confirm deletion in the dialog
4. Entry is permanently removed

---

## How to Favorite an Entry

1. Open the entry
2. Click the **star icon** (top right)
3. It turns gold — the entry is now in your Favorites
4. Find all favorites under **★ Favorites** in the sidebar

---

## How to Search

1. Click **Search** in the sidebar
2. Type any word, phrase, date, or title
3. Results appear as you type (searches title + content)

---

## How to Download an Entry

1. Open the entry
2. Click **Export** → downloads as a `.txt` file

---

## How to Export All Entries (Backup)

1. Go to **Settings**
2. Click **Export JSON**
3. A `.json` file downloads with all entries and metadata

---

## How to Change Your Password

1. Go to **Settings → Security → Change Password**
2. Enter your current password
3. Enter and confirm your new password
4. Click **Change Password**
5. You'll be logged out automatically — log back in with the new password

---

## Backup & Restore

### Backup Strategy

Your diary data is stored in Supabase's managed Postgres database.

**Manual backup (recommended weekly):**
1. Go to Settings → Export JSON
2. Save the file to a safe location (your computer, cloud drive, etc.)

**Supabase automatic backups:**
- Free tier: 7-day Point-in-Time Recovery
- Paid tier: longer retention

**Raw database backup via Supabase Dashboard:**
1. Supabase Dashboard → **Database** → **Backups**
2. Download a backup

### Restore from JSON Backup

If you need to restore from a JSON export:

1. Set up a fresh Supabase project with the schema
2. Use the Supabase SQL editor to insert entries from your backup
3. Or write a simple restore script using the backend API

### Recovery Scenarios

| Scenario | Recovery |
|---|---|
| Website deleted | Redeploy from GitHub (data is in Supabase) |
| GitHub repo lost | Redeploy fresh frontend + backend. Data stays in Supabase |
| Supabase project deleted | Restore from JSON backup export |
| Forgot password | Reset via Supabase SQL: `UPDATE owner SET password_hash = 'new-hash'` |

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role secret key |
| `JWT_SECRET` | Random 64-char secret for signing tokens |
| `JWT_EXPIRES_IN` | Session duration e.g. `12h`, `7d` |
| `FRONTEND_URL` | Your GitHub Pages URL (for CORS) |
| `PORT` | Port to run on (Railway sets this automatically) |

### Frontend (GitHub Secrets)

| Secret | Description |
|---|---|
| `VITE_API_URL` | Your Railway backend URL |
| `VITE_BASE_PATH` | Base path for GitHub Pages (e.g. `/my-diary/`) |

---

## Running Locally

```bash
# Clone the repo
git clone https://github.com/yourusername/your-repo.git
cd your-repo

# Backend
cd backend
cp .env.example .env
# Fill in .env with your Supabase credentials
npm install
npm run dev

# Frontend (new terminal)
cd frontend
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:3001
npm install
npm run dev
```

Open http://localhost:5173

---

## Security Features

- ✅ Password hashed with **bcrypt** (cost factor 12)
- ✅ JWT tokens with expiry — never stored in localStorage
- ✅ Rate limiting: 10 login attempts per 15 minutes per IP
- ✅ All API endpoints verify JWT server-side
- ✅ CORS restricted to your frontend domain only
- ✅ Supabase RLS blocks any direct anon/public access
- ✅ Service role key is server-side only, never in frontend
- ✅ Diary content treated as plain text — no XSS risk
- ✅ Confirm dialog before delete
- ✅ No passwords in source code, git history, or localStorage
- ✅ `noindex` meta tag — search engines won't index the diary

---

## Project Structure

```
diary-app/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Auto-deploy to GitHub Pages
├── backend/
│   ├── src/
│   │   ├── index.js            # Express server
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT verification
│   │   ├── routes/
│   │   │   ├── auth.js         # Login, change password
│   │   │   ├── entries.js      # CRUD + upload
│   │   │   └── setup.js        # First-time setup
│   │   └── utils/
│   │       └── supabase.js     # DB client
│   ├── .env.example
│   ├── package.json
│   └── railway.toml
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # React contexts (Auth, Toast)
│   │   ├── pages/              # Page components
│   │   ├── styles/             # Global CSS
│   │   ├── utils/              # API client, date helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── supabase-schema.sql          # Run this in Supabase SQL editor
├── .gitignore
└── README.md
```

---

## FAQ

**Can I use a custom domain?**
Yes. In GitHub Pages settings, add your custom domain. Set `VITE_BASE_PATH=/` and update `FRONTEND_URL` in the backend env.

**How do I reset my password if I forget it?**
Go to Supabase SQL Editor and run:
```sql
-- First generate a new hash with bcrypt (cost 12) for your new password
-- Then update:
UPDATE owner SET password_hash = 'new-bcrypt-hash-here';
```
Or delete the owner row and go through setup again (diary entries are preserved).

**Is this safe to put on a public GitHub repo?**
Yes. The repository contains only frontend code and backend code — no passwords, no keys, no diary entries. All secrets are in environment variables set in Railway and GitHub Secrets.

**What happens if my session expires?**
You'll be redirected to the lock screen to re-enter your PIN.
