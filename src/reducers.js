import _get from 'lodash/fp/get';

/**
 * Make state object for an action in the process of a HTTP request
 * @param {object} action Action
 * @param {string} responsePath Path in response data where the actual data is located
 * @return {object} State
 */
export const requestState = (action = {}, responsePath = '') => {
    return {
        data: _get(`response${responsePath ? `.${responsePath}` : ''}`, action),
        error: action.error,
        pending: action.pending || false
    };
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
