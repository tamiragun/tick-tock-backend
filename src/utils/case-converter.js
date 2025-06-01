// Case conversion utilities
const toCamelCase = (str) => str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
const toSnakeCase = (str) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const convertKeysToSnakeCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToSnakeCase);
  }
  if (obj !== null && obj.constructor === Object) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        toSnakeCase(key),
        convertKeysToSnakeCase(value)
      ])
    );
  }
  return obj;
};

const convertKeysToCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase);
  }
  if (obj !== null && obj.constructor === Object) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        toCamelCase(key),
        convertKeysToCamelCase(value)
      ])
    );
  }
  return obj;
};

export {
  toCamelCase,
  toSnakeCase,
  convertKeysToSnakeCase,
  convertKeysToCamelCase
}; 