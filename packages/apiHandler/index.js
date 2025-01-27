import tokenManager from "./tokenManager";
/**
 * Utility function to make HTTP requests (GET, POST, PATCH, DELETE) to an API.
 * Handles both JSON and binary file responses, including images and PDFs.
 * 
 * @param {Object} options - The options for the request.
 * @param {string} options.url - The full API endpoint URL.
 * @param {string} [options.method='GET'] - The HTTP method to be used ('GET', 'POST', 'PATCH', 'DELETE').
 * @param {Object} [options.body=null] - The data to be sent with the request (for 'POST' and 'PATCH' methods).
 * @param {string} [options.fileType='application/json'] - The expected response type (e.g., 'image/jpeg', 'application/json').
 * @param {string} [options.queryParams=''] - Query parameters to be appended to the URL (optional).
 * @param {Object} [options.headers={}] - Custom headers to be added to the request (optional).
 * @returns {Promise<Object|Buffer>} - Returns the response data, either as a JSON object or a binary Buffer (for file responses).
 * 
 * @throws {Object} - Throws an error object with 'code' and 'message' in case of failure.
 */
async function apiRequest({
    url,               // The full API URL (including the endpoint).
    method = 'GET',    // HTTP method to be used (default is 'GET').
    body = null,       // The body data for 'POST' or 'PATCH' requests (optional).
    fileType = 'application/json',  // Accept header to specify the expected response format.
    queryParams = '', 
    accessToken=null,// Query parameters to append to the URL (optional).
    headers = {},      // Custom headers for the request (optional).
  }) {
    // Access token retrieval. Replace `tokenManager.getToken()` with your logic for getting the token.
    if (accessToken == null){
         accessToken = tokenManager.getToken();
    }
    
    // Construct the complete URL, appending any query parameters.
    const completeUrl = `${url}${queryParams ? `?${queryParams}` : ''}`;
  
    // Default headers for the request. Includes Content-Type for POST/PATCH requests and Authorization header.
    const defaultHeaders = {
      'Content-Type': 'application/json',  // Default Content-Type for 'POST' and 'PATCH' methods.
      'Accept': fileType,  // The file type expected in the response (image, pdf, json, etc.)
      'Authorization': `Bearer ${accessToken}`,  // Bearer token for authentication.
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',  // Cache headers to ensure fresh data.
      'Expires': '-1', // No expiration for the response.
      'Pragma': 'no-cache', // HTTP header to enforce no caching of the response.
    };
  
    // Merge the custom headers with the default headers (overrides default if custom headers provided).
    const mergedHeaders = { ...defaultHeaders, ...headers };
  
    // Fetch options object with HTTP method, headers, and optionally body for 'POST' or 'PATCH' methods.
    const options = {
      method,      // 'GET', 'POST', 'PATCH', or 'DELETE'
      headers: mergedHeaders,
      // For 'POST' or 'PATCH', stringify the body object into JSON and add to the request options.
      body: method === 'POST' || method === 'PATCH' ? JSON.stringify(body) : undefined, 
    };
  
    try {
      // Perform the fetch request using the constructed URL and options.
      const response = await fetch(completeUrl, options);
  
      // If the response isn't OK (status code not in the range of 200–299), throw an error.
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      // If the response is of a file type (image, PDF, etc.), process it as a Blob.
      if (fileType !== 'application/json' && response.headers.get('content-type').includes(fileType)) {
        const blob = await response.blob();  // Convert response into a Blob (for images, PDFs, etc.)
  
        // Convert the Blob into an ArrayBuffer, then into a Buffer (useful for file handling in Node.js).
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
  
        return buffer;  // Return the Buffer containing the file data.
      }
  
      // For responses of 'application/json' type (or similar), return JSON data.
      const data = await response.json();
      return data; // Return the JSON data from the API response.
  
    } catch (error) {
      // Catch any errors that occurred during the fetch operation and log them.
      console.error("Error occurred while fetching data:", error);
  
      // Return a structured error with code and message for easier debugging.
      const structuredError = {
        code: 'NETWORK_ERROR',
        message: error.message || "An error occurred while making the request.",
        details: error,  // Include the original error details for debugging.
      };
      throw structuredError;  // Rethrow the error so the caller can handle it.
    }
  }
  
  
  export {apiRequest}