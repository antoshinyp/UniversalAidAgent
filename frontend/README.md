<!--
Copyright (c) 2025 Save Child Hackathon Team. All rights reserved.
-->

# Universal Aid Agent

**Project Description:**
Universal Aid Agent is a cross-platform solution for human protection, incident reporting, and resource guidance. It features a React frontend and FastAPI backend, enabling users to report incidents, access country-specific safety guidelines, and receive AI-powered recommendations. The system supports accessibility, integrates with Azure OpenAI for intelligent suggestions, and uses the SERP API for Google Search grounding to provide up-to-date information. Designed for security, safety, inclusivity, and extensibility, it is suitable for global deployment in diverse communities.

**Contact:**
For support or inquiries, contact: apushparaj@microsoft.com or antoshiny.pushparaj@gmail.com

# Save Child Universal Aid Agent

A cross-platform solution for child protection, incident reporting, and resource guidance, built with React (frontend) and FastAPI (backend).

## Table of Contents
- [Project Status](#project-status)
- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Usage](#usage)
- [Deployment](#deployment)
- [Testing](#testing)
- [Security Best Practices](#security-best-practices)
- [Contributing](#contributing)
- [Troubleshooting & Support](#troubleshooting--support)
- [Environment Variables](#environment-variables)

## Project Status: In Progress

### Unfinished or In-Progress Features
- **Email Notification:** Not fully implemented. Some parts may be incomplete or non-functional.

## Features
- Child protection incident reporting
- Country-specific guidelines and emergency contacts
- AI-powered recommendations (Azure OpenAI)
- Secure authentication (Azure AD)
- Feedback and justification submission
- Accessibility and multi-language support

## Architecture Overview
- **Frontend:** React + Vite (see `frontend/`)
- **Backend:** FastAPI (see `main.py`)
- **AI Integration:** Azure OpenAI for recommendations
- **Authentication:** Azure AD (OAuth2/JWT)
- **Email:** SendGrid (for admin notifications)
- **Data:** Country guidelines and options in JSON files

## Usage
1. Clone the repository.
2. Install dependencies:
   - Backend: `pip install -r requirements.txt`
   - Frontend: `cd frontend && npm install`
3. Set environment variables (see below).
4. Start backend: `python main.py` (or `uvicorn main:app --reload`)
5. Start frontend: `cd frontend && npm run dev`
6. Access the app at `http://localhost:5173` (default Vite port).

## Deployment
- Deploy backend (FastAPI) to Azure, AWS, or any cloud supporting Python.
- Deploy frontend (React) to Azure Static Web Apps, Vercel, Netlify, or similar.
- Set environment variables securely in your deployment environment.

## Testing
- **Automated tests are not yet implemented.**
- To add tests:
  - For backend: Use `pytest` or `unittest`.
  - For frontend: Use `jest` and `@testing-library/react`.
- See `TESTING.md` for more details.

## Security Best Practices
- Never commit secrets or keys to version control.
- Use environment variables for all credentials.
- For production, use Azure Key Vault or a similar secret manager.
- Validate and sanitize all user input (see backend code for examples).
- Use HTTPS in production.

## Contributing
- See `CONTRIBUTING.md` for guidelines.
- Open issues or pull requests for bugs, features, or questions.

## Troubleshooting & Support
- If you encounter issues, check logs in the backend and browser console.
- Ensure all required environment variables are set.
- For help, open an issue or contact the maintainers.

## Environment Variables

The following environment variables are required for running this project securely:

### Frontend (.env file in `frontend/` directory)
```
REACT_APP_AZURE_CLIENT_ID=your-azure-client-id
REACT_APP_AZURE_TENANT_ID=your-azure-tenant-id
```
- Do **not** commit your .env file to GitHub. Add `.env` to your `.gitignore`.

### Backend (set as system environment variables or in your deployment environment)
```
AZURE_CLIENT_ID=your-azure-client-id
AZURE_TENANT_ID=your-azure-tenant-id
AZURE_OPENAI_ENDPOINT=your-azure-openai-endpoint
AZURE_OPENAI_KEY=your-azure-openai-key
AZURE_OPENAI_DEPLOYMENT=your-azure-openai-deployment-name
SERPAPI_KEY=your-serpapi-key (optional, for web search)
```
- Never commit secrets or keys to version control.
- For production, you may use Azure Key Vault or a similar secret manager.

# Universal Aid Agent Frontend

A React-based web application for reporting human protection incidents and accessing country-specific safety recommendations.

## Usage

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deployment

- Build for production:
  ```bash
  npm run build
  ```
- Preview production build:
  ```bash
  npm run preview
  ```
- Deploy the `dist/` folder to your preferred static hosting service (e.g., Azure Static Web Apps, Vercel, Netlify).

## Architecture Overview

- **src/App.jsx**: Main application component, handles routing and layout.
- **src/FamilySocialSection.jsx, NeedsAttachmentsSection.jsx, PerpetratorReportingSection.jsx**: Form sections for incident reporting.
- **src/api.js**: Handles API calls to the backend.
- **src/hooks/useDropdownOptions.js**: Custom hook for loading dropdown options.
- **public/**: Static assets and privacy policy.

## Testing

Currently, there are no automated frontend tests. To add tests, consider using [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

## Contribution

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on contributing to this project.

## Security

- Do not expose sensitive API keys in frontend code.
- Validate and sanitize all user input on the backend.
- Use HTTPS in production.

## Troubleshooting & Support

- If you encounter issues, check the browser console and backend logs.
- For help, open an issue or contact the project maintainers.
