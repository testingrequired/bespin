// Middleware

export class Middleware {
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}
