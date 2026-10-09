# TaskFlow — Work, in flow.

> A responsive, browser-based project and task manager built with React and TypeScript.

**Made by Praveen Suthar**

- **GitHub repository:** <https://github.com/Praveen-Suthar-08/TaskFlow>
- **Clone URL:** <https://github.com/Praveen-Suthar-08/TaskFlow.git>
- **Author profile:** <https://github.com/Praveen-Suthar-08>
- **Deployment:** Configure GitHub Pages using the workflow in `.github/workflows/deploy.yml`.

TaskFlow gives an individual a clear workspace for planning projects, organizing tasks, tracking deadlines, and reviewing progress. The application is designed to run as a static website and stores workspace data in the browser.

---

## Table of contents

1. [Project overview](#project-overview)
2. [Goals](#goals)
3. [Features](#features)
4. [Technology stack](#technology-stack)
5. [Application pages](#application-pages)
6. [Project structure](#project-structure)
7. [Requirements](#requirements)
8. [Installation](#installation)
9. [Run in development](#run-in-development)
10. [Build for production](#build-for-production)
11. [Available commands](#available-commands)
12. [How to use TaskFlow](#how-to-use-taskflow)
13. [Task workflow](#task-workflow)
14. [Project management](#project-management)
15. [Search filtering and sorting](#search-filtering-and-sorting)
16. [Keyboard shortcuts](#keyboard-shortcuts)
17. [Dashboard analytics](#dashboard-analytics)
18. [Calendar behavior](#calendar-behavior)
19. [Browser storage and backups](#browser-storage-and-backups)
20. [Data model](#data-model)
21. [Validation rules](#validation-rules)
22. [Architecture notes](#architecture-notes)
23. [Testing](#testing)
24. [GitHub Pages deployment](#github-pages-deployment)
25. [Git commands](#git-commands)
26. [Accessibility and responsive design](#accessibility-and-responsive-design)
27. [Privacy and security](#privacy-and-security)
28. [Troubleshooting](#troubleshooting)
29. [Known limitations](#known-limitations)
30. [Future improvements](#future-improvements)
31. [Contributing](#contributing)
32. [License](#license)
33. [Author](#author)

---

## Project overview

TaskFlow is a lightweight project management application for personal workspaces.
It brings task planning, task status, priority, due dates, labels, and project-level organization into one interface.
The interface includes a dashboard, a task list, a Kanban board, a monthly calendar, and a settings area.
Task data is stored in the browser's `localStorage`.
The project does not require a separately deployed backend server.
The application can therefore be published using static hosting such as GitHub Pages.
TaskFlow is intended for students, developers, job seekers, and people managing personal projects.
Examples include course assignments, bugs, portfolio work, interview preparation, and small project plans.

## Goals

- Keep project tasks in one organized workspace.
- Make task status easy to understand at a glance.
- Provide a visual way to move tasks through a workflow.
- Make deadlines visible through dashboard summaries and a calendar.
- Reduce the effort required to search and filter a task list.
- Preserve task data when the same browser is reopened.
- Give users a manual JSON backup and restore option.
- Keep the application usable without paid APIs or backend credentials.
- Provide a responsive layout for desktop, tablet, and mobile screens.
- Make the codebase understandable and straightforward to extend.

## Features

### Dashboard

- Shows metrics for the currently selected project.
- Displays total, active, completed, and overdue task counts.
- Shows a completion percentage derived from current task data.
- Shows tasks with upcoming due dates.
- Shows recently updated tasks.
- Provides quick ways to start creating work.

### Task management

- Create a task with a required title.
- Add an optional task description.
- Set a task's status.
- Choose low, medium, or high priority.
- Add an optional due date.
- Add labels to categorize work.
- Add an optional assignee name.
- Edit a task after it has been created.
- Delete a task after a confirmation step.
- Track creation and update timestamps.

### Kanban board

- Includes To do, In progress, and Done columns.
- Displays task cards grouped by status.
- Supports drag-and-drop movement between columns.
- Supports reordering cards within a column.
- Includes keyboard-accessible drag-and-drop support from dnd-kit.
- Provides an action for adding a task to a selected column.
- Displays empty-column guidance when no tasks are present.

### My Tasks

- Lists the tasks in the active project.
- Searches task titles, descriptions, and labels.
- Filters tasks by status.
- Filters tasks by priority.
- Filters tasks by label.
- Filters tasks to show overdue work.
- Combines active filters together.
- Supports sorting by due date, priority, creation date, or manual order.
- Includes a way to clear filters.

### Calendar

- Displays a monthly calendar grid.
- Aligns the calendar with Monday as the first day of the week.
- Provides previous-month and next-month controls.
- Includes a Today action to return to the current month.
- Places tasks on their due dates.
- Opens a task when its calendar entry is selected.
- Shows a compact number of task entries per day.
- Indicates when additional tasks exist on a busy day.

### Project management

- Create multiple projects.
- Give projects a name and description.
- Switch between projects.
- Keep tasks associated with their project.
- Edit existing project information.
- Delete projects with confirmation.
- Switch to another available project when the active project is deleted.

### Personalization and settings

- Switch between light and dark themes.
- Persist theme selection with the rest of the local workspace data.
- Export application data as JSON.
- Import a valid TaskFlow JSON backup.
- Reset the workspace to demo data after confirmation.
- Receive in-app feedback for important actions.

### Data safety

- Load demo data on first launch when no saved data exists.
- Validate saved data before treating it as a valid workspace.
- Recover with demo data when saved JSON is corrupt or invalid.
- Validate imported JSON before it can replace current data.
- Reject unsupported versions and malformed task or project values.
- Surface storage failures rather than silently promising persistence.
- Keep export/import local to the current browser session and file selection.

## Technology stack

| Technology | Role in TaskFlow |
| --- | --- |
| React 18 | Component-driven user interface |
| TypeScript | Types for application state, tasks, projects, and page navigation |
| Vite | Development server and production build tool |
| CSS | Layout, responsive behavior, theming, and component styling |
| Tailwind CSS | Included in the development dependencies for utility-first styling support |
| dnd-kit | Drag-and-drop interactions and sortable task cards |
| Lucide React | Interface icons |
| date-fns | Date formatting and calendar calculations |
| Browser localStorage | Local persistence for the workspace |
| Vitest | Unit test runner |
| Testing Library | React component testing utilities |
| jsdom | Browser-like DOM environment for tests |
| ESLint | Static code quality checks |
| GitHub Actions | Automated validation and GitHub Pages deployment |

## Application pages

### Overview

The Overview page is the main dashboard.
It summarizes the active project's task progress and deadlines.
Use it to quickly understand what is complete, what is active, and what needs attention.

### My Tasks

The My Tasks page presents a searchable and filterable task list.
Use it when you need to find a task by title, description, label, status, or priority.
The list can be sorted based on the supported sort options.

### Board

The Board page organizes work into three status columns.
Use it to update task status visually and to order tasks within each status.

### Calendar

The Calendar page displays tasks that have a due date.
Use the month controls to review earlier or upcoming work.
Tasks without due dates remain available in the task list and board.

### Settings

The Settings page contains project management, theme preferences, data import/export, and reset actions.
Use the export function before clearing browser data or moving to a different browser.

---

## Project structure

```text
TaskFlow/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   ├── components/
│   │   ├── BoardColumn.tsx
│   │   ├── ProjectModal.tsx
│   │   ├── TaskCard.tsx
│   │   └── TaskFormModal.tsx
│   ├── data/
│   │   └── demo.ts
│   ├── services/
│   │   ├── storage.ts
│   │   └── storage.test.ts
│   ├── styles.css
│   ├── test/
│   │   └── setup.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── taskUtils.ts
│   │   └── taskUtils.test.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── eslint.config.js
└── README.md
```

### Important files

- `src/App.tsx` composes the main application and page views.
- `src/components/BoardColumn.tsx` renders a Kanban column.
- `src/components/TaskCard.tsx` renders an individual board card.
- `src/components/TaskFormModal.tsx` contains the task form UI.
- `src/components/ProjectModal.tsx` contains the project form UI.
- `src/services/storage.ts` loads, saves, exports, and validates application data.
- `src/utils/taskUtils.ts` contains analytics, date, filter, sort, and validation utilities.
- `src/data/demo.ts` creates the initial sample workspace.
- `src/types/index.ts` defines the TypeScript data model and page types.
- `src/styles.css` defines the main visual styling and responsive layouts.
- `src/utils/taskUtils.test.ts` tests task utilities and analytics.
- `src/services/storage.test.ts` tests storage and import behavior.
- `vite.config.ts` configures Vite and Vitest.
- `.github/workflows/deploy.yml` defines the GitHub Pages workflow.

## Requirements

Install the following before running the project locally:

- Node.js 20 or newer.
- npm, which is included with Node.js installations.
- Git, if you plan to clone or push the repository.
- A modern browser such as Chrome, Firefox, Edge, or Safari.
- An editor such as Visual Studio Code or Antigravity.

Node.js 22 is the version used by the included GitHub Actions workflow.
Check your installed versions with these commands:

```bash
node --version
npm --version
git --version
```

## Installation

### Option A: Clone from GitHub

Open a terminal and move to the folder where you keep development projects.
Clone the repository using the supplied URL:

```bash
git clone https://github.com/Praveen-Suthar-08/TaskFlow.git
```

Move into the project directory:

```bash
cd TaskFlow
```

Install dependencies:

```bash
npm install
```

### Option B: Download the source ZIP

Open the repository page:

<https://github.com/Praveen-Suthar-08/TaskFlow>

Choose the repository's Code menu.
Select the option to download a ZIP archive.
Extract the archive to a folder on your computer.
Open a terminal in the extracted project directory.
Install dependencies:

```bash
npm install
```

### Open the project in an editor

Open the `TaskFlow` project folder in your editor.
Open its integrated terminal.
Make sure the terminal's current directory contains `package.json`.
Run commands from that directory unless a command explicitly says otherwise.

## Run in development

Start the Vite development server:

```bash
npm run dev
```

Vite prints a local URL in the terminal.
The default local URL is usually:
<http://localhost:5173>
Open the URL in a browser.
Keep the terminal running while developing.
Vite refreshes the page when supported source files change.
To stop the development server, focus the terminal and press `Ctrl+C`.

## Build for production

Create an optimized production build:

```bash
npm run build
```

The build output is written to the `dist/` directory.
The build script runs the TypeScript project build before creating the production assets.
Preview the production build locally with:

```bash
npm run preview
```

Use the preview URL printed by Vite to inspect the built application.
Run the production build after significant code changes and before deployment.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies listed in `package.json` |
| `npm run dev` | Start the local Vite development server |
| `npm run typecheck` | Run TypeScript checks for application and tool configuration |
| `npm run lint` | Run ESLint across the repository |
| `npm test` | Run the unit test suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run build` | Type-check and build the production application |
| `npm run preview` | Preview the built `dist` output locally |

If a command fails, read the first meaningful error in the terminal and resolve it before continuing.
Do not treat a missing script or an interrupted command as a successful check.

## How to use TaskFlow

### First launch

Open TaskFlow in the browser.
On a new browser profile, the application loads its demo workspace.
Review the initial projects and sample tasks to understand the interface.
Choose a project from the project selector to focus on that project's tasks.

### Create a task

Select the Add Task action.
Enter a meaningful task title.
Optionally add a description to provide context.
Choose the status and priority.
Add a due date when the task has a deadline.
Add labels when grouping related tasks is helpful.
Add an assignee name if you want to record who is responsible.
Save the task.
The new task should appear in the applicable task list, board column, dashboard, and calendar when it has a due date.

### Edit a task

Open a task from the task list, board, calendar, or a dashboard task entry.
Change the fields that need updating.
Save the changes.
The task's update timestamp is refreshed when the edit is saved.

### Delete a task

Choose the delete action for the relevant task.
Review the confirmation dialog.
Confirm the deletion only when you intend to remove the task.
Cancel the dialog to keep the task.

### Change task status

Open the task and select a different status, or drag the card to another Kanban column.
The status is represented by one of the supported values: `todo`, `in-progress`, or `done`.
The dashboard metrics update from the current task collection.

### Change task priority

Edit a task and select Low, Medium, or High.
Priority sorting ranks High before Medium and Low.
Priority helps highlight important work, but does not automatically change a task's status.

## Task workflow

TaskFlow provides three default statuses.

| Status value | Display label | Typical use |
| --- | --- | --- |
| `todo` | To do | Work that has not started |
| `in-progress` | In progress | Work currently being handled |
| `done` | Done | Work that has been completed |

A common workflow is:

1. Create a task in To do.
2. Add the priority and due date.
3. Move it to In progress when work begins.
4. Update its description or labels if requirements change.
5. Move it to Done when complete.
6. Review the dashboard to track overall progress.

TaskFlow does not enforce a single required workflow beyond its supported statuses.
You can create tasks directly in a selected board column.
Completed tasks remain available for review unless you delete them.

## Project management

Projects provide a way to separate different sets of tasks.
Examples include a college semester, a portfolio project, an internship search, or personal planning.

### Create a project

Open the project selector or project settings area.
Choose the create-project action.
Enter a project name.
Add a description if useful.
Save the project and select it to view its tasks.

### Switch projects

Choose another project from the project selector.
The task list, board, calendar, and dashboard use the selected project's tasks.
The application data contains all locally stored projects, even though most views focus on one active project at a time.

### Delete a project

Open project settings and choose the delete action.
Review the confirmation prompt.
Deleting a project also removes tasks associated with that project from the workspace data.
Export a backup first when you want to preserve a project's information.
The application keeps at least one project in a valid imported workspace.

## Search filtering and sorting

### Search

Search checks task titles, descriptions, and labels.
The search text is trimmed and matched without case sensitivity.
Search and filters can be used together.

### Filters

Use the filters to narrow the task list.

- **Status:** select To do, In progress, or Done.
- **Priority:** select Low, Medium, or High.
- **Label:** select a label present in the current project's task set.
- **Overdue:** show tasks whose due date has passed and that are not completed.

When more than one filter is active, a task must satisfy every selected condition to remain visible.
Use the clear-filters action to return to the unfiltered task list.

### Sorting

The supported sort options are:

- **Due date:** earliest due dates first; tasks without a due date appear after dated tasks.
- **Priority:** high priority first, followed by medium and low.
- **Creation date:** most recently created tasks first.
- **Manual order:** use the saved order value for task ordering.

Sorting changes how tasks are presented; it does not change a task's status or due date.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl+K` or `Cmd+K` | Focus the global task search field |
| `Ctrl+N` or `Cmd+N` | Open the create-task dialog |
| `Escape` | Close the task or project dialog when it is open |

On macOS, use the Command key. On Windows and Linux, use the Control key.

## Dashboard analytics

Dashboard numbers are derived from the active project's tasks.
They are not independent values stored separately from task records.

| Metric | Meaning |
| --- | --- |
| Total | All tasks in the active project |
| Completed | Tasks whose status is `done` |
| Active | Tasks whose status is not `done` |
| Overdue | Incomplete tasks with a due date before the local current date |
| Completion | Completed tasks divided by total tasks, as a rounded percentage |

When the active project contains zero tasks, the completion percentage is zero.
Completed tasks are never counted as overdue.
A task due today is not considered overdue on that date.
Task changes flow back into the derived metrics so the dashboard can reflect current state.

## Calendar behavior

The calendar displays tasks with a due date.
Dates are stored as `YYYY-MM-DD` strings.
The monthly grid begins on Monday.
The calendar includes leading and trailing days needed to fill complete weeks.
Use the navigation buttons to move between months.
Use Today to jump back to the current month.
Selecting a calendar task opens that task for viewing or editing.
A day shows a limited number of task labels to avoid overcrowding.
When additional tasks exist for a day, the interface indicates that more tasks are present.
Tasks without a due date are not placed on a calendar day.

## Browser storage and backups

TaskFlow uses browser `localStorage` for workspace persistence.
The current storage key is:

```text
taskflow.app-data.v1
```

Saved data typically remains available in the same browser profile between visits.
Browser settings, private browsing modes, storage policies, or manual data clearing can affect persistence.

### Export a backup

Open Settings.
Choose Export JSON.
Save the downloaded JSON file somewhere safe.
The file contains the application data represented by the current workspace state.

### Import a backup

Open Settings.
Choose the import option.
Select a TaskFlow JSON file.
TaskFlow parses the file and validates its structure before applying it.
A failed import should leave the current application data unchanged.

### Reset demo data

Open Settings and choose the reset action.
Review the confirmation prompt carefully.
Confirm only when you are comfortable replacing the current workspace with the sample workspace.
Export a backup before resetting when you need to retain current work.

### Storage recovery

If the stored JSON cannot be read or fails validation, TaskFlow falls back to demo data and presents a warning.
If a storage write fails, the application reports the error instead of assuming the data was saved successfully.
Export your workspace regularly because browser storage is not a substitute for cloud backup.

## Data model

TaskFlow uses a versioned application data object.
The TypeScript definitions live in `src/types/index.ts`.

### Task status and priority types

```ts
export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';
```

### Task shape

```ts
interface Task {
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
```

### Project shape

```ts
interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}
```

### Application data shape

```ts
interface AppData {
  version: 1;
  tasks: Task[];
  projects: Project[];
  activeProjectId: string | null;
  theme: 'light' | 'dark';
}
```

### Data format guidance

- IDs are unique within their respective entity collections.
- Every task refers to an existing project ID.
- Due dates use `YYYY-MM-DD`, or `null` when there is no due date.
- Timestamps use ISO-style date-time strings with a time-zone marker.
- Task order is represented by a numeric `order` field.
- The data version is `1` in this application version.

## Validation rules

Imported workspace data is checked before it is accepted.
Validation includes the top-level version and collection types.
Project IDs and task IDs must follow the accepted identifier pattern.
Duplicate project IDs are rejected.
Duplicate task IDs are rejected.
A task's `projectId` must refer to a project in the imported project collection.
Project names and task titles must not be blank.
Task status must be one of the supported status values.
Task priority must be one of the supported priority values.
Due dates must be valid calendar dates in the expected format.
Creation and update timestamps must be parseable ISO-style date-time values.
Labels must be an array of non-empty strings within the validation limits.
The theme must be `light` or `dark`.
Unsupported or invalid imported data is rejected before the active workspace is replaced.

## Architecture notes

### Shared source of truth

Application state is held in the main React application state.
Views derive their task information from that shared state.
This helps keep the task list, board, calendar, and dashboard consistent after changes.

### Utility layer

`src/utils/taskUtils.ts` contains reusable operations that do not require a UI component.

These functions include overdue calculations, analytics, filtering, sorting, label collection, project lookup, and imported-data validation.

### Storage service

`src/services/storage.ts` encapsulates browser storage behavior.

It loads saved data, provides demo-data recovery, validates imported JSON, and downloads JSON backups.

### Component layer

The application uses reusable React components for project forms, task forms, Kanban cards, and Kanban columns.
Keeping these elements separate from the main application component makes it easier to change their behavior independently.

### Static deployment

The application is built with Vite.
The Vite base is configured as `./` to support assets under a repository path.
No server-side route rewriting is required for the current page-switching approach.

## Testing

TaskFlow includes Vitest tests for its task utility and storage behavior.
Run the test suite with:

```bash
npm test
```

Run tests continuously during development with:

```bash
npm run test:watch
```

### Current test coverage

The task utility tests cover analytics calculations.
They check that an empty task collection does not produce an invalid completion percentage.
They check that a task due today is not overdue.
They check that completed tasks are excluded from overdue counts.
They check combinations of search, status, and priority filtering.
They check that initial demo data is accepted by the validator.
They check that malformed data and duplicate-ID backups are rejected.
The storage tests cover saving and restoring valid workspace data.
They cover recovery when saved JSON is corrupt.
They cover validation of imported data.
They check that an invalid import does not mutate saved data.
They check that storage write failures are surfaced to the caller.

### Recommended pre-release checks

Run type checking:

```bash
npm run typecheck
```

Run linting:

```bash
npm run lint
```

Run unit tests:

```bash
npm test
```

Run the production build:

```bash
npm run build
```

Only report checks as successful after you have run them and observed their results.

## GitHub Pages deployment

This project includes a GitHub Actions workflow at:

```text
.github/workflows/deploy.yml
```

The workflow runs when code is pushed to `main` or when manually dispatched from the Actions tab.
It checks out the repository.
It sets up Node.js 22.
It installs project dependencies.
It runs TypeScript checks.
It runs ESLint.
It runs the unit tests.
It creates the production build.
It uploads the `dist/` folder as a Pages artifact.
It deploys the artifact to GitHub Pages.

### One-time repository setup

Push the project to the repository:

<https://github.com/Praveen-Suthar-08/TaskFlow>

Open the repository on GitHub.
Choose Settings.
Open Pages in the repository settings.
Set the build and deployment source to GitHub Actions.
Open the Actions tab.
Select the `Deploy TaskFlow to GitHub Pages` workflow.
Run it manually, or push a commit to the `main` branch.
Wait for the workflow to finish and check each job step for errors.
When deployment succeeds, use the Pages URL shown by the deployment workflow.
The expected repository-style URL format is:

```text
https://Praveen-Suthar-08.github.io/TaskFlow/
```

The URL is only live after GitHub Pages is enabled and a deployment succeeds.

### If the deployment fails

Open the failed workflow run in the Actions tab.
Find the first failed step.
Read its output before making changes.
If dependency installation fails, verify that package versions can be downloaded.
If tests fail, reproduce the test locally and fix the underlying issue.
If type checking fails, correct the reported TypeScript errors.
If linting fails, follow the ESLint output for the affected file.
If the build fails, confirm that dependencies are installed and the source compiles locally.

## Git commands

Use these commands to inspect the repository state:

```bash
git status
git branch --show-current
git log --oneline -5
```

If you have cloned the repository and made changes, stage them with:

```bash
git add README.md
git commit -m "docs: expand TaskFlow README"
git push origin main
```

If you changed other project files too, review `git status` before staging them.
If you are creating a new local repository instead of cloning the supplied repository, initialize Git and add the remote carefully:

```bash
git init
git branch -M main
git remote add origin https://github.com/Praveen-Suthar-08/TaskFlow.git
git add .
git commit -m "Initial TaskFlow project"
git push -u origin main
```

Do not run `git remote add origin` if an `origin` remote already exists.
Check the configured remote with:

```bash
git remote -v
```

## Accessibility and responsive design

TaskFlow is intended to work across desktop, tablet, and mobile viewport sizes.
The interface includes responsive navigation and page layouts.
Forms should be operated using their labels and controls.
Interactive elements use semantic buttons where appropriate.
Visible focus indicators help keyboard users track navigation.
Kanban drag-and-drop is configured with keyboard support from dnd-kit.
Dialogs and confirmations are used for forms and destructive actions.
Color is used alongside labels to help communicate task status and priority.

### Manual accessibility checklist

- Navigate the main sections using the keyboard.
- Confirm that interactive elements show a focus indicator.
- Open and close task and project dialogs.
- Check that form fields have understandable labels.
- Verify that validation messages are readable.
- Test the board with keyboard controls.
- Confirm that destructive actions require confirmation.
- Test the layout at a narrow phone width.
- Check that content does not create unwanted horizontal page overflow.
- Verify that important information remains readable in light and dark themes.

## Privacy and security

TaskFlow is a local, single-browser application in this version.
It does not implement user account authentication.
It does not synchronize data to a remote database.
It does not provide cross-device collaboration.
The workspace is stored in the current browser's local storage.
Anyone with access to the same browser profile may potentially access the local workspace.
Do not store passwords, access tokens, payment information, or other highly sensitive data in task descriptions.
Exported JSON backups can contain all task and project details from the workspace.
Keep backup files in a location you control.
Before sharing a backup, inspect it for private information.
No private API key is required to run the application.
The current application does not depend on a backend API for its task operations.

## Troubleshooting

### `npm` is not recognized

Install Node.js from the official Node.js website.
Close and reopen the terminal after installation.
Check that `node --version` and `npm --version` both return version information.

### Dependencies fail to install

Check the network connection.
Check whether the npm registry is reachable from the current network.
Retry `npm install` after resolving network or registry access problems.
If the project has a package lock file in a future revision, keep it consistent with `package.json`.

### The development server does not start

Confirm that you are in the project directory.
Confirm that dependencies finished installing.
Check the terminal output for a port conflict or missing package.
If port 5173 is already in use, use the alternate local URL printed by Vite.

### The page appears blank

Check the browser developer console for runtime errors.
Check the terminal where Vite is running.
Confirm that the project was opened from the correct directory.
Try restarting the development server after fixing the reported error.

### Changes do not persist after refresh

Check whether the browser allows local storage for the page.
Avoid private browsing modes that clear storage when the session ends.
Check whether the browser profile has storage restrictions.
Export a JSON backup before clearing browser data.

### A JSON import is rejected

Confirm that the file is a TaskFlow export.
Make sure the file contains valid JSON.
Verify that its version, project references, IDs, status fields, priority fields, dates, and other required fields follow the current data model.
The importer intentionally rejects invalid or unsupported data to protect the current workspace.

### A GitHub Pages deployment is blank or missing styles

Open the deployed URL from the workflow output.
Confirm that repository Pages settings use GitHub Actions.
Confirm that the latest workflow completed successfully.
Check the browser network panel for missing assets.
Verify the Vite relative base setting if deployment paths have been changed.

### An overdue count looks unexpected

TaskFlow compares due dates with the local calendar date.
A task due today is not overdue.
A task marked Done is never overdue.
Tasks without a due date are not overdue.

### A project cannot be deleted or imported

Review the validation and confirmation messages.
A valid workspace must contain at least one project.
Imported tasks must reference projects that exist in the same imported data object.
Export the current workspace before experimenting with hand-edited JSON.

## Known limitations

- Task data is local to a browser profile.
- There is no sign-in or multi-user permission system.
- There is no cross-device cloud synchronization.
- There are no real-time team collaboration features.
- There are no email or push notifications.
- There is no remote database or server API.
- The application cannot recover local data that the browser has permanently deleted unless a backup exists.
- The GitHub Pages workflow requires repository Pages settings to be configured.
- The repository's live deployment status must be checked on GitHub; it is not guaranteed by the presence of a workflow file.

## Future improvements

These are possible future directions, not promises that the functionality already exists.

- Add optional cloud synchronization through a separately secured backend.
- Add real authentication if multi-user use becomes a requirement.
- Add richer recurring-task rules.
- Add configurable custom task statuses.
- Add additional calendar views.
- Add project templates.
- Add CSV export for spreadsheet workflows.
- Add richer dashboard charts.
- Add automated browser-level end-to-end tests.
- Add a documented release and versioning process.
- Improve import diagnostics with field-level error messages.
- Add optional application-level backup reminders.

Any new backend capability should include a clear privacy model and appropriate access controls.

## Contributing

Contributions and improvements can be made through the GitHub repository.
Repository:

<https://github.com/Praveen-Suthar-08/TaskFlow>

### Suggested contribution workflow

1. Review the existing project structure.
2. Create a focused branch for your change.
3. Make a small, well-scoped modification.
4. Add or update tests where appropriate.
5. Run type checking.
6. Run linting.
7. Run the unit tests.
8. Run the production build.
9. Review the diff for unrelated or generated files.
10. Open a pull request with a clear summary and verification notes.

### Code quality guidelines

- Keep TypeScript types explicit where they improve clarity.
- Prefer small components with a clear responsibility.
- Keep pure business rules in utility functions when practical.
- Keep task and project data consistent across pages.
- Validate externally supplied data before applying it.
- Preserve existing user data during failed imports or mutations.
- Avoid adding dependencies for functionality that can be handled simply.
- Do not commit environment secrets or private credentials.
- Document behavior that affects persistence or static hosting.
- Report test results accurately.

### Pull request checklist

- [ ] The change has a clear purpose.
- [ ] Existing behavior has been preserved where appropriate.
- [ ] New behavior has tests where practical.
- [ ] Type checking has been run.
- [ ] Linting has been run.
- [ ] Unit tests have been run.
- [ ] The production build has been run.
- [ ] Responsive layouts have been checked when UI changed.
- [ ] README documentation has been updated when needed.
- [ ] No secrets or personal backup data are included.

## License

No `LICENSE` file is currently included in this project source.
Until a license is added, do not assume that the repository is released under an open-source license.
Add a license file and update this section if the project is formally licensed in the future.

## Author

**Made by Praveen Suthar**

- GitHub profile: <https://github.com/Praveen-Suthar-08>
- TaskFlow repository: <https://github.com/Praveen-Suthar-08/TaskFlow>
- Git clone URL: <https://github.com/Praveen-Suthar-08/TaskFlow.git>

Thanks for checking out TaskFlow.
If you use or adapt the project, review its local-storage behavior and limitations first.

---

*TaskFlow — Work, in flow.*
