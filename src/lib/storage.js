/**
 * LocalStorage abstraction layer.
 * This will be swapped out for Supabase later.
 * All data operations go through this module.
 */

const PREFIX = 'dashboard_';

function getKey(collection) {
  return `${PREFIX}${collection}`;
}

/**
 * Get all items from a collection
 */
export function getAll(collection) {
  try {
    const data = localStorage.getItem(getKey(collection));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Get a single item by ID
 */
export function getById(collection, id) {
  const items = getAll(collection);
  return items.find(item => item.id === id) || null;
}

/**
 * Add an item to a collection
 */
export function add(collection, item) {
  const items = getAll(collection);
  items.push(item);
  localStorage.setItem(getKey(collection), JSON.stringify(items));
  return item;
}

/**
 * Update an item in a collection
 */
export function update(collection, id, updates) {
  const items = getAll(collection);
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(getKey(collection), JSON.stringify(items));
  return items[index];
}

/**
 * Remove an item from a collection
 */
export function remove(collection, id) {
  const items = getAll(collection);
  const filtered = items.filter(item => item.id !== id);
  localStorage.setItem(getKey(collection), JSON.stringify(filtered));
  return true;
}

/**
 * Replace all items in a collection
 */
export function setAll(collection, items) {
  localStorage.setItem(getKey(collection), JSON.stringify(items));
  return items;
}

/**
 * Get/set a single value (for settings, etc.)
 */
export function getValue(key) {
  try {
    const data = localStorage.getItem(getKey(key));
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setValue(key, value) {
  localStorage.setItem(getKey(key), JSON.stringify(value));
  return value;
}

/**
 * Clear all dashboard data
 */
export function clearAll() {
  Object.keys(localStorage)
    .filter(key => key.startsWith(PREFIX))
    .forEach(key => localStorage.removeItem(key));
}
