# Repository Guidance

## Performance work

- Measure the same representative workload before and after every optimization.
- Keep a change only when the measured gain justifies its runtime and maintenance complexity.
- Cover server response time, browser loading/rendering, transferred and decoded page weight, generated bundle sizes, and MongoDB query plans.
- Use production-like data for database benchmarks; the development seed is intentionally small and can hide collection scans or in-memory sorts.
- Run Node.js commands with the repository's supported Node 22 release from `lib/`.
- Treat `https://idiomatically.net` as the canonical production origin when measuring deployed behavior.

## Current architecture notes

- Public routes are server-rendered through React Router and load their data through the local GraphQL endpoint.
- Ant Design SSR styles are extracted in `lib/src/entry.server.tsx` and inserted into every HTML response.
- Idiom list ranking currently computes equivalent count from the `equivalents` array during each MongoDB aggregation.
- The application ensures indexes for idiom `slug` and `languageKey` at startup; add more only after representative query-plan benchmarks.
- Keep equivalent count computed from `equivalents` until production scale justifies the write-path complexity of denormalizing and indexing it.
