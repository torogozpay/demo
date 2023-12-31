import _ from 'lodash';
import { combineReducers } from 'redux';
import URI from 'urijs';
import { one, collection, find, update } from '@shoutem/redux-io';
import { ext, data as contextData } from 'context';
import { url, appId } from 'environment';

export const SHORTCUTS = 'shoutem.core.shortcuts';
export const DISCOVERED_FEEDS = 'shoutem.proxy.feeds';
export const FEED_ITEMS = _.get(contextData, ['params', 'schema']);

export default combineReducers({
  shortcut: one(SHORTCUTS, ext('shortcut')),
  discoveredFeeds: collection(DISCOVERED_FEEDS, ext('discoveredFeeds')),
  feedItems: collection(FEED_ITEMS, ext('feedItems')),
});

export function updateShortcutSettings(id, settings) {
  const config = {
    schema: SHORTCUTS,
    request: {
      endpoint: `//${url.apps}/v1/apps/${appId}/shortcuts/${id}`,
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    },
  };

  const partialShortcut = {
    type: SHORTCUTS,
    id,
    attributes: {
      settings,
    },
  };

  return update(config, partialShortcut);
}

export function loadFeed(feedUrl) {
  // decode url in case someone encoded it in a way incompatible with legacy server
  const decodedFeedUrl = URI.decode(feedUrl);
  const endpoint = new URI(
    `//${url.proxy}/v1/apps/${appId}/proxy/resources/${FEED_ITEMS}`,
  )
    .setQuery({
      'filter[url]': decodedFeedUrl,
    })
    .toString();

  const config = {
    schema: FEED_ITEMS,
    request: {
      endpoint,
      headers: {
        Accept: 'application/vnd.api+json',
      },
    },
  };

  return find(config, ext('feedItems'));
}

export function discoverFeeds(feedUrl) {
  const partialDiscoverFeeds = {
    type: 'shoutem.proxy.actions.discover-feeds',
    attributes: {
      schema: FEED_ITEMS,
      url: feedUrl,
    },
  };

  const config = {
    schema: DISCOVERED_FEEDS,
    request: {
      endpoint: `//${url.proxy}/v1/apps/${appId}/proxy/actions/discover-feeds`,
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json',
      },
      body: JSON.stringify({ data: partialDiscoverFeeds }),
      method: 'POST',
    },
  };

  return find(config, ext('discoveredFeeds'));
}
