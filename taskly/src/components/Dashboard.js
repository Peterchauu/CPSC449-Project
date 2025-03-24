import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, onSnapshot, getDocs, deleteDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import TodoList from "./TodoList";
import { CalendarList, CalendarDisplay } from "./Calendar";

const Dashboard = ({ user }) => {
  const [todos, setTodos] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [events, setEvents] = useState([]); // State for events

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

  const addTask = async (text) => {
    if (text.trim() === "") return;
    await addDoc(collection(db, "users", user.uid, "todos"), {
      text,
      createdAt: new Date(),
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = "/signin"; // Redirect to sign-in page
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
      window.location.href = "/signin"; // Redirect to sign-in page
    } catch (error) {
      console.error("Error clearing database:", error);
      alert("Failed to clear the database. Check the console for details.");
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left Column */}
      <div style={{ width: "30%", padding: "20px", borderRight: "1px solid #ccc" }}>
        <h1>Dashboard</h1>
        <button onClick={handleSignOut} style={{ width: "100%", marginBottom: "20px" }}>
          Sign Out
        </button>
        <button onClick={clearDatabase} style={{ width: "100%", marginBottom: "20px", backgroundColor: "red", color: "white" }}>
          Clear Database
        </button>

        {/* Tasks Section */}
        <div>
          <h2>My Tasks</h2>
          <button
            onClick={() => addTask("New Task")}
            style={{ width: "100%", marginBottom: "10px" }}
          >
            Add Task
          </button>
          <TodoList todos={todos} setTodos={setTodos} />
        </div>

        {/* Calendar List Section */}
        <CalendarList
          user={user}
          setSelectedCalendar={setSelectedCalendar}
          selectedCalendar={selectedCalendar}
        />
      </div>

      {/* Right Column */}
      <div style={{ width: "70%", padding: "20px" }}>
        <CalendarDisplay
          selectedCalendar={selectedCalendar}
          events={events} // Pass events state
          updateEvents={setEvents} // Pass setEvents as updateEvents
        />
      </div>
    </div>
  );
};

export default Dashboard;