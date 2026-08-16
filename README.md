# Academic Decathlon Analytics Dashboard

A web-based dashboard for tracking your Academic Decathlon team's performance and analyzing competitor data in real-time.

## Features

✅ **My Team Performance** - Track weekly team scores  
✅ **Event Breakdown** - Monitor individual event performance  
✅ **Competitor History** - See 7-year trends with line graphs  
✅ **Team Event Profile** - Compare all schools across events  
✅ **Real-time Data Input** - Add scores and see charts update instantly  
✅ **Cloud Deployment** - Runs 24/7 on Vercel (free)  

## Setup

### 1. Create Supabase Account & Database

Go to https://supabase.com and create an account.

In SQL Editor, run:

```sql
CREATE TABLE team_scores (
  id BIGSERIAL PRIMARY KEY,
  week TEXT UNIQUE NOT NULL,
  score INTEGER NOT NULL
);

CREATE TABLE event_scores (
  id BIGSERIAL PRIMARY KEY,
  week TEXT NOT NULL,
  event TEXT NOT NULL,
  score INTEGER NOT NULL,
  UNIQUE(week, event)
);

CREATE TABLE competitor_scores (
  id BIGSERIAL PRIMARY KEY,
  year TEXT NOT NULL,
  school TEXT NOT NULL,
  score INTEGER NOT NULL,
  UNIQUE(year, school)
);
```

Get your `SUPABASE_URL` and `SUPABASE_KEY` from Settings → API.

### 2. Deploy to Vercel

1. Push code to GitHub
2. Go to https://vercel.com and sign in with GitHub
3. Import your repository
4. Add environment variables:
   - `SUPABASE_URL` = your URL
   - `SUPABASE_KEY` = your key
5. Deploy

Your app runs on a URL like: `https://yourname.vercel.app`

## Local Development

```bash
npm install
cd client && npm install && cd ..
npm start
```

App runs on http://localhost:3001

## Usage

- Click "Add Data" to input scores
- View 4 tabs: Team Performance, Events, Competitor History, Team Profiles
- All changes save instantly to Supabase

Enjoy your dashboard! 🎉
