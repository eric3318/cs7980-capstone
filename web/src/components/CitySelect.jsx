import React from 'react';

function CitySelect({ city, setCity }) {
    return (
        <div>
            <label htmlFor="city">Select City:</label>
            <select id="city" value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="vancouver">Vancouver</option>
                <option value="toronto">Toronto</option>
                {/* Add more cities as needed */}
            </select>
        </div>
    );
}

export default CitySelect;
