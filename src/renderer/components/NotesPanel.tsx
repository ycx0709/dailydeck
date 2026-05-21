import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Note } from "../../shared/types";

type Props = {
  notes: Note[];
  onCreate: (text: string) => void;
  onDelete: (id: string) => void;
};

export function NotesPanel({ notes, onCreate, onDelete }: Props) {
  const [text, setText] = useState("");

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Quick notes</h2>
      </div>
      <form
        className="entry-row"
        onSubmit={(event) => {
          event.preventDefault();
          onCreate(text);
          setText("");
        }}
      >
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Capture a note" />
        <button aria-label="Add note" type="submit">
          <Plus size={16} />
        </button>
      </form>
      <div className="list">
        {notes.map((note) => (
          <div className="item-row note-row" key={note.id}>
            <span>{note.text}</span>
            <button aria-label="Delete note" onClick={() => onDelete(note.id)}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
