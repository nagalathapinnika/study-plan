# Firestore Security Specification

## 1. Data Invariants

1. **User Ownership**: Every user can only read and write their own documents under `/users/{userId}` and its subcollections (`/users/{userId}/plans`, `/users/{userId}/tasks`, `/users/{userId}/quizAttempts`).
2. **Identity Integrity**: `userId` inside incoming document payload must strictly match the authenticated user's `request.auth.uid`.
3. **Role Protection**: Standard users cannot modify or escalate their `role` field.
4. **Valid Path Keys**: All document ID path variables (`userId`, `planId`, `taskId`, `attemptId`) must be strings matching alphanumeric regex `^[a-zA-Z0-9_\-]+$` of length `<= 128`.
5. **No Blanket Reads**: No global collections permit unauthorized or unbounded reads. All list queries must filter by user ID.
6. **Immutable Creation Timestamps**: Creation timestamp fields cannot be tampered with or modified during updates.

## 2. The "Dirty Dozen" Payloads (Designed to Fail)

1. **Spoofed User Creation**: Creating `/users/victim_123` with `request.auth.uid = "attacker_456"`.
2. **Elevated Privilege Escalation**: Updating `role: 'admin'` in `/users/{userId}` by a standard user.
3. **Ghost Field Injection**: Adding `{ "hackedKey": true }` to `/users/{userId}` during update.
4. **Oversized Field / DOS**: Attempting to write a 1MB payload into `learningGoals` exceeding 500 chars.
5. **Orphaned Subcollection Write**: User attempting to create a study plan under another user's path `/users/other_user/plans/plan1`.
6. **Task User Mismatch**: Writing `/users/{userId}/tasks/task1` where `incoming().userId != userId`.
7. **Cross-Tenant Quiz Injection**: Submitting a quiz attempt into another student's account.
8. **Invalid Path ID Characters**: Creating a doc with invalid characters `/users/{userId}/plans/..%2Fhack`.
9. **Unauthenticated Read**: Attempting to read `/users/some_id` without an auth token.
10. **Unauthenticated Write**: Attempting to write to `/users/some_id` without auth.
11. **Altering Plan Ownership**: Updating `userId` in existing study plan document.
12. **Blanket Collection Crawl**: Requesting `/users` without scoping query to `request.auth.uid`.

## 3. Test Runner Design (`firestore.rules.test.ts`)

A test runner verifying that each of the 12 malicious payloads returns `PERMISSION_DENIED`.
