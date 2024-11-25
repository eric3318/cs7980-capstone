

import React from 'react';

function PreferenceSlider({ preference, setPreference }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <label htmlFor="preference" style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>
                Preference
            </label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <span style={{ marginRight: '10px' }}>Shortest Distance</span>
                <input
                    type="range"
                    id="preference"
                    min="0"
                    max="1"
                    step="0.05"
                    value={preference}
                    onChange={(e) => setPreference(parseFloat(e.target.value))}
                    style={{ flex: '1', margin: '0 10px' }}
                />
                <span style={{ marginLeft: '10px' }}>Most shade</span>
            </div>
            <p>{`Preference Value: ${preference}`}</p>
        </div>
    );
}

export default PreferenceSlider;

