import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { db } from "../firebase";
import { collection, doc, getDocs, deleteDoc} from "firebase/firestore";
import "../styles/Dashboard.css";

const TodoList = ({ todos, user }) => {
  const deleteTask = async (taskId) => {
    try {
      console.log("Deleting task:", taskId);

      const subtasksRef = collection(db, "users", user.uid, "todos", taskId, "subtasks");
      const subtasksSnapshot = await getDocs(subtasksRef);

      if (!subtasksSnapshot.empty) {
        const deletePromises = subtasksSnapshot.docs.map((subtaskDoc) =>
          deleteDoc(doc(db, "users", user.uid, "todos", taskId, "subtasks", subtaskDoc.id))
        );
        await Promise.all(deletePromises);
      }
      const taskRef = doc(db, "users", user.uid, "todos", taskId);
      await deleteDoc(taskRef);

      alert("Task deleted successfully!");
    } catch (error) {
      alert("Failed to delete task");
    }
  };

  return (
    <div>
      {todos.map((todo, index) => (
        <Draggable 
          key={todo.id} 
          draggableId={todo.id} 
          index={index}
        >
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={`task-item ${snapshot.isDragging ? 'task-dragging' : ''}`}
              style={{
                ...provided.draggableProps.style,
                opacity: snapshot.isDragging ? 0.5 : 1
              }}
            >
              <span>{todo.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(todo.id);
                }}
                className="delete-task-button"
              >
                x
              </button>
            </div>
          )}
        </Draggable>
      ))}
    </div>
  );
};

export default TodoList;