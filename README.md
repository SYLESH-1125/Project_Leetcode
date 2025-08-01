# 🏆 LeetCode Contest Auto-Tracker Dashboard

A modern Next.js dashboard for tracking LeetCode contest performance with automated data fetching and comprehensive analytics.

## ✨ Features

- **🤖 Automated Contest Fetching**: Real-time contest data collection
- **📊 Beautiful Analytics**: Interactive dashboard with performance metrics
- **🔍 Advanced User Tracking**: Comprehensive user search and matching
- **🛡️ Cloudflare Bypass**: Proven techniques for reliable data access
- **📈 Performance Insights**: Detailed rankings, scores, and statistics
- **🎯 High Success Rate**: 70.5% user detection with complete contest data

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/leetcode-contest-tracker.git
   cd leetcode-contest-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up database**
   - Run the SQL schema in `supabase-schema.sql`
   - Import your target users using `import-users.js`

5. **Start the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
