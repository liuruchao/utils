# Utils - 实用工具函数

本仓库提供有用的 JavaScript 工具函数。目前，它主要包含一个高级的深拷贝函数。

## `newDeepCopy(data)`

`newDeepCopy` 函数位于 `deepCopy.js` 文件中，用于创建一个给定 JavaScript 对象或数组的深拷贝副本。

### 功能特性：

*   **全面的深拷贝：** 递归复制所有嵌套的对象和数组，确保新结构完全独立于原始结构。
*   **处理多种数据类型：**
    *   正确克隆原始类型（数字、字符串、布尔值、null、undefined，以及对象中的 Symbol 类型）。
    *   深拷贝对象的属性。
    *   深拷贝数组的元素。
    *   深拷贝 `Set` 对象，包括深拷贝其元素。
    *   深拷贝 `Map` 对象，包括深拷贝其键和值（如果它们是对象）。
    *   函数通过引用复制。
*   **循环引用处理：** 安全地处理对象和数组中的循环引用，防止无限循环和栈溢出。内部使用 `WeakMap` 来跟踪已访问的对象。
*   **类型保留：** 输入数据的主要结构（对象或数组）将被保留。

### 用法：

该函数期望接收一个对象或数组作为输入。如果输入不是对象（例如，直接输入原始类型），它将抛出 `TypeError`。

```javascript
// 从 deepCopy.js 导入或加载 newDeepCopy
// const newDeepCopy = require('./deepCopy'); // 如果使用 CommonJS 模块

const original = {
    name: "Original",
    details: {
        version: 1,
        tags: new Set(["a", "b"]),
        history: [{event: "created"}, {event: "updated"}]
    },
    circular: null
};
original.circular = original; // 创建一个循环引用

const copied = newDeepCopy(original);

console.log(copied);
console.log(copied !== original); // true
console.log(copied.details !== original.details); // true
console.log(copied.details.tags !== original.details.tags); // true
console.log(copied.details.history[0] !== original.details.history[0]); // true
console.log(copied.circular === copied); // true
```

### 测试：

`deepCopy.js` 文件包含一套使用 `console.assert` 和 `console.log` 实现的综合性内联测试。这些测试覆盖了各种场景，包括嵌套结构、不同数据类型和循环引用，以确保函数的正确性。您可以直接运行该文件（例如，使用 Node.js）来查看测试结果。

```sh
node deepCopy.js
```
