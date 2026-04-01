import { useState, useEffect, useCallback } from "react";
import { db } from "./firebase"; // [cite: 66, 275]
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy
} from "firebase/firestore"; // [cite: 67-73, 276]
import "./App.css"; // [cite: 74, 132]

function App() {
  const [note, setNote] = useState(""); 
  const [notes, setNotes] = useState([]); // [cite: 77]
  const [editId, setEditId] = useState(null);
  const notesCollection = collection(db, "notes"); // [cite: 78]

  const fetchNotes = useCallback(async () => {
  const q = query(notesCollection, orderBy("createdAt", "desc"));
  const data = await getDocs(q);
  setNotes(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
}, [notesCollection]);

useEffect(() => {
  fetchNotes();
}, [fetchNotes]);

  // Handle Save (Create or Update)
  const handleSave = async () => {
    if (note.trim() === "") return;

    if (editId) {
      const noteDoc = doc(db, "notes", editId);
      await updateDoc(noteDoc, { text: note });
      setEditId(null);
    } else {
      await addDoc(notesCollection, {
        text: note,
        createdAt: new Date() // [cite: 82-85, 281-283]
      });
    }

    setNote("");
    fetchNotes(); // [cite: 87, 103]
  };

  const deleteNote = async (id) => {
    const noteDoc = doc(db, "notes", id); // [cite: 101]
    await deleteDoc(noteDoc); // [cite: 71, 102]
    fetchNotes();
  };

  const startEdit = (n) => {
    setNote(n.text);
    setEditId(n.id);
  };

  return (
    <div className="app-wrapper">
      <div className="glass-container">
        <header>
          <h1 className="main-title">My First React App</h1>
          <p className="subtitle">Enter your note here</p>
        </header>

        <div className="input-group">
          <input
            type="text"
            placeholder="Type a secret..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button className="magic-button" onClick={handleSave}>
            {editId ? "Update ✨" : "Add Note ✨"}
          </button>
        </div>

        <div className="notes-grid">
          {notes.map((n) => (
            <div className="sticky-note" key={n.id}>
              <div className="note-content">
                <p>{n.text}</p>
              </div>
              <div className="note-footer">
                <button onClick={() => startEdit(n)}>Edit</button>
                <button className="del-btn" onClick={() => deleteNote(n.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App; // [cite: 131, 219]