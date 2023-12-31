import _ from 'lodash';
import { LOAD_SUCCESS } from '@shoutem/redux-io';
import { canHandleAction } from '@shoutem/redux-io/reducers/resource';
import { selectPushNotificationGroups } from 'shoutem.push-notifications';
import { ext, GROUP_PREFIX } from '../const';
import { shouldSubscribeToGroupByDefault } from '../services';
import {
  fetchSelectedGroups,
  GROUPS_SCHEMA,
  SELECTED_GROUPS_SCHEMA,
} from './actions';

/**
 * Some groups have a 'subscribe by default' setting. This middleware
 * subscribes the user to these groups if he didn't manually unsubscribe
 * whenever new selected groups are received from the server.
 */
const selectGroupsSubscribedToByDefault = store => next => action => {
  if (
    !(
      canHandleAction(action, SELECTED_GROUPS_SCHEMA) &&
      action.type === LOAD_SUCCESS
    )
  ) {
    return next(action);
  }
  const state = store.getState()[ext()];

  const {
    groups: { data: groups },
    manuallyUnsubscribedGroups,
  } = state;
  const selectedGroups = action.payload;

  const groupsToSubscribeTo = _.filter(groups, group =>
    shouldSubscribeToGroupByDefault(
      group,
      selectedGroups,
      manuallyUnsubscribedGroups,
    ),
  );

  if (_.size(groupsToSubscribeTo)) {
    const tagsToSubscribeTo = _.map(
      groupsToSubscribeTo,
      group => `${GROUP_PREFIX + group.tag}`,
    );

    store.dispatch(
      selectPushNotificationGroups({
        added: tagsToSubscribeTo,
        removed: [],
      }),
    );

    return next({
      ...action,
      payload: selectedGroups.concat(tagsToSubscribeTo),
    });
  }

  return next(action);
};

/**
 * Loads selected groups after all groups are loaded.
 */
const loadSelectedGroups = store => next => action => {
  if (canHandleAction(action, GROUPS_SCHEMA) && action.type === LOAD_SUCCESS) {
    store.dispatch(fetchSelectedGroups());
  }

  return next(action);
};

export const middleware = [
  loadSelectedGroups,
  selectGroupsSubscribedToByDefault,
];
