
/** @file config.js
 * @author Marek Kotewicz <marek@ethdev.com>
 * @author Andreas Olofsson <andreas@erisindustries.com>
 * @date 2015
 * @module utils/config
 */

/// required to define ETH_BIGNUMBER_ROUNDING_MODE
var BigNumber = require('bignumber.js');

module.exports = {
    ETH_PADDING: 32,
    ETH_SIGNATURE_LENGTH: 4,
    ETH_BIGNUMBER_ROUNDING_MODE: { ROUNDING_MODE: BigNumber.ROUND_DOWN },
    DEFAULT_GAS: 1000000,
    DEFAULT_FEE: 0,
    USE_RAW_BYTES: false
};

