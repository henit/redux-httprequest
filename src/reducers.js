import _get from 'lodash/fp/get';
import _set from 'lodash/fp/set';

/**
 * Make initial state store data
 * @return {object} Initial state
 */
export const initializeState = () => ({
    data: null,
    pending: null,
    error: null
});

/**
 * Make state object for an action in the process of a HTTP request
 * @param {object} existingState Existing state (request object)
 * @param {object} action Action
 * @param {string} responsePath Path in response data where the actual data is located
 * @return {object} State
 */
export const requestState = (existingState, action = {}, responsePath = '') => {
    return {
        ...existingState,
        data: _get(`response${responsePath ? `.${responsePath}` : ''}`, action) || existingState.data,
        receivedAt: action.receivedAt,
        statusCode: action.statusCode,
        error: action.error,
        connectionError: action.connectionError,
        pending: action.pending || false
    };
};

/* Request state for a specific state path */
export const pathRequestState = (path, existingState, action, responsePath) => {
    return _set(path, requestState(_get(path, existingState), action, responsePath), existingState);
};

/**
 * Load an existing dataset onto a request state location. Like when loading
 * an entity from a preloaded list onto a single entity state in the store.
 * @param {object|array} data Data to load
 * @return {object} State
 */
export const loadState = (data = null) => {
    return {
        data,
        error: null,
        pending: false
    };
};

/* Request state for a specific state path */
export const pathLoadState = (path, existingState, data) => {
    return _set(path, loadState(data), existingState);
};

/**
 * Change the data of a state object
 * @param {object} existingState The existing state object
 * @param {string} path Path to position of changed value
 * @param {mixed} value New value
 * @return {object} State
 */
export const changeState = (existingState = {}, path, value) => {
    return {
        ...existingState,
        data: _set(path, value, existingState.data)
    };
};

export const pathChangeState = (statePath, state, path, value) => {
    return _set(statePath, changeState(_get(statePath, state), path, value), state);
};

/**
 * Clear a state dataset.
 * @return {object} State
 */
export const clearState = () => {
    return {
        data: null,
        error: null,
        pending: false
    };
};

/* Load state for a specific state path */
export const pathClearState = (path, existingState) => {
    return _set(path, clearState(), existingState);
};
