/**
 * @file formatters.js
 * @author Marek Kotewicz <marek@ethdev.com>
 * @author Andreas Olofsson <andreas@erisindustries.com>
 * @date 2015
 * @module solidity/formatters
 */

var BigNumber = require('bignumber.js');
var utils = require('../utils/utils');
var c = require('../utils/config');
var SolidityParam = require('./param');

/**
 * Formats input value to byte representation of int
 * If value is negative, return it's two's complement
 * If the value is floating point, round it down
 *
 * @method formatInputInt
 * @param {String|Number|BigNumber} value - input value
 * @returns {SolidityParam}
 */
var formatInputInt = function (value) {
    var padding = c.ETH_PADDING * 2;
    BigNumber.config(c.ETH_BIGNUMBER_ROUNDING_MODE);
    var result = utils.padLeft(utils.toTwosComplement(value).round().toString(16), padding);
    return new SolidityParam(result);
};

/**
 * Formats input value to string.
 *
 * @method formatInputInt
 * @param {String|Number|BigNumber} value - input value
 * @returns {SolidityParam}
 */
var formatInputString = function (value) {
    var result = utils.asciiToHex(value);
    var l = Math.floor((result.length + 63) / 64);
    result = utils.padRight(result, l * 64);
    return new SolidityParam(formatInputInt(value.length).value + result, 32);
};

/**
 * Formats input value to byte representation of string
 *
 * @method formatInputBytes
 * @param {Value} value - input value
 * @returns {SolidityParam}
 */
var formatInputBytes = function (value) {
    var pad;
    if(typeof(value) === "string"){
        pad = utils.padRight;
    } else {
        pad = utils.padLeft;
    }
    var result = pad(utils.toHex(value), 64);
    return new SolidityParam(result);
};

/**
 * Formats input value to byte representation of string
 *
 * @method formatInputDynamicBytes
 * @param {String} value - input value
 * @returns {SolidityParam}
 */
var formatInputDynamicBytes = function (value) {
    var pad;
    if(typeof(value) === "string"){
        pad = utils.padRight;
    } else {
        pad = utils.padLeft;
    }
    value = utils.toHex(value);
    var l = Math.floor((value.length + 63) / 64);
    var result = pad(value, l * 64);
    var length = Math.floor(value.length / 2);
    return new SolidityParam(formatInputInt(length).value + result, 32);
};

/**
 * Formats input value to byte representation of bool
 *
 * @method formatInputBool
 * @param {Boolean} value - input value
 * @returns {SolidityParam}
 */
var formatInputBool = function (value) {
    var result = '000000000000000000000000000000000000000000000000000000000000000' + (value ?  '1' : '0');
    return new SolidityParam(result);
};

/**
 * Formats input value to byte representation of real
 * Values are multiplied by 2^m and encoded as integers
 *
 * @method formatInputReal
 * @param {String|Number|BigNumber} value - input value
 * @returns {SolidityParam}
 */
var formatInputReal = function (value) {
    return formatInputInt(new BigNumber(value).times(new BigNumber(2).pow(128)));
};

/**
 * Check if input value is negative
 *
 * @method signedIsNegative
 * @param {String} value is hex format
 * @returns {Boolean} true if it is negative, otherwise false
 */
var signedIsNegative = function (value) {
    return (new BigNumber(value.substr(0, 1), 16).toString(2).substr(0, 1)) === '1';
};

/**
 * Formats right-aligned output bytes to int
 *
 * @method formatOutputInt
 * @param {SolidityParam} param - param
 * @returns {BigNumber} right-aligned output bytes formatted to big number
 */
var formatOutputInt = function (param) {
    var value = param.staticPart() || "0";

    // check if it's negative number
    // it it is, return two's complement
    if (signedIsNegative(value)) {
        return new BigNumber(value, 16).minus(new BigNumber('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF', 16)).minus(1);
    }
    return new BigNumber(value, 16);
};

/**
 * Formats right-aligned output bytes to uint
 *
 * @method formatOutputUInt
 * @param {SolidityParam} param - param
 * @returns {BigNumber} right-aligned output bytes formatted to uint
 */
var formatOutputUInt = function (param) {
    var value = param.staticPart() || "0";
    return new BigNumber(value, 16);
};

/**
 * Formats right-aligned output bytes to real
 *
 * @method formatOutputReal
 * @param {SolidityParam} param - param
 * @returns {BigNumber} input bytes formatted to real
 */
var formatOutputReal = function (param) {
    return formatOutputInt(param).dividedBy(new BigNumber(2).pow(128));
};

/**
 * Formats right-aligned output bytes to ureal
 *
 * @method formatOutputUReal
 * @param {SolidityParam} param - param
 * @returns {BigNumber} input bytes formatted to ureal
 */
var formatOutputUReal = function (param) {
    return formatOutputUInt(param).dividedBy(new BigNumber(2).pow(128));
};

/**
 * Should be used to format output bool
 *
 * @method formatOutputBool
 * @param {SolidityParam} param - param
 * @returns {Boolean} right-aligned input bytes formatted to bool
 */
var formatOutputBool = function (param) {
    return param.staticPart() === '0000000000000000000000000000000000000000000000000000000000000001';
};

/**
 * Should be used to format output hex-string
 *
 * @method formatOutputBytes
 * @param {SolidityParam} param - param. left-aligned hex representation of string
 * @returns {String} ascii string
 */
var formatOutputBytes = function (param) {
    // length might also be important!
    return param.staticPart();
};

/**
 * Should be used to format output bytes
 *
 * @method formatOutputDynamicBytes
 * @param {SolidityParam} param - param. left-aligned hex representation of string
 * @returns {String} ascii string
 */
var formatOutputDynamicBytes = function (param) {
    var length = (new BigNumber(param.dynamicPart().slice(0, 64), 16)).toNumber() * 2;
    return param.dynamicPart().substr(64, length);
};

/**
 * Should be used to format output string
 *
 * @method formatOutputString
 * @param {SolidityParam} param - left-aligned hex representation of string
 * @returns {String} ascii string
 */
var formatOutputString = function (param) {
    var length = (new BigNumber(param.dynamicPart().slice(0, 64), 16)).toNumber() * 2;
    return utils.hexToAscii(param.dynamicPart().substr(64, length));
};

/**
 * Should be used to format output address
 *
 * @method formatOutputAddress
 * @param {SolidityParam} param - param. right-aligned input bytes.
 * @returns {String} address
 */
var formatOutputAddress = function (param) {
    var value = param.staticPart();
    return value.slice(value.length - 40, value.length);
};

module.exports = {
    formatInputBytes: formatInputBytes,
    formatInputDynamicBytes: formatInputDynamicBytes,
    formatInputInt: formatInputInt,
    formatInputBool: formatInputBool,
    formatInputReal: formatInputReal,
    formatInputString: formatInputString,
    formatOutputBytes: formatOutputBytes,
    formatOutputDynamicBytes: formatOutputDynamicBytes,
    formatOutputInt: formatOutputInt,
    formatOutputUInt: formatOutputUInt,
    formatOutputReal: formatOutputReal,
    formatOutputUReal: formatOutputUReal,
    formatOutputBool: formatOutputBool,
    formatOutputAddress: formatOutputAddress,
    formatOutputString: formatOutputString
};