import 'core-js/fn/array/is-array';
import http from './http';

export const HTTPREQUEST_CLEAR = 'HTTPREQUEST_CLEAR';

export const HTTPREQUEST_INITIATE = 'HTTPREQUEST_INITIATE';
export const HTTPREQUEST_COMPLETE = 'HTTPREQUEST_COMPLETE';
export const HTTPREQUEST_ERROR = 'HTTPREQUEST_ERROR';

let actions = {};

// Dispatch action creators. Can be used separately as part of a multi-step process.

actions.requestInitiate = (type = HTTPREQUEST_INITIATE, action = {}) => ({
  type,
  status: 'initiate',
  pending: true,
  ...action
});

actions.requestComplete = (type = HTTPREQUEST_COMPLETE, action = {}) => ({
  type,
  status: 'complete',
  pending: false,
  receivedAt: (new Date()).toISOString(),
  ...action
});

actions.requestError = (type = HTTPREQUEST_ERROR, action = {}) => ({
  type,
  status: 'error',
  pending: false,
  ...action
});

// Main request method

actions.request = (type, options = {}) => {
  const {
    method = 'GET',
    path = '',
    query = {},
    body,
    params // Action parameters (additional to the request info)
  } = options;

  const typeInitiate = (Array.isArray(type) && type[0]) || type || HTTPREQUEST_INITIATE;
  const typeComplete = (Array.isArray(type) && type[1]) || type || HTTPREQUEST_COMPLETE;
  const typeError = (Array.isArray(type) && type[2]) || type || HTTPREQUEST_ERROR;

  return async dispatch => {
    dispatch(actions.requestInitiate(typeInitiate, {
      request: { method, path, query, body },
      params
    }));

    try {
      const { statusCode, response } = await http.request(options);

      dispatch(actions.requestComplete(typeComplete, {
        statusCode,
        error: null,
        response,
        params
      }));

      return {
        statusCode,
        response,
        error: null
      };

    } catch (e) {
      dispatch(actions.requestError(typeError, {
        statusCode: e.statusCode,
        error: {
          message: e.message,
          details: e.details,
          stack: e.stack,
          connectionError: e.connectionError
        },
        params
      }));
    }
  };
};

actions.get = (type, path, query, options = {}) =>
  actions.request(type, {
    ...options,
    method: 'GET',
    path,
    query
  });

actions.post = (type, path, body, options = {}) =>
  actions.request(type, {
    ...options,
    method: 'POST',
    path,
    body
  });

actions.put = (type, path, body, options = {}) =>
  actions.request(type, {
    ...options,
    method: 'PUT',
    path,
    body
  });

actions.patch = (type, path, body, options = {}) =>
  actions.request(type, {
    ...options,
    method: 'PATCH',
    path,
    body
  });

actions.delete = (type, path, query, options = {}) =>
  actions.request(type, {
    ...options,
    method: 'DELETE',
    path,
    query
  });

export default actions;
