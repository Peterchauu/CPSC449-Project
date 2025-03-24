import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot, query, where } from "firebase/firestore";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Calendar List Component
export const CalendarList = ({ user, setSelectedCalendar, selectedCalendar }) => {
  const [calendars, setCalendars] = useState([]);
  const [newCalendarName, setNewCalendarName] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "calendars"),
      where("sharedWith", "array-contains", user.email)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userCalendars = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCalendars(userCalendars);
    });
    return () => unsubscribe();
  }, [user.email]);

  const createCalendar = async () => {
    if (!newCalendarName.trim()) return;
    try {
      await addDoc(collection(db, "calendars"), {
        name: newCalendarName,
        owner: user.email,
        sharedWith: [user.email],
      });
      setNewCalendarName("");
    } catch (error) {
      console.error("Error creating calendar:", error);
    }
  };

  return (
    <div>
      <h2>My Calendars</h2>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="New Calendar Name"
          value={newCalendarName}
          onChange={(e) => setNewCalendarName(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <button onClick={createCalendar} style={{ width: "100%" }}>
          Create Calendar
        </button>
      </div>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {calendars.map((calendar) => (
          <li
            key={calendar.id}
            onClick={() => setSelectedCalendar(calendar)}
            style={{
              cursor: "pointer",
              padding: "10px",
              backgroundColor: selectedCalendar?.id === calendar.id ? "#f0f0f0" : "transparent",
              borderRadius: "5px",
              marginBottom: "5px",
            }}
          >
            {calendar.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Calendar Display Component
export const CalendarDisplay = ({ selectedCalendar, events, updateEvents }) => {
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventStartDate, setNewEventStartDate] = useState("");
  const [newEventEndDate, setNewEventEndDate] = useState("");
  const [shareEmail, setShareEmail] = useState("");

  useEffect(() => {
    if (!selectedCalendar) return;

    const unsubscribe = onSnapshot(
      collection(db, "calendars", selectedCalendar.id, "events"),
      (snapshot) => {
        const calendarEvents = snapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          start: new Date(doc.data().start), // Convert Firestore timestamp to Date
          end: new Date(doc.data().end),
        }));
        updateEvents(calendarEvents);
      }
    );

    return () => unsubscribe();
  }, [selectedCalendar, updateEvents]);

  const addEvent = async () => {
    if (
      !selectedCalendar ||
      !newEventTitle.trim() ||
      !newEventStartDate.trim() ||
      !newEventEndDate.trim()
    )
      return;

    try {
      const startDate = new Date(newEventStartDate);
      const endDate = new Date(newEventEndDate);

      if (startDate > endDate) {
        alert("Start date cannot be after end date.");
        return;
      }

      await addDoc(
        collection(db, "calendars", selectedCalendar.id, "events"),
        {
          title: newEventTitle,
          start: startDate,
          end: endDate,
        }
      );

      setNewEventTitle("");
      setNewEventStartDate("");
      setNewEventEndDate("");
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  const shareCalendar = async () => {
    if (!selectedCalendar || !shareEmail.trim()) return;
    try {
      const calendarRef = collection(db, "calendars");
      const calendarDoc = selectedCalendar.id;
      await addDoc(calendarRef, {
        sharedWith: [...selectedCalendar.sharedWith, shareEmail],
      });
    } catch (error) {
      console.error("Error sharing calendar:", error);
    }
  };

  if (!selectedCalendar) {
    return <p>Please select a calendar to view events.</p>;
  }

  return (
    <div>
      <h2>{selectedCalendar.name}</h2>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>Event Title</label>
        <input
          type="text"
          placeholder="Event Title"
          value={newEventTitle}
          onChange={(e) => setNewEventTitle(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <label style={{ display: "block", marginBottom: "5px" }}>Start Date and Time</label>
        <input
          type="datetime-local"
          value={newEventStartDate}
          onChange={(e) => setNewEventStartDate(e.target.value)}
          placeholder="Start Date and Time"
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <label style={{ display: "block", marginBottom: "5px" }}>End Date and Time</label>
        <input
          type="datetime-local"
          value={newEventEndDate}
          onChange={(e) => setNewEventEndDate(e.target.value)}
          placeholder="End Date and Time"
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <button onClick={addEvent} style={{ width: "100%" }}>
          Add Event
        </button>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>Share Calendar With</label>
        <input
          type="email"
          placeholder="Share with (email)"
          value={shareEmail}
          onChange={(e) => setShareEmail(e.target.value)}
          style={{ width: "100%", marginBottom: "10px" }}
        />
        <button onClick={shareCalendar} style={{ width: "100%" }}>
          Share Calendar
        </button>
      </div>
      <div style={{ height: 500 }}>
        <BigCalendar
          localizer={localizer}
          events={events} // Pass events array
          startAccessor="start" // Use the start date
          endAccessor="end"     // Use the end date
          style={{ height: "100%" }}
        />
      </div>
    </div>
  );
};

// Main Calendar Component
const Calendar = ({ user, displayOnly }) => {
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [events, updateEvents] = useState([]);

  if (displayOnly) {
    return selectedCalendar ? (
      <div>
        <h2>{selectedCalendar.name}</h2>
        <div style={{ height: 500 }}>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
          />
        </div>
      </div>
    ) : (
      <p>Please select a calendar to view events.</p>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "30%", padding: "20px", borderRight: "1px solid #ccc" }}>
        <h1>Dashboard</h1>
        <CalendarList
          user={user}
          setSelectedCalendar={setSelectedCalendar}
          selectedCalendar={selectedCalendar}
        />
      </div>
      <div style={{ width: "70%", padding: "20px" }}>
        <CalendarDisplay
          selectedCalendar={selectedCalendar}
          events={events}
          updateEvents={updateEvents}
        />
      </div>
    </div>
  );
};

export default Calendar;