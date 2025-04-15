import React from "react";
import { useParams } from "react-router-dom";

const EventDetailsPage = ({ events }) => {
  const { date } = useParams();
  const selectedDate = new Date(date);
  const eventsForDay = events.filter(
    (event) =>
      new Date(event.start).toDateString() === selectedDate.toDateString()
  );

  return (
    <div>
      <h1>Events for {selectedDate.toDateString()}</h1>
      {eventsForDay.length > 0 ? (
        eventsForDay.map((event) => (
          <div key={event.id}>
            <h2>{event.title}</h2>
            <p>
              {new Date(event.start).toLocaleTimeString()} -{" "}
              {new Date(event.end).toLocaleTimeString()}
            </p>
          </div>
        ))
      ) : (
        <p>No events for this day.</p>
      )}
    </div>
  );
};

export default EventDetailsPage;