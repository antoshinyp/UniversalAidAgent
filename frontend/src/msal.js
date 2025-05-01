// msal.js - Microsoft Entra ID (Azure AD) authentication setup for React 19
import { PublicClientApplication } from '@azure/msal-browser';

// TODO: Replace with your real Azure AD app registration values
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    authority: import.meta.env.VITE_AZURE_TENANT_ID
      ? `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`
      : '',
    redirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  }
};

// Debug: Log config and throw error if missing
if (!msalConfig.auth.clientId || !msalConfig.auth.authority) {
  console.error('MSAL config error:', msalConfig);
  throw new Error('Azure AD environment variables are missing or invalid. Please set VITE_AZURE_CLIENT_ID and VITE_AZURE_TENANT_ID and restart the dev server.');
}

export const msalInstance = new PublicClientApplication(msalConfig);

let initialized = false;
async function ensureInitialized() {
  if (!initialized) {
    await msalInstance.initialize();
    initialized = true;
  }
}

export async function login() {
  await ensureInitialized();
  try {
    const loginResponse = await msalInstance.loginPopup({ scopes: ["User.Read"] });
    return loginResponse;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export function logout() {
  msalInstance.logoutPopup();
}

export function getAccount() {
  const accounts = msalInstance.getAllAccounts();
  return accounts && accounts.length > 0 ? accounts[0] : null;
}

export async function getAccessToken() {
  await ensureInitialized();
  const account = getAccount();
  if (!account) return null;
  try {
    const response = await msalInstance.acquireTokenSilent({
      scopes: ["User.Read"],
      account
    });
    return response.accessToken;
  } catch {
    // fallback to interactive
    const response = await msalInstance.acquireTokenPopup({ scopes: ["User.Read"] });
    return response.accessToken;
  }
}
