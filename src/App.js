import { useState, useEffect, useCallback } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy
} from "firebase/firestore";
import "./App.css";

function App() {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [editId, setEditId] = useState(null);
  const notesCollection = collection(db, "notes");

  // Fetch Notes - Ordered by newest first
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
      // Update existing note
      const noteDoc = doc(db, "notes", editId);
      await updateDoc(noteDoc, { text: note });
      setEditId(null);
    } else {
      // Create new note
      await addDoc(notesCollection, {
        text: note,
        createdAt: new Date()
      });
    }

    setNote("");
    fetchNotes();
  };

  // Delete a note
  const deleteNote = async (id) => {
    const noteDoc = doc(db, "notes", id);
    await deleteDoc(noteDoc);
    fetchNotes();
  };

  // Start editing a note
  const startEdit = (n) => {
    setNote(n.text);
    setEditId(n.id);
  };

  // Handle Enter key to save
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <div className="app-wrapper">
      <div className="glass-container">
        <header className="app-header">
          <h1 className="main-title">My Notes</h1>
          <p className="subtitle">Save your thoughts</p>
        </header>

        <div className="input-group">
          <input
            type="text"
            placeholder="Type a note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyPress={handleKeyPress}
            className="note-input"
            maxLength="500"
          />
          <button className="magic-button" onClick={handleSave}>
            {editId ? "Update ✨" : "Add ✨"}
          </button>
        </div>

        <div className="notes-grid">
          {notes.length === 0 ? (
            <p className="empty-message">No notes yet. Add one to get started! 📝</p>
          ) : (
            notes.map((n) => (
              <div className="sticky-note" key={n.id}>
                <div className="note-content">
                  <p>{n.text}</p>
                </div>
                <div className="note-footer">
                  <button 
                    className="edit-btn"
                    onClick={() => startEdit(n)}
                    aria-label="Edit note"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="del-btn"
                    onClick={() => deleteNote(n.id)}
                    aria-label="Delete note"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;