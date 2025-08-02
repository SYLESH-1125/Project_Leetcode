# Netlify Environment Variables Setup

To deploy this project to Netlify with automated contest fetching, you need to configure the following environment variables in your Netlify dashboard:

## Required Environment Variables

### Database Configuration
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Application Settings
```
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Setup Instructions

1. **Create Netlify Account**: Sign up at https://netlify.com
2. **Connect GitHub**: Link your GitHub repository containing this project
3. **Configure Build Settings**:
   - Build command: `npm run netlify-build`
   - Publish directory: `.next`
   - Node version: 18.x or higher

4. **Add Environment Variables**:
   - Go to Site settings → Environment variables
   - Add all the variables listed above with your actual values

5. **Deploy**: Netlify will automatically deploy your project with scheduled functions

## Automated Contest Fetching

The following scheduled functions will run automatically:

- **Weekly Contest**: Every Sunday at 10:00 AM IST (4:30 AM UTC)
- **Biweekly Contest**: Every Saturday at 10:15 PM IST (4:45 PM UTC)

## Manual Trigger

You can manually trigger contest fetching by visiting:
`https://your-site-name.netlify.app/.netlify/functions/manual-contest-trigger`

## Health Check

Monitor the automation status at:
`https://your-site-name.netlify.app/.netlify/functions/health-check`

## Troubleshooting

1. **Check Netlify Functions Logs**: Site dashboard → Functions → View logs
2. **Verify Environment Variables**: Ensure all required variables are set correctly
3. **Database Connection**: Verify Supabase credentials and network access
4. **Function Timeouts**: Netlify functions have a 10-second timeout limit

## Local Testing

To test Netlify functions locally:
```bash
npm install -g netlify-cli
netlify dev
```

This will simulate the Netlify environment with your functions running locally.
