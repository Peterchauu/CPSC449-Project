import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, updateDoc, addDoc, doc, arrayUnion, getDocs, deleteDoc, query, where } from "firebase/firestore";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { Droppable } from "@hello-pangea/dnd";
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

export const CalendarList = ({ user, setSelectedCalendar, selectedCalendar }) => {
  const [calendars, setCalendars] = useState([]);
  const [newCalendarName, setNewCalendarName] = useState("");
  const [shareEmail, setShareEmail] = useState("");

  useEffect(() => {
    if (!user) return;

    // Query calendars where the user is the owner or is included in the sharedWith array
    const calendarsQuery = query(
      collection(db, "calendars"),
      where("sharedWith", "array-contains", user.email)
    );

    const unsubscribe = onSnapshot(calendarsQuery, (snapshot) => {
      const userCalendars = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCalendars(userCalendars);
    });

    return () => unsubscribe();
  }, [user]);

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

  const deleteCalendar = async (calendarId) => {
    try {
      const eventsRef = collection(db, "calendars", calendarId, "events");
      const eventsSnapshot = await getDocs(eventsRef);
      const deletePromises = eventsSnapshot.docs.map((eventDoc) =>
        deleteDoc(doc(db, "calendars", calendarId, "events", eventDoc.id))
      );
      await Promise.all(deletePromises);
      const calendarRef = doc(db, "calendars", calendarId);
      await deleteDoc(calendarRef);
      alert("Calendar deleted successfully!");
    } catch (error) {
      console.error("Error deleting calendar:", error);
      alert("Failed to delete calendar. Check the console for details.");
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
        <button onClick={createCalendar} className="my-calendar-section-button">
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
            <span>{calendar.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteCalendar(calendar.id);
              }}
              className="delete-calendar-button"
            >
              x
            </button>
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

export const CalendarDisplay = ({
  selectedCalendar,
  events,
  updateEvents,
  setHoveredDate,
  setIsEventModalOpen,
  setIsTaskViewModalOpen,
  setSelectedEvent,
}) => {
  const [currentView, setCurrentView] = useState("week");

  useEffect(() => {
    if (!selectedCalendar) return;

    const unsubscribe = onSnapshot(
      collection(db, "calendars", selectedCalendar.id, "events"),
      async (snapshot) => {
        const calendarEvents = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const eventData = doc.data();

            // Fetch tasks for the event
            const tasksSnapshot = await getDocs(
              collection(db, "calendars", selectedCalendar.id, "events", doc.id, "tasks")
            );
            const tasks = tasksSnapshot.docs.map((taskDoc) => ({
              id: taskDoc.id,
              ...taskDoc.data(),
            }));

            return {
              id: doc.id,
              title: eventData.title,
              description: eventData.description,
              start: new Date(eventData.start),
              end: new Date(eventData.end),
              type: eventData.type,
              tasks, // Include tasks in the event
            };
          })
        );

        updateEvents(calendarEvents);
      }
    );

    return () => unsubscribe();
  }, [selectedCalendar, updateEvents]);

  const handleSlotSelect = (slotInfo) => {
    setHoveredDate(slotInfo.start);
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    if (event.type === "task") {
      setIsTaskViewModalOpen(true);
    } else {
      setIsEventModalOpen(true);
    }
  };

  const eventPropGetter = (event) => {
    const isDark = document.body.classList.contains("dark-mode");

    const baseTaskStyle = {
      backgroundColor: isDark ? "#ffa726" : "#ff9800",
      borderRadius: "6px",
      border: "2px solid rgba(0, 0, 0, 0.15)",
      color: "#fff",
      fontWeight: "bold",
    };

    const baseEventStyle = {
      backgroundColor: isDark ? "#1565c0" : "#007bff",
      borderRadius: "6px",
      border: "2px solid rgba(0, 0, 0, 0.15)",
      color: "#fff",
      fontWeight: "bold",
    };

    return {
      style: event.type === "task" ? baseTaskStyle : baseEventStyle,
    };
  };

  const CustomEvent = ({ event }) => {
    return (
      <Droppable droppableId={`event-${event.id}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`custom-event ${
              event.type === "task" ? "task-event" : "normal-event"
            } ${snapshot.isDraggingOver ? "drag-over" : ""}`}
          >
            <div className="event-title">{event.title}</div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };

  return (
    <div>
      <h2>{selectedCalendar?.name}</h2>
      <div style={{ height: 600 }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          onSelectSlot={handleSlotSelect}
          onSelectEvent={handleEventSelect}
          selectable
          eventPropGetter={eventPropGetter}
          onView={(view) => setCurrentView(view)}
          views={["month", "week", "day"]}
          defaultView={"month"}
          components={{
            event: CustomEvent,
          }}
        />
      </div>
    </div>
  );
};