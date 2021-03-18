# bespin mock

Mocking library

## mockFunction

Setup mock function's return value based on call arguments. Verify mock functions were called with expected arguments.

```javascript
import { mockFunction } from '@testingrequired/bespin-mock';

function getName() {
  return 'World';
}

function greeting(getNameFn) {
  const name = getNameFn();
  console.log(`Hello, ${name}!`);
}

const mockGetName = mockFunction(getName);
mockGetName.mock.whenCalledWithThenReturn([], 'Universe');

greeting(mockGetName); // Hello, Universe!
```
