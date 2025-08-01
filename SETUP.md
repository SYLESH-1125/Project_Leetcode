# 🏆 LeetCode Contest Auto-Tracker Setup Guide

## 📋 Quick Setup Steps

### 1. Supabase Database Setup

1. **Create Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project
   - Copy your Project URL and API Key

2. **Run Database Schema**
   - Go to your Supabase project → SQL Editor
   - Copy and paste the content from `supabase-schema.sql`
   - Run the SQL to create all tables

3. **Configure Environment Variables**
   - Update `.env.local` with your actual Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 2. Import Target Users

Run this command to import your 61 target users into the database:

```bash
node import-users.js
```

### 3. Start the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see your automated leaderboard!

## 🤖 Automation Features

### Automatic Contest Detection
- **Weekly Contests**: Every Sunday 8:00 AM - 9:30 AM IST
  - Auto-fetch at 10:00 AM IST
- **Biweekly Contests**: Every 2nd Saturday 8:00 PM - 9:30 PM IST
  - Auto-fetch at 11:00 PM IST

### Manual Triggers
- Use the "🚀 Trigger Fetch" button in the UI
- Call the API: `POST /api/automation/trigger`

### Database Tables
- `contests`: All contest information
- `target_users`: Your 61 tracked users
- `user_contest_results`: Participation results
- `contest_stats`: Performance statistics

## 🔧 API Endpoints

- `GET /api/contests` - List all contests
- `GET /api/contests/[id]` - Get specific contest data
- `POST /api/automation/trigger` - Manually trigger data fetch
- `GET /api/leaderboard/summary` - Get leaderboard summary

## 📊 Features

✅ **Automated Contest Detection**: Automatically finds new contests  
✅ **Cloudflare Bypass**: Advanced headers for reliable data fetching  
✅ **User Matching**: Smart username variation matching  
✅ **Performance Analytics**: Comprehensive scoring and ranking  
✅ **Real-time UI**: Live updates with automation triggers  
✅ **Database Storage**: Persistent storage with Supabase  
✅ **Scheduling**: Cron-based automation for hands-off operation  

## 🎯 Next Steps

1. Set up your Supabase project
2. Import your target users
3. Let the system run automatically!

The system will automatically detect new contests and fetch data after they complete. You can also manually trigger fetches using the UI button.

---

**🔄 Automation Status**: The system runs 24/7 and checks for new contests every hour. When a contest ends, it automatically fetches all participant data and updates your leaderboard.
