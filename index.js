var contractsModule = require('./lib/contract');
var pipes = require('./lib/pipes/pipes');
var utils = require('./lib/utils/utils');
var edbModule = require('eris-db');
var DevPipe = require('./lib/pipes/dev_pipe');
var outputFormatters = require('./lib/output_formatters');

/**
 * Create a new solidity contracts object from the given pipe.
 *
 * @deprecated
 * @param pipe
 * @returns {*|contract}
 */
exports.solidityContracts = function(pipe){
    contractsModule.init(pipe);
    return contractsModule.contract;
};

/**
 * Create a new solidity contracts object from the given pipe.
 *
 * @param pipe
 * @returns {*|contract}
 */
exports.contracts = function(pipe){
    contractsModule.init(pipe);
    return contractsModule.contract;
};

/**
 * Create a new solidity contracts object with a DevPipe from the given
 * rpc-URL and private key.
 *
 * @deprecated
 * @param {string} erisdbURL - The url to the eris-db server. Usually (http://localhost:1337/rpc)
 * @param {string} privateKey - The 64 byte private key used to make transactions with eris-db/tendermint.
 * NOTE: As always, as in every doc we ever write - don't pass private keys around if they actually protect
 * something. Only do it in testing where key is basically just a worthless bunch of bytes.
 * @param {function(error, data)} [callback] - Callback is only needed if using a websocket client. It will fire when
 * the websockets are ready to go. If callback is not provided, the object will be returned,
 * otherwise it is passed as the data param in the (normal error-first) callback.
 */
exports.solidityContractsDev = function(erisdbURL, privateKey, callback){
    var edb = edbModule.createInstance(erisdbURL);
    var pipe = new DevPipe(edb, privateKey);
    contractsModule.init(pipe);
    var contract = contractsModule.contract;

    if(callback){
        edb.start(function(error){
            if(error){
                callback(error);
            } else {
                callback(null, contract);
            }
        })
    } else {
        return contract;
    }
};

/**
 * Create a new solidity contracts object with a DevPipe from the given
 * rpc-URL and private key.
 *
 * @param {string} erisdbURL - The url to the eris-db server. Usually (http://localhost:1337/rpc)
 * @param {string} privateKey - The 64 byte private key used to make transactions with eris-db/tendermint.
 * NOTE: As always, as in every doc we ever write - don't pass private keys around if they actually protect
 * something. Only do it in testing where key is basically just a worthless bunch of bytes.
 * @param {function(error, data)} [callback] - Callback is only needed if using a websocket client. It will fire when
 * the websockets are ready to go. If callback is not provided, the object will be returned,
 * otherwise it is passed as the data param in the (normal error-first) callback.
 */
exports.contractsDev = function(erisdbURL, privateKey, callback){
    var edb = edbModule.createInstance(erisdbURL);
    var pipe = new DevPipe(edb, privateKey);
    contractsModule.init(pipe);
    var contract = contractsModule.contract;

    if(callback){
        edb.start(function(error){
            if(error){
                callback(error);
            } else {
                callback(null, contract);
            }
        })
    } else {
        return contract;
    }
};

exports.pipes = pipes;

exports.utils = {};
exports.utils.hexToAscii = utils.hexToAscii;
exports.utils.asciiToHex = utils.asciiToHex;
exports.utils.htoa = utils.hexToAscii;
exports.utils.atoh = utils.asciiToHex;

exports.outputFormatters = outputFormatters;