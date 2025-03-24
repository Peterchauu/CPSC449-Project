import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import MyCalendar from "./Calendar";
import TodoList from "./TodoList";
import { Button, Container, Typography } from "@mui/material";

interface Event {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  owner: string;
}

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch events
  const fetchEvents = async () => {
    try {
      const snapshot = await getDocs(collection(db, "events"));
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  // Add event
  const addEvent = async () => {
    const newEvent: Event = {
      title: "New Event",
      start: new Date(),
      end: new Date(),
      owner: user.uid,
    };
    await addDoc(collection(db, "events"), newEvent);
    fetchEvents();
  };

  // Delete event
  const deleteEvent = async (id: string) => {
    await deleteDoc(doc(db, "events", id));
    fetchEvents();
  };

  return (
    <Container>
      <Typography variant="h4">Welcome, {user.displayName}</Typography>
      <Button variant="contained" onClick={addEvent}>Add Event</Button>
      <MyCalendar events={events} />
      <TodoList />
    </Container>
  );
};

export default Dashboard;