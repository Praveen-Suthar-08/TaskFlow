import { isValid, parseISO } from 'date-fns';
import type { AppData, Priority, Project, Task, TaskStatus } from '../types';

export const STATUS_META: Record<TaskStatus, { label: string; className: string }> = {
  todo: { label: 'To do', className: 'todo' },
  'in-progress': { label: 'In progress', className: 'progress' },
  done: { label: 'Done', className: 'done' },
};
export const PRIORITY_META: Record<Priority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'low' },
  medium: { label: 'Medium', className: 'medium' },
  high: { label: 'High', className: 'high' },
};

export function isOverdue(task: Task, today = new Date()): boolean {
  if (task.status === 'done' || !task.dueDate) return false;
  return task.dueDate < localDateString(today);
}

export function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getAnalytics(tasks: Task[], today = new Date()) {
  const completed = tasks.filter((task) => task.status === 'done').length;
  const active = tasks.filter((task) => task.status !== 'done').length;
  const overdue = tasks.filter((task) => isOverdue(task, today)).length;
  return {
    total: tasks.length,
    completed,
    active,
    overdue,
    completion: tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100),
  };
}

export interface TaskFilters {
  query?: string;
  status?: TaskStatus | 'all';
  priority?: Priority | 'all';
  label?: string | 'all';
  overdueOnly?: boolean;
  sort?: 'dueDate' | 'priority' | 'createdAt' | 'order';
}

const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function filterAndSortTasks(tasks: Task[], filters: TaskFilters = {}, today = new Date()): Task[] {
  const query = filters.query?.trim().toLocaleLowerCase() ?? '';
  return tasks
    .filter((task) => {
      const matchesQuery = !query || `${task.title} ${task.description} ${task.labels.join(' ')}`.toLocaleLowerCase().includes(query);
      const matchesStatus = !filters.status || filters.status === 'all' || task.status === filters.status;
      const matchesPriority = !filters.priority || filters.priority === 'all' || task.priority === filters.priority;
      const matchesLabel = !filters.label || filters.label === 'all' || task.labels.includes(filters.label);
      const matchesOverdue = !filters.overdueOnly || isOverdue(task, today);
      return matchesQuery && matchesStatus && matchesPriority && matchesLabel && matchesOverdue;
    })
    .sort((a, b) => {
      switch (filters.sort ?? 'order') {
        case 'dueDate': return (a.dueDate ?? '9999-12-31').localeCompare(b.dueDate ?? '9999-12-31') || a.order - b.order;
        case 'priority': return priorityRank[a.priority] - priorityRank[b.priority] || a.order - b.order;
        case 'createdAt': return b.createdAt.localeCompare(a.createdAt);
        default: return a.order - b.order;
      }
    });
}

const validStatuses = new Set<TaskStatus>(['todo', 'in-progress', 'done']);
const validPriorities = new Set<Priority>(['low', 'medium', 'high']);
const idPattern = /^[A-Za-z0-9_-]{1,128}$/;
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

function validDateString(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseISO(value)) && localDateString(parseISO(value)) === value;
}
function validTimestamp(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value));
}
function validLabels(value: unknown): value is string[] {
  return Array.isArray(value) && value.length <= 50 && value.every((label) => typeof label === 'string' && label.trim().length > 0 && label.length <= 50);
}

export function validateAppData(value: unknown): value is AppData {
  if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.tasks) || !Array.isArray(value.projects)) return false;
  if (!(value.activeProjectId === null || typeof value.activeProjectId === 'string')) return false;
  if (!(value.theme === 'light' || value.theme === 'dark')) return false;
  if (value.projects.length === 0 || value.projects.length > 500 || value.tasks.length > 10000) return false;

  const projectIds = new Set<string>();
  for (const raw of value.projects) {
    if (!isRecord(raw) || typeof raw.id !== 'string' || !idPattern.test(raw.id) || projectIds.has(raw.id)) return false;
    if (typeof raw.name !== 'string' || !raw.name.trim() || raw.name.length > 100 || typeof raw.description !== 'string' || raw.description.length > 2000 || !validTimestamp(raw.createdAt)) return false;
    projectIds.add(raw.id);
  }
  if (value.activeProjectId !== null && !projectIds.has(value.activeProjectId)) return false;

  const taskIds = new Set<string>();
  for (const raw of value.tasks) {
    if (!isRecord(raw)) return false;
    if (typeof raw.id !== 'string' || !idPattern.test(raw.id) || taskIds.has(raw.id)) return false;
    if (typeof raw.projectId !== 'string' || !projectIds.has(raw.projectId)) return false;
    if (typeof raw.title !== 'string' || !raw.title.trim() || raw.title.length > 200) return false;
    if (typeof raw.description !== 'string' || raw.description.length > 5000) return false;
    if (typeof raw.status !== 'string' || !validStatuses.has(raw.status as TaskStatus)) return false;
    if (typeof raw.priority !== 'string' || !validPriorities.has(raw.priority as Priority)) return false;
    if (!(raw.dueDate === null || validDateString(raw.dueDate))) return false;
    if (!validLabels(raw.labels) || typeof raw.assignee !== 'string' || raw.assignee.length > 100) return false;
    if (!validTimestamp(raw.createdAt) || !validTimestamp(raw.updatedAt)) return false;
    if (typeof raw.order !== 'number' || !Number.isFinite(raw.order)) return false;
    taskIds.add(raw.id);
  }
  return true;
}

export function normalizeProjectName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function getLabels(tasks: Task[]): string[] {
  return [...new Set(tasks.flatMap((task) => task.labels))].sort((a, b) => a.localeCompare(b));
}

export function getProjectById(projects: Project[], id: string | null): Project | undefined {
  return projects.find((project) => project.id === id);
}
