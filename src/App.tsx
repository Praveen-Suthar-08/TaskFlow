import { useEffect, useMemo, useRef, useState, type CSSProperties, type ChangeEvent, type ReactNode } from 'react';
import {
  DndContext, KeyboardSensor, PointerSensor, closestCorners, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  Activity, ArrowDownUp, ArrowDownToLine, ArrowLeft, ArrowRight, Bell, CalendarDays,
  Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, ClipboardList,
  Clock3, Download, Filter, FolderKanban, LayoutDashboard, ListTodo, Menu, Moon, MoreHorizontal,
  Plus, Search, Settings2, SlidersHorizontal, Sparkles, Sun, TrendingUp, Upload, X, Zap,
} from 'lucide-react';
import {
  addMonths, endOfMonth, endOfWeek, format, isSameMonth, isToday,
  startOfMonth, startOfWeek, subMonths, eachDayOfInterval, parseISO,
} from 'date-fns';
import type { AppData, Page, Priority, Project, Task, TaskInput, TaskStatus } from './types';
import { createDemoData } from './data/demo';
import { downloadJson, loadAppData, parseImport, saveAppData } from './services/storage';
import {
  filterAndSortTasks, getAnalytics, getLabels, getProjectById, isOverdue,
  localDateString, normalizeProjectName, PRIORITY_META, STATUS_META,
} from './utils/taskUtils';
import TaskFormModal from './components/TaskFormModal';
import ProjectModal from './components/ProjectModal';
import BoardColumn from './components/BoardColumn';
import './styles.css';

interface ToastMessage { id: number; message: string; kind: 'success' | 'error' | 'info' }
interface Confirmation { title: string; message: string; confirmLabel?: string; danger?: boolean; action: () => void }
const PAGE_META: Record<Page, { title: string; subtitle: string }> = {
  dashboard: { title: 'Good things happen when you focus.', subtitle: 'Here’s what your work looks like today.' },
  tasks: { title: 'My tasks', subtitle: 'All your next steps, in one place.' },
  board: { title: 'Kanban board', subtitle: 'Move work forward, one card at a time.' },
  calendar: { title: 'Calendar', subtitle: 'See what’s coming up and when.' },
  settings: { title: 'Settings', subtitle: 'Make TaskFlow work the way you do.' },
};
const NAV_ITEMS: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'tasks', label: 'My tasks', icon: ListTodo },
  { id: 'board', label: 'Board', icon: FolderKanban },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];
const STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done'];

function makeId(prefix: string): string {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`}`;
}

function shortDate(value: string | null): string {
  if (!value) return 'No date';
  return format(parseISO(value), 'MMM d');
}

function initials(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'Y';
}

