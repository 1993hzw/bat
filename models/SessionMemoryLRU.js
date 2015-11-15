/*修改自express-session模块中的memory.js*/

/*!
 * express-session
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module dependencies.
 * @private
 */

var Store = require('express-session').Store;
var util = require('util');
var LRU = require("lru-cache");
var options;//lru options
//var cache = LRU(options);


/**
 * Shim setImmediate for node.js < 0.10
 * @private
 */

/* istanbul ignore next */
var defer = typeof setImmediate === 'function'
    ? setImmediate
    : function (fn) {
    process.nextTick(fn.bind.apply(fn, arguments))
}

/**
 * Module exports.
 */

module.exports = MemoryStore

/**
 * A session store in memory.
 * @public
 */

function MemoryStore(opts) {
    Store.call(this);

    opts = opts || {};
    options = {
        max: opts.max || 1000,//条目最大数量
        length: opts.length || function (n) {
            return 1;
        },
        dispose: function (key, n) {//删除条目，或覆盖条目时会触发
            //console.log("dispose "+key + ":" + n);
        },
        maxAge: opts.maxAge || 1000 * 60 * 60
    };

    this.sessions = LRU(options);//设为lru-cache
}

/**
 * Inherit from Store.
 */

util.inherits(MemoryStore, Store)

/**
 * Get all active sessions.
 *
 * @param {function} callback
 * @public
 */

MemoryStore.prototype.all = function all(callback) {
    var sessionIds = this.sessions.keys();
    var sessions = Object.create(null)

    for (var i = 0; i < sessionIds.length; i++) {
        var sessionId = sessionIds[i]
        var session = getSession.call(this, sessionId)

        if (session) {
            sessions[sessionId] = session;
        }
    }

    callback && defer(callback, null, sessions)
}

/**
 * Clear all sessions.
 *
 * @param {function} callback
 * @public
 */

MemoryStore.prototype.clear = function clear(callback) {
    this.sessions = LRU(options);
    callback && defer(callback)
}

/**
 * Destroy the session associated with the given session ID.
 *
 * @param {string} sessionId
 * @public
 */

MemoryStore.prototype.destroy = function destroy(sessionId, callback) {
    this.sessions.del(sessionId);
    callback && defer(callback)
}

/**
 * Fetch session by the given session ID.
 *
 * @param {string} sessionId
 * @param {function} callback
 * @public
 */

MemoryStore.prototype.get = function get(sessionId, callback) {
    defer(callback, null, getSession.call(this, sessionId))
}

/**
 * Commit the given session associated with the given sessionId to the store.
 *
 * @param {string} sessionId
 * @param {object} session
 * @param {function} callback
 * @public
 */

/**
 * Get number of active sessions.
 *
 * @param {function} callback
 * @public
 */

MemoryStore.prototype.length = function length(callback) {
    callback(null, this.sessions.length());
}

MemoryStore.prototype.set = function set(sessionId, session, callback) {
    this.sessions.set(sessionId, JSON.stringify(session));
    callback && defer(callback)
}

/**
 * Touch the given session object associated with the given session ID.
 *
 * @param {string} sessionId
 * @param {object} session
 * @param {function} callback
 * @public
 */

MemoryStore.prototype.touch = function touch(sessionId, session, callback) {
    var currentSession = getSession.call(this, sessionId)

    if (currentSession) {
        // update expiration
        currentSession.cookie = session.cookie
        //this.sessions[sessionId] = JSON.stringify(currentSession)
        this.sessions.set(sessionId, JSON.stringify(currentSession));
    }

    callback && defer(callback)
}

/**
 * Get session from the store.
 * @private
 */

function getSession(sessionId) {
    var sess = this.sessions.get(sessionId);

    if (!sess) {
        return
    }

    // parse
    sess = JSON.parse(sess)

    var expires = typeof sess.cookie.expires === 'string'
        ? new Date(sess.cookie.expires)
        : sess.cookie.expires

    // destroy expired session
    if (expires && expires <= Date.now()) {
        this.sessions.del(sessionId);
        return
    }

    return sess
}
