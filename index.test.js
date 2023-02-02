var cattojs = require("./index");
test("random float", () => {
  expect(typeof cattojs.random.float(1, 3)).toBe("number");
});
test("random int", () => {
  expect(typeof cattojs.random.int(1, 3)).toBe("number");
});
test("random range", () => {
  expect(typeof cattojs.random.range(1, 3)).toBe("number");
});
test("random bool", () => {
  expect(typeof cattojs.random.bool()).toBe("boolean");
});
test("html disable", () => {
  expect(cattojs.HTML.disable("<>")).toBe("&lt;&gt;");
});
test("array remove", () => {
  var arr = ["a", "b", "c"];
  expect(arr.remove(1)).toBe("b");
  expect(arr).toMatchObject(["a", "c"]);
});
test("array has", () => {
  var arr = ["a", "b", "c"];
  expect(arr.has("b")).toBeTruthy();
});
test("base64 encode", () => {
  expect(cattojs.Base64.encode("Test.")).toBe("VGVzdC4=");
});
test("base64 decode", () => {
  expect(cattojs.Base64.decode("VGVzdC4=")).toBe("Test.");
});
