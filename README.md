# Utils - Utility Functions

This repository provides useful JavaScript utility functions. Currently, it features an advanced deep copy function.

## `newDeepCopy(data)`

The `newDeepCopy` function, located in `deepCopy.js`, creates a deep copy of a given JavaScript object or array.

### Features:

*   **Comprehensive Deep Copying:** Recursively copies all nested objects and arrays, ensuring that the new structure is entirely independent of the original.
*   **Handles Various Data Types:**
    *   Correctly clones primitive types (numbers, strings, booleans, null, undefined, symbols if part of objects).
    *   Deep copies properties of objects.
    *   Deep copies elements of arrays.
    *   Deep copies `Set` objects, including deep copying their elements.
    *   Deep copies `Map` objects, including deep copying their keys and values if they are objects.
    *   Copies functions by reference.
*   **Circular Reference Handling:** Safely handles circular references within objects and arrays, preventing infinite loops and stack overflows. It uses a `WeakMap` internally to keep track of visited objects.
*   **Type Preservation:** The primary structure (Object or Array) of the input data is preserved.

### Usage:

The function expects an object or an array as its input. It will throw a `TypeError` if the input is not an object (e.g., a primitive type directly).

```javascript
// Import or load newDeepCopy from deepCopy.js
// const newDeepCopy = require('./deepCopy'); // If using CommonJS modules

const original = {
    name: "Original",
    details: {
        version: 1,
        tags: new Set(["a", "b"]),
        history: [{event: "created"}, {event: "updated"}]
    },
    circular: null
};
original.circular = original; // Create a circular reference

const copied = newDeepCopy(original);

console.log(copied);
console.log(copied !== original); // true
console.log(copied.details !== original.details); // true
console.log(copied.details.tags !== original.details.tags); // true
console.log(copied.details.history[0] !== original.details.history[0]); // true
console.log(copied.circular === copied); // true
```

### Testing:

The `deepCopy.js` file includes a comprehensive suite of inline tests using `console.assert` and `console.log`. These tests cover various scenarios, including nested structures, different data types, and circular references, to ensure the function's correctness. You can run the file directly (e.g., with Node.js) to see the test results.

```sh
node deepCopy.js
```
