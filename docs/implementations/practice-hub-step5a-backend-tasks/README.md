# Phase 11 Step 5A: Practice Hub Backend Task & Review Queues

## Overview
Phase 11 Step 5A implements the backend task and review queue architecture within the Practice Hub module. It enables practice members (owners, admins, senior accountants, and staff) to create, manage, query, assign, update, and resolve client workflow tasks and review requests across workspaces.

- **Status:** COMPLETE & VERIFIED
- **Commit SHA:** `def107fec9bde848d43b3c4002e6f601d42f76d6`
- **Database Migrations:** Zero (reused existing Prisma `model Task`, `enum TaskStatus`, and `enum TaskPriority`)
- **Guard Enforcement:** All write and retrieval routes enforce `@RequireWorkspaceType('PRACTICE')` and `@UseGuards(WorkspaceTypeGuard)`.

---

## Architecture & Data Flow

```
Client / Frontend
       │
       ▼
PracticeHubController (`/api/v1/practice-hub`)
       │
       ├── @RequireWorkspaceType('PRACTICE')
       └── @UseGuards(WorkspaceTypeGuard)
       │
       ▼
PracticeHubService
       │
       ├── assertPracticeMember()   --> Verifies caller is ACTIVE member of Practice
       ├── assertValidAssignee()    --> Verifies assignee belongs to Practice
       └── PrismaService (model Task)
```

---

## Controller Endpoints (`Haypbooks/Backend/src/practice-hub/practice-hub.controller.ts`)

| HTTP Method | Route | Description | Guard / Decorator |
|---|---|---|---|
| `POST` | `/api/v1/practice-hub/tasks` | Create a new task within practice workspace | `@RequireWorkspaceType('PRACTICE')` |
| `GET` | `/api/v1/practice-hub/tasks` | Query practice tasks (filtered by status, priority, assignee, client) | `@RequireWorkspaceType('PRACTICE')` |
| `GET` | `/api/v1/practice-hub/reviews` | Query review queue tasks (IN_REVIEW / REVIEW status) | `@RequireWorkspaceType('PRACTICE')` |
| `GET` | `/api/v1/practice-hub/tasks/:id` | Retrieve single task detail by ID | `@RequireWorkspaceType('PRACTICE')` |
| `PATCH` | `/api/v1/practice-hub/tasks/:id` | Update task fields (status, priority, assignee, dates) | `@RequireWorkspaceType('PRACTICE')` |
| `DELETE` | `/api/v1/practice-hub/tasks/:id` | Soft-delete task (`deletedAt: new Date()`) | `@RequireWorkspaceType('PRACTICE')` |

---

## Data Transfer Objects (`Haypbooks/Backend/src/practice-hub/dto/`)

1. **`CreateTaskDto` (`create-task.dto.ts`):**
   - `title`: `string` (required, non-empty)
   - `description`: `string` (optional)
   - `priority`: `TaskPriority` enum (`LOW`, `MEDIUM`, `HIGH`, `URGENT`)
   - `status`: `TaskStatus` enum (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `CANCELLED`)
   - `assigneeId`: `string` (optional, validated against practice membership)
   - `clientId`: `string` (optional, linked client workspace)
   - `dueDate`: `Date` string (optional, ISO 8601)

2. **`UpdateTaskDto` (`update-task.dto.ts`):**
   - Partial fields from `CreateTaskDto` using `PartialType(CreateTaskDto)`
   - Handles status transitions (`completedAt` set when status becomes `DONE`)

3. **`QueryTasksDto` (`query-tasks.dto.ts`):**
   - Filtering by `status`, `priority`, `assigneeId`, `clientId`, `search` term
   - Pagination support (`limit`, `offset`)

---

## Service Layer Methods (`Haypbooks/Backend/src/practice-hub/practice-hub.service.ts`)

1. `createPracticeTask(workspaceId: string, userId: string, dto: CreateTaskDto)`
2. `getPracticeTasks(workspaceId: string, userId: string, query: QueryTasksDto)`
3. `getPracticeTaskById(workspaceId: string, userId: string, taskId: string)`
4. `updatePracticeTask(workspaceId: string, userId: string, taskId: string, dto: UpdateTaskDto)`
5. `deletePracticeTask(workspaceId: string, userId: string, taskId: string)`
6. `getReviewQueueTasks(workspaceId: string, userId: string, query: QueryTasksDto)`
7. `assertPracticeMember(workspaceId: string, userId: string)`: Reuses `findPracticeByWorkspace(workspaceId)` and checks caller's `PracticeUser` record.
8. `assertValidAssignee(practiceId: string, assigneeId: string)`: Validates assigned user is an active practice staff member.

---

## Verification & Quality Gates
- **Backend Typecheck:** `npx tsc --noEmit` in `Haypbooks/Backend` exits 0.
- **Frontend Typecheck:** `npm run typecheck` in `Haypbooks/Frontend` exits 0.
- **Prisma Schema Drift:** None. No new migrations introduced.