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
        <div>
            <label htmlFor="time">Select Time (Pacific Time):</label>
            <input
                type="datetime-local"
                id="time"
                value={time}
                onChange={handleTimeChange}
            />
        </div>
    );
}

export default TimeSelect;
