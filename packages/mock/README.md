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

## mockObject

Create a mocked instance of a class. All methods are mocked.

```typescript
import { mockObject } from '@testingrequired/bespin-mock';

class Service {
  getNames(): Array<string> {
    return [];
  }
}

const mockService = mockObject(Service);

mockService.getNames.mock.whenCalledWithThenReturns([], ['foo', 'bar']);

mockSerivce.getNames(); // ['foo', 'bar']
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

#### reset

Mock setups can be emptied

```typescript
import { mockFunction } from '@testingrequired/bespin-mock';

function numberToString(n: number) {
  console.log(n);
}

const mockFn = mockFunction(numberToString);

mockFn.mock.whenCalledWithJustRun([10]);

mockFn(10); // Does nothing

mockFn.mock.reset();

mockFn(10); // Throws because there are no matching setups
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

### Recorded Data

Mocks record their input arguments and return values.

```typescript
import { mockFunction } from '@testingrequired/bespin-mock';

function numberToString(n: number) {
  console.log(n);
}

const mockFn = mockFunction(numberToString);

mockFn.mock.whenCalledWithJustRun([10]);

mockFn(10);
mockFn(10);
mockFn(10);

mockFn.mock.calls; // [[10], [10], [10]]
mockFn.mock.returns; // [undefined, undefined, undefined]
```

#### clear

This recorded data can be cleared

```typescript
import { mockFunction } from '@testingrequired/bespin-mock';

function numberToString(n: number) {
  console.log(n);
}

const mockFn = mockFunction(numberToString);

mockFn.mock.whenCalledWithJustRun([10]);

mockFn(10);
mockFn(10);
mockFn(10);

mockFn.mock.calls; // [[10], [10], [10]]
mockFn.mock.returns; // [undefined, undefined, undefined]

mockFn.mock.clear();

mockFn.mock.calls; // []
mockFn.mock.returns; // []
```
