import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { DragDropContext, Droppable } from "react-beautiful-dnd";

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
    const unsubscribe = onSnapshot(collection(db, "calendars"), (snapshot) => {
      const userCalendars = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCalendars(userCalendars);
    });
    return () => unsubscribe();
  }, []);

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
  const [hoveredDate, setHoveredDate] = useState(null);

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

  const addEvent = async (title, start, end) => {
    if (!selectedCalendar || !title.trim() || !start || !end) return;

    try {
      await addDoc(
        collection(db, "calendars", selectedCalendar.id, "events"),
        {
          title,
          start,
          end,
        }
      );
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, draggableId } = result;

    if (!destination || !hoveredDate) return;

    const draggedTask = events.find((event) => event.id === draggableId);

    if (destination.droppableId === "calendar") {
      const start = new Date(hoveredDate);
      const end = new Date(start);
      end.setHours(start.getHours() + 1); // Set end time to 1 hour after start time

      await addEvent(draggedTask.title, start, end);
    }
  };

  const handleSlotHover = (slotInfo) => {
    setHoveredDate(slotInfo.start);
  };

  if (!selectedCalendar) {
    return <p>Please select a calendar to view events.</p>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="calendar">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <h2>{selectedCalendar.name}</h2>
            <div style={{ height: 500 }}>
              <BigCalendar
                localizer={localizer}
                events={events} // Pass events array
                startAccessor="start" // Use the start date
                endAccessor="end"     // Use the end date
                style={{ height: "100%" }}
                onSelectSlot={handleSlotHover}
                selectable
              />
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
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