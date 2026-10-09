export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  labels: string[];
  assignee: string;
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface AppData {
  version: 1;
  tasks: Task[];
  projects: Project[];
  activeProjectId: string | null;
  theme: 'light' | 'dark';
}

export type TaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'> & { id?: string; order?: number };
export type Page = 'dashboard' | 'tasks' | 'board' | 'calendar' | 'settings';
