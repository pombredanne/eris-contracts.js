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
Pipe.prototype.call = function (txPayload, callback) {
    var address = txPayload.to;
    if (address.length > 1 && address.slice(0,2) == '0x'){
        address = address.slice(2);
    }
    var data = txPayload.data;
    if (data.length > 1 && data.slice(0,2) == '0x'){
        data = data.slice(2);
    }
    this._erisdb.txs().call(address, data, function(error, data){
        if(error) {
            callback(error);
        } else {
            callback(null, '0x' + data.return);
        }
    });
};

/**
 * Used to subscribe to Solidity events from a given account.
 *
 * @param {string} accountAddress - the address of the account.
 * @param {string} [eventHash] - The event hash. If this is left out then all events from the given
 * account should be subscribed to.
 * @param {function} callback - error-first callback.
 * TODO add this both in Tendermint and here.
 */
Pipe.prototype.eventSub = function (accountAddress, eventHash, callback) {
    callback(new Error("Not implemented."));
};