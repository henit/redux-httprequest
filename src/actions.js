import 'core-js/fn/array/is-array';
import 'whatwg-fetch';

export const HTTPREQUEST_CLEAR = 'HTTPREQUEST_CLEAR';
export const STATE_PENDING = 'STATE_PENDING';
export const STATE_COMPLETE = 'STATE_COMPLETE';
export const STATE_FAILED = 'STATE_FAILED';

export const HTTPREQUEST_INITIATE = 'HTTPREQUEST_INITIATE';
export const HTTPREQUEST_COMPLETE = 'HTTPREQUEST_COMPLETE';
export const HTTPREQUEST_ERROR = 'HTTPREQUEST_ERROR';

let actions = {};

actions._fetch = (...args) => fetch(...args);

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
    baseUrl,
    headers,
    method = 'GET',
    path = '',
    query = {},
    body,
    credentials = 'include',
    contentType = 'application/json',
    params // Action parameters (additional to the request info)
  } = options;

  const typeInitiate = (Array.isArray(type) && type[0]) || type || HTTPREQUEST_INITIATE;
  const typeComplete = (Array.isArray(type) && type[1]) || type || HTTPREQUEST_COMPLETE;
  const typeError = (Array.isArray(type) && type[2]) || type || HTTPREQUEST_ERROR;

  return async dispatch => {
    const url = baseUrl
      .concat(path)
      .concat(Object.keys(query).length > 0 ?
        '?' + Object.keys(query)
          .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
          .join('&')
        :
        '');

    dispatch(actions.requestInitiate(typeInitiate, {
      request: { method, path, query, body },
      params
    }));

    let fetchHeaders = new Headers();
    if (headers) {
      for (let name in headers) {
        fetchHeaders.append(name, headers[name]);
      }
    }
    if (contentType && (!headers || !headers['Content-Type'])) {
      fetchHeaders.append('Content-Type', contentType);
    }

    let res;
    try {
      res = await actions._fetch(url, {
        headers: fetchHeaders,
        method,
        credentials,
        body: (contentType && contentType.includes('json')) ? JSON.stringify(body) : body
      });
    } catch (e) {
      const error = {
        connectionError: true,
        message: 'Can\'t connect to url.'
      };
      dispatch(actions.requestError(typeError, {
        statusCode: null,
        error,
        params
      }));

      // return {
      throw {
        statusCode: null,
        response: null,
        error
      };
    }

    if (!res) {
      // return;
      throw {
        error: 'No result from fetch'
      };
    }

    const responseContentType = res.headers.get('Content-Type');
    const statusCode = res.status;

    const isJson = Boolean(responseContentType && (
      responseContentType.includes('application/json') || responseContentType.includes('application/hal+json')
    ));

    const response = await (isJson ? res.json() : res.text());

    if (statusCode >= 200 && statusCode <= 290) {
      // Success response
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

    } else {
      // Error response
      if (isJson) {
        const error = {
          message: response.message || res.statusText,
          details: response.details,
          stack: response.stack,
          connectionError: false,
          statusCode
        };
        dispatch(actions.requestError(typeError, {
          statusCode,
          error,
          params
        }));

        // return {
        throw {
          statusCode,
          response,
          error
        };

      } else {
        const error = {
          message: res.statusText || 'Unknown request error',
          connectionError: false,
          statusCode
        };
        dispatch(actions.requestError(typeError, {
          statusCode,
          error,
          params
        }));

        // return {
        throw {
          statusCode,
          response,
          error
        };
      }
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

/**
 * REST Api composed functions
 */
actions.rest = {};

actions.rest.postOne = (baseUrl, type, restName, props) => {
  return actions.request(type, {
    baseUrl,
    method: 'POST',
    path: `${restName}/`,
    body: props
  });
};

actions.rest.getOne = (baseUrl, type, restName, entityId) => {
  return actions.request(type, {
    baseUrl,
    method: 'GET',
    path: `${restName}/${entityId}`
  });
};

actions.rest.getMany = (baseUrl, type, restName, query = {}) => {
  return actions.request(type, {
    baseUrl,
    method: 'GET',
    path: `${restName}/`,
    query
  });
};

actions.rest.putOne = (baseUrl, type, restName, entityId, props) => {
  return actions.request(type, {
    baseUrl,
    method: 'PUT',
    path: `${restName}/${entityId}`,
    body: props
  });
};

actions.rest.deleteOne = (baseUrl, type, restName, entityId) => {
  return actions.request(type, {
    baseUrl,
    method: 'DELETE',
    path: `${restName}/${entityId}`
  });
};


actions.all = baseUrl => {
  return {
    requestInitiate: actions.requestInitiate,
    requestComplete: actions.requestComplete,
    requestError: actions.requestError,
    request: (type, options = {}) => actions.request(type, { ...options, baseUrl }),
    get: (type, path, query, options = {}) => actions.get(type, path, query, { ...options, baseUrl }),
    post: (type, path, body, options = {}) => actions.post(type, path, body, { ...options, baseUrl }),
    put: (type, path, body, options = {}) => actions.put(type, path, body, { ...options, baseUrl }),
    patch: (type, path, body, options = {}) => actions.patch(type, path, body, { ...options, baseUrl }),
    delete: (type, path, query, options = {}) => actions.delete(type, path, query, { ...options, baseUrl }),

    rest: {
      getOne: (...args) => actions.rest.getOne(baseUrl, ...args),
      getMany: (...args) => actions.rest.getMany(baseUrl, ...args),
      postOne: (...args) => actions.rest.postOne(baseUrl, ...args),
      putOne: (...args) => actions.rest.putOne(baseUrl, ...args),
      deleteOne: (...args) => actions.rest.deleteOne(baseUrl, ...args)
    }
  };
};

export default actions;
