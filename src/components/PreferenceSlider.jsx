import React from 'react';

function PreferenceSlider({ preference, setPreference }) {
    return (
        <div>
            <label htmlFor="preference">Preference Parameter:</label>
            <input
                type="range"
                id="preference"
                min="0"
                max="1"
                step="0.05"
                value={preference}
                onChange={(e) => setPreference(parseFloat(e.target.value))}
            />
            <p>
                {`Preference Value: ${preference} (indicates willingness to travel farther in sunlight vs. shade)`}
            </p>
        </div>
    );
}

export default PreferenceSlider;
