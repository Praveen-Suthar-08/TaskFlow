import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Project } from '../types';

interface ProjectModalProps {
  project?: Project | null;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
}

export default function ProjectModal({ project, onClose, onSave }: ProjectModalProps) {
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [error, setError] = useState('');
  useEffect(() => {
    const handler = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) { setError('Project name is required.'); return; }
    onSave(name.trim().replace(/\s+/g, ' '), description.trim());
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal project-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
      <div className="modal-heading"><div><span className="eyebrow">WORKSPACE</span><h2 id="project-modal-title">{project ? 'Edit project' : 'New project'}</h2><p className="muted">Keep related work in one place.</p></div><button className="icon-button" onClick={onClose} aria-label="Close project form" type="button"><X size={19} /></button></div>
      <form onSubmit={submit} className="task-form">
        <label className="field">Project name <span className="required">*</span><input autoFocus value={name} onChange={(event) => { setName(event.target.value); setError(''); }} maxLength={100} placeholder="e.g. Website redesign" /></label>
        <label className="field">Description<textarea rows={3} maxLength={1000} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What is this project about?" /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions"><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button type="submit" className="button primary">{project ? 'Save project' : 'Create project'}</button></div>
      </form>
    </section>
  </div>;
}
