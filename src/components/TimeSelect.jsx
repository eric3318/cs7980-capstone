import React from 'react';

function TimeSelect({ time, setTime }) {
    const handleTimeChange = (e) => {
        const localTime = new Date(e.target.value);

        // 将本地时间转换为太平洋时间
        const pacificTime = new Date(localTime.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));

        // 格式化为 "yyyy-MM-ddTHH:mm" 的格式
        const pacificISOString = pacificTime.toISOString().slice(0, 16);

        setTime(pacificISOString);
    };

    return (
            <div className="time-select-container">
                <label htmlFor="time" className="time-select-label">Select Time (Pacific Time):</label>
                <input
                    type="datetime-local"
                    id="time"
                    className="time-select-input"
                    value={time}
                    onChange={handleTimeChange}
                />
            </div>
        );
    }

export default TimeSelect;
