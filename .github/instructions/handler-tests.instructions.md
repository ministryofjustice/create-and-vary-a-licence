---
applyTo: "server/routes/**/*.test.ts"
---

# Handler Test Utilities

Handler tests must use the factory functions in `server/testUtils/handlerTestUtils.ts` rather than manually constructing `req`/`res` stubs.

## Rules

- Never use `as unknown as Request` or `as unknown as Response` type casts
- Never declare `let req` / `let res` with forward type annotations — use inline `const { req, res }` per test
- Never mutate `req` or `res` after creation — pass `licence:` and `user:` directly to the factory
- Never include `req.body` if the test is testing a `GET`
- All test-specific configuration (body, query, path, params, session, licence, user) must be declared in the `createRequestAndResponse()` call

## Pattern

```typescript
import {
  createRequestAndResponse,
  createProbationUser,
  createPrisonUser,
  createUser,
} from "../../../testUtils/handlerTestUtils";

it("should render view", async () => {
  const { req, res, next } = createRequestAndResponse({
    req: {
      licenceId: "1",
      body: { answer: "Yes" },
      session: { teamSelection: ["teamA"] },
    },
    res: {
      user: createProbationUser({ username: "USER1" }),
      licence: { typeCode: "AP", statusCode: "ACTIVE" },
    },
  });

  await handler.GET(req, res);

  expect(res.render).toHaveBeenCalledWith("pages/create/someView");
});
```

## User Factories

Use the most specific factory for the user type being tested:

- `createUser(overrides)` — generic user, use when the user type is not significant
- `createProbationUser(overrides)` — COM/probation user with `isProbationUser: true` and team codes
- `createPrisonUser(overrides)` — prison/ACO user with `nomisStaffId`, `activeCaseload`, and ACO role

## Factory Options

All options are namespaced under `req` or `res`:

| Option          | Type                      | Description                             |
| --------------- | ------------------------- | --------------------------------------- |
| `req.licenceId` | `string \| number`        | Shorthand for `params: { licenceId }`   |
| `req.params`    | `Record<string, unknown>` | URL route params                        |
| `req.body`      | `Record<string, unknown>` | Request body                            |
| `req.query`     | `Record<string, unknown>` | Query string params                     |
| `req.session`   | `Record<string, unknown>` | Session data                            |
| `req.[key]`     | `unknown`                 | Any other `req` property (e.g. `route`) |
| `res.user`      | user factory result       | User in `res.locals.user`               |
| `res.licence`   | `Record<string, unknown>` | Licence in `res.locals.licence`         |
| `res.[key]`     | `unknown`                 | Any other `res.locals` property         |

## Return Value

`createRequestAndResponse()` returns `{ req, res, next }` where `next` is a `jest.Mock` typed as Express's `NextFunction`. Use it directly — no need to declare or type it separately.

## Migration Checklist

When converting an existing test file:

1. Add import from `../../../testUtils/handlerTestUtils` (adjust relative path as needed)
2. Remove `let req`/`let res` forward declarations
3. Replace each `beforeEach` setup block with inline `const { req, res } = createRequestAndResponse(...)` per test
4. Move any `res.locals.licence = ...` post-creation mutations into `licence:` option
5. Remove all `as unknown as Request/Response` casts
6. Run `npm run typecheck` to confirm no type errors
