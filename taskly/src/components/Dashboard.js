import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, onSnapshot, getDocs, deleteDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import TodoList from "./TodoList";
import { CalendarList, CalendarDisplay } from "./Calendar";
import TaskModal from "./TaskModal";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import "../styles/Dashboard.css"; // Import the CSS file for styling

const Dashboard = ({ user }) => {
  const [todos, setTodos] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [events, setEvents] = useState([]); // State for events
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    // Listen for real-time updates from Firestore
    const unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "todos"),
      (snapshot) => {
        const tasks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTodos(tasks);
      }
    );
    return () => unsubscribe();
  }, [user.uid]);

  const addTask = async (title, description) => {
    if (title.trim() === "") return;
    await addDoc(collection(db, "users", user.uid, "todos"), {
      title,
      description,
      createdAt: new Date(),
    });
    setIsTaskModalOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = "#/signin"; // Redirect to sign-in page
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const clearDatabase = async () => {
    try {
      // Delete all todos
      const todosSnapshot = await getDocs(collection(db, "users", user.uid, "todos"));
      for (const todoDoc of todosSnapshot.docs) {
        await deleteDoc(doc(db, "users", user.uid, "todos", todoDoc.id));
      }

      // Delete all calendars and their events
      const calendarsSnapshot = await getDocs(collection(db, "calendars"));
      for (const calendarDoc of calendarsSnapshot.docs) {
        const calendarId = calendarDoc.id;

        // Delete events in the calendar
        const eventsSnapshot = await getDocs(collection(db, "calendars", calendarId, "events"));
        for (const eventDoc of eventsSnapshot.docs) {
          await deleteDoc(doc(db, "calendars", calendarId, "events", eventDoc.id));
        }

        // Delete the calendar itself
        await deleteDoc(doc(db, "calendars", calendarId));
      }

      alert("Database cleared successfully!");
      window.location.href = "#/signin"; // Redirect to sign-in page
    } catch (error) {
      console.error("Error clearing database:", error);
      alert("Failed to clear the database. Check the console for details.");
    }
  };

  const onDragEnd = async (result) => {
    const { destination, draggableId } = result;

    if (!destination) return;

    const draggedTask = todos.find((task) => task.id === draggableId);

    if (destination.droppableId === "calendar") {
      const start = new Date(destination.droppableId);
      const end = new Date(start);
      end.setHours(start.getHours() + 1); // Set end time to 1 hour after start time

      await addDoc(collection(db, "calendars", selectedCalendar.id, "events"), {
        title: draggedTask.title,
        start,
        end,
      });
      await deleteDoc(doc(db, "users", user.uid, "todos", draggedTask.id));
    }
  };

  return (
    <div className="dashboard-container">
      {/* Left Column */}
      <div className="sidebar">
        <h1>Dashboard</h1>
        <button onClick={handleSignOut} className="signout-button">
          Sign Out
        </button>
        <button onClick={clearDatabase} className="clear-button">
          Clear Database
        </button>

        {/* Tasks Section */}
        <div className="tasks-section">
          <h2>My Tasks</h2>
          <button onClick={() => setIsTaskModalOpen(true)} className="add-task-button">
            Add Task
          </button>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  <TodoList todos={todos} />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Calendar List Section */}
        <CalendarList
          user={user}
          setSelectedCalendar={setSelectedCalendar}
          selectedCalendar={selectedCalendar}
        />
      </div>

      {/* Right Column */}
      <div className="main-content">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="calendar">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                <CalendarDisplay
                  selectedCalendar={selectedCalendar}
                  events={events} // Pass events state
                  updateEvents={setEvents} // Pass setEvents as updateEvents
                />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <TaskModal
          onClose={() => setIsTaskModalOpen(false)}
          onSave={addTask}
        />
      )}
    </div>
  );
};

export default Dashboard;