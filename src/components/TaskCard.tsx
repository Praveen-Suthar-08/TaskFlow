import type { CSSProperties, ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, GripVertical, MoreHorizontal, Pencil, Trash2, UserRound } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Task } from '../types';
import { isOverdue, PRIORITY_META } from '../utils/taskUtils';

export interface TaskCardProps {
  task: Task;
  draggable?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function TaskCardContent({ task, onEdit, onDelete, dragHandle }: TaskCardProps & { dragHandle?: ReactNode }) {
  const overdue = isOverdue(task);
  return <article className="task-card">
    <div className="task-card-top">
      {dragHandle}
      <span className={`priority-dot ${PRIORITY_META[task.priority].className}`} title={`${PRIORITY_META[task.priority].label} priority`} />
      <div className="task-card-spacer" />
      <div className="task-actions">
        <button type="button" className="tiny-icon-button" aria-label={`Edit ${task.title}`} onClick={() => onEdit(task)}><Pencil size={14} /></button>
        <button type="button" className="tiny-icon-button danger-hover" aria-label={`Delete ${task.title}`} onClick={() => onDelete(task)}><Trash2 size={14} /></button>
      </div>
      <button className="tiny-icon-button menu-placeholder" aria-label={`${task.title} options`} type="button" onClick={() => onEdit(task)}><MoreHorizontal size={15} /></button>
    </div>
    <button type="button" className="task-card-title" onClick={() => onEdit(task)}>{task.title}</button>
    {task.description && <p className="task-card-description">{task.description}</p>}
    {task.labels.length > 0 && <div className="task-labels">{task.labels.slice(0, 3).map((label) => <span className="label-chip" key={label}>{label}</span>)}{task.labels.length > 3 && <span className="label-more">+{task.labels.length - 3}</span>}</div>}
    <div className="task-card-footer">
      <div className={`task-due ${overdue ? 'overdue' : ''}`}>{task.dueDate ? <><CalendarDays size={13} /><span>{format(parseISO(task.dueDate), 'MMM d')}</span></> : <span className="no-date">No due date</span>}</div>
      <span className="avatar-small" title={task.assignee || 'Unassigned'}>{task.assignee.trim() ? task.assignee.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase() : <UserRound size={12} />}</span>
    </div>
  </article>;
}

export default function TaskCard(props: TaskCardProps) {
  if (!props.draggable) return <TaskCardContent {...props} />;
  return <SortableTaskCard {...props} />;
}

function SortableTaskCard(props: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.task.id });
  const style: CSSProperties = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.45 : 1 };
  const handle = <button type="button" className="drag-handle" aria-label={`Drag ${props.task.title}`} {...attributes} {...listeners}><GripVertical size={15} /></button>;
  return <div ref={setNodeRef} style={style} className="sortable-task"><TaskCardContent {...props} dragHandle={handle} /></div>;
}
