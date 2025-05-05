import React, { useState, useEffect } from "react";
import "../styles/index.css"; 

const TaskModal = ({ onClose, onSave, onDelete, initialTask }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setTitle(initialTask ? initialTask.title || "" : "");
    setDescription(initialTask ? initialTask.description || "" : "");
  }, [initialTask]);

  const handleSave = () => {
    onSave(title, description, initialTask?.id);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && initialTask?.id) {
      onDelete(initialTask.id);
    }
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{initialTask ? "Edit Task" : "Add Task"}</h2>
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
            {initialTask ? "Update" : "Save"}
          </button>
          {initialTask && (
            <button onClick={handleDelete} className="button delete-button">
              Delete
            </button>
          )}
          <button onClick={onClose} className="button cancel-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;