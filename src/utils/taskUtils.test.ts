import { describe, expect, it } from 'vitest';
import { createDemoData } from '../data/demo';
import type { Task } from '../types';
import { filterAndSortTasks, getAnalytics, isOverdue, validateAppData } from './taskUtils';

const baseTask: Task = {
  id: 'task-test', projectId: 'project-test', title: 'Test task', description: 'A test description',
  status: 'todo', priority: 'medium', dueDate: '2026-10-09', labels: ['Testing'], assignee: 'You',
  createdAt: '2026-10-01T10:00:00.000Z', updatedAt: '2026-10-02T10:00:00.000Z', order: 0,
};

describe('task analytics and filtering', () => {
  it('computes counts and avoids division by zero', () => {
    expect(getAnalytics([])).toEqual({ total: 0, completed: 0, active: 0, overdue: 0, completion: 0 });
    const tasks = [
      { ...baseTask, status: 'done' as const, dueDate: '2026-10-01' },
      { ...baseTask, id: 'task-two', status: 'in-progress' as const, dueDate: '2026-10-08' },
    ];
    expect(getAnalytics(tasks, new Date(2026, 9, 9))).toEqual({ total: 2, completed: 1, active: 1, overdue: 1, completion: 50 });
  });

  it('does not count tasks due today as overdue and excludes completed tasks', () => {
    const today = new Date(2026, 9, 9, 18, 30);
    expect(isOverdue({ ...baseTask, dueDate: '2026-10-09' }, today)).toBe(false);
    expect(isOverdue({ ...baseTask, dueDate: '2026-10-08' }, today)).toBe(true);
    expect(isOverdue({ ...baseTask, status: 'done', dueDate: '2026-10-01' }, today)).toBe(false);
  });

  it('combines query, status, and priority filters', () => {
    const tasks = [
      { ...baseTask, title: 'Fix API error states', labels: ['Engineering'], priority: 'high' as const },
      { ...baseTask, id: 'task-two', title: 'Write release notes', status: 'in-progress' as const, priority: 'low' as const },
    ];
    expect(filterAndSortTasks(tasks, { query: 'api', priority: 'high', status: 'todo' })).toHaveLength(1);
    expect(filterAndSortTasks(tasks, { query: 'api', priority: 'low', status: 'todo' })).toHaveLength(0);
  });

  it('accepts initial demo data and rejects malformed or duplicate-ID backups', () => {
    const data = createDemoData();
    expect(validateAppData(data)).toBe(true);
    expect(validateAppData({ ...data, tasks: [{ ...data.tasks[0], status: 'blocked' }] })).toBe(false);
    const task = data.tasks[0];
    expect(validateAppData({ ...data, tasks: [...data.tasks, { ...task, title: 'Duplicate ID' }] })).toBe(false);
    expect(validateAppData({ ...data, activeProjectId: 'missing-project' })).toBe(false);
  });
});
