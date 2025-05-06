import React from "react";
import "../styles/index.css";

const TaskViewModal = ({ onClose, task }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Task Details</h2>
        <div className="task-details">
          <h3>{task.title}</h3>
          <p className="task-description-view">{task.description || "No description available."}</p>
        </div>
        <div className="modal-buttons">
          <button onClick={onClose} className="button cancel-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskViewModal;