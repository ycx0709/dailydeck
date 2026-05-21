import { Check, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Task } from "../../shared/types";

type Props = {
  tasks: Task[];
  onCreate: (text: string) => void;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
};

export function TaskPanel({ tasks, onCreate, onToggle, onDelete }: Props) {
  const [text, setText] = useState("");

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Today</h2>
      </div>
      <form
        className="entry-row"
        onSubmit={(event) => {
          event.preventDefault();
          onCreate(text);
          setText("");
        }}
      >
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Add a task" />
        <button aria-label="Add task" type="submit">
          <Plus size={16} />
        </button>
      </form>
      <div className="list">
        {tasks.map((task) => (
          <div className="item-row" key={task.id}>
            <button aria-label="Toggle task" onClick={() => onToggle(task.id, !task.completed)}>
              <Check size={16} />
            </button>
            <span className={task.completed ? "done" : ""}>{task.text}</span>
            <button aria-label="Delete task" onClick={() => onDelete(task.id)}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
