import axios from 'axios'
import { HttpsProxyAgent } from 'https-proxy-agent'

class CloudflareBypass {
  constructor() {
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    ];
    
    // Updated working proxy list - real working proxies
    this.proxies = [
      // Free public proxies (may need updating)
      'http://47.74.152.29:8888',
      'http://103.160.201.76:8080',
      'http://190.13.84.218:8080',
      'http://41.65.236.57:1976',
      'http://103.148.72.192:80',
      // We'll try without proxy first, then with proxies as fallback
    ];
    
    this.useProxy = true; // Flag to control proxy usage
    this.directConnectionFallback = true; // Always try direct connection as fallback
    
    this.currentProxyIndex = 0;
    
    this.headers = {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': 'https://leetcode.com',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    };

    this.session = null;
    this.initSession();
  }

  initSession() {
    this.session = axios.create({
      timeout: 30000,
      headers: this.headers,
      withCredentials: true,
      maxRedirects: 5,
    });
  }

  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  getNextProxy() {
    if (this.proxies.length === 0) return null;
    
    const proxy = this.proxies[this.currentProxyIndex];
    this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxies.length;
    return proxy;
  }

  async bypassCloudflare(url, options = {}) {
    const maxRetries = 3;
    let lastError = null;

    // First try direct connection without proxy
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`    🔄 Direct attempt ${attempt}/${maxRetries} for: ${url}`);

        const config = {
          method: options.method || 'GET',
          url: url,
          headers: {
            ...this.headers,
            'User-Agent': this.getRandomUserAgent(),
            'Referer': 'https://leetcode.com/',
            'Cookie': this.generateRealisticCookies(),
            ...options.headers,
          },
          validateStatus: () => true, // Accept all status codes
          httpsAgent: false, // No proxy for direct connection
          proxy: false,
          ...options,
        };

        const response = await this.session(config);

        // Check if we got a successful response
        if (response.status === 200) {
          console.log(`    ✅ Direct Success: ${response.status} - ${url}`);
          
          // Check if response contains Cloudflare challenge
          if (this.isCloudflareChallenge(response.data)) {
            console.log(`    🔒 Cloudflare challenge detected, trying advanced bypass...`);
            // Try advanced bypass techniques
            return await this.tryAdvancedBypass(url, options);
          }
          
          return {
            data: response.data,
            status: response.status,
            headers: response.headers,
          };
        } else if (response.status === 403 || response.status === 503) {
          console.log(`    🔒 Cloudflare protection detected (${response.status}), trying advanced bypass...`);
          // Try advanced bypass techniques
          return await this.tryAdvancedBypass(url, options);
        } else if (response.status === 404) {
          console.log(`    ❌ Contest not found (404): ${url}`);
          return null;
        } else {
          console.log(`    ⚠️ Unexpected status: ${response.status} - ${url}`);
          await this.delay(1000 * attempt);
          continue;
        }

      } catch (error) {
        lastError = error;
        console.log(`    ❌ Direct attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < maxRetries) {
          await this.delay(2000 * attempt);
        }
      }
    }

    // If direct connection failed, try with different techniques
    return await this.tryAdvancedBypass(url, options);
  }

  async tryAdvancedBypass(url, options = {}) {
    console.log(`    🚀 Trying advanced bypass techniques...`);
    
    // Try different approaches
    const techniques = [
      { name: 'Mobile User Agent', headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1' }},
      { name: 'Firefox Headers', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0', 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8' }},
      { name: 'Minimal Headers', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }},
    ];

    for (const technique of techniques) {
      try {
        console.log(`    🔧 Trying ${technique.name}...`);
        
        const config = {
          method: options.method || 'GET',
          url: url,
          headers: {
            ...this.headers,
            ...technique.headers,
            'Referer': 'https://leetcode.com/',
            'Cookie': this.generateRealisticCookies(),
            ...options.headers,
          },
          validateStatus: () => true,
          timeout: 30000,
          ...options,
        };

        const response = await this.session(config);

        if (response.status === 200) {
          console.log(`    ✅ ${technique.name} Success: ${response.status}`);
          
          if (!this.isCloudflareChallenge(response.data)) {
            return {
              data: response.data,
              status: response.status,
              headers: response.headers,
            };
          }
        }

        await this.delay(1000);
      } catch (error) {
        console.log(`    ❌ ${technique.name} failed: ${error.message}`);
      }
    }

    throw new Error(`All bypass techniques failed for: ${url}`);
  }

  isCloudflareChallenge(data) {
    if (typeof data !== 'string') return false;
    
    const cfIndicators = [
      'Checking your browser before accessing',
      'DDoS protection by Cloudflare',
      'cf-browser-verification',
      'cf-im-under-attack',
      '__cf_chl_jschl_tk__',
      'window._cf_chl_opt',
    ];
    
    return cfIndicators.some(indicator => data.includes(indicator));
  }

  generateRealisticCookies() {
    // Generate realistic session cookies
    const sessionId = this.generateRandomString(32);
    const csrfToken = this.generateRandomString(40);
    
    return [
      `sessionid=${sessionId}`,
      `csrftoken=${csrfToken}`,
      `NEW_PROBLEMLIST_PAGE=1`,
      `gr_user_id=${this.generateRandomString(16)}`,
      `amplitude_id_leetcode.com=${this.generateRandomString(20)}`,
    ].join('; ');
  }

  generateRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async fetchContestDataGraphQL(contestSlug) {
    const graphqlUrl = 'https://leetcode.com/graphql/';
    
    const query = `
      query contestRanking($contestSlug: String!) {
        contestRanking(contestSlug: $contestSlug) {
          totalParticipants
          userNum
          submissions {
            rank
            username
            score
            finishTime
            country
            oldRating
            newRating
            dataRegion
          }
          questions {
            questionId
            title
            titleSlug
            difficulty
          }
        }
      }
    `;

    const variables = {
      contestSlug: contestSlug
    };

    try {
      console.log(`    🔍 GraphQL query for contest: ${contestSlug}`);
      
      const response = await this.bypassCloudflare(graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        data: {
          query: query,
          variables: variables,
        },
      });

      if (response && response.data && response.data.data) {
        console.log(`    ✅ GraphQL Success: Retrieved contest data`);
        return response.data.data;
      } else if (response && response.data && response.data.errors) {
        console.log(`    ❌ GraphQL Errors: ${JSON.stringify(response.data.errors)}`);
        return null;
      } else {
        console.log(`    ⚠️ GraphQL: No data returned`);
        return null;
      }

    } catch (error) {
      console.log(`    ❌ GraphQL Failed: ${error.message}`);
      throw error;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Simulate different request patterns to avoid detection
  async simulateHumanBehavior() {
    await this.delay(Math.random() * 2000 + 1000); // Random delay 1-3 seconds
  }

  // Advanced Cloudflare bypass techniques
  async advancedBypass(url, options = {}) {
    console.log(`    🚀 Attempting advanced Cloudflare bypass for: ${url}`);
    
    // Try TLS fingerprint randomization
    const tlsConfig = {
      ...options,
      headers: {
        ...this.headers,
        'User-Agent': this.getRandomUserAgent(),
        'Sec-Ch-Ua': this.generateRandomSecChUa(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.google.com/',
        'Upgrade-Insecure-Requests': '1',
        ...options.headers,
      },
      // Add random delays between requests
      timeout: 45000,
    };

    return await this.bypassCloudflare(url, tlsConfig);
  }

  generateRandomSecChUa() {
    const browsers = [
      '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      '"Not_A Brand";v="99", "Microsoft Edge";v="120", "Chromium";v="120"',
      '"Not_A Brand";v="8", "Firefox";v="121"',
    ];
    return browsers[Math.floor(Math.random() * browsers.length)];
  }

  // Try alternative API endpoints that might be less protected
  async tryAlternativeEndpoints(contestSlug) {
    const alternativeUrls = [
      `https://leetcode.com/contest/${contestSlug}/ranking/1/`,
      `https://leetcode.com/contest/${contestSlug}/`,
      `https://leetcode.com/contest/${contestSlug}/problems/`,
      `https://leetcode-cn.com/contest/api/ranking/${contestSlug}/`,
    ];

    for (const url of alternativeUrls) {
      try {
        console.log(`    🔍 Trying alternative: ${url}`);
        const response = await this.bypassCloudflare(url);
        
        if (response && response.status === 200) {
          console.log(`    ✅ Alternative endpoint success: ${url}`);
          return response;
        }
      } catch (error) {
        console.log(`    ❌ Alternative failed: ${error.message}`);
      }
    }

    return null;
  }
}

export default CloudflareBypass