export default function App() {
  const [initialLoad] = useState(() => loadAppData());
  const [data, setData] = useState<AppData>(initialLoad.data);
  const [page, setPage] = useState<Page>('dashboard');
  const [query, setQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [taskModal, setTaskModal] = useState<Task | null | undefined>(undefined);
  const [taskDefaultStatus, setTaskDefaultStatus] = useState<TaskStatus>('todo');
  const [projectModal, setProjectModal] = useState<Project | null | undefined>(undefined);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [storageWarning, setStorageWarning] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [labelFilter, setLabelFilter] = useState('all');
  const [overdueFilter, setOverdueFilter] = useState(false);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt' | 'order'>('dueDate');
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const persistedDataRef = useRef(data);
  const toastCounter = useRef(0);

  const activeProject = getProjectById(data.projects, data.activeProjectId) ?? data.projects[0];
  const projectTasks = useMemo(() => data.tasks.filter((task) => task.projectId === activeProject?.id), [data.tasks, activeProject?.id]);
  const analytics = useMemo(() => getAnalytics(projectTasks), [projectTasks]);
  const visibleTasks = useMemo(() => filterAndSortTasks(projectTasks, {
    query, status: taskStatusFilter, priority: priorityFilter, label: labelFilter, overdueOnly: overdueFilter, sort: sortBy,
  }), [projectTasks, query, taskStatusFilter, priorityFilter, labelFilter, overdueFilter, sortBy]);
  const boardTasks = useMemo(() => filterAndSortTasks(projectTasks, { query, sort: 'order' }), [projectTasks, query]);
  const labels = useMemo(() => getLabels(projectTasks), [projectTasks]);
  const pageMeta = PAGE_META[page];
  const hasActiveFilters = taskStatusFilter !== 'all' || priorityFilter !== 'all' || labelFilter !== 'all' || overdueFilter;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    document.documentElement.dataset.theme = data.theme;
    if (persistedDataRef.current === data) return;
    try {
      saveAppData(data);
      persistedDataRef.current = data;
      setStorageWarning('');
    } catch {
      persistedDataRef.current = data;
      setStorageWarning('Browser storage is unavailable or full. Your latest changes may not survive a refresh. Export a backup from Settings.');
    }
  }, [data]);

  useEffect(() => {
    if (initialLoad.warning) setStorageWarning(initialLoad.warning);
  }, [initialLoad.warning]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        document.getElementById('global-search')?.focus();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        openNewTask();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // openNewTask is stable enough for the keyboard shortcut and deliberately references live state setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function notify(message: string, kind: ToastMessage['kind'] = 'success') {
    const id = ++toastCounter.current;
    setToast({ id, message, kind });
    window.setTimeout(() => setToast((current) => current?.id === id ? null : current), 3600);
  }

  function openNewTask(status: TaskStatus = 'todo') {
    setTaskDefaultStatus(status);
    setTaskModal(null);
  }

  function saveTask(input: TaskInput) {
    const now = new Date().toISOString();
    setData((previous) => {
      if (input.id) {
        const existing = previous.tasks.find((task) => task.id === input.id);
        if (!existing) return previous;
        const changedScope = existing.projectId !== input.projectId || existing.status !== input.status;
        const destinationSiblings = previous.tasks.filter((task) => task.id !== existing.id && task.projectId === input.projectId && task.status === input.status);
        const nextOrder = changedScope ? (destinationSiblings.length ? Math.max(...destinationSiblings.map((task) => task.order)) + 1 : 0) : input.order ?? existing.order;
        const updated: Task = { ...existing, ...input, id: existing.id, createdAt: existing.createdAt, updatedAt: now, order: nextOrder };
        return { ...previous, tasks: previous.tasks.map((task) => task.id === updated.id ? updated : task) };
      }
      const siblings = previous.tasks.filter((task) => task.projectId === input.projectId && task.status === input.status);
      const created: Task = {
        ...input,
        id: makeId('task'),
        createdAt: now,
        updatedAt: now,
        order: siblings.length ? Math.max(...siblings.map((task) => task.order)) + 1 : 0,
      };
      return { ...previous, tasks: [...previous.tasks, created] };
    });
    setTaskModal(undefined);
    notify(input.id ? 'Task updated' : 'Task created');
  }

  function requestDeleteTask(task: Task) {
    setConfirmation({
      title: 'Delete this task?',
      message: `“${task.title}” will be permanently removed from this browser.`,
      confirmLabel: 'Delete task',
      danger: true,
      action: () => {
        setData((previous) => ({ ...previous, tasks: previous.tasks.filter((item) => item.id !== task.id) }));
        notify('Task deleted', 'info');
      },
    });
  }

  function saveProject(name: string, description: string) {
    if (projectModal && projectModal !== null) {
      const existingId = projectModal.id;
      setData((previous) => ({ ...previous, projects: previous.projects.map((project) => project.id === existingId ? { ...project, name, description } : project) }));
      notify('Project updated');
    } else {
      const project: Project = { id: makeId('project'), name: normalizeProjectName(name), description, createdAt: new Date().toISOString() };
      setData((previous) => ({ ...previous, projects: [...previous.projects, project], activeProjectId: project.id }));
      notify('Project created');
    }
    setProjectModal(undefined);
  }

  function requestDeleteProject(project: Project) {
    if (data.projects.length <= 1) { notify('Keep at least one project in your workspace.', 'error'); return; }
    setConfirmation({
      title: `Delete “${project.name}”?`,
      message: 'This also removes every task in this project. This action cannot be undone.',
      confirmLabel: 'Delete project',
      danger: true,
      action: () => {
        setData((previous) => {
          const projects = previous.projects.filter((item) => item.id !== project.id);
          const nextActive = previous.activeProjectId === project.id ? projects[0]?.id ?? null : previous.activeProjectId;
          return { ...previous, projects, activeProjectId: nextActive, tasks: previous.tasks.filter((task) => task.projectId !== project.id) };
        });
        notify('Project deleted', 'info');
      },
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !activeProject) return;
    const activeTask = projectTasks.find((task) => task.id === String(active.id));
    if (!activeTask) return;
    const overTask = projectTasks.find((task) => task.id === String(over.id));
    const overStatus = overTask?.status ?? (String(over.id).startsWith('column:') ? String(over.id).slice('column:'.length) as TaskStatus : activeTask.status);
    if (!STATUSES.includes(overStatus)) return;

    setData((previous) => {
      let tasks = [...previous.tasks];
      const moved = tasks.find((task) => task.id === activeTask.id);
      if (!moved) return previous;
      if (moved.status !== overStatus) {
        tasks = tasks.map((task) => task.id === moved.id ? { ...task, status: overStatus, order: Math.max(-1, ...tasks.filter((item) => item.projectId === moved.projectId && item.status === overStatus).map((item) => item.order)) + 1, updatedAt: new Date().toISOString() } : task);
        return { ...previous, tasks };
      }
      if (!overTask || overTask.status !== moved.status) return previous;
      const peers = tasks.filter((task) => task.projectId === moved.projectId && task.status === moved.status).sort((a, b) => a.order - b.order);
      const oldIndex = peers.findIndex((task) => task.id === moved.id);
      const newIndex = peers.findIndex((task) => task.id === overTask.id);
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return previous;
      const reordered = arrayMove(peers, oldIndex, newIndex);
      const orderById = new Map(reordered.map((task, index) => [task.id, index]));
      tasks = tasks.map((task) => orderById.has(task.id) ? { ...task, order: orderById.get(task.id) ?? task.order, updatedAt: task.id === moved.id ? new Date().toISOString() : task.updatedAt } : task);
      return { ...previous, tasks };
    });
  }

  function resetFilters() {
    setTaskStatusFilter('all'); setPriorityFilter('all'); setLabelFilter('all'); setOverdueFilter(false); setSortBy('dueDate'); setQuery('');
  }

  async function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imported = parseImport(await file.text());
      setData(imported);
      resetFilters();
      notify('Backup imported successfully');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not import that backup.', 'error');
    } finally {
      event.target.value = '';
    }
  }

  function askResetDemo() {
    setConfirmation({
      title: 'Reset to demo data?',
      message: 'This replaces the tasks and projects saved in this browser with the original TaskFlow sample workspace.',
      confirmLabel: 'Reset workspace', danger: true,
      action: () => { setData(createDemoData()); resetFilters(); setPage('dashboard'); notify('Demo workspace restored', 'info'); },
    });
  }

  const dueSoon = projectTasks.filter((task) => task.status !== 'done' && task.dueDate && task.dueDate >= localDateString(new Date())).sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? '')).slice(0, 4);
  const recentTasks = [...projectTasks].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  const monthStart = startOfMonth(calendarMonth);
  const calendarDays = eachDayOfInterval({ start: startOfWeek(monthStart, { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(calendarMonth), { weekStartsOn: 1 }) });

  return <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} data-theme={data.theme}>
    {sidebarOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
    <aside className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
      <div className="brand-row">
        <div className="brand-mark"><Check size={20} strokeWidth={3} /></div>
        {!sidebarCollapsed && <div className="brand-copy"><strong>taskflow<span>.</span></strong><small>WORK, IN FLOW</small></div>}
        <button className="sidebar-collapse icon-button" title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setSidebarCollapsed((value) => !value)} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}><ArrowLeft size={16} /></button>
      </div>

      {!sidebarCollapsed && <button className="workspace-switcher" onClick={() => setShowProjectMenu((value) => !value)} aria-expanded={showProjectMenu}>
        <span className="workspace-symbol">{activeProject?.name.slice(0, 1).toUpperCase() ?? 'T'}</span>
        <span className="workspace-copy"><strong>{activeProject?.name ?? 'My workspace'}</strong><small>Personal workspace</small></span><ChevronDown size={15} />
      </button>}
      {showProjectMenu && <div className="project-popover">
        <span className="menu-label">SWITCH PROJECT</span>
        {data.projects.map((project) => <button type="button" className={`project-menu-item ${project.id === activeProject?.id ? 'selected' : ''}`} key={project.id} onClick={() => { setData((previous) => ({ ...previous, activeProjectId: project.id })); setShowProjectMenu(false); }}><span className="project-menu-avatar">{project.name.slice(0, 1).toUpperCase()}</span><span>{project.name}</span>{project.id === activeProject?.id && <Check size={14} />}</button>)}
        <button type="button" className="project-menu-create" onClick={() => { setProjectModal(null); setShowProjectMenu(false); }}><Plus size={15} /> Create a project</button>
      </div>}

      <div className="sidebar-section-label">WORKSPACE</div>
      <nav className="main-nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => { const Icon = item.icon; return <button type="button" key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => { setPage(item.id); setSidebarOpen(false); }} title={sidebarCollapsed ? item.label : undefined}><Icon size={18} /><span>{item.label}</span>{item.id === 'tasks' && !sidebarCollapsed && <span className="nav-count">{projectTasks.length}</span>}</button>; })}
      </nav>

      {!sidebarCollapsed && <>
        <div className="sidebar-section-row"><span className="sidebar-section-label">YOUR PROJECTS</span><button type="button" className="tiny-icon-button" aria-label="Create a project" onClick={() => setProjectModal(null)}><Plus size={15} /></button></div>
        <div className="sidebar-projects">{data.projects.slice(0, 5).map((project, index) => <button type="button" key={project.id} className={`sidebar-project ${project.id === activeProject?.id ? 'current' : ''}`} onClick={() => setData((previous) => ({ ...previous, activeProjectId: project.id }))}><span className={`project-color color-${index % 4}`} /><span>{project.name}</span><span className="sidebar-project-count">{data.tasks.filter((task) => task.projectId === project.id).length}</span></button>)}</div>
        <div className="sidebar-bottom">
          <div className="upgrade-card"><div className="upgrade-spark"><Sparkles size={15} /></div><strong>A calmer way to work</strong><p>Small steps add up. Keep your focus on what matters.</p><button type="button" onClick={() => setPage('settings')}>Explore settings <ArrowRight size={13} /></button></div>
          <button type="button" className="profile-row" onClick={() => setPage('settings')}><span className="profile-avatar">PS</span><span className="profile-info"><strong>Praveen Suthar</strong><small>Personal account</small></span><MoreHorizontal size={17} /></button>
        </div>
      </>}
    </aside>

    <main className="main-area">
      <header className="topbar">
        <button type="button" className="icon-button mobile-menu-button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
        <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{page === 'dashboard' ? 'Overview' : pageMeta.title}</strong></div>
        <div className="topbar-actions">
          <div className={`global-search ${showMobileSearch ? 'search-visible' : ''}`}><Search size={16} /><input id="global-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks…" aria-label="Search tasks" /><kbd>⌘ K</kbd><button className="mobile-search-close" type="button" aria-label="Close search" onClick={() => setShowMobileSearch(false)}><X size={15} /></button></div>
          <button type="button" className="icon-button mobile-search-button" aria-label="Search" onClick={() => setShowMobileSearch(true)}><Search size={18} /></button>
          <span className="topbar-divider" />
          <button type="button" className="icon-button theme-button" onClick={() => setData((previous) => ({ ...previous, theme: previous.theme === 'light' ? 'dark' : 'light' }))} aria-label={data.theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'} title="Toggle theme">{data.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
          <button type="button" className="icon-button notifications-button" aria-label="Notifications" onClick={() => notify('You’re all caught up. No new notifications.', 'info')}><Bell size={18} /><span /></button>
          <button type="button" className="button primary top-add-button" onClick={() => openNewTask()}><Plus size={17} /> <span>New task</span></button>
        </div>
      </header>

      <div className="page-content">
        {storageWarning && <div className="storage-warning" role="status"><CircleHelp size={16} /><span>{storageWarning}</span><button type="button" aria-label="Dismiss storage warning" onClick={() => setStorageWarning('')}><X size={15} /></button></div>}
        <div className="page-heading">
          <div><div className="eyebrow date-eyebrow">{format(new Date(), 'EEEE, MMMM d')}</div><h1>{pageMeta.title}</h1><p>{pageMeta.subtitle}</p></div>
          {page !== 'settings' && <button type="button" className="button primary heading-add" onClick={() => openNewTask()}><Plus size={17} /> Add task</button>}
        </div>

        {page === 'dashboard' && <>
          <section className="welcome-banner">
            <div className="welcome-copy"><span className="welcome-label"><Sparkles size={13} /> YOUR DAILY SNAPSHOT</span><h2>{analytics.overdue > 0 ? `You’ve got ${analytics.overdue} overdue ${analytics.overdue === 1 ? 'task' : 'tasks'}.` : analytics.active > 0 ? 'You’re building good momentum.' : 'A clean slate. Nice work.'}</h2><p>{analytics.overdue > 0 ? 'Take a breath, pick one, and make a little progress.' : 'Stay intentional, do one thing at a time, and let the progress add up.'}</p><button type="button" className="banner-button" onClick={() => setPage('board')}>Go to my board <ArrowRight size={14} /></button></div>
            <div className="welcome-art" aria-hidden="true"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-sun"><Check size={34} /></div><div className="art-spark spark-one">✳</div><div className="art-spark spark-two">✦</div><div className="art-pill pill-one">MAKE IT COUNT</div><div className="art-pill pill-two"><CheckCircle2 size={13} /> One step at a time</div></div>
          </section>

          <section className="stats-grid" aria-label="Task analytics">
            <StatCard label="Total tasks" value={analytics.total} icon={<ClipboardList size={18} />} tone="lavender" note="In this project" />
            <StatCard label="In progress" value={projectTasks.filter((task) => task.status === 'in-progress').length} icon={<Activity size={18} />} tone="blue" note="Work underway" />
            <StatCard label="Completed" value={analytics.completed} icon={<CheckCircle2 size={18} />} tone="green" note="Nicely done" trend={analytics.completion} />
            <StatCard label="Overdue" value={analytics.overdue} icon={<Clock3 size={18} />} tone="peach" note={analytics.overdue ? 'Needs a look' : 'You’re on track'} />
          </section>

          <div className="dashboard-grid">
            <section className="panel progress-panel">
              <div className="panel-heading"><div><h2>Project progress</h2><p>A little progress is still progress.</p></div><button className="text-button" type="button" onClick={() => setPage('tasks')}>View tasks <ArrowRight size={14} /></button></div>
              <div className="progress-main"><div className="progress-ring" style={{ '--progress': `${analytics.completion}%` } as CSSProperties}><div><strong>{analytics.completion}%</strong><span>complete</span></div></div><div className="progress-breakdown"><div className="breakdown-line"><span><i className="legend-dot done-dot" />Completed</span><strong>{analytics.completed}</strong></div><div className="breakdown-line"><span><i className="legend-dot active-dot" />In progress</span><strong>{projectTasks.filter((task) => task.status === 'in-progress').length}</strong></div><div className="breakdown-line"><span><i className="legend-dot todo-dot" />To do</span><strong>{projectTasks.filter((task) => task.status === 'todo').length}</strong></div></div></div>
              <div className="progress-bar"><span style={{ width: `${analytics.completion}%` }} /></div><div className="progress-foot"><span>{analytics.completed} of {analytics.total} tasks completed</span><span>{Math.max(0, analytics.total - analytics.completed)} remaining</span></div>
            </section>
            <section className="panel upcoming-panel">
              <div className="panel-heading"><div><h2>Upcoming deadlines</h2><p>Keep the important things in sight.</p></div><button className="icon-button subtle" type="button" aria-label="Open calendar" onClick={() => setPage('calendar')}><ArrowRight size={17} /></button></div>
              {dueSoon.length ? <div className="deadline-list">{dueSoon.map((task) => <button type="button" className="deadline-item" key={task.id} onClick={() => setTaskModal(task)}><span className={`deadline-calendar ${task.dueDate === localDateString(new Date()) ? 'today' : ''}`}><small>{task.dueDate ? format(parseISO(task.dueDate), 'MMM').toUpperCase() : ''}</small><strong>{task.dueDate ? format(parseISO(task.dueDate), 'd') : '—'}</strong></span><span className="deadline-detail"><strong>{task.title}</strong><small>{task.dueDate === localDateString(new Date()) ? 'Due today' : task.dueDate ? `Due ${format(parseISO(task.dueDate), 'EEEE')}` : 'No due date'}</small></span><span className={`priority-pill ${task.priority}`}>{task.priority}</span></button>)}</div> : <EmptyState icon={<CalendarDays size={20} />} title="No deadlines coming up" description="Add a due date to a task and it will show up here." actionLabel="Create task" onAction={() => openNewTask()} />}
            </section>
          </div>

          <section className="panel recent-panel">
            <div className="panel-heading"><div><h2>Recently updated</h2><p>Your latest changes, all together.</p></div><button className="text-button" type="button" onClick={() => setPage('tasks')}>See all <ArrowRight size={14} /></button></div>
            {recentTasks.length ? <div className="recent-table"><div className="recent-table-head"><span>Task</span><span>Status</span><span>Priority</span><span>Due date</span><span /></div>{recentTasks.map((task) => <TaskTableRow key={task.id} task={task} onEdit={() => setTaskModal(task)} onDelete={() => requestDeleteTask(task)} />)}</div> : <EmptyState icon={<ListTodo size={20} />} title="Your workspace is ready" description="Create a task to start making progress." actionLabel="Create your first task" onAction={() => openNewTask()} />}
          </section>
        </>}

        {page === 'tasks' && <section className="panel task-list-panel">
          <div className="list-toolbar"><div className="list-result-count"><strong>{visibleTasks.length}</strong> {visibleTasks.length === 1 ? 'task' : 'tasks'}<span> in {activeProject?.name}</span></div><div className="list-toolbar-actions"><label className="select-with-icon"><Filter size={15} /><select aria-label="Filter by status" value={taskStatusFilter} onChange={(event) => setTaskStatusFilter(event.target.value as TaskStatus | 'all')}><option value="all">All statuses</option><option value="todo">To do</option><option value="in-progress">In progress</option><option value="done">Done</option></select></label><label className="select-with-icon"><SlidersHorizontal size={15} /><select aria-label="Sort tasks" value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}><option value="dueDate">Due date</option><option value="priority">Priority</option><option value="createdAt">Recently created</option><option value="order">Manual order</option></select></label></div></div>
          <div className="filter-row"><label className="filter-select">Priority<select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as Priority | 'all')}><option value="all">Any priority</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label><label className="filter-select">Label<select value={labelFilter} onChange={(event) => setLabelFilter(event.target.value)}><option value="all">Any label</option>{labels.map((label) => <option key={label} value={label}>{label}</option>)}</select></label><button className={`filter-chip ${overdueFilter ? 'filter-chip-active' : ''}`} type="button" onClick={() => setOverdueFilter((value) => !value)}><Clock3 size={14} /> Overdue only</button>{hasActiveFilters && <button type="button" className="clear-filter-button" onClick={resetFilters}>Clear filters <X size={13} /></button>}</div>
          {visibleTasks.length ? <div className="task-table"><div className="task-table-head"><span>Task name</span><span>Status</span><span>Priority</span><span>Due date</span><span>Assignee</span><span /></div>{visibleTasks.map((task) => <TaskTableRow key={task.id} task={task} onEdit={() => setTaskModal(task)} onDelete={() => requestDeleteTask(task)} showDescription />)}</div> : <EmptyState icon={<Search size={20} />} title={projectTasks.length ? 'No tasks match your filters' : 'A fresh start'} description={projectTasks.length ? 'Try changing your search or clearing one of the filters.' : 'Add the first task to this project and build momentum.'} actionLabel={projectTasks.length ? 'Clear filters' : 'Create task'} onAction={projectTasks.length ? resetFilters : () => openNewTask()} />}
        </section>}

        {page === 'board' && <section className="board-section">
          <div className="board-toolbar"><div className="board-legend"><span><i className="legend-dot todo-dot" />To do <b>{boardTasks.filter((task) => task.status === 'todo').length}</b></span><span><i className="legend-dot active-dot" />In progress <b>{boardTasks.filter((task) => task.status === 'in-progress').length}</b></span><span><i className="legend-dot done-dot" />Done <b>{boardTasks.filter((task) => task.status === 'done').length}</b></span></div><div className="board-hint"><GripIcon /> Drag cards to update status</div></div>
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <div className="kanban-grid">{STATUSES.map((status) => <BoardColumn key={status} status={status} tasks={boardTasks.filter((task) => task.status === status)} onAdd={(nextStatus) => openNewTask(nextStatus)} onEdit={(task) => setTaskModal(task)} onDelete={requestDeleteTask} />)}</div>
          </DndContext>
          {!boardTasks.length && <div className="board-empty-note">No tasks match this search. Clear the search to see every card.</div>}
        </section>}

        {page === 'calendar' && <section className="panel calendar-panel">
          <div className="calendar-toolbar"><div><h2>{format(calendarMonth, 'MMMM yyyy')}</h2><p>Tasks are shown on their due dates.</p></div><div className="calendar-actions"><button type="button" className="button secondary today-button" onClick={() => setCalendarMonth(startOfMonth(new Date()))}>Today</button><button type="button" className="icon-button bordered" aria-label="Previous month" onClick={() => setCalendarMonth((month) => subMonths(month, 1))}><ChevronLeft size={17} /></button><button type="button" className="icon-button bordered" aria-label="Next month" onClick={() => setCalendarMonth((month) => addMonths(month, 1))}><ChevronRight size={17} /></button></div></div>
          <div className="calendar-grid"><div className="weekday-row">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <div key={day}>{day}</div>)}</div><div className="calendar-days">{calendarDays.map((day) => { const dayTasks = projectTasks.filter((task) => task.dueDate === localDateString(day)).sort((a, b) => a.order - b.order); return <div className={`calendar-day ${!isSameMonth(day, calendarMonth) ? 'outside-month' : ''} ${isToday(day) ? 'is-today' : ''}`} key={localDateString(day)}><span className="calendar-day-number">{format(day, 'd')}</span><div className="calendar-day-tasks">{dayTasks.slice(0, 3).map((task) => <button key={task.id} type="button" className={`calendar-task calendar-${task.status}`} onClick={() => setTaskModal(task)} title={task.title}>{task.title}</button>)}{dayTasks.length > 3 && <span className="more-calendar-tasks">+{dayTasks.length - 3} more</span>}</div></div>; })}</div></div>
          <div className="calendar-legend"><span><i className="calendar-legend-dot todo" />To do</span><span><i className="calendar-legend-dot progress" />In progress</span><span><i className="calendar-legend-dot done" />Done</span><span className="calendar-legend-note">Select a task to edit it</span></div>
        </section>}

        {page === 'settings' && <div className="settings-layout">
          <div className="settings-main">
            <section className="panel settings-panel"><div className="settings-title"><div className="settings-icon appearance"><Sun size={18} /></div><div><h2>Appearance</h2><p>Make your workspace feel right.</p></div></div><div className="settings-row"><div><strong>Color theme</strong><span>Choose a look that works for you.</span></div><div className="theme-choices"><button type="button" className={data.theme === 'light' ? 'theme-choice chosen' : 'theme-choice'} onClick={() => setData((previous) => ({ ...previous, theme: 'light' }))}><Sun size={16} />Light</button><button type="button" className={data.theme === 'dark' ? 'theme-choice chosen' : 'theme-choice'} onClick={() => setData((previous) => ({ ...previous, theme: 'dark' }))}><Moon size={16} />Dark</button></div></div></section>
            <section className="panel settings-panel"><div className="settings-title"><div className="settings-icon projects"><FolderKanban size={18} /></div><div><h2>Projects</h2><p>Organize your work into focused spaces.</p></div><button type="button" className="button secondary small-button" onClick={() => setProjectModal(null)}><Plus size={15} /> New project</button></div>
              <div className="project-settings-list">{data.projects.map((project) => <div className={`project-setting-item ${project.id === activeProject?.id ? 'project-setting-active' : ''}`} key={project.id}><div className="project-setting-icon">{project.name.slice(0, 1).toUpperCase()}</div><div className="project-setting-info"><strong>{project.name}{project.id === activeProject?.id && <span className="current-project-tag">CURRENT</span>}</strong><p>{project.description || 'No description yet.'}</p><small>{data.tasks.filter((task) => task.projectId === project.id).length} tasks</small></div><div className="project-setting-actions"><button type="button" className="button secondary small-button" onClick={() => setData((previous) => ({ ...previous, activeProjectId: project.id }))}>{project.id === activeProject?.id ? 'Selected' : 'Switch to'}</button><button type="button" className="tiny-icon-button" aria-label={`Edit ${project.name}`} onClick={() => setProjectModal(project)}><MoreHorizontal size={17} /></button><button type="button" className="tiny-icon-button danger-hover" aria-label={`Delete ${project.name}`} onClick={() => requestDeleteProject(project)}><X size={15} /></button></div></div>)}</div>
            </section>
            <section className="panel settings-panel"><div className="settings-title"><div className="settings-icon data"><ArrowDownUp size={18} /></div><div><h2>Your data</h2><p>Take your work with you, whenever you need.</p></div></div><div className="data-action-row"><div className="data-action-symbol"><Download size={18} /></div><div className="data-action-copy"><strong>Export a backup</strong><p>Download all tasks and projects as a JSON file.</p></div><button type="button" className="button secondary" onClick={() => { try { downloadJson(data); notify('Your backup is ready to save'); } catch { notify('Could not export data in this browser.', 'error'); } }}><Download size={15} /> Export JSON</button></div><div className="data-action-row"><div className="data-action-symbol"><Upload size={18} /></div><div className="data-action-copy"><strong>Import a backup</strong><p>Restore from a TaskFlow JSON export. Invalid files won’t replace your data.</p></div><input ref={importInputRef} type="file" accept=".json,application/json" className="visually-hidden" onChange={importData} /><button type="button" className="button secondary" onClick={() => importInputRef.current?.click()}><Upload size={15} /> Import JSON</button></div></section>
            <section className="panel settings-panel danger-zone"><div className="settings-title"><div className="settings-icon danger"><ArrowDownToLine size={18} /></div><div><h2>Reset workspace</h2><p>Replace saved data with the original sample workspace.</p></div></div><div className="data-action-row"><div className="data-action-copy"><strong>Reset demo data</strong><p>This removes your current local tasks and projects.</p></div><button type="button" className="button danger-button" onClick={askResetDemo}>Reset data</button></div></section>
          </div>
          <aside className="settings-aside"><div className="settings-tip-card"><div className="tip-icon"><Zap size={18} /></div><span className="eyebrow">A QUICK NOTE</span><h3>Your data stays yours.</h3><p>TaskFlow stores your tasks in this browser. There’s no account, no cloud sync, and no server receiving your project data.</p><div className="tip-foot"><CheckCircle2 size={15} /> Private by design</div></div><div className="about-card"><div className="brand-mark small"><Check size={15} strokeWidth={3} /></div><strong>TaskFlow <span>v1.0.0</span></strong><p>Made for meaningful progress.</p><div className="about-rule" /><span>Keyboard shortcuts</span><div className="shortcut-row"><span>Search tasks</span><kbd>Ctrl K</kbd></div><div className="shortcut-row"><span>New task</span><kbd>Ctrl N</kbd></div></div></aside>
        </div>}

        <footer className="app-footer"><span><span className="footer-status-dot" /> All changes are saved locally</span><span>Made for meaningful progress <span className="footer-heart">✳</span></span></footer>
      </div>
    </main>

    {taskModal !== undefined && <TaskFormModal task={taskModal} projects={data.projects} activeProjectId={activeProject?.id ?? data.projects[0]?.id ?? ''} onClose={() => setTaskModal(undefined)} onSave={saveTask} defaultStatus={taskDefaultStatus} />}
    {projectModal !== undefined && <ProjectModal project={projectModal} onClose={() => setProjectModal(undefined)} onSave={saveProject} />}
    {confirmation && <div className="modal-backdrop" role="presentation"><section className="modal confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message"><div className={`confirm-symbol ${confirmation.danger ? 'danger-symbol' : ''}`}>{confirmation.danger ? <Trash2Icon /> : <CircleHelp size={22} />}</div><h2 id="confirm-title">{confirmation.title}</h2><p id="confirm-message">{confirmation.message}</p><div className="modal-actions"><button className="button secondary" type="button" onClick={() => setConfirmation(null)}>Cancel</button><button className={`button ${confirmation.danger ? 'danger-button' : 'primary'}`} type="button" onClick={() => { confirmation.action(); setConfirmation(null); }}>{confirmation.confirmLabel ?? 'Confirm'}</button></div></section></div>}
    {toast && <div className={`toast toast-${toast.kind}`} role="status"><span className="toast-icon">{toast.kind === 'error' ? <CircleHelp size={17} /> : <CheckCircle2 size={17} />}</span><span>{toast.message}</span><button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)}><X size={15} /></button></div>}
  </div>;
}

