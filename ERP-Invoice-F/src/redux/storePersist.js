function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    console.error(e.message);
    return false;
  }
  return true;
}

export const localStorageHealthCheck = async () => {
  for (var i = 0; i < localStorage.length; ++i) {
    try {
      const result = window.localStorage.getItem(localStorage.key(i));
      if (!isJsonString(result)) {
        window.localStorage.removeItem(localStorage.key(i));
      }
      if (result && Object.keys(localStorage.key(i)).length == 0) {
        window.localStorage.removeItem(localStorage.key(i));
      }
    } catch (error) {
      window.localStorage.clear();
      console.error('window.localStorage Exception occurred:', error);
    }
  }
  for (var j = 0; j < sessionStorage.length; ++j) {
    try {
      const result = window.sessionStorage.getItem(sessionStorage.key(j));
      if (!isJsonString(result)) {
        window.sessionStorage.removeItem(sessionStorage.key(j));
      }
      if (result && Object.keys(sessionStorage.key(j)).length == 0) {
        window.sessionStorage.removeItem(sessionStorage.key(j));
      }
    } catch (error) {
      window.sessionStorage.clear();
      console.error('window.sessionStorage Exception occurred:', error);
    }
  }
};

export const storePersist = {
  set: (key, state, remember = true) => {
    if (remember) {
      window.localStorage.setItem(key, JSON.stringify(state));
      window.sessionStorage.removeItem(key);
    } else {
      window.sessionStorage.setItem(key, JSON.stringify(state));
      window.localStorage.removeItem(key);
    }
  },
  get: (key) => {
    let result = window.sessionStorage.getItem(key);
    if (!result) {
      result = window.localStorage.getItem(key);
    }
    
    if (!result) {
      return false;
    } else {
      if (!isJsonString(result)) {
        window.localStorage.removeItem(key);
        window.sessionStorage.removeItem(key);
        return false;
      } else return JSON.parse(result);
    }
  },
  remove: (key) => {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
  getAll: () => {
    return {
      ...window.sessionStorage,
      ...window.localStorage,
    };
  },
  clear: () => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  },
};

export default storePersist;
