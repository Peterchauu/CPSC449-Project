import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, getDocs, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import TodoList from "./TodoList";
import { CalendarList, CalendarDisplay } from "./Calendar";
import TaskModal from "./TaskModal";
import EventModal from "./EventModal";
import TaskViewModal from "./TaskViewModal";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import DarkModeToggle from "./DarkModeToggle";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [todos, setTodos] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [events, setEvents] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isTaskViewModalOpen, setIsTaskViewModalOpen] = useState(false);
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

  const addTask = async (title, description, existingTaskId) => {
    if (title.trim() === "") return;
    
    if (existingTaskId && selectedCalendar) {
      try {
        await updateDoc(doc(db, "calendars", selectedCalendar.id, "events", existingTaskId), {
          title,
          description
        });
      } catch (error) {
        console.error("Error updating task:", error);
      }
    } else {
      await addDoc(collection(db, "users", user.uid, "todos"), {
        title,
        description,
        createdAt: new Date(),
      });
    }
    setIsTaskModalOpen(false);
  };

  const addEvent = async (title, start, end, existingEventId) => {
    if (!selectedCalendar || !title.trim() || !start || !end) return;
    try {
      if (existingEventId) {
        await updateDoc(doc(db, "calendars", selectedCalendar.id, "events", existingEventId), {
          title,
          start: start.toISOString(),
          end: end.toISOString(),
          type: "event"
        });
      } else {
        await addDoc(collection(db, "calendars", selectedCalendar.id, "events"), {
          title,
          start: start.toISOString(),
          end: end.toISOString(),
          type: "event"
        });
      }
      setIsEventModalOpen(false);
    } catch (error) {
      console.error("Error saving event:", error);
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

  const deleteTask = async (taskId) => {
    if (!taskId) return;
    
    try {
      if (selectedCalendar && taskId) {
        // Delete a task from the calendar
        await deleteDoc(doc(db, "calendars", selectedCalendar.id, "events", taskId));
      } 
      setIsTaskModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error deleting task:", error);
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

  const clearUserData = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      "Are you sure you want to clear all your data? This action cannot be undone."
    );
    
    if (!confirmed) return;
    
    try {
      const todosRef = collection(db, "users", user.uid, "todos");
      const todosSnapshot = await getDocs(todosRef);
      const todoDeletePromises = todosSnapshot.docs.map((todoDoc) => 
        deleteDoc(doc(db, "users", user.uid, "todos", todoDoc.id))
      );
      
      const calendarsRef = collection(db, "calendars");
      const calendarQuery = query(calendarsRef, where("owner", "==", user.email));
      const calendarsSnapshot = await getDocs(calendarQuery);
      
      const calendarDeletePromises = calendarsSnapshot.docs.map(async (calendarDoc) => {
        const eventsRef = collection(db, "calendars", calendarDoc.id, "events");
        const eventsSnapshot = await getDocs(eventsRef);
        const eventDeletePromises = eventsSnapshot.docs.map((eventDoc) => 
          deleteDoc(doc(db, "calendars", calendarDoc.id, "events", eventDoc.id))
        );
        
        await Promise.all(eventDeletePromises);
        return deleteDoc(doc(db, "calendars", calendarDoc.id));
      });
      
      await Promise.all([...todoDeletePromises, ...calendarDeletePromises]);
      
      setTodos([]);
      setEvents([]);
      setSelectedCalendar(null);
      
      alert("All your data has been cleared successfully.");
    } catch (error) {
      console.error("Error clearing user data:", error);
      alert("Failed to clear data. Please try again.");
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || !selectedCalendar) return;
    if (source.droppableId === "tasks" && destination.droppableId !== "tasks") {
      const draggedTask = todos.find(task => task.id === draggableId);
      if (!draggedTask) return;
      try {
        await addDoc(collection(db, "calendars", selectedCalendar.id, "events"), {
          title: draggedTask.title,
          description: draggedTask.description || "", // Store the description
          start: new Date(destination.droppableId).toISOString(),
          end: new Date(new Date(destination.droppableId).setHours(new Date(destination.droppableId).getHours() + 1)).toISOString(),
          type: "task"
        });
        await deleteDoc(doc(db, "users", user.uid, "todos", draggedTask.id));
      } catch (error) {
        console.error("Error moving task to calendar:", error);
        alert("Failed to move task to calendar");
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="dashboard-container">
        <DarkModeToggle />
        <div className="sidebar">
          <h1>Dashboard</h1>
          <button onClick={handleSignOut} className="signout-button">
            Sign Out
          </button>
          <button onClick={clearUserData} className="signout-button">
            Clear My Data
          </button>
          <div className="tasks-section">
            <h2>My Tasks</h2>
            <button 
              onClick={() => {
                setSelectedEvent(null);
                setIsTaskModalOpen(true);
              }} 
              className="add-task-button"
            >
              Add Task
            </button>
            <Droppable droppableId="tasks">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  <TodoList todos={todos} user={user} />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
          <CalendarList
            user={user}
            setSelectedCalendar={setSelectedCalendar}
            selectedCalendar={selectedCalendar}
          />
        </div>
        <div className="main-content">
          {selectedCalendar && (
            <CalendarDisplay
              selectedCalendar={selectedCalendar}
              events={events}
              updateEvents={setEvents}
              setHoveredDate={setHoveredDate}
              setIsEventModalOpen={setIsEventModalOpen}
              setIsTaskModalOpen={setIsTaskModalOpen}
              setIsTaskViewModalOpen={setIsTaskViewModalOpen}
              setSelectedEvent={setSelectedEvent}
            />
          )}
        </div>
        {isTaskModalOpen && (
          <TaskModal
            onClose={() => {
              setIsTaskModalOpen(false);
              setSelectedEvent(null); 
            }}
            onSave={addTask}
            onDelete={deleteTask}
            initialTask={selectedEvent}
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
        {isTaskViewModalOpen && selectedEvent && (
          <TaskViewModal
            onClose={() => {
              setIsTaskViewModalOpen(false);
              setSelectedEvent(null);
            }}
            task={selectedEvent}
            onDelete={deleteTask}
          />
        )}
      </div>
    </DragDropContext>
  );
};

export default Dashboard;