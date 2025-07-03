import React from 'react';

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    return (
        <div className="error-message">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
                <h3>Error Loading Documentation</h3>
                <p>{message}</p>
                <button onClick={() => window.location.reload()}>
                    Try Again
                </button>
            </div>
        </div>
    );
};

export default ErrorMessage; 