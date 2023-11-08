// list of exports supported by shoutem can be found here: https://shoutem.github.io/docs/extensions/reference/extension-exports

// Constants `screens`, `actions` and `reducer` are exported via named export
// It is important to use those exact names
import { FontsPage } from './pages';
import { reducer } from './redux';
import { shoutemUrls } from './services';
import './style.scss';

export const pages = {
  FontsPage,
};

let pageReducer = null;

export function pageWillMount(page) {
  pageReducer = reducer();
  shoutemUrls.init(page);
}

export { pageReducer as reducer };
