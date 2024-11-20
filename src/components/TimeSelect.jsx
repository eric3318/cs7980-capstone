import React from 'react';
import { toDate, toZonedTime } from "date-fns-tz"; // Corrected imports
import { format } from "date-fns";

function TimeSelect({ time, setTime }) {
  const handleTimeChange = (e) => {
    const selectedTime = e.target.value; // User-selected time in "yyyy-MM-ddTHH:mm" format
    const timeZone = "America/Los_Angeles";

    // Parse the user-selected time into a Date object
    const localTime = toDate(selectedTime, { timeZone });

    // Convert the Date object into the specified Pacific Time zone
    const pacificTime = toZonedTime(localTime, timeZone);

    // Format the time for storage/display
    const pacificISOString = format(pacificTime, "yyyy-MM-dd'T'HH:mm");

    setTime(pacificISOString); // Store the formatted Pacific Time
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
