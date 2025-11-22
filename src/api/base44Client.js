import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "690914f7fb70eda72d63d5e0", 
  requiresAuth: true // Ensure authentication is required for all operations
});
