/**
 * @file dev_pipe.js
 * @fileOverview Base class for the dev-pipe.
 * @author Andreas Olofsson (andreas@erisindustries.com)
 * @module pipe/dev_pipe
 */
'use strict';

var Pipe = require('./pipe');
var nUtil = require('util');
var config = require('../utils/config');
/**
 * Constructor for the DevPipe class.
 *
 * @type {Pipe}
 */
module.exports = DevPipe;

/**
 * DevPipe transacts using the unsafe
 *
 * @param {*} erisdb - the erisdb object.
 * @param {string} privKey - the private key to use when sending transactions. NOTE: This means a private key
 * will be passed over the net, so it should only be used when developing, or if it's 100% certain that the
 * eris-db server and this script runs on the same machine, or communication is secure. The recommended way
 * will be to call a signing function on the client side, like in a browser plugin.
 *
 * @constructor
 */
function DevPipe(erisdb, privKey) {
    Pipe.call(this, erisdb);
    this._privKey = privKey;
}

nUtil.inherits(DevPipe, Pipe);

/**
 * Used to send a transaction.
 * @param {module:solidity/function~TxPayload} txPayload - The payload object.
 * @param callback - The error-first callback.
 */
DevPipe.prototype.transact = function (txPayload, callback) {
    // This will block until a block with txs in them is committed, then close the sub manually.
    // Ugly hack. Will fix later.
    var that = this;
    this._erisdb.txs().transact(this._privKey, txPayload.to, txPayload.data, config.DEFAULT_GAS, config.DEFAULT_FEE, null, function (error, data) {
        if (error) {
            console.log(error);
            callback(error);
            return;
        }
        var txRet = data;
        var eventSub;
        var counter = 0;
        that._erisdb.events().subNewBlocks(function (error, data) {
            if (error) {
                console.log(error);
                callback(error);
                return;
            }
            eventSub = data;
        }, function (error, data) {
            // First predicate added for mock edb.
            if(data.data && data.data.txs.length === 0){
                return;
            }
            if(counter > 0){
                return;
            }
            counter++;
            // We don't care about the block data, just the fact that a new block event was fired.
            if (error) {
                console.log(error);
                callback(error);
            }
            eventSub.stop(function () {

            });
            callback(null, txRet);
        });
    });
};