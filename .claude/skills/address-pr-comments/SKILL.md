---
name: address-pr-comments
description: Fetch unresolved PR review comments, fix the code issues, commit, push, reply to each comment, and resolve the threads.
argument-hint: <pr-url-or-number>
---

# Address PR Review Comments: $ARGUMENTS

Fetch unresolved review comments from a pull request, fix the issues raised, then reply and resolve each thread.

## Steps

### 1. Fetch unresolved review comments

Use `gh api` to get the PR review comments:

```
gh api repos/{owner}/{repo}/pulls/{number}/comments
```

Filter to only unresolved threads using the GraphQL API:

```graphql
query {
  repository(owner: "{owner}", name: "{repo}") {
    pullRequest(number: {number}) {
      reviewThreads(last: 50) {
        nodes {
          id
          isResolved
          comments(first: 5) {
            nodes {
              databaseId
              path
              body
            }
          }
        }
      }
    }
  }
}
```

If there are no unresolved comments, report that and stop.

### 2. Understand and fix each issue

For each unresolved comment:

1. Read the referenced file and understand the concern
2. Make the necessary code change to address the feedback
3. Keep track of which thread IDs map to which fixes

### 3. Run tests

Run `npm test` to verify the fixes don't break anything.

### 4. Commit and push

- Stage only the changed files (not `git add -A`)
- Write a commit message summarizing all fixes
- Push to the current branch

### 5. Reply to each comment

For each comment, reply with a brief explanation of what was fixed and reference the commit SHA:

```
gh api repos/{owner}/{repo}/pulls/{number}/comments/{comment_id}/replies \
  -f body="Fixed in {sha}. {brief explanation}"
```

### 6. Resolve each thread

Use GraphQL to resolve all addressed threads in a single mutation:

```graphql
mutation {
  t1: resolveReviewThread(input: {threadId: "{thread_id_1}"}) { thread { isResolved } }
  t2: resolveReviewThread(input: {threadId: "{thread_id_2}"}) { thread { isResolved } }
}
```

### 7. Report

Summarize what was done:
- Number of comments addressed
- Files changed
- Commit SHA
- Any comments that could NOT be addressed (with explanation)

## Notes

- Parse the PR URL or number from `$ARGUMENTS` — accept formats like `#2`, `2`, or a full GitHub PR URL
- Extract `{owner}` and `{repo}` from the git remote if not provided in the URL
- If a comment is about a design decision or question (not a code fix), reply explaining the rationale instead of changing code
- Always run tests before committing
