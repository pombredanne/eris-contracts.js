var Pipe = require('../../lib/pipes/pipe');

var nUtil = require('util');

var testData = require('../testdata/testdata.json');

module.exports = MockPipe;

/**
 * Mock pipe
 *
 * @constructor
 */
function MockPipe() {
    Pipe.call(this, null);
}

nUtil.inherits(MockPipe, Pipe);

/**
 * Used to send a transaction.
 * @param {module:solidity/function~TxPayload} txPayload - The payload object.
 * @param callback - The error-first callback.
 */
MockPipe.prototype.transact = function(txPayload, callback) {
    callback(null, testData.transact.contract_addr);
};

/**
 * Used to do a call.
 * @param {module:solidity/function~TxPayload} txPayload - The payload object.
 * @param callback - The error-first callback.
 */
MockPipe.prototype.call = function (txPayload, callback) {
    callback(null, testData.call.return.toUpperCase());
};

/**
 * Used to subscribe to Solidity events from a given account.
 *
 * @param {string} accountAddress - the address of the account.
 * @param {function} createCallback - error-first callback. The data object is the EventSub object.
 * @param {function} eventCallback - error-first callback. The data object is a solidity event object.
 */
MockPipe.prototype.eventSub = function (accountAddress, createCallback, eventCallback) {
    if(eventCallback) {
        eventCallback(null, testData.event);
    } else {
        createCallback(null, testData.event);
    }
};