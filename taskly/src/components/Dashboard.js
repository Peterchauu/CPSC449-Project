import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, onSnapshot, getDocs, deleteDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import TodoList from "./TodoList";
import { CalendarList, CalendarDisplay } from "./Calendar";
import TaskModal from "./TaskModal";
import EventModal from "./EventModal";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import DarkModeToggle from "./DarkModeToggle";
import "../styles/Dashboard.css"; 

const Dashboard = () => {
  const [todos, setTodos] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [events, setEvents] = useState([]); 
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
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
    }
  }, [user]);

  const addTask = async (title, description) => {
    if (title.trim() === "") return;
    await addDoc(collection(db, "users", user.uid, "todos"), {
      title,
      description,
      createdAt: new Date(),
    });
    setIsTaskModalOpen(false);
  };

  const addEvent = async (title, start, end) => {
    if (!selectedCalendar || !title.trim() || !start || !end) return;

    try {
      await addDoc(
        collection(db, "calendars", selectedCalendar.id, "events"),
        {
          title,
          start: start.toISOString(),
          end: end.toISOString(),
        }
      );
      setIsEventModalOpen(false);
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  const deleteEvent = async (eventId) => {
    if (!selectedCalendar || !eventId) return;

    try {
      await deleteDoc(doc(db, "calendars", selectedCalendar.id, "events", eventId));
      setIsEventModalOpen(false);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = "#/signin"; 
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const clearDatabase = async () => {
    try {
      const todosSnapshot = await getDocs(collection(db, "users", user.uid, "todos"));
      for (const todoDoc of todosSnapshot.docs) {
        await deleteDoc(doc(db, "users", user.uid, "todos", todoDoc.id));
      }

      const calendarsSnapshot = await getDocs(collection(db, "calendars"));
      for (const calendarDoc of calendarsSnapshot.docs) {
        const calendarId = calendarDoc.id;

        const eventsSnapshot = await getDocs(collection(db, "calendars", calendarId, "events"));
        for (const eventDoc of eventsSnapshot.docs) {
          await deleteDoc(doc(db, "calendars", calendarId, "events", eventDoc.id));
        }

        await deleteDoc(doc(db, "calendars", calendarId));
      }

      alert("Database cleared successfully!");
      window.location.href = "#/signin"; 
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
      end.setHours(start.getHours() + 1);

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
      <DarkModeToggle />
      <div className="sidebar">
        <h1>Dashboard</h1>
        <button onClick={handleSignOut} className="signout-button">
          Sign Out
        </button>
        <button onClick={clearDatabase} className="clear-button">
          Clear Database
        </button>

        <div className="tasks-section">
          <h2>My Tasks</h2>
          <button onClick={() => setIsTaskModalOpen(true)} className="add-task-button">
            Add Task
          </button>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  <TodoList todos={todos} user={user}/>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <CalendarList
          user={user}
          setSelectedCalendar={setSelectedCalendar}
          selectedCalendar={selectedCalendar}
        />
      </div>

      <div className="main-content">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="calendar">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {selectedCalendar && (
                  <CalendarDisplay
                    selectedCalendar={selectedCalendar}
                    events={events} 
                    updateEvents={setEvents}
                    setHoveredDate={setHoveredDate}
                    setIsEventModalOpen={setIsEventModalOpen}
                    setSelectedEvent={setSelectedEvent}
                  />
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {isTaskModalOpen && (
        <TaskModal
          onClose={() => setIsTaskModalOpen(false)}
          onSave={addTask}
        />
      )}

      {isEventModalOpen && (
        <EventModal
          onClose={() => setIsEventModalOpen(false)}
          onSave={addEvent}
          onDelete={deleteEvent}
          initialDate={hoveredDate}
          event={selectedEvent}
        />
      )}
    </div>
  );
};

export default Dashboard;