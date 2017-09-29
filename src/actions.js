import 'whatwg-fetch';

export const HTTPREQUEST_CLEAR = 'HTTPREQUEST_CLEAR';
export const STATE_PENDING = 'STATE_PENDING';
export const STATE_COMPLETE = 'STATE_COMPLETE';
export const STATE_FAILED = 'STATE_FAILED';

let actions = {};

actions._fetch = (...args) => fetch(...args);

actions.request = (params = {}) => {
    const {
        baseUrl,
        headers,
        method = 'GET',
        path = '',
        query = {},
        body,
        preserve = false
        // priority = 3
    } = params;
    const requestId = params.requestId || `${method} ${path || '/'}`;
    const subject = params.subject || requestId.replace(' ', '_').replace('/', '_');

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
            type: `HTTPREQUEST_${subject}_INITIATE`,
            requestId,
            params
        });

        let fetchHeaders = new Headers();
        if (headers) {
            for (let name in headers) {
                fetchHeaders.append(name, headers[name]);
            }
        }

        const res = await actions
            ._fetch(url, {
                headers: fetchHeaders,
                method: method || 'GET',
                body: body ? JSON.stringify(body) : undefined,
                credentials: 'include'
            })
            .catch(e => {
                let error = new Error('Can\'t connect to url.');
                error.details = e.message;
                error.type = 'ConnectionError';

                dispatch({
                    type: `HTTPREQUEST_${subject}_ERROR`,
                    requestId,
                    params,
                    error
                });
            });

        if (!res) {
            return;
        }

        const contentType = res.headers.get('Content-Type');
        const status = res.status;

        const isJson = Boolean(contentType && (
            contentType.includes('application/json') || contentType.includes('application/hal+json')
        ));

        if (status >= 200 && status <= 290) {
            // Success response
            const response = await (isJson ? res.json() : res.text());

            dispatch({
                type: `HTTPREQUEST_${subject}_COMPLETE`,
                receivedAt: (new Date()).toISOString(),
                requestId,
                status,
                response,
                params
            });

            return {
                status,
                // When preserving data, it should be read from the state
                response: preserve ? null : response
            };

        } else {
            // Error
            if (isJson) {
                const body = await res.json();

                // Parse error response
                let error = new Error(body.message || res.statusText);
                error.status = status || body.status;
                if (body.details) {
                    error.details = body.details;
                }

                dispatch({
                    type: `HTTPREQUEST_${subject}_ERROR`,
                    requestId,
                    status,
                    params,
                    error
                });

            } else {
                // Error response
                let error = new Error(res.statusText || 'Unknown request error');
                error.status = status;

                dispatch({
                    type: `HTTPREQUEST_${subject}_ERROR`,
                    requestId,
                    status,
                    params,
                    error
                });
            }
        }
    };
};

actions.jsonRequest = (params = {}) => {
    return actions.request({
        ...params,
        headers: {
            'Content-Type': 'application/json',
            ...(params.headers || {})
        }
    });
};

actions.getSingularRestHal = (baseUrl, restName, entityId, requestId) => {
    return actions.jsonRequest({
        baseUrl,
        subject: `ONE_${restName.toUpperCase()}`,
        path: `${restName}/${entityId}`,
        preserve: true,
        requestId
    });
};

actions.getPluralRestHal = (baseUrl, restName, query = {}, requestId) => {
    return actions.jsonRequest({
        baseUrl,
        subject: restName.toUpperCase(),
        path: `${restName}/`,
        responsePath: `_embedded.${restName}`,
        preserve: true,
        requestId,
        query
    });
};

export default actions;
