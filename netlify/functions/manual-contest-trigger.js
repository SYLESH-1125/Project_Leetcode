// netlify/functions/manual-contest-trigger.js
// Manual contest fetching trigger for immediate execution

import ContestFetcher from '../../lib/contest-fetcher.js';

export const handler = async (event) => {
  console.log('🎯 Manual Contest Trigger Activated');
  console.log('⏰ Time:', new Date().toISOString());
  console.log('📡 Method:', event.httpMethod);
  
  // Only allow POST requests for manual triggers
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Allow': 'POST'
      },
      body: JSON.stringify({ 
        error: 'Method not allowed. Use POST to trigger contest fetching.' 
      })
    };
  }
  
  try {
    // Parse request body for specific contest ID (optional)
    let requestData = {};
    if (event.body) {
      try {
        requestData = JSON.parse(event.body);
      } catch (e) {
        console.log('📝 No valid JSON body provided, proceeding with default automation');
      }
    }
    
    // Initialize the contest fetcher
    const fetcher = new ContestFetcher();
    
    console.log('🤖 Starting manual contest automation...');
    console.log('🎯 Request data:', requestData);
    
    // Run the automation
    const results = await fetcher.runAutomation();
    
    const responseData = {
      success: true,
      timestamp: new Date().toISOString(),
      type: 'manual',
      trigger_source: 'dashboard_button',
      message: `Successfully processed ${results.length} contests`,
      contests: results,
      request_data: requestData,
      automation_trigger: 'manual_netlify_function'
    };
    
    console.log('✅ Manual automation completed successfully');
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
    console.error('❌ Manual contest automation failed:', error);
    
    const errorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      type: 'manual',
      error: error.message,
      stack: error.stack,
      automation_trigger: 'manual_netlify_function'
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
