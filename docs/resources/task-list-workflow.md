# Work through the Project Bible Task List

Open **Tasks** in the Bible footer to see work across chapters. Use **Ready to work** to find open or ready tasks with an empty Blockers field. Use the chapter and assignee filters to narrow the list. Each private reader with task editing enabled saves this view to its project's `task-list.md`.

## Pick up, update, and finish a task

1. Read the project’s Task List and owning Bible chapter. Pick a task you can act on. If it has a blocker, check whether the named task, decision, or evidence has landed before clearing the blocker. Leave someone else’s in-progress work with them unless you are assigned to collaborate.
2. Set the task to **In progress** and add your name to **Assignees**. Keep the other assignees. Use the description and next action to record what you did, what you checked, and what someone can pick up next.
3. If work stops on a dependency, use **Blocked** and record the missing task, decision, or evidence in **Blockers**. Link the dependency if possible and say who can clear it when known. Use **Hold** for work paused by choice and **Cancelled** for work the project has dropped.
4. Use **Complete** after you verify the result. Keep the task in the list and link its evidence. For a meaningful project change, add a dated entry to the project’s `changelog.md` with what changed, how you checked it, and a link to the task or its evidence. Link the entry back from the task when it helps someone follow the change.

## Edit from a project checkout

Agents can edit the project file named in its README, usually `docs/task-list.md`. Keep the existing checklist or table format. Reopen or refresh the browser list to load agent edits. Reread the file just before editing and make a targeted change so you keep other contributors’ work. For a blocker, use a separate line in a checklist item or add ` · **Blockers:** …` at the end of a table row’s **Next action** cell, before the assignees comment.

In a checklist, keep the status and short next action indented under the task. On completion, set the status to **Complete** and check the box.

```markdown
## Audio Engineering

- [ ] Check the mix on a phone speaker.

  **Blocked** · Compare the current Dock mix with music off and on.
  **Blockers:** [Package the phone build](release-checks.md).
  <!-- assignees: ["Joe","Kal"] -->
```

In an existing four-column task table, edit the **Status** and **Next action** cells. If a status already ends with a `<!-- task:… -->` marker, keep its ID and kind and set the final flag to `1` for complete or `0` for open, held, blocked, or cancelled work.

```markdown
| Asset | Task | Status | Next action |
| --- | --- | --- | --- |
| | Check the mix on a phone speaker. | Blocked | Compare the mix. · **Blockers:** [Package the phone build](release-checks.md). <!-- assignees: ["Joe","Kal"] --> |
```

Use the assignees comment on a task for one or more names. Keep them in a JSON array. Use an empty array to clear assignments. To maintain the project roster, keep one name per line under `## Members`. If you rename or remove a name, update both the roster and every task that uses it. You can make the same changes in one save from the member picker.

```markdown
## Members

- Joe
- Kal
```
