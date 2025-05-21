function newDeepCopy(data, visited = new WeakMap()) {
  if (typeof data !== "object" || data === null) {
    throw new TypeError("传入参数不是对象");
  }

  // 1. Check if already visited
  if (visited.has(data)) {
    return visited.get(data);
  }

  let newData = Array.isArray(data) ? [] : {};

  // 2. Store the new copy in the visited map BEFORE recursion
  visited.set(data, newData);

  // 3. Pass 'visited' in all recursive calls.
  if (Array.isArray(data)) {
    // Loop through 'data' as an array
    data.forEach((element, index) => {
      if (typeof element === 'object' && element !== null) {
        newData[index] = newDeepCopy(element, visited); // Pass 'visited'
      } else {
        newData[index] = element; // Primitives/functions assigned directly
      }
    });
  } else {
    // 'data' is an object, use the existing Object.keys logic
    const dataKeys = Object.keys(data);
    dataKeys.forEach(key => {
      const currentDataValue = data[key];
      // 基本数据类型的值和函数直接赋值拷贝
      if (typeof currentDataValue !== "object" || currentDataValue === null) {
        newData[key] = currentDataValue;
      } else if (Array.isArray(currentDataValue)) {
        // This is the logic implemented by the previous worker for nested arrays
        newData[key] = currentDataValue.map(item => {
          if (typeof item === 'object' && item !== null) {
            return newDeepCopy(item, visited); // Pass 'visited'
          } else {
            return item;
          }
        });
      } else if (currentDataValue instanceof Set) {
        const newSet = new Set();
        currentDataValue.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            newSet.add(newDeepCopy(item, visited)); // Pass 'visited'
          } else {
            newSet.add(item); // Primitives/functions added directly
          }
        });
        newData[key] = newSet;
      } else if (currentDataValue instanceof Map) {
        const newMap = new Map();
        currentDataValue.forEach((mapValue, mapKey) => {
          const copiedKey = (typeof mapKey === 'object' && mapKey !== null) ? newDeepCopy(mapKey, visited) : mapKey; // Pass 'visited'
          const copiedValue = (typeof mapValue === 'object' && mapValue !== null) ? newDeepCopy(mapValue, visited) : mapValue; // Pass 'visited'
          newMap.set(copiedKey, copiedValue);
        });
        newData[key] = newMap;
      } else { // Property is a non-array, non-set, non-map object
        newData[key] = newDeepCopy(currentDataValue, visited); // Pass 'visited'
      }
    });
  }
  return newData;
}

// 测试数据项
var data = {
  age: 18,
  name: "liuruchao",
  education: ["小学", "初中", "高中", "大学", undefined, null],
  likesFood: new Set(["fish", "banana"]),
  friends: [
    {
      name: "summer",
      sex: "woman"
    },
    {
      name: "daWen",
      sex: "woman"
    },
    {
      name: "yang",
      sex: "man"
    }
  ],
  work: {
    time: "2019",
    project: {
      name: "test",
      obtain: ["css", "html", "js"]
    }
  },
  play: function() {
    console.log("玩滑板");
  }
};


// --- Test Suite ---
console.log("--- Starting Test Suite for newDeepCopy ---"); // Updated console log message

