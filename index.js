var contractsModule = require('./lib/contractManager');
var pipes = require('./lib/pipes/pipes');
var utils = require('./lib/utils/utils');
var edbModule = require('eris-db');
var DevPipe = require('./lib/pipes/dev_pipe');
var outputFormatters = require('./lib/output_formatters');

var edb;

/**
 * Create a new solidity contracts object from the given pipe.
 *
 * @param pipe
 * @returns {*|contract}
 */
exports.newContractManager = function(pipe){
    return contractsModule.newContractManager(pipe);
};

/**
 * Create a new solidity contracts object with a DevPipe from the given
 * rpc-URL and private key.
 *
 * @param {string} erisdbURL - The url to the eris-db server. Usually (http://localhost:1337/rpc)
 * @param {string} accounts - Used to pass in a list of accounts. NOTE: This is for DEV ONLY. The keys are not protected.
 * @param {function(error, data)} [callback] - Callback is only needed if using a websocket client. If callback is not provided,
 * the object will be returned, otherwise it is passed as the data param in the (normal error-first) callback.
 */
exports.newContractManagerDev = function(erisdbURL, accounts, callback){
    edb = edbModule.createInstance(erisdbURL);
    var pipe = new DevPipe(edb, accounts);
    var manager = contractsModule.newContractManager(pipe);

    if(callback){
        edb.start(function(error){
            if(error){
                callback(error);
            } else {
                callback(null, manager);
            }
        })
    } else {
        return manager;
    }
};

/**
 * Create a new solidity contracts object from the given pipe.
 *
 * @deprecated
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
 * @param {string} erisdbURL - The url to the eris-db server. Usually (http://localhost:1337/rpc)
 * @param {string} privateKey - The 64 byte private key used to make transactions with eris-db/tendermint.
 * NOTE: As always, as in every doc we ever write - don't pass private keys around if they actually protect
 * something. Only do it in testing where key is basically just a worthless bunch of bytes.
 * @param {function(error, data)} [callback] - Callback is only needed if using a websocket client. It will fire when
 * the websockets are ready to go. If callback is not provided, the object will be returned,
 * otherwise it is passed as the data param in the (normal error-first) callback.
 * @deprecated
 */
exports.contractsDev = function(erisdbURL, privateKey, callback){
    edb = edbModule.createInstance(erisdbURL);
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
 * Get the eris-db instance.
 *
 * TODO This might not be set if the user provides their own pipe. Need to remove this asap.
 * @returns {*}
 * @deprecated
 */
exports.getErisDb = function(){
    console.log("DEPRECATED: Access the eris-db instance through the contract manager instead.");
    return edb;
};

exports.pipes = pipes;

/**
 * Utils has methods for working with strings.
 *
 * @type {{}}
 */
exports.utils = {};
exports.utils.hexToAscii = utils.hexToAscii;
exports.utils.asciiToHex = utils.asciiToHex;
exports.utils.padLeft = utils.padLeft;
exports.utils.padRight = utils.padRight;
exports.utils.htoa = utils.hexToAscii;
exports.utils.atoh = utils.asciiToHex;

/**
 * Output formatters are used to transform the output of contract transactions and calls.
 * These objects takes all named params and put them as fields in the object, and also puts
 * the raw output into an array.
 *
 * If the output of a solidity function is (someInt, someBytes), the output will be an
 * array by default, for example: [BigNumber(5), "abba"]. What you get after formatting
 * with 'outputFormatters.json' is:
 *
 * var obj = {
 *   params: {
 *      someInt: BigNumber(5),
 *      someBytes: "abba"
 *   },
 *   raw: [BigNumber(5), "abba"]
 * }
 *
 * You may also use 'jsonStrings', which would display all numbers as decimal strings instead - in params - but
 * leave the values intact in 'raw'.
 *
 * var stringObj = {
 *   params: {
 *      someInt: "5",
 *      someBytes: "abba"
 *   },
 *   raw: [BigNumber(5), "abba"]
 * }
 *
 * Finally, there's 'paramsToJson' that will do the 'jsonStrings' conversion, then JSON.stringify the 'params'
 * object and return it alone. This is good when passing the values on to a http response.
 *
 * What 'paramsToJson' will return is the result of: JSON.stringify(stringObj.params)
 *
 * NOTE: 'paramsToJson' will only work if all output params are named. Otherwise they will not be included in 'params'
 * and therefore not in the JSON-formatted output. When working with unnamed params, you should probably just
 * JSON.stringify the output array.
 *
 * @type {{}}
 */
exports.outputFormatters = outputFormatters;
exports.outputFormatters.paramsToJson = outputFormatters.valuesToJsonString(outputFormatters.jsonStrings);

/**
 * @deprecated
 */
exports.solidityContracts = function(pipe){
    contractsModule.init(pipe);
    return contractsModule.contract;
};

/**
 * @deprecated
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
