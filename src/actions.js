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

actions.request = (type, params = {}) => {
    const {
        baseUrl,
        headers,
        method = 'GET',
        path = '',
        query = {},
        body
    } = params;

    const typeInitiate = (Array.isArray(type) && type[0]) || type || HTTPREQUEST_INITIATE;
    const typeComplete = (Array.isArray(type) && type[1]) || type || HTTPREQUEST_COMPLETE;
    const typeError = (Array.isArray(type) && type[2]) || type || HTTPREQUEST_ERROR;

    return async (dispatch, getState) => {
        const url = baseUrl
            .concat(path)
            .concat(Object.keys(query).length > 0 ?
                '?' + Object.keys(query)
                    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
                    .join('&')
                :
                '');

        dispatch({
            type: typeInitiate,
            status: 'initiate',
            pending: true,
            request: {
                method,
                path,
                query,
                body
            }
        });

        let fetchHeaders = new Headers();
        if (headers) {
            for (let name in headers) {
                fetchHeaders.append(name, headers[name]);
            }
        }
        if (!headers || !headers['Content-Type']) {
            fetchHeaders.append('Content-Type', 'application/json');
        }

        let res;
        try {
            res = await actions._fetch(url, {
                headers: fetchHeaders,
                method,
                body: body ? JSON.stringify(body) : undefined,
                credentials: 'include'
            });
        } catch (e) {
            /*let error = new Error('Can\'t connect to url.');
            error.details = e.message;
            error.type = 'ConnectionError';
            throw error;*/

            dispatch({
                type: typeError,
                status: 'error',
                pending: false,
                statusCode: null,
                connectionError: true,
                error: {
                    message: 'Can\'t connect to url.'
                }
            });
        }

        if (!res) {
            return;
        }

        const contentType = res.headers.get('Content-Type');
        const statusCode = res.status;

        const isJson = Boolean(contentType && (
            contentType.includes('application/json') || contentType.includes('application/hal+json')
        ));

        const response = await (isJson ? res.json() : res.text());

        if (statusCode >= 200 && statusCode <= 290) {
            // Success response
            dispatch({
                type: typeComplete,
                status: 'complete',
                receivedAt: (new Date()).toISOString(),
                pending: false,
                statusCode,
                connectionError: false,
                response,
                error: null
            });

        } else {
            // Error response
            if (isJson) {
                dispatch({
                    type: typeError,
                    status: 'error',
                    pending: false,
                    statusCode,
                    connectionError: false,
                    error: {
                        message: response.message || res.statusText,
                        details: response.details,
                        stack: response.stack
                    }
                });

            } else {
                dispatch({
                    type: typeError,
                    status: 'error',
                    pending: false,
                    statusCode,
                    connectionError: false,
                    error: {
                        message: res.statusText || 'Unknown request error'
                    }
                });
            }
        }

        return {
            statusCode,
            response
        };
    };
};

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
        request: (type, params = {}) => actions.request(type, { ...params, baseUrl }),
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
