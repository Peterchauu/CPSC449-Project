import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, updateDoc, addDoc, doc, arrayUnion } from "firebase/firestore";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import EventModal from "./EventModal";
import "../styles/Calendar.css";

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
  const [shareEmail, setShareEmail] = useState("");

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

  const shareCalendar = async (calendarId) => {
    if (!shareEmail.trim()) return;
    try {
      const calendarRef = doc(db, "calendars", calendarId);
      await updateDoc(calendarRef, {
        sharedWith: arrayUnion(shareEmail),
      });
      setShareEmail("");
      alert("Calendar shared successfully!");
    } catch (error) {
      console.error("Error sharing calendar:", error);
      alert("Failed to share calendar. Check the console for details.");
    }
  };

  return (
    <div className="my-calendar-section">
      <h2>My Calendars</h2>
      <div>
        <input
          type="text"
          placeholder="New Calendar Name"
          value={newCalendarName}
          onChange={(e) => setNewCalendarName(e.target.value)}
        />
        <button onClick={createCalendar}>
          Create Calendar
        </button>
      </div>
      <ul>
        {calendars.map((calendar) => (
          <li
            key={calendar.id}
            onClick={() => setSelectedCalendar(calendar)}
            className={`calendar-item ${
              selectedCalendar?.id === calendar.id ? "selected" : ""
            }`} 
          >
            {calendar.name}
            <input
              type="text"
              placeholder="Share with email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
            />
            <button
              onClick={() => shareCalendar(calendar.id)}
              className="share-calendar-button"
            >
              Share Calendar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Calendar Display Component
export const CalendarDisplay = ({ selectedCalendar, events, updateEvents, setHoveredDate, setIsEventModalOpen, setSelectedEvent }) => {
  useEffect(() => {
    if (!selectedCalendar) return;

    const unsubscribe = onSnapshot(
      collection(db, "calendars", selectedCalendar.id, "events"),
      (snapshot) => {
        const calendarEvents = snapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          start: new Date(doc.data().start), 
          end: new Date(doc.data().end),
        }));
        updateEvents(calendarEvents);
      }
    );

    return () => unsubscribe();
  }, [selectedCalendar, updateEvents]);

  const handleSlotHover = (slotInfo) => {
    setHoveredDate(slotInfo.start);
  };

  const handleSlotSelect = (slotInfo) => {
    setHoveredDate(slotInfo.start);
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };
  
  const eventPropGetter = (event) => {
    const style = {
      backgroundColor: "#add8e6",
      borderRadius: "5px",
      opacity: 0.8,
      color: "black",
      border: "0px",
      display: "block",
    };
    return {
      style: style,
    };
  };

  const eventComponent = ({ event }) => (
    <span>
      <strong>{event.title}</strong>
      <br />
      {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  );

  return (
    <DragDropContext>
      <Droppable droppableId="calendar">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <h2>{selectedCalendar.name}</h2>
            <div style={{ height: 600 }}> 
              <BigCalendar
                localizer={localizer}
                events={events} 
                startAccessor="start" 
                endAccessor="end"  
                style={{ height: "100%" }}
                onSelectSlot={handleSlotSelect}
                onSelectEvent={handleEventSelect} 
                onHoverSlot={handleSlotHover}
                selectable
                eventPropGetter={eventPropGetter} 
                components={{
                  event: eventComponent, 
                }}
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
const Calendar = ({ user, displayOnly, addEvent }) => {
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [events, updateEvents] = useState([]);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

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
          setHoveredDate={setHoveredDate}
          setIsEventModalOpen={setIsEventModalOpen}
        />
      </div>
      {isEventModalOpen && (
        <EventModal
          onClose={() => setIsEventModalOpen(false)}
          onSave={addEvent}
          initialDate={hoveredDate}
        />
      )}
    </div>
  );
};

export default Calendar;