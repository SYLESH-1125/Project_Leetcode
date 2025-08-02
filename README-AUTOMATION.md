# LeetCode Contest Auto-Fetcher & Leaderboard System

## Overview
Automated system that fetches LeetCode contest data for all contests and displays comprehensive leaderboards.

## Contest Schedule
- **Weekly Contests**: Every Sunday 8:00 AM - 9:30 AM IST
- **Biweekly Contests**: Every Saturday 8:00 PM - 9:30 PM IST (every 2 weeks)

## Features
- Automated contest detection and data fetching
- Real-time leaderboard updates
- Historical contest tracking
- Supabase database integration
- Performance analytics across multiple contests

## Setup Instructions

### 1. Supabase Setup
1. Go to https://supabase.com and create a new project
2. Copy the project URL and anon key
3. Run the SQL schema provided in `supabase-schema.sql`

### 2. Environment Variables
Create `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies
```bash
npm install @supabase/supabase-js node-cron
```

### 4. Run the System
```bash
npm run dev
```

## Database Schema
- `contests`: Contest metadata and schedules
- `participants`: User data for all contests
- `user_contest_results`: Individual contest results
- `target_users`: List of 61 users to track

## Automation Features
- Contest detection based on LeetCode API
- Automatic data fetching post-contest
- Real-time dashboard updates
- Performance trend analysis
