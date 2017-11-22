import actions, { STATE_PENDING, STATE_COMPLETE, STATE_FAILED } from './actions';
import reducer from './reducer';
// import reducers from './reducers';
import { initializeState, requestState, pathRequestState, loadState, changeState,
    pathChangeState, clearState, pathClearState } from './reducers';

export {
    // Reducers
    initializeState,
    requestState,
    pathRequestState,
    loadState,
    changeState,
    pathChangeState,
    clearState,
    pathClearState,

    actions,
    reducer, // @DEPRECATED
    // reducers,
    STATE_PENDING, // @DEPRECATED
    STATE_COMPLETE, // @DEPRECATED
    STATE_FAILED // @DEPRECATED
};

export default actions;
