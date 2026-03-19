# Tasks Module

Contains core task management and reminder logic.  Notable components:

* `TasksService` – CRUD operations for tasks, used by frontend.
* `ReminderService` – background job (interval) that scans for due reminders and
  sends an email via `MailService`; updates the task to mark the reminder sent.

Reminder behaviour is covered by a unit test (`reminder.service.spec.ts`) that
mocks the `PrismaService` and `MailService`.
