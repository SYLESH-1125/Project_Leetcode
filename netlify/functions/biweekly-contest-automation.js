// netlify/functions/biweekly-contest-automation.js
// Automated biweekly contest fetching for Netlify

import ContestFetcher from '../../lib/contest-fetcher.js';

export const handler = async (event) => {
  console.log('🏆 Biweekly Contest Automation Triggered');
  console.log('⏰ Time:', new Date().toISOString());
  console.log('🌍 Event source:', event.httpMethod || 'scheduled');
  
  try {
    // Initialize the contest fetcher
    const fetcher = new ContestFetcher();
    
    // Run the automation for biweekly contests
    console.log('🤖 Starting biweekly contest automation...');
    const results = await fetcher.runAutomation();
    
    const responseData = {
      success: true,
      timestamp: new Date().toISOString(),
      type: 'biweekly',
      message: `Successfully processed ${results.length} contests`,
      contests: results,
      automation_trigger: 'netlify_scheduled_function'
    };
    
    console.log('✅ Biweekly automation completed successfully');
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
    console.error('❌ Biweekly contest automation failed:', error);
    
    const errorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      type: 'biweekly',
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
