---
name: ship-check
description: Perform a final QA and polish pass before demo or deployment.
disable-model-invocation: true
---

When invoked:

1. Check all main routes and nav items.
2. Find broken imports, missing data, and dead actions.
3. Verify build/lint readiness.
4. Verify the main demo flow:
   request -> approval -> approved request -> candidate match -> candidate detail -> resume view -> interview scores -> reactivate
5. Fix small polish issues without redesigning the app.
6. Return a concise punch list of anything still fake or fragile.