function StatCard({ label, value, icon, tone, note, trend }: { label: string; value: number; icon: React.ReactNode; tone: string; note: string; trend?: number }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><span className="stat-label">{label}</span><div className="stat-bottom"><strong>{value}</strong>{trend !== undefined && <span className="stat-trend"><TrendingUp size={13} />{trend}%</span>}</div><span className="stat-note">{note}</span></article>;
}

function TaskTableRow({ task, onEdit, onDelete, showDescription = false }: { task: Task; onEdit: () => void; onDelete: () => void; showDescription?: boolean }) {
  return <div className="task-table-row">
    <div className="table-task-main"><span className={`table-task-check ${task.status === 'done' ? 'checked' : ''}`}>{task.status === 'done' && <Check size={12} />}</span><button type="button" className={`table-task-title ${task.status === 'done' ? 'completed-title' : ''}`} onClick={onEdit}>{task.title}</button>{showDescription && task.description && <small>{task.description}</small>}</div>
    <div><span className={`status-pill ${STATUS_META[task.status].className}`}><i />{STATUS_META[task.status].label}</span></div>
    <div><span className={`priority-text ${PRIORITY_META[task.priority].className}`}><i />{PRIORITY_META[task.priority].label}</span></div>
    <div className={`table-due ${isOverdue(task) ? 'overdue' : ''}`}>{task.dueDate ? <><CalendarDays size={13} />{shortDate(task.dueDate)}</> : <span>—</span>}</div>
    <div className="table-assignee"><span className="avatar-tiny">{initials(task.assignee)}</span><span>{task.assignee || 'Unassigned'}</span></div>
    <div className="table-actions"><button type="button" className="tiny-icon-button" aria-label={`Edit ${task.title}`} onClick={onEdit}><MoreHorizontal size={16} /></button><button type="button" className="tiny-icon-button danger-hover" aria-label={`Delete ${task.title}`} onClick={onDelete}><X size={14} /></button></div>
  </div>;
}

function EmptyState({ icon, title, description, actionLabel, onAction }: { icon: ReactNode; title: string; description: string; actionLabel: string; onAction: () => void }) {
  return <div className="empty-state"><div className="empty-state-icon">{icon}</div><h3>{title}</h3><p>{description}</p><button type="button" className="button secondary" onClick={onAction}>{actionLabel}</button></div>;
}

function GripIcon() { return <span className="grip-icon"><span /><span /><span /><span /><span /><span /></span>; }
function Trash2Icon() { return <span className="trash-symbol"><X size={20} /></span>; }