function runTests() {

  // Helper for comparing Set contents
  function setsAreEqual(setA, setB) {
    if (setA.size !== setB.size) return false;
    for (const item of setA) {
      // For simplicity in this test, assumes primitive items or requires deep equality for objects
      // A more robust comparison would be needed for sets of objects if order doesn't matter and deep equality is complex
      if (!setB.has(item)) return false;
    }
    return true;
  }

  // Helper for comparing Map contents
  function mapsAreEqual(mapA, mapB) {
    if (mapA.size !== mapB.size) return false;
    for (const [key, value] of mapA) {
      if (!mapB.has(key) || mapB.get(key) !== value) {
        // For simplicity, assumes primitive keys/values or requires deep equality for objects
        return false;
      }
    }
    return true;
  }
  
  // 1. Basic Integrity
  console.log("\n--- Test 1: Basic Integrity ---");
  // 1.1 Simple Object
  console.log("1.1 Testing simple object with primitive values...");
  const simpleObj = { a: 1, b: "hello", c: true };
  const copiedSimpleObj = newDeepCopy(simpleObj);
  console.log("Original Simple Object:", simpleObj);
  console.log("Copied Simple Object:", copiedSimpleObj);
  console.assert(simpleObj !== copiedSimpleObj, "Test 1.1 FAILED: Copied object is not a new instance.");
  console.assert(simpleObj.a === copiedSimpleObj.a, "Test 1.1 FAILED: Value 'a' mismatch.");
  console.assert(simpleObj.b === copiedSimpleObj.b, "Test 1.1 FAILED: Value 'b' mismatch.");
  console.assert(simpleObj.c === copiedSimpleObj.c, "Test 1.1 FAILED: Value 'c' mismatch.");
  if (simpleObj !== copiedSimpleObj && simpleObj.a === copiedSimpleObj.a && simpleObj.b === copiedSimpleObj.b && simpleObj.c === copiedSimpleObj.c) {
    console.log("Test 1.1 PASSED");
  } else {
    console.error("Test 1.1 FAILED - Check assertions above.");
  }

  // 1.2 Array of Primitives
  console.log("\n1.2 Testing array of primitives...");
  const simpleArr = [1, "two", false, null, undefined];
  const copiedSimpleArr = newDeepCopy(simpleArr);
  console.log("Original Simple Array:", simpleArr);
  console.log("Copied Simple Array:", copiedSimpleArr);
  console.assert(simpleArr !== copiedSimpleArr, "Test 1.2 FAILED: Copied array is not a new instance.");
  console.assert(simpleArr.length === copiedSimpleArr.length, "Test 1.2 FAILED: Array length mismatch.");
  for (let i = 0; i < simpleArr.length; i++) {
    console.assert(simpleArr[i] === copiedSimpleArr[i], `Test 1.2 FAILED: Element at index ${i} mismatch.`);
  }
  if (simpleArr !== copiedSimpleArr && simpleArr.length === copiedSimpleArr.length && simpleArr.every((v, i) => v === copiedSimpleArr[i])) {
    console.log("Test 1.2 PASSED");
  } else {
    console.error("Test 1.2 FAILED - Check assertions above.");
  }

  // 2. Nested Structures
  console.log("\n--- Test 2: Nested Structures ---");
  // 2.1 Object with nested objects
  console.log("2.1 Testing object with nested objects...");
  const nestedObj = { level1: { level2: { value: "deep" }, b: 2 }, c: 3 };
  const copiedNestedObj = newDeepCopy(nestedObj);
  console.log("Original Nested Object:", nestedObj);
  console.log("Copied Nested Object:", copiedNestedObj);
  console.assert(nestedObj !== copiedNestedObj, "Test 2.1 FAILED: Copied object is not a new instance.");
  console.assert(nestedObj.level1 !== copiedNestedObj.level1, "Test 2.1 FAILED: Nested object 'level1' is not a new instance.");
  console.assert(nestedObj.level1.level2 !== copiedNestedObj.level1.level2, "Test 2.1 FAILED: Nested object 'level2' is not a new instance.");
  console.assert(copiedNestedObj.level1.level2.value === "deep", "Test 2.1 FAILED: Deep value mismatch.");
  console.assert(copiedNestedObj.level1.b === 2, "Test 2.1 FAILED: Sibling value mismatch.");
  console.assert(copiedNestedObj.c === 3, "Test 2.1 FAILED: Top level value mismatch.");
   if (nestedObj !== copiedNestedObj && 
      nestedObj.level1 !== copiedNestedObj.level1 &&
      nestedObj.level1.level2 !== copiedNestedObj.level1.level2 &&
      copiedNestedObj.level1.level2.value === "deep" &&
      copiedNestedObj.level1.b === 2 &&
      copiedNestedObj.c === 3) {
    console.log("Test 2.1 PASSED");
  } else {
    console.error("Test 2.1 FAILED - Check assertions above.");
  }

  // 2.2 Array of objects
  console.log("\n2.2 Testing array of objects...");
  const arrOfObjs = [{ id: 1, name: "A" }, { id: 2, name: "B" }];
  const copiedArrOfObjs = newDeepCopy(arrOfObjs);
  console.log("Original Array of Objects:", arrOfObjs);
  console.log("Copied Array of Objects:", copiedArrOfObjs);
  console.assert(arrOfObjs !== copiedArrOfObjs, "Test 2.2 FAILED: Copied array is not a new instance.");
  console.assert(arrOfObjs.length === copiedArrOfObjs.length, "Test 2.2 FAILED: Array length mismatch.");
  console.assert(arrOfObjs[0] !== copiedArrOfObjs[0], "Test 2.2 FAILED: First object in array is not a new instance.");
  console.assert(copiedArrOfObjs[0].id === 1 && copiedArrOfObjs[0].name === "A", "Test 2.2 FAILED: First object properties mismatch.");
  console.assert(arrOfObjs[1] !== copiedArrOfObjs[1], "Test 2.2 FAILED: Second object in array is not a new instance.");
  console.assert(copiedArrOfObjs[1].id === 2 && copiedArrOfObjs[1].name === "B", "Test 2.2 FAILED: Second object properties mismatch.");
  if (arrOfObjs !== copiedArrOfObjs && arrOfObjs.length === copiedArrOfObjs.length &&
      arrOfObjs[0] !== copiedArrOfObjs[0] && copiedArrOfObjs[0].id === 1 && copiedArrOfObjs[0].name === "A" &&
      arrOfObjs[1] !== copiedArrOfObjs[1] && copiedArrOfObjs[1].id === 2 && copiedArrOfObjs[1].name === "B") {
    console.log("Test 2.2 PASSED");
  } else {
    console.error("Test 2.2 FAILED - Check assertions above.");
  }
  
  // 2.3 Object containing an array of objects
  console.log("\n2.3 Testing object containing an array of objects...");
  const objWithArrOfObjs = { title: "List", items: [{ task: "Task 1" }, { task: "Task 2" }] };
  const copiedObjWithArrOfObjs = newDeepCopy(objWithArrOfObjs);
  console.log("Original Object with Array of Objects:", objWithArrOfObjs);
  console.log("Copied Object with Array of Objects:", copiedObjWithArrOfObjs);
  console.assert(objWithArrOfObjs !== copiedObjWithArrOfObjs, "Test 2.3 FAILED: Copied object is not new.");
  console.assert(objWithArrOfObjs.items !== copiedObjWithArrOfObjs.items, "Test 2.3 FAILED: Nested array 'items' is not new.");
  console.assert(objWithArrOfObjs.items[0] !== copiedObjWithArrOfObjs.items[0], "Test 2.3 FAILED: First object in nested array is not new.");
  console.assert(copiedObjWithArrOfObjs.items[0].task === "Task 1", "Test 2.3 FAILED: Property of first object in nested array mismatch.");
  if (objWithArrOfObjs !== copiedObjWithArrOfObjs &&
      objWithArrOfObjs.items !== copiedObjWithArrOfObjs.items &&
      objWithArrOfObjs.items[0] !== copiedObjWithArrOfObjs.items[0] &&
      copiedObjWithArrOfObjs.items[0].task === "Task 1") {
    console.log("Test 2.3 PASSED");
  } else {
    console.error("Test 2.3 FAILED - Check assertions above.");
  }

  // 3. Set Handling
  console.log("\n--- Test 3: Set Handling ---");
  // 3.1 Set with primitive values
  console.log("3.1 Testing Set with primitive values...");
  const primitiveSet = new Set([1, "hello", true]);
  const copiedPrimitiveSet = newDeepCopy(primitiveSet);
  console.log("Original Primitive Set:", primitiveSet);
  console.log("Copied Primitive Set:", copiedPrimitiveSet);
  console.assert(primitiveSet !== copiedPrimitiveSet, "Test 3.1 FAILED: Copied Set is not a new instance.");
  console.assert(setsAreEqual(primitiveSet, copiedPrimitiveSet), "Test 3.1 FAILED: Set contents are not equal.");
  if (primitiveSet !== copiedPrimitiveSet && setsAreEqual(primitiveSet, copiedPrimitiveSet)) {
    console.log("Test 3.1 PASSED");
  } else {
    console.error("Test 3.1 FAILED - Check assertions above.");
  }

  // 3.2 Set with objects
  console.log("\n3.2 Testing Set with objects...");
  const objInSet1 = { id: 1 };
  const objInSet2 = { id: 2 };
  const objectSet = new Set([objInSet1, objInSet2]);
  const copiedObjectSet = newDeepCopy(objectSet);
  console.log("Original Object Set:", objectSet);
  console.log("Copied Object Set:", copiedObjectSet);
  console.assert(objectSet !== copiedObjectSet, "Test 3.2 FAILED: Copied Set is not a new instance.");
  let originalSetValues = Array.from(objectSet);
  let copiedSetValues = Array.from(copiedObjectSet);
  console.assert(originalSetValues[0] !== copiedSetValues[0], "Test 3.2 FAILED: First object in Set is not a new instance.");
  console.assert(copiedSetValues[0].id === originalSetValues[0].id, "Test 3.2 FAILED: Property of first object in Set mismatch.");
  console.assert(originalSetValues[1] !== copiedSetValues[1], "Test 3.2 FAILED: Second object in Set is not a new instance.");
  console.assert(copiedSetValues[1].id === originalSetValues[1].id, "Test 3.2 FAILED: Property of second object in Set mismatch.");
  if (objectSet !== copiedObjectSet && 
      originalSetValues.length === copiedSetValues.length &&
      originalSetValues[0] !== copiedSetValues[0] && copiedSetValues[0].id === originalSetValues[0].id &&
      originalSetValues[1] !== copiedSetValues[1] && copiedSetValues[1].id === originalSetValues[1].id
      ) {
    console.log("Test 3.2 PASSED");
  } else {
    console.error("Test 3.2 FAILED - Check assertions above. Note: Set element order might affect this simple check if elements were complex.");
  }


  // 4. Map Handling
  console.log("\n--- Test 4: Map Handling ---");
  // 4.1 Map with primitive keys and values
  console.log("4.1 Testing Map with primitive keys and values...");
  const primitiveMap = new Map([["a", 1], ["b", "two"]]);
  const copiedPrimitiveMap = newDeepCopy(primitiveMap);
  console.log("Original Primitive Map:", primitiveMap);
  console.log("Copied Primitive Map:", copiedPrimitiveMap);
  console.assert(primitiveMap !== copiedPrimitiveMap, "Test 4.1 FAILED: Copied Map is not a new instance.");
  console.assert(mapsAreEqual(primitiveMap, copiedPrimitiveMap), "Test 4.1 FAILED: Map contents are not equal.");
   if (primitiveMap !== copiedPrimitiveMap && mapsAreEqual(primitiveMap, copiedPrimitiveMap)) {
    console.log("Test 4.1 PASSED");
  } else {
    console.error("Test 4.1 FAILED - Check assertions above.");
  }

  // 4.2 Map with objects as values
  console.log("\n4.2 Testing Map with objects as values...");
  const objValueMap = new Map([["key1", { val: "A" }], ["key2", { val: "B" }]]);
  const copiedObjValueMap = newDeepCopy(objValueMap);
  console.log("Original Object Value Map:", objValueMap);
  console.log("Copied Object Value Map:", copiedObjValueMap);
  console.assert(objValueMap !== copiedObjValueMap, "Test 4.2 FAILED: Copied Map is not a new instance.");
  console.assert(objValueMap.get("key1") !== copiedObjValueMap.get("key1"), "Test 4.2 FAILED: Object value for 'key1' is not a new instance.");
  console.assert(copiedObjValueMap.get("key1").val === "A", "Test 4.2 FAILED: Property of object value for 'key1' mismatch.");
  console.assert(objValueMap.get("key2") !== copiedObjValueMap.get("key2"), "Test 4.2 FAILED: Object value for 'key2' is not a new instance.");
  console.assert(copiedObjValueMap.get("key2").val === "B", "Test 4.2 FAILED: Property of object value for 'key2' mismatch.");
  if (objValueMap !== copiedObjValueMap &&
      objValueMap.get("key1") !== copiedObjValueMap.get("key1") && copiedObjValueMap.get("key1").val === "A" &&
      objValueMap.get("key2") !== copiedObjValueMap.get("key2") && copiedObjValueMap.get("key2").val === "B") {
    console.log("Test 4.2 PASSED");
  } else {
    console.error("Test 4.2 FAILED - Check assertions above.");
  }

  // 5. Functions
  console.log("\n--- Test 5: Functions ---");
  console.log("5.1 Testing object with a function property...");
  const funcObj = { method: function() { return "original"; }, val: 10 };
  const copiedFuncObj = newDeepCopy(funcObj);
  console.log("Original Function Object:", funcObj);
  console.log("Copied Function Object:", copiedFuncObj);
  console.assert(funcObj !== copiedFuncObj, "Test 5.1 FAILED: Copied object is not a new instance.");
  console.assert(funcObj.method === copiedFuncObj.method, "Test 5.1 FAILED: Function property 'method' is not copied by reference.");
  console.assert(copiedFuncObj.val === 10, "Test 5.1 FAILED: Other property 'val' mismatch.");
  console.assert(copiedFuncObj.method() === "original", "Test 5.1 FAILED: Copied method does not behave as original.");
  if (funcObj !== copiedFuncObj && funcObj.method === copiedFuncObj.method && copiedFuncObj.val === 10) {
    console.log("Test 5.1 PASSED (Functions are copied by reference as expected)");
  } else {
    console.error("Test 5.1 FAILED - Check assertions above.");
  }

  // 6. Circular References
  console.log("\n--- Test 6: Circular References ---");
  // 6.1 Single object circular reference
  console.log("6.1 Testing single object circular reference (objA.circularRef = objA)...");
  const objA = { name: "A" };
  objA.circularRef = objA;
  const copiedA = newDeepCopy(objA);
  console.log("Original objA (structure with circular ref):", objA.name, "circularRef points to self:", objA.circularRef === objA);
  console.log("Copied copiedA (structure with circular ref):", copiedA.name, "circularRef points to self:", copiedA.circularRef === copiedA);
  console.assert(objA !== copiedA, "Test 6.1 FAILED: Copied object is not a new instance.");
  console.assert(copiedA.circularRef === copiedA, "Test 6.1 FAILED: Copied object's circular reference does not point to itself.");
  console.assert(copiedA.name === "A", "Test 6.1 FAILED: Property 'name' mismatch.");
  if (objA !== copiedA && copiedA.circularRef === copiedA && copiedA.name === "A") {
    console.log("Test 6.1 PASSED");
  } else {
    console.error("Test 6.1 FAILED - Check assertions above.");
  }

  // 6.2 Mutual circular reference
  console.log("\n6.2 Testing mutual circular reference (objB.ref = objC, objC.ref = objB)...");
  const objB = { name: "B" };
  const objC = { name: "C" };
  objB.ref = objC;
  objC.ref = objB;
  const copiedB = newDeepCopy(objB);
  const copiedC = copiedB.ref; 
  console.log("Original objB name:", objB.name, "objB.ref.name:", objB.ref.name, "objC.ref.name:", objC.ref.name);
  console.log("Copied copiedB name:", copiedB.name, "copiedB.ref.name:", copiedB.ref.name, "copiedC.ref.name:", copiedC.ref.name);
  console.assert(objB !== copiedB, "Test 6.2 FAILED: copiedB is not a new instance.");
  console.assert(objC !== copiedC, "Test 6.2 FAILED: copiedC (copiedB.ref) is not a new instance.");
  console.assert(copiedB.ref === copiedC, "Test 6.2 FAILED: copiedB.ref does not point to copiedC.");
  console.assert(copiedC.ref === copiedB, "Test 6.2 FAILED: copiedC.ref does not point back to copiedB.");
  console.assert(copiedB.name === "B", "Test 6.2 FAILED: copiedB.name mismatch.");
  console.assert(copiedC.name === "C", "Test 6.2 FAILED: copiedC.name mismatch.");
  if (objB !== copiedB && objC !== copiedC && copiedB.ref === copiedC && copiedC.ref === copiedB && copiedB.name === "B" && copiedC.name === "C") {
    console.log("Test 6.2 PASSED");
  } else {
    console.error("Test 6.2 FAILED - Check assertions above.");
  }

  // 7. Provided Test Data
  console.log("\n--- Test 7: Provided Test Data (complex object) ---");
  const copiedData = newDeepCopy(data);
  console.log("Original 'data' object:", data);
  console.log("Copied 'copiedData' object:", copiedData);

  console.assert(data !== copiedData, "Test 7 FAILED: copiedData is not a new instance of data.");
  // Primitives
  console.assert(data.age === copiedData.age, "Test 7 FAILED: 'age' mismatch.");
  console.assert(data.name === copiedData.name, "Test 7 FAILED: 'name' mismatch.");
  // Array of primitives (education)
  console.assert(data.education !== copiedData.education, "Test 7 FAILED: 'education' array is not a new instance.");
  console.assert(data.education.length === copiedData.education.length, "Test 7 FAILED: 'education' array length mismatch.");
  console.assert(data.education[0] === copiedData.education[0], "Test 7 FAILED: 'education' array element mismatch.");
  // Set (likesFood)
  console.assert(data.likesFood !== copiedData.likesFood, "Test 7 FAILED: 'likesFood' Set is not a new instance.");
  console.assert(setsAreEqual(data.likesFood, copiedData.likesFood), "Test 7 FAILED: 'likesFood' Set content mismatch.");
  // Array of objects (friends)
  console.assert(data.friends !== copiedData.friends, "Test 7 FAILED: 'friends' array is not a new instance.");
  console.assert(data.friends.length === copiedData.friends.length, "Test 7 FAILED: 'friends' array length mismatch.");
  console.assert(data.friends[0] !== copiedData.friends[0], "Test 7 FAILED: First friend object is not a new instance.");
  console.assert(data.friends[0].name === copiedData.friends[0].name, "Test 7 FAILED: First friend's name mismatch.");
  // Nested object (work)
  console.assert(data.work !== copiedData.work, "Test 7 FAILED: 'work' object is not a new instance.");
  console.assert(data.work.project !== copiedData.work.project, "Test 7 FAILED: 'work.project' object is not a new instance.");
  console.assert(data.work.project.name === copiedData.work.project.name, "Test 7 FAILED: 'work.project.name' mismatch.");
  console.assert(data.work.project.obtain !== copiedData.work.project.obtain, "Test 7 FAILED: 'work.project.obtain' array not new.");
  console.assert(data.work.project.obtain[0] === copiedData.work.project.obtain[0], "Test 7 FAILED: 'work.project.obtain' element mismatch.");
  // Function (play)
  console.assert(data.play === copiedData.play, "Test 7 FAILED: 'play' function is not copied by reference.");

  // A more comprehensive check for overall success for test 7
  let test7Passed = data !== copiedData &&
                    data.age === copiedData.age &&
                    data.education !== copiedData.education && data.education.every((e, i) => e === copiedData.education[i]) &&
                    data.likesFood !== copiedData.likesFood && setsAreEqual(data.likesFood, copiedData.likesFood) &&
                    data.friends !== copiedData.friends && data.friends[0] !== copiedData.friends[0] && data.friends[0].name === copiedData.friends[0].name &&
                    data.work !== copiedData.work && data.work.project !== copiedData.work.project && data.work.project.name === copiedData.work.project.name &&
                    data.work.project.obtain !== copiedData.work.project.obtain && data.work.project.obtain[0] === copiedData.work.project.obtain[0] &&
                    data.play === copiedData.play;

  if (test7Passed) {
    console.log("Test 7 (Provided Data) PASSED (based on selected checks)");
  } else {
    console.error("Test 7 (Provided Data) FAILED - Check assertions above.");
  }

  console.log("\n--- Test Suite Finished ---");
}

// Run all tests
runTests();

// Example of how to test circular references in the provided 'data' object if they were added
// For instance, if we add a circular reference to 'data':
// data.myself = data;
// const copiedDataWithCircular = newDeepCopy(data);
// console.log("\n--- Testing 'data' with added circular reference ---");
// console.assert(copiedDataWithCircular.myself === copiedDataWithCircular, "Test FAILED: Circular reference in 'data.myself' not maintained.");
// if (copiedDataWithCircular.myself === copiedDataWithCircular) {
//   console.log("Test for 'data.myself' circular reference PASSED");
// } else {
//   console.error("Test for 'data.myself' circular reference FAILED");
// }
// delete data.myself; // Clean up
// delete copiedDataWithCircular.myself;
