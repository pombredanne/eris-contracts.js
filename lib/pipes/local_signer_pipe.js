/**
 * @file dev_pipe.js
 * @fileOverview Base class for the dev-pipe.
 * @author Andreas Olofsson (andreas@erisindustries.com)
 * @module pipe/dev_pipe
 */
'use strict';

var Pipe = require('./pipe');
var nUtil = require('util');

module.exports = LSPipe;

/**
 * DevPipe transacts using a yet-to-be-implemented local tx signing function.
 *
 * @param {*} erisdb - the erisdb object.
 * @param {Function} signerFunc - should accept a TxPayload object and turn it into a signed transaction.
 *
 * @constructor
 */
function LSPipe(erisdb, signerFunc) {
    Pipe.call(this, erisdb);
    this._signerFunc = signerFunc;
}

nUtil.inherits(LSPipe, Pipe);

/**
 * Used to send a transaction.
 * @param {module:solidity/function~TxPayload} txPayload - The payload object.
 * @param callback - The error-first callback.
 */
LSPipe.prototype.transact = function (txPayload, callback) {
    throw new Error("Local signer transacting has not been implemented yet.");
    /*
    console.log("Calling pipe transact function");
    var that = this;

    this._signerFunc(txPayload, function (error, txObj) {
        if (error) {
            callback(error);
            return;
        }
        that._erisdb.txs().broadcastTx(txObj, function (error, data) {
            if (error) {
                callback(error);
                return;
            }
            var txRet = data;
            var eventSub;
            // TODO broadcast and hold in edb.
        });
    });
    */
};