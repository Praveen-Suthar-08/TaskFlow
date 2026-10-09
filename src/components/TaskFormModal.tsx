import { useEffect, useState, type FormEvent } from 'react';
import { CalendarDays, X } from 'lucide-react';
import type { Project, Task, TaskInput, TaskStatus, Priority } from '../types';

interface TaskFormModalProps {
  task?: Task | null;
  projects: Project[];
  activeProjectId: string;
  onClose: () => void;
  onSave: (input: TaskInput) => void;
  defaultStatus?: TaskStatus;
}

export default function TaskFormModal({ task, projects, activeProjectId, onClose, onSave, defaultStatus = 'todo' }: TaskFormModalProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? defaultStatus);
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '');
  const [labels, setLabels] = useState(task?.labels.join(', ') ?? '');
  const [assignee, setAssignee] = useState(task?.assignee ?? 'You');
  const [projectId, setProjectId] = useState(task?.projectId ?? activeProjectId);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) { setError('Give your task a title before saving.'); return; }
    if (cleanTitle.length > 200) { setError('Task titles must be 200 characters or fewer.'); return; }
    if (description.length > 5000) { setError('Descriptions must be 5,000 characters or fewer.'); return; }
    onSave({
      ...(task ? { id: task.id, order: task.order } : {}),
      projectId,
      title: cleanTitle,
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate || null,
      labels: [...new Set(labels.split(',').map((item) => item.trim()).filter(Boolean))].slice(0, 20),
      assignee: assignee.trim().slice(0, 100),
    });
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="modal task-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">TASK DETAILS</span>
            <h2 id="task-modal-title">{task ? 'Edit task' : 'Create a task'}</h2>
            <p className="muted">A clear next step makes all the difference.</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close task form" type="button"><X size={19} /></button>
        </div>
        <form onSubmit={submit} className="task-form">
          <label className="field full-field">Task title <span className="required">*</span>
            <input autoFocus value={title} onChange={(event) => { setTitle(event.target.value); setError(''); }} placeholder="e.g. Ship the new dashboard" maxLength={200} />
          </label>
          <label className="field full-field">Description
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} maxLength={5000} placeholder="Add context, notes, or what done looks like…" />
          </label>
          <div className="form-grid">
            <label className="field">Status
              <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus)}>
                <option value="todo">To do</option><option value="in-progress">In progress</option><option value="done">Done</option>
              </select>
            </label>
            <label className="field">Priority
              <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </label>
            <label className="field">Due date
              <div className="input-with-icon"><CalendarDays size={16} /><input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></div>
            </label>
            <label className="field">Assignee
              <input value={assignee} onChange={(event) => setAssignee(event.target.value)} placeholder="Unassigned" maxLength={100} />
            </label>
            <label className="field full-field">Project
              <select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
            </label>
            <label className="field full-field">Labels <span className="field-hint">Separate labels with commas</span>
              <input value={labels} onChange={(event) => setLabels(event.target.value)} placeholder="Engineering, Design, Research" />
            </label>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button className="button secondary" type="button" onClick={onClose}>Cancel</button>
            <button className="button primary" type="submit">{task ? 'Save changes' : 'Create task'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
