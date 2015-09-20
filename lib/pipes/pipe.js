/**
 * @file pipe.js
 * @fileOverview Base class for the pipe.
 * @author Andreas Olofsson (andreas@erisindustries.com)
 * @module pipe/pipe
 */
'use strict';

module.exports = Pipe;

/**
 * Pipe is used to call transact, call, and solidity event sub methods on the blockchain rpc library.
 * it can also do formatting of input and output as needed. It is designed to use eris-db.js.
 *
 * @param {*} erisdb - the erisdb object
 *
 * @constructor
 */
function Pipe(erisdb){
    this._erisdb = erisdb;
}

/**
 * Used to send a transaction.
 * @param {module:solidity/function~TxPayload} txPayload - The payload object.
 * @param callback - The error-first callback.
 */
Pipe.prototype.transact = function(txPayload, callback) {callback(new Error("Not implemented"))};

/**
 * Used to do a call.
 * @param {module:solidity/function~TxPayload} txPayload - The payload object.
 * @param callback - The error-first callback.
 */
Pipe.prototype.call = function (txPayload, callback) {callback(new Error("Not implemented"))};

/**
 * Used to subscribe to Solidity events from a given account.
 *
 * @param {string} accountAddress - the address of the account.
 * @param {function} createCallback - error-first callback. The data object is the EventSub object.
 * @param {function} eventCallback - error-first callback. The data object is a solidity event object.
 */
Pipe.prototype.eventSub = function (accountAddress, createCallback, eventCallback) {
    this._erisdb.events().subSolidityEvent(accountAddress, createCallback, eventCallback);
};

Pipe.prototype.addAccount = function(accountData){new Error("Not implemented")};

Pipe.prototype.removeAccount = function(accountId){new Error("Not implemented")};

Pipe.prototype.setDefaultAccount = function(accountId){new Error("Not implemented")};

Pipe.prototype.hasAccount = function(accountId){new Error("Not implemented")};

Pipe.prototype.erisDb = function(){
    return this._erisdb;
};