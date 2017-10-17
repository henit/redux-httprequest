import actions, { STATE_PENDING, STATE_COMPLETE, STATE_FAILED } from './actions';
import reducer from './reducer';
// import reducers from './reducers';
import { requestState, loadState } from './reducers';

export {
    // Reducers
    requestState,
    loadState,

    actions,
    reducer, // @DEPRECATED
    // reducers,
    STATE_PENDING, // @DEPRECATED
    STATE_COMPLETE, // @DEPRECATED
    STATE_FAILED // @DEPRECATED
};

export default actions;
