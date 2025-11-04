import React from 'react';

const ErrorDisplay = ({ error }: { error: Error | null }) => {
  if (!error) return null;
  return (
    <div className="error-display">
      <h4>Build Error:</h4>
      <pre>{error.message}</pre>
    </div>
  );
};

export default ErrorDisplay;
