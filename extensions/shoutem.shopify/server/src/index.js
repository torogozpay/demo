// Constants `screens`, `actions` and `reducer` are exported via named export
// It is important to use those exact names

// export everything from extension.js
// list of exports supported by shoutem can be found here: https://shoutem.github.io/docs/extensions/reference/extension-exports
import reducer from './redux';

export * from './extension';

export { reducer };
