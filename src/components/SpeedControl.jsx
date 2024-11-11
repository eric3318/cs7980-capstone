import React from 'react';

function SpeedControl({ speed, setSpeed }) {
    return (
        <div>
            <label htmlFor="speed">Speed (m/s):</label>
            <input
                type="number"
                id="speed"
                value={speed}
                min="0.1"
                step="0.1"
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
            />
        </div>
    );
}

export default SpeedControl;
