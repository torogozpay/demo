const {
  PERMISSION_TYPES,
} = require('../../shoutem.permissions/app/build/const');

const permissions = [
  { type: PERMISSION_TYPES.ANDROID_ACCESS_NETWORK_STATE }
];

module.exports = { permissions };
