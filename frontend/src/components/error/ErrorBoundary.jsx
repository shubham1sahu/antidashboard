import React from 'react';

/**
 * Global Error Boundary to catch JavaScript errors anywhere in their child
 * component tree, log those errors, and display a fallback UI instead of
 * the component tree that crashed.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error in React component tree:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-xl w-full bg-white shadow-lg rounded-xl overflow-hidden border border-red-100">
            <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <h2 className="text-lg font-bold text-red-800">Something went wrong.</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                An unexpected error occurred in the application. Please try refreshing the page.
              </p>
              
              {this.state.error && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Error Details</h3>
                  <div className="bg-slate-100 p-3 rounded-lg overflow-auto max-h-32 text-xs font-mono text-slate-800">
                    {this.state.error.toString()}
                  </div>
                </div>
              )}

              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
