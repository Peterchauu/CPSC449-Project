import React, { useState, useEffect } from "react";
import "../styles/EventModal.css"; // Import the CSS file for styling

const EventModal = ({ onClose, onSave, onDelete, initialDate, event }) => {
  const [title, setTitle] = useState(event ? event.title : "");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  useEffect(() => {
    if (event) {
      setStart(event.start.toISOString().slice(0, 16));
      setEnd(event.end.toISOString().slice(0, 16));
    } else if (initialDate) {
      const startDate = new Date(initialDate);
      const endDate = new Date(initialDate);
      endDate.setHours(startDate.getHours() + 1); // Set end time to 1 hour after start time
      setStart(startDate.toISOString().slice(0, 16));
      setEnd(endDate.toISOString().slice(0, 16));
    }
  }, [initialDate, event]);

  const handleSave = () => {
    onSave(title, new Date(start), new Date(end));
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(event.id);
    }
    onClose();
  };

  return (
    <div className="event-modal">
      <div className="event-modal-content">
        <h2>{event ? "Edit Event" : "Add Event"}</h2>
        <label>
          Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label>
          Start:
          <input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label>
          End:
          <input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
        <div className="event-modal-buttons">
          <button onClick={handleSave} className="save-button">
            Save
          </button>
          {event && (
            <button onClick={handleDelete} className="delete-button">
              Delete
            </button>
          )}
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;