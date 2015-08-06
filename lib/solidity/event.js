/**
 * @file event.js
 * @author Marek Kotewicz <marek@ethdev.com>
 * @author Andreas Olofsson <andreas@erisindustries.com>
 * @date 2014
 * @module solidity/event
 */

var utils = require('../utils/utils');
var coder = require('./coder');
var sha3 = require('../utils/sha3');

/**
 * This prototype should be used to create event filters
 */
var SolidityEvent = function (json, address, pipe) {
    this._params = json.inputs;
    this._name = utils.transformToFullName(json);
    this._address = address;
    this._anonymous = json.anonymous;
    this._pipe = pipe;
};

/**
 * Should be used to get filtered param types
 *
 * @method types
 * @param {Boolean} indexed - decide if returned typed should be indexed
 * @return {Array} array of types
 */
SolidityEvent.prototype.types = function (indexed) {
    return this._params.filter(function (i) {
        return i.indexed === indexed;
    }).map(function (i) {
        return i.type;
    });
};

/**
 * Should be used to get event display name
 *
 * @method displayName
 * @return {String} event display name
 */
SolidityEvent.prototype.displayName = function () {
    return utils.extractDisplayName(this._name);
};

/**
 * Should be used to get event type name
 *
 * @method typeName
 * @return {String} event type name
 */
SolidityEvent.prototype.typeName = function () {
    return utils.extractTypeName(this._name);
};

/**
 * Should be used to get event signature
 *
 * @method signature
 * @return {String} event signature
 */
SolidityEvent.prototype.signature = function () {
    return sha3(this._name);
};

/**
 * Should be used to encode indexed params and options to one final object
 * 
 * @method encode
 * @param {Object} indexed
 * @param {Object} options
 * @return {Object} everything combined together and encoded
 */
SolidityEvent.prototype.encode = function (indexed, options) {
    indexed = indexed || {};
    options = options || {};
    var result = {};

    result.topics = [];

    if (!this._anonymous) {
        result.address = this._address;
        result.topics.push(this.signature());
    }

    var indexedTopics = this._params.filter(function (i) {
        return i.indexed === true;
    }).map(function (i) {
        var value = indexed[i.name];
        if (value === undefined || value === null) {
            return null;
        }
        
        if (utils.isArray(value)) {
            return value.map(function (v) {
                return coder.encodeParam(i.type, v);
            });
        }
        return coder.encodeParam(i.type, value);
    });

    result.topics = result.topics.concat(indexedTopics);

    return result;
};

/**
 * Should be used to decode indexed params and options
 *
 * @method decode
 * @param {Object} data
 * @return {Object} result object with decoded indexed && not indexed params
 */
SolidityEvent.prototype.decode = function (data) {

    data.topics = data.topics || [];
    data.data = data.data || '';

    var argTopics = this._anonymous ? data.topics : data.topics.slice(1);
    var indexedData = argTopics.map(function (topics) { return topics; }).join("");
    var indexedParams = coder.decodeParams(this.types(true), indexedData); 

    var notIndexedData = data.data;
    var notIndexedParams = coder.decodeParams(this.types(false), notIndexedData);
    
    var result = {};
    result.event = this.displayName();
    result.address = data.address;

    result.args = this._params.reduce(function (acc, current) {
        acc[current.name] = current.indexed ? indexedParams.shift() : notIndexedParams.shift();
        return acc;
    }, {});

    delete result.data;
    delete result.topics;

    return result;
};

/**
 * Should be used to create new eris-db events from events.
 *
 * @method execute
 * @param {function} [startCallback] - error-first callback. The data object is the EventSub. If left out
 * it will not return a sub and will automatically shut the sub down after the first event is received.
 * It is equivalent to but less expressive then calling 'Contract.eventName.once(eventCallback)'.
 * @param {function} eventCallback - error-first callback. The data object is a formatted solidity event.
 * @return {Object} filter object
 */
SolidityEvent.prototype.execute = function (startCallback, eventCallback) {
    if(!eventCallback){
        eventCallback = startCallback;
        startCallback = null;
    }
    var formatter = this.decode.bind(this);
    var that = this;
    return this._pipe.eventSub(this._address, startCallback, function(error, event){
        if(error){
            eventCallback(error);
            return;
        }
        // TODO handle anonymous.
        // TODO we don't have filtering in tendermint yet, so I do it here.
        if(event.topics[0] === that.signature()) {
            var fmtEvent, err;
            try {
                fmtEvent = formatter(event);
            } catch (error){
                err = error;
            }
            eventCallback(err, fmtEvent);
        }
    });
};

/**
 * Should be used to attach event to contract object
 *
 * @method attachToContract
 * @param {Contract} contract - The contract it should be attached to.
 */
SolidityEvent.prototype.attachToContract = function (contract) {
    var execute = this.execute.bind(this);
    // Will stop as soon as it receives an event.
    execute.once = execute.bind(this);

    var displayName = this.displayName();
    if (!contract[displayName]) {
        contract[displayName] = execute;
    }
    contract[displayName][this.typeName()] = this.execute.bind(this, contract);
};

module.exports = SolidityEvent;

