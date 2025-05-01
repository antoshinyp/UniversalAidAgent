import React from "react";
import childProtection from "./assets/child-friendly.jpeg";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log error info here if needed
    // console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{color: 'red', background: '#fff3f3', padding: 16, borderRadius: 8, textAlign: 'center'}}>
          <img src={childProtection} alt="Error" style={{width: 60, marginBottom: 16, opacity: 0.7}} />
          <h2>Something went wrong.</h2>
          <pre style={{whiteSpace: 'pre-wrap'}}>{this.state.error && this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
