# Case for Levity

This is a case for solving the problem:
> Create an app (in TypeScript) to monitor traffic delays on a freight delivery route and notify a customer if a significant delay occurs. The goal of this exercise is to assess your ability to work with APIs, handle data transformations, and build a multi-step workflow using Temporal (and their TypeScript SDK).

## Running the code

Install dependencies with `npm install`.

Run `temporal server start-dev` to start [Temporal Server](https://github.com/temporalio/cli/#installation).

1. In a shell, run `npm run start.watch` to start the Worker and reload it when code changes.
1. In another shell, run `npm run workflow` to run the Workflow Client.
    - Update `src/shared.ts` with keys
    - Increase `DELAY_THRESHOLD_IN_MINUTES` in `/src/shared.ts` to increase the likelyhood of not gaving to send notification
    - Update `email` in `src/shared.ts` to receive notification 
1. Run `npm test` to run the tests.
