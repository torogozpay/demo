import _ from 'lodash';
import { getShortcut } from 'shoutem.application';
import { getCollection } from '@shoutem/redux-io';
import { ext } from '../const';

function getModuleState(state) {
  return state[ext()];
}

export function getNewsFeed(state, feedUrl) {
  return getCollection(getModuleState(state).latestNews[feedUrl], state);
}

export function getFeedUrl(state, shortcutId) {
  const shortcut = getShortcut(state, shortcutId);
  return _.get(shortcut, 'settings.feedUrl');
}
