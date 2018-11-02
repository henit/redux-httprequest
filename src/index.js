import actions from './actions';
import http from './http';
import { initializeState, requestState, pathRequestState, loadState, pathLoadState, changeState,
  pathChangeState, clearState, pathClearState } from './reducers';

const all = baseUrl => ({
  // Direct http requests
  request: (options = {}) => http.request({ ...options, baseUrl }),
  get: (path, query, options = {}) => http.get(path, query, { ...options, baseUrl }),
  post: (path, body, options = {}) => http.post(path, body, { ...options, baseUrl }),
  put: (path, body, options = {}) => http.put(path, body, { ...options, baseUrl }),
  patch: (path, body, options = {}) => http.patch(path, body, { ...options, baseUrl }),
  delete: (path, query, options = {}) => http.delete(path, query, { ...options, baseUrl }),

  // Actions
  requestThunk: (type, options = {}) => actions.request(type, { ...options, baseUrl }),
  getThunk: (type, path, query, options = {}) => actions.get(type, path, query, { ...options, baseUrl }),
  postThunk: (type, path, body, options = {}) => actions.post(type, path, body, { ...options, baseUrl }),
  putThunk: (type, path, body, options = {}) => actions.put(type, path, body, { ...options, baseUrl }),
  patchThunk: (type, path, body, options = {}) => actions.patch(type, path, body, { ...options, baseUrl }),
  deleteThunk: (type, path, query, options = {}) => actions.delete(type, path, query, { ...options, baseUrl })
});

// export default {
export {
  // Actions
  all,
  http,
  actions,

  // Reducers
  initializeState,
  requestState,
  pathRequestState,
  loadState,
  pathLoadState,
  changeState,
  pathChangeState,
  clearState,
  pathClearState
};

export default all;
