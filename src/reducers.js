import _get from 'lodash/fp/get';
import _set from 'lodash/fp/set';

/**
 * Make initial state store data
 * @return {object} Initial state
 */
export const initializeState = () => ({
    data: null,
    pending: false,
    error: null
});

/**
 * Make state object for an action in the process of a HTTP request
 * @param {object} state Existing state (request object)
 * @param {object} action Action
 * @param {string} responsePath Path in response data where the actual data is located
 * @return {object} State
 */
export const requestState = (state, action = {}, responsePath = '') => {
    return {
        ...state,
        data: _get(`response${responsePath ? `.${responsePath}` : ''}`, action) || state.data,
        error: action.error,
        pending: action.pending || false
    };
};

export const pathRequestState = (path, state, action, responsePath) => {
    return _set(path, requestState(_get(path, state), action, responsePath), state);
};

/**
 * Load an existing dataset onto a request state location. Like when loading
 * an entity from a preloaded list onto a single entity state in the store.
 * @param {object|array} data Data to load
 * @return {object} State
 */
export const loadState = data => {
    return {
        data,
        error: null,
        pending: false
    };
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

export const pathClearState = (path) => {
    return _set(path, clearState());
};
