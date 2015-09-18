/**
 * @file function.js
 * @author Marek Kotewicz <marek@ethdev.com>
 * @author Andreas Olofsson <andreas@erisindustries.com>
 * @date 2015
 * @module solidity/function
 */
var coder = require('./coder');
var utils = require('../utils/utils');
var sha3 = require('../utils/sha3');

/**
 * This prototype should be used to call/sendTransaction to solidity functions
 */
var SolidityFunction = function (json, address, pipe, outputFormatter) {
    this._json = json; // TODO for now.
    this._outputFormatter = outputFormatter;
    this._inputTypes = json.inputs.map(function (i) {
        return i.type;
    });
    this._outputTypes = json.outputs.map(function (i) {
        return i.type;
    });
    this._constant = json.constant;
    this._name = utils.transformToFullName(json);
    this._address = address;
    this._pipe = pipe;
};

SolidityFunction.prototype.extractCallback = function (args) {
    if (args.length > 0 && utils.isFunction(args[args.length - 1])) {
        return args.pop(); // modify the args array!
    } else {
        return null;
    }
};

SolidityFunction.prototype.extractCallObj = function (args) {
    if(args.length == 0){
        return null;
    }
    var obj = args[args.length - 1];
    if(utils.isObject(obj) && obj.from){
        return args.pop(); // modify the args array!
    } else {
        return null;
    }
};

/**
 * Should be used to create payload from arguments
 *
 * @method toPayload
 * @param {Array} args - solidity function params
 * @param {Object} [options] - payload options
 */
SolidityFunction.prototype.toPayload = function (args, options) {
    var opts = {};
    if (options) {
        opts = options;
    }
    opts.to = this._address;
    opts.data = (this.signature() + coder.encodeParams(this._inputTypes, args)).toUpperCase();
    return opts;
};

/**
 * Should be used to get function signature
 *
 * @method signature
 * @return {String} function signature
 */
SolidityFunction.prototype.signature = function () {
    return sha3(this._name).slice(0, 8);
};

SolidityFunction.prototype.unpackOutput = function (output) {
    if (!output) {
        return;
    }
    output = output.length >= 2 && output.slice(0,2) === '0x' ? output.slice(2) : output;
    var result = coder.decodeParams(this._outputTypes, output);
    result = result.length === 1 ? result[0] : result;
    return this._outputFormatter(this._json.outputs, result);
};

/**
 * Should be used to test if Inputs can be formatted
 *
 * @method testInputs
 * @return {Boolean} True is can be formatted false otherwise
 */

SolidityFunction.prototype.testInputs = function () {

    var payload;
    try {
        this.toPayload(Array.prototype.slice.call(arguments, 1));
    } catch (payloadError){
        return false;
    }

    return true;
};

/**
 * Calls a contract function.
 *
 * @method call
 * @param {...Object} function arguments
 * @param {function} If the last argument is a function, the contract function
 *   call will be asynchronous, and the callback will be passed the
 *   error and result.
 */
SolidityFunction.prototype.call = function () {
    var args = Array.prototype.slice.call(arguments).filter(function (a) {return a !== undefined; });
    var callback = this.extractCallback(args);
    if(callback === null){
        callback(new Error("No callback function provided"), null);
        return;
    }
    var txObj = this.extractCallObj(args);
    var payload;
    try {
        payload = this.toPayload(args, txObj);
    } catch (payloadError){
        callback(payloadError, null);
        return;
    }

    var self = this;

    this._pipe.call(payload, function (error, output) {
        if(error) {
            console.log("Error callback from sendTransaction");
            callback(error);
            return;
        }
        var err = null, res = null;
        try {
            res = self.unpackOutput(output);
        } catch (unpackingError){
            err = unpackingError;
        } finally {
            callback(err, res);
        }
    });
};

/**
 * Should be used to sendTransaction to solidity function
 *
 * @method sendTransaction
 * @param {Object} [options] - options
 */
SolidityFunction.prototype.sendTransaction = function () {
    var args = Array.prototype.slice.call(arguments).filter(function (a) {return a !== undefined; });
    var callback = this.extractCallback(args);

    var txObj = this.extractCallObj(args);
    var payload;
    try {
        payload = this.toPayload(args, txObj);
    } catch (payloadError){
        callback(payloadError, null);
        return;
    }

    var self = this;

    this._pipe.transact(payload, function (error, output) {
        if(error) {
            console.log("Error callback from sendTransaction");
            callback(error);
            return;
        }
        var err = null, res = null;
        try {
            res = self.unpackOutput(output);
        } catch (unpackingError){
            err = unpackingError;
        } finally {
            callback(err, res);
        }
    });
};

/**
 * Should be used to get function display name
 *
 * @method displayName
 * @return {String} display name of the function
 */
SolidityFunction.prototype.displayName = function () {
    return utils.extractDisplayName(this._name);
};

/**
 * Should be used to get function type name
 *
 * @method typeName
 * @return {String} type name of the function
 */
SolidityFunction.prototype.typeName = function () {
    return utils.extractTypeName(this._name);
};

/**
 * Should be called to execute function
 *
 * @method execute
 */
SolidityFunction.prototype.execute = function () {
    var transaction = !this._constant;

    // send transaction
    if (transaction) {
       this.sendTransaction.apply(this, Array.prototype.slice.call(arguments));
    } else {
        // call
        this.call.apply(this, Array.prototype.slice.call(arguments));
    }
};

/**
 * Should be called to attach function to contract
 *
 * @method attachToContract
 * @param {Contract} contract - the contract.
 */
SolidityFunction.prototype.attachToContract = function (contract) {
    var execute = this.execute.bind(this);
    execute.call = this.call.bind(this);
    execute.sendTransaction = this.sendTransaction.bind(this);
    execute.signature = this.signature.bind(this);
    execute.testInputs = this.testInputs.bind(this);
    var displayName = this.displayName();
    if (!contract[displayName]) {
        contract[displayName] = execute;
    }
    contract[displayName][this.typeName()] = execute; // circular!!!!
};

module.exports = SolidityFunction;

/**
 * The transaction payload object.
 *
 * @typedef {Object} TxPayload
 * @property {string} to - The target address.
 * @property {string} data - The transaction data.
 */

/*
 Object - The transaction object to send:
 from: String - The address for the sending account. Uses the web3.eth.defaultAccount property, if not specified.
 to: String - (optional) The destination address of the message, left undefined for a contract-creation transaction.
 value: Number|String|BigNumber - (optional) The value transferred for the transaction in Wei, also the endowment if it's a contract-creation transaction.
 gas: Number|String|BigNumber - (optional, default: To-Be-Determined) The amount of gas to use for the transaction (unused gas is refunded).
 gasPrice: Number|String|BigNumber - (optional, default: To-Be-Determined) The price of gas for this transaction in wei, defaults to the mean network gas price.
 data: String - (optional) Either a byte string containing the associated data of the message, or in the case of a contract-creation transaction, the initialisation code.
 nonce: Number - (optional) Integer of a nonce. This allows to overwrite your own pending transactions that use the same nonce.
 */