import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Check, Circle, Clock3, Plus } from 'lucide-react';
import type { Task, TaskStatus } from '../types';
import TaskCard from './TaskCard';

const columnIcons = { todo: Circle, 'in-progress': Clock3, done: Check };
const columnTitles: Record<TaskStatus, string> = { todo: 'To do', 'in-progress': 'In progress', done: 'Done' };

interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onAdd: (status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function BoardColumn({ status, tasks, onAdd, onEdit, onDelete }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `column:${status}` });
  const Icon = columnIcons[status];
  return <section ref={setNodeRef} className={`board-column ${isOver ? 'column-over' : ''}`} aria-label={`${columnTitles[status]} column`}>
    <header className="column-header">
      <div className={`column-icon ${status}`}><Icon size={15} /></div>
      <h3>{columnTitles[status]}</h3>
      <span className="column-count">{tasks.length}</span>
      <button className="tiny-icon-button column-add" type="button" onClick={() => onAdd(status)} aria-label={`Add task to ${columnTitles[status]}`}><Plus size={16} /></button>
    </header>
    <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
      <div className="column-cards">
        {tasks.map((task) => <TaskCard key={task.id} task={task} draggable onEdit={onEdit} onDelete={onDelete} />)}
        {tasks.length === 0 && <div className="column-empty"><span className="empty-circle"><Plus size={16} /></span><p>No tasks here yet</p><button type="button" onClick={() => onAdd(status)}>Add a task</button></div>}
      </div>
    </SortableContext>
  </section>;
}
