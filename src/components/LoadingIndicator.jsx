import React from 'react';


function LoadingIndicator() {
    return (
        <div style={{ textAlign: 'center', margin: '20px' }}>
            <p>Processing... Please wait</p>
            <div
                style={{
                    width: '100%',
                    height: '10px',
                    backgroundColor: '#f3f3f3',
                    borderRadius: '5px',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        width: '50%',
                        height: '100%',
                        backgroundColor: '#4caf50',
                        animation: 'progress 1.5s infinite',
                    }}
                ></div>
            </div>
        </div>
    );
}

export default LoadingIndicator;
