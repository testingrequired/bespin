# bespin mock

Mocking library

```typescript
import { Mock } from '@testingrequired/bespin-mock';

function getName(): string {
  return 'World';
}

function getGreeting(getNameFn: () => string): String {
  const name = getNameFn();

  return `Hello ${name}`;
}

const mockGetName = Mock.of(getName);

mockGetName.whenCalledWithThenReturn([], 'Universe');

const greeting = getGreeting(mockGetName.fn); // 'Hello Universe'

mockGetName.verify([]);
```
