// netlify/functions/weekly-contest-automation.js
// Automated weekly contest fetching with dynamic table creation for Netlify

import ContestFetcher from '../../lib/contest-fetcher.js';

export const handler = async (event) => {
  console.log('🏆 Weekly Contest Automation Triggered');
  console.log('⏰ Time:', new Date().toISOString());
  console.log('🌍 Event source:', event.httpMethod || 'scheduled');
  
  try {
    // Initialize the contest fetcher
    const fetcher = new ContestFetcher();
    
    // Run the automation for weekly contests
    console.log('🤖 Starting weekly contest automation...');
    const results = await fetcher.runAutomation();
    
    const responseData = {
      success: true,
      timestamp: new Date().toISOString(),
      type: 'weekly',
      message: `Successfully processed ${results.length} contests`,
      contests: results,
      automation_trigger: 'netlify_scheduled_function'
    };
    
    console.log('✅ Weekly automation completed successfully');
    console.log('📊 Results:', responseData);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(responseData)
    };
    
  } catch (error) {
    console.error('❌ Weekly contest automation failed:', error);
    
    const errorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      type: 'weekly',
      error: error.message,
      stack: error.stack,
      automation_trigger: 'netlify_scheduled_function'
    };
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(errorResponse)
    };
  }
};
