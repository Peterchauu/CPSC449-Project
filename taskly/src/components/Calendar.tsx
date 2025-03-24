import React from "react";
import moment from "moment";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface CalendarProps {
  events: Array<{
    id?: string;
    title: string;
    start: Date;
    end: Date;
  }>;
}

const MyCalendar: React.FC<CalendarProps> = ({ events }) => {
  return (
    <div style={{ height: "500px", margin: "20px" }}>
      <Calendar
        localizer={localizer}
        events={events}
        defaultView="month"
        startAccessor="start"
        endAccessor="end"
      />
    </div>
  );
};

export default MyCalendar;