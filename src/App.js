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
  const [searchTerm, setSearchTerm] = useState("");
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
      const noteDoc = doc(db, "notes", editId);
      await updateDoc(noteDoc, { text: note });
      setEditId(null);
    } else {
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

  // Cancel edit
  const cancelEdit = () => {
    setNote("");
    setEditId(null);
  };

  // Handle Enter key to save
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  // Filter notes based on search
  const filteredNotes = notes.filter((n) =>
    n.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">📝 My Notes</h1>
          <p className="app-tagline">Keep your thoughts organized</p>
        </div>
      </header>

      <main className="app-main">
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              className="note-input"
              placeholder="Write something beautiful..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength="500"
              rows="3"
            />
            <div className="char-count">
              {note.length}/500
            </div>
          </div>

          <div className="button-group">
            <button className="btn btn-save" onClick={handleSave}>
              {editId ? "✏️ Update Note" : "➕ Add Note"}
            </button>
            {editId && (
              <button className="btn btn-cancel" onClick={cancelEdit}>
                ✕ Cancel
              </button>
            )}
          </div>
        </div>

        {notes.length > 0 && (
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="note-count">{filteredNotes.length} notes</span>
          </div>
        )}

        <div className="notes-container">
          {filteredNotes.length === 0 ? (
            <div className="empty-state">
              <p className="empty-icon">📭</p>
              <p className="empty-text">
                {notes.length === 0
                  ? "No notes yet. Create your first one!"
                  : "No notes match your search."}
              </p>
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map((n, index) => (
                <div
                  className={`note-card note-color-${(index % 3) + 1}`}
                  key={n.id}
                >
                  <div className="note-header">
                    <span className="note-badge">
                      {new Date(n.createdAt?.toDate?.()).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="note-body">
                    <p className="note-text">{n.text}</p>
                  </div>

                  <div className="note-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => startEdit(n)}
                      title="Edit note"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => deleteNote(n.id)}
                      title="Delete note"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>✨ Notes App | Created with React & Firebase</p>
      </footer>
    </div>
  );
}

export default App;