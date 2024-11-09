// api/proxy.js
const fetch = require('node-fetch'); // Use node-fetch for server-side HTTP requests

module.exports = async (req, res) => {
  const { method, body, query, headers } = req;

  // Your backend URL
  const backendUrl = 'http://122.248.226.78/api/chat';

  // Prepare request options to forward to the backend
  const options = {
    method, // Forward the HTTP method (POST, GET, etc.)
    headers: {
      ...headers, // Forward headers from the original request
    },
    body: method === 'POST' ? JSON.stringify(body) : undefined, // Forward body for POST requests
  };

  try {
    // Forward the request to your backend
    const response = await fetch(backendUrl, options);

    // If the backend response is OK, send it back to the frontend
    if (response.ok) {
      const data = await response.json();
      res.status(response.status).json(data);
    } else {
      res.status(response.status).json({ error: 'Failed to fetch from backend' });
    }
  } catch (error) {
    // Handle errors (network errors, etc.)
    console.error('Error in proxy function:', error);
    res.status(500).json({ error: 'An error occurred while contacting the backend' });
  }
};
