import React, { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, onSnapshot, doc } from "firebase/firestore";
import { db } from "../firebase";
import TaskModal from "./TaskModal";
import "../styles/index.css"; // Ensure you have a CSS file for styling

const EventModal = ({ onClose, onSave, onDelete, initialDate, event, selectedCalendar }) => {
  const [title, setTitle] = useState(event ? event.title : "");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [tasks, setTasks] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (!selectedCalendar || !event) return;

    setStart(event.start?.toISOString().slice(0, 16) || "");
    setEnd(event.end?.toISOString().slice(0, 16) || "");

    // Fetch tasks for the event
    const tasksRef = collection(
      db,
      "calendars",
      selectedCalendar.id,
      "events",
      event.id,
      "tasks"
    );
    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const eventTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(eventTasks);
    });

    return () => unsubscribe();
  }, [event, selectedCalendar]);

  const handleSave = () => {
    if (!title.trim() || !start || !end) {
      console.error("Invalid event data");
      return;
    }
    onSave(title, new Date(start), new Date(end), event?.id);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && event?.id) {
      onDelete(event.id);
    }
    onClose();
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(
        doc(db, "calendars", selectedCalendar.id, "events", event.id, "tasks", taskId)
      );
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleTaskSave = async (title, description, taskId) => {
    if (!selectedCalendar || !event) return;

    try {
      if (taskId) {
        // Update existing task
        await updateDoc(
          doc(db, "calendars", selectedCalendar.id, "events", event.id, "tasks", taskId),
          { title, description }
        );
      } else {
        // Add new task
        await addDoc(
          collection(db, "calendars", selectedCalendar.id, "events", event.id, "tasks"),
          { title, description }
        );
      }
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content event-modal">
        <div className="event-details">
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
          <div className="modal-buttons">
            <button onClick={handleSave} className="button save-button">
              Save
            </button>
            {event && (
              <button onClick={handleDelete} className="button delete-button">
                Delete
              </button>
            )}
            <button onClick={onClose} className="button cancel-button">
              Cancel
            </button>
          </div>
        </div>

        <div className="task-section">
          <h3>Tasks</h3>
          <div className="task-cards">
            {tasks.map((task) => (
              <div key={task.id} className="task-card">
                <h4>{task.title}</h4>
                <p>{task.description || "No description provided."}</p>
                <div className="task-card-actions">
                  <button
                    onClick={() => {
                      setSelectedTask(task);
                      setIsTaskModalOpen(true);
                    }}
                    className="edit-task-button"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="delete-task-button"
                  >
                    ✖
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              setSelectedTask(null);
              setIsTaskModalOpen(true);
            }}
            className="button add-task-button"
          >
            Add Task
          </button>
        </div>
      </div>

      {isTaskModalOpen && (
        <TaskModal
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleTaskSave}
          initialTask={selectedTask}
        />
      )}
    </div>
  );
};

export default EventModal;