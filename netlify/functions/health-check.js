exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const timestamp = new Date().toISOString();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'healthy',
        timestamp,
        message: 'LeetCode Contest Automation is running',
        environment: process.env.NODE_ENV || 'production',
        functions: {
          weekly: '/api/weekly-contest',
          biweekly: '/api/biweekly-contest', 
          manual: '/api/manual-trigger'
        }
      })
    };
  } catch (error) {
    console.error('Health check error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        message: 'Health check failed',
        error: error.message
      })
    };
  }
};
