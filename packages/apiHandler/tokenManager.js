// TokenManager.js
class TokenManager {
    constructor() {
      this.token = '';
    }
    setToken(token) {
      this.token = token;
    }
  
    getToken() {     
      return this.token;
    }
  
    clearToken() {
      this.token = null;
    }
  }
  
  const tokenManager = new TokenManager();
  export default tokenManager;
  