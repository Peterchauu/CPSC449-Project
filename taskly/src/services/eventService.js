import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

export const createEvent = async (event) => {
  await addDoc(collection(db, "events"), event);
};

export const getEvents = async () => {
  const snapshot = await getDocs(collection(db, "events"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const updateEvent = async (id, updates) => {
  await updateDoc(doc(db, "events", id), updates);
};

export const deleteEvent = async (id) => {
  await deleteDoc(doc(db, "events", id));
};