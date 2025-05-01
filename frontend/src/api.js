// API utility functions to connect React frontend to FastAPI backend

const API_BASE_URL = 'http://localhost:8000';

export async function generateRecommendation(data) {
  const response = await fetch(`${API_BASE_URL}/generate-recommendation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to generate recommendation');
  }
  return response.json();
}

import { getAccessToken } from "./msal";

export async function reportIncident(data) {
  const formData = new FormData();
  for (const key in data) {
    if (Array.isArray(data[key]) && key === 'attachments') {
      data[key].forEach(file => formData.append('attachments', file));
    } else if (key === 'groups') {
      formData.append('groups', JSON.stringify(data[key]));
    } else if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  }
  // Add Authorization header with MSAL access token
  const token = await getAccessToken();
  const response = await fetch(`${API_BASE_URL}/report-incident`, {
    method: "POST",
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return await response.json();
}

export async function search(query) {
  const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Search failed');
  }
  return response.json();
}

export async function submitFeedback(feedbackData) {
  try {
    const response = await fetch(`${API_BASE_URL}/submit-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit feedback');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
}
