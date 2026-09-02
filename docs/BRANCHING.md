# Branching and review strategy

## Branches

- `main` is the protected, releasable branch.
- `feature/KAN-123-short-description` is for normal feature work.
- `fix/KAN-123-short-description` is for defects.
- `docs/KAN-123-short-description` is for documentation-only changes.

Every branch must reference a Jira issue. Keep branches small and rebase or update them from `main` before review.

## Pull requests

1. Create a Jira issue and branch from the latest `main`.
2. Make focused commits and include tests or validation evidence.
3. Open a pull request using the repository template.
4. Request at least one teammate review.
5. Resolve review comments and ensure checks pass.
6. Merge only through the pull request; direct pushes to `main` are not allowed.
7. Delete the branch after merge.

## Commit format

Use concise imperative messages, preferably including the Jira key, for example: `KAN-14 Add staging deployment plan`.
