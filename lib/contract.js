/**
 * @file contract.js
 * @author Marek Kotewicz <marek@ethdev.com>
 * @author Andreas Olofsson <andreas@erisindustries.com>
 * @date 2014
 * @module contract
 */

var utils = require('./utils/utils');
var coder = require('./solidity/coder');
var SolidityEvent = require('./solidity/event');
var SolidityFunction = require('./solidity/function');

var pipe = null;

/**
 * Initialize with a transaction, call, and solidity event registration function.
 * The reason for this is so that transactions can be generated and signed on the
 * caller side, rather then having to pass along a private key. The tendermint client
 * does not store accounts in the same way that; transactions need to be signed or have
 * the signing key along with them when they reach the client.
 *
 * Transaction and call should both take a transaction object as input, and return a
 * transaction receipt. The solidity event function needs to accept an account address
 * and an event hash, and return an eris-db subscriber object (both would return via
 * (error,data) callbacks).
 *
 * TODO link to the transact and sub objects.
 *
 * @param {module:pipes/pipe~Pipe} pipeIn - the pipe
 */
function init(pipeIn){
    pipe = pipeIn;
}

/**
 * Should be called to encode constructor params
 *
 * @method encodeConstructorParams
 * @param {Array} abi
 * @param {Array} params
 */
var encodeConstructorParams = function (abi, params) {
    return abi.filter(function (json) {
            return json.type === 'constructor' && json.inputs.length === params.length;
        }).map(function (json) {
            return json.inputs.map(function (input) {
                return input.type;
            });
        }).map(function (types) {
            return coder.encodeParams(types, params);
        })[0] || '';
};

/**
 * Should be called to add functions to contract object
 *
 * @method addFunctionsToContract
 * @param {Contract} contract
 * @param {Array} abi
 * TODO
 * @param {function} pipe - The pipe (added internally).
 * @param {function} outputFormatter - the output formatter (added internally).
 */
var addFunctionsToContract = function (contract, pipe, outputFormatter) {
    contract.abi.filter(function (json) {
        return json.type === 'function';
    }).map(function (json) {
        // Add formatter, or if no formatter exists just pass data through.
        var of = outputFormatter || function(json, output){return output};
        return new SolidityFunction(json, contract.address, pipe, of);
    }).forEach(function (f) {
        f.attachToContract(contract);
    });
};

/**
 * Should be called to add events to contract object
 *
 * @method addEventsToContract
 * @param {Contract} contract
 * @param {Array} abi
 */
var addEventsToContract = function (contract, pipe) {
    contract.abi.filter(function (json) {
        return json.type === 'event';
    }).map(function (json) {
        return new SolidityEvent(json, contract.address, pipe);
    }).forEach(function (e) {
        e.attachToContract(contract);
    });
};

/**
 * Should be called to create new ContractFactory
 *
 * @method contract
 * @param {Array} abi
 * @returns {ContractFactory} new contract factory
 */
function contract(abi) {
    return new ContractFactory(abi);
}

/**
 *
 * @param {Array} abi - The abi object.
 * @constructor
 */
var ContractFactory = function (abi) {
    this.abi = abi;
    this._pipe = pipe;
};

/**
 * Should be called to create new contract on a blockchain
 *
 * @method new
 * @param {*} [contract] constructor param1 (optional)
 * @param {*} [contract] constructor param2 (optional)
 * @param {Object} contract transaction object (required)
 * @param {Function} callback
 */
ContractFactory.prototype.new = function () {
    // parse arguments
    var options = {}; // required!
    var callback;

    var args = Array.prototype.slice.call(arguments);
    if (utils.isFunction(args[args.length - 1])) {
        callback = args.pop();
    }

    var last = args[args.length - 1];
    if (utils.isObject(last) && !utils.isArray(last)) {
        options = args.pop();
    }
    if (!options.hasOwnProperty('data')){
        options.data = '';
    }
    if (!options.hasOwnProperty('to')){
        options.to = '';
    }
    // throw an error if there are no options
    options.data += encodeConstructorParams(this.abi, args);

    var that = this;
    this._pipe.transact(options, function (error, data) {
            if (error) {
                callback(error);
            }
            var address = data.contract_addr;
            that.at(address, callback);
        });
};

/**
 * Should be called to get access to existing contract on a blockchain
 *
 * @method at
 * @param {string} address - contract address
 * @param {Function} [callback] - optional callback.
 * @returns {Contract} returns contract if no callback was passed,
 * otherwise calls callback function (err, contract)
 */
ContractFactory.prototype.at = function (address, callback) {
    var of = this._outputFormatter || function(outputData, output){return output;};
    var contractAt = new Contract(this.abi, address, this._pipe, of);
    if(!callback){
        return contractAt
    } else {
        callback(null, contractAt);
    }
};

ContractFactory.prototype.setOutputFormatter = function(outputFormatter){
    this._outputFormatter = outputFormatter;
};

/**
 * The contract type. This class is instantiated internally through the factory.
 *
 * @method Contract
 * @param {Array} abi
 * @param {string} address
 * @param {pipe} pipe;
 * @param {Function} outputFormatter - the output formatter.
 */
var Contract = function (abi, address, pipe, outputFormatter) {
    this.address = address;
    // TODO avoid conflict somehow.
    this.abi = abi;
    addFunctionsToContract(this, pipe, outputFormatter);
    addEventsToContract(this, pipe);
};

exports.contract = contract;
exports.init = init;