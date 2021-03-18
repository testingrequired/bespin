# bespin mock

Mocking library

## mockFunction

Setup mock function's return value based on call arguments. Verify mock functions were called with expected arguments.

```typescript
import { mockFunction } from '@testingrequired/bespin-mock';

function getName() {
  return 'World';
}

function greeting(
  getNameFn: typeof getName /* The mock will pass this type check */
) {
  const name = getNameFn();
  console.log(`Hello, ${name}!`);
}

const mockGetName = mockFunction(getName);

// Mock setups are based on the calling arguments.
mockGetName.mock.whenCalledWithThenReturn([], 'Universe');

greeting(mockGetName); // Hello, Universe!
```

## Mock

The mock contains setups which match calling arguments to behaviors (e.g. returning values, throwing errors, doing nothing), methods for verifying calls, raw access to call and return sequences.

### Setups

Mocks are strict by nature. Meaning they will throw an exception if a call is made without a matching setup. This is not configurable at this time.

#### whenCalledWithThenReturn

When called with args `[a, b, c...]` then return a `"value"`.

```typescript
import { mockFunction } from '@testingrequired/bespin-mock';

function numberToString(n: number): string {
  return n.toString(10);
}

const mockFn = mockFunction(numberToString);

mockFn.mock.whenCalledWithThenReturn([10], '100');

mockFn(10); // 100
```

#### whenCalledWithThenThrow

When called with args `[a, b, c...]` then throw `error`.

```typescript
import { mockFunction } from '@testingrequired/bespin-mock';

function numberToString(n: number): string {
  return n.toString(10);
}

const mockFn = mockFunction(numberToString);

mockFn.mock.whenCalledWithThenThrow([10], new Error('Expected error message'));

mockFn(10); // Throws 'Expected error message'
```

#### whenCalledWithJustRun

When called with args `[a, b, c...]` then do nothing.

```typescript
import { mockFunction } from '@testingrequired/bespin-mock';

function numberToString(n: number) {
  console.log(n);
}

const mockFn = mockFunction(numberToString);

mockFn.mock.whenCalledWithJustRun([10]);

mockFn(10); // Does nothing
```

### Verifying

#### verify

Verifies mock was called with expected arugments.

```typescript
import { mockFunction } from '@testingrequired/bespin-mock';

function numberToString(n: number) {
  console.log(n);
}

const mockFn = mockFunction(numberToString);

mockFn.mock.whenCalledWithJustRun([10]);

mockFn(10); // Does nothing

mockFn.mock.verify([10]);

mockFn.mock.verify([20]); // Throws because no calls were made passing 20
```

#### verifyAll

Verify all setups were called.

```typescript
import { mockFunction } from '@testingrequired/bespin-mock';

function numberToString(n: number) {
  console.log(n);
}

const mockFn = mockFunction(numberToString);

mockFn.mock.whenCalledWithJustRun([10]);

mockFn.mock.verifyAll(); // Throws because no calls were made passing 10
```
