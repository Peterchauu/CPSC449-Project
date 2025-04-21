import React, { useState } from "react";
import "../styles/index.css"; 

const TaskModal = ({ onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    onSave(title, description);
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add Task</h2>
        <label className="task-title">
          Title:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="task-description">
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <div className="modal-buttons">
          <button onClick={handleSave} className="button save-button">
            Save
          </button>
          <button onClick={onClose} className="button cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;