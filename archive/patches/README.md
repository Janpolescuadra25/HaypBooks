This folder contains a patch and instructions to apply the squash-validate changes.

Files:
- squash-validate-changes.patch: a unified-style patch containing the new/updated files with full contents.
- squash-validate-changes.txt: human-readable summary of changes.
- PR_DESCRIPTION.md: suggested PR title and body.

How to apply (recommended):

1) Inspect the patch:
   less archive/patches/squash-validate-changes.patch

2) Apply using `git apply` from repo root:

   git apply --index archive/patches/squash-validate-changes.patch

   - If `git apply` complains about mismatched hunks, you can use `git apply --allow-overlap --index` or apply individual file sections manually.

3) Commit and open a PR:

   git checkout -b feat/squash-validate-tenantid-uuid
   git add .
   git commit -m "squash-validate: land convert tenantid->uuid, robust validation & CI matrix"
   git push -u origin feat/squash-validate-tenantid-uuid

4) Monitor CI (the workflow `squash-validate` will run both guarded and unguarded runs).

If you prefer, I can initialize the git repo and open the PR for you if you provide the remote origin details.

Notes:
- The patch is additive and includes full file contents. Back up any local changes before applying.
- If you want a safer apply, create a new branch and apply the patch there, then run `npm --prefix Haypbooks/Backend run lint:migrations:rls` and `node scripts/db/squash-validate.js` locally.
