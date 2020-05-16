const Store = require('electron-store');

const store = new Store();

const Get = (key, d={}) => {
  return store.get(key, d);
};
const Save = (key, value) => {
  return store.set(key, value);
};
const Del = (key) => {
  return store.delete(key);
};

const DataStore = {
  Save,
  Get,
  Del
};

export default DataStore;
