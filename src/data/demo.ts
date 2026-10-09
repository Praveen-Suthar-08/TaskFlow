import { addDays, formatISO, startOfDay } from 'date-fns';
import type { AppData, Project, Task } from '../types';

const today = startOfDay(new Date());
const stamp = (daysAgo: number) => formatISO(addDays(today, -daysAgo));
const due = (daysFromNow: number) => formatISO(addDays(today, daysFromNow), { representation: 'date' });

export const demoProjects: Project[] = [
  { id: 'project-product', name: 'Product Launch', description: 'Prepare the next product release.', createdAt: stamp(18) },
  { id: 'project-personal', name: 'Personal', description: 'A little space for everything else.', createdAt: stamp(12) },
];

export const demoTasks: Task[] = [
  { id: 'task-1', projectId: 'project-product', title: 'Finalize onboarding flow', description: 'Review the first-run experience and remove any unnecessary steps.', status: 'in-progress', priority: 'high', dueDate: due(1), labels: ['Design', 'Product'], assignee: 'You', createdAt: stamp(6), updatedAt: stamp(0), order: 0 },
  { id: 'task-2', projectId: 'project-product', title: 'Audit API error states', description: 'Make error messages actionable and consistent across the app.', status: 'todo', priority: 'high', dueDate: due(0), labels: ['Engineering'], assignee: 'Alex Morgan', createdAt: stamp(5), updatedAt: stamp(1), order: 1 },
  { id: 'task-3', projectId: 'project-product', title: 'Update the component library', description: 'Document buttons, form controls, spacing, and typography tokens.', status: 'todo', priority: 'medium', dueDate: due(4), labels: ['Design'], assignee: 'You', createdAt: stamp(4), updatedAt: stamp(2), order: 2 },
  { id: 'task-4', projectId: 'project-product', title: 'Ship analytics events', description: 'Verify key conversion events in the staging environment.', status: 'done', priority: 'medium', dueDate: due(-2), labels: ['Engineering', 'Analytics'], assignee: 'Jamie Lee', createdAt: stamp(8), updatedAt: stamp(1), order: 3 },
  { id: 'task-5', projectId: 'project-product', title: 'Write release notes', description: 'Summarize product improvements and fixes for the launch.', status: 'in-progress', priority: 'low', dueDate: due(6), labels: ['Content'], assignee: 'You', createdAt: stamp(3), updatedAt: stamp(0), order: 4 },
  { id: 'task-6', projectId: 'project-product', title: 'Run accessibility checks', description: 'Check keyboard navigation, focus order, and color contrast.', status: 'todo', priority: 'medium', dueDate: due(3), labels: ['Quality'], assignee: 'Riley Park', createdAt: stamp(2), updatedAt: stamp(2), order: 5 },
  { id: 'task-7', projectId: 'project-personal', title: 'Plan the weekend', description: 'Make time for a long walk and a good book.', status: 'todo', priority: 'low', dueDate: due(2), labels: ['Personal'], assignee: 'You', createdAt: stamp(2), updatedAt: stamp(2), order: 0 },
];

export const createDemoData = (): AppData => ({
  version: 1,
  tasks: demoTasks.map((task) => ({ ...task, labels: [...task.labels] })),
  projects: demoProjects.map((project) => ({ ...project })),
  activeProjectId: demoProjects[0]?.id ?? null,
  theme: 'light',
});
