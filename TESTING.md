# Testing Universal Aid Agent

## Current Status

- There are currently no automated tests for the backend or frontend.

## How to Add Tests

### Backend (Python/FastAPI)
- Use `pytest` or `unittest` for backend tests.
- Place test files in a `tests/` directory.
- Example:
  ```python
  def test_example():
      assert 1 + 1 == 2
  ```

### Frontend (React)
- Use [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).
- Place test files alongside components or in a `__tests__/` folder.
- Example:
  ```js
  import { render, screen } from '@testing-library/react';
  import App from '../src/App';
  test('renders app', () => {
    render(<App />);
    expect(screen.getByText(/Universal Aid/i)).toBeInTheDocument();
  });
  ```

## Manual Testing
- Test the app by running both backend and frontend locally.
- Try submitting forms, uploading files, and using different user types.

## Future Improvements
- Add automated tests for all endpoints and components.
- Set up CI to run tests on pull requests.

## Language Support Testing

- The application is intended to support multiple languages for accessibility and inclusivity.
- **Current status:** Automated and manual tests for language switching, translation accuracy, and fallback behavior are not yet implemented.
- **Future work:**
  - Add tests to verify UI and API responses in all supported languages.
  - Ensure all user-facing text is translatable and translations are complete.
  - Test language switching in the UI and verify correct content rendering.

## SERP API (Google Search) Grounding

- The backend integrates with the SERP API for Google Search grounding to enhance recommendations and provide up-to-date information.
- **Current status:** There are no automated tests for SERP API integration.
- **Future work:**
  - Add tests to mock and validate SERP API responses.
  - Ensure fallback and error handling when the API is unavailable or returns unexpected results.
  - Test that grounded search results are correctly incorporated into recommendations and user flows.
