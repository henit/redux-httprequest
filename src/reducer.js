/* eslint-disable max-statements */
import _ from 'lodash/fp';
import { STATE_PENDING, STATE_COMPLETE, STATE_FAILED, HTTPREQUEST_CLEAR } from './actions';

// State of ongoing or previous api queries

const httpDefaultState = {};

// @DEPRECATED
export default function http(state = httpDefaultState, action) {

  switch (action.type) {
    case HTTPREQUEST_CLEAR:
      return _.omitBy(_.isUndefined, {
        ...state,
        [action.id]: undefined
      });
  }

  const match = action.type.match(/^HTTPREQUEST_(.*)_(INITIATE|COMPLETE|ERROR)$/);

  if (match && action.params.preserve) {
    const { requestId, params, response, receivedAt, error } = action;
    // const { responsePath } = params;

    const existing = _.get(requestId, state);

    switch (match[2]) {
      case 'INITIATE':
        return _.set(requestId, _.assign(existing, {
          state: STATE_PENDING,
          params
        }), state);

      case 'COMPLETE': {
        return _.set(requestId, _.assign(existing, {
          state: STATE_COMPLETE,
          receivedAt,
          response
        }), state);
      }

      case 'ERROR':
        return _.set(requestId, _.assign(existing, {
          state: STATE_FAILED,
          error: error
        }), state);
    }
  }

  return state;
}
