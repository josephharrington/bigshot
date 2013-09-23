/*
 * Copyright 2010 - 2012 Leo Sutic <leo.sutic@gmail.com>
 *  
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0 
 *     
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and 
 * limitations under the License. 
 */
    

/**
 * Creates a new instance of the cached resource. May return
 * null, in which case that value is cached. The function
 * may be called multiple times, but a corresponding call to
 * the dispose function will always occur inbetween.
 * @name bigshot.TimedWeakReference.Create
 * @function
 */

/**
 * Disposes a of the cached resource. 
 * @name bigshot.TimedWeakReference.Dispose
 * @function
 * @param {Object} resource the resource that was created
 * by the create function
 */

/**
 * Creates a new instance.
 *
 * @class Caches a lazy-created resource for a given time before
 * disposing it. 
 *
 * @param {bigshot.TimedWeakReference.Create} create a function that creates the
 * held resource. May be called multiple times, but not without a call to
 * dispose inbetween.
 * @param {bigshot.TimedWeakReference.Dispose} dispose a function that disposes the
 * resource created by create.
 * @param {int} interval the polling interval in milliseconds. If the last 
 * access time is further back than one interval, the held resource is 
 * disposed (and will be re-created
 * on the next call to get).
 */
bigshot.TimedWeakReference = function (create, dispose, interval) {
    this.object = null;
    this.hasObject = false;
    this.fnCreate = create;
    this.fnDispose = dispose;
    this.lastAccess = new Date ().getTime ();
    this.hasTimer = false;
    this.interval = interval;
};

bigshot.TimedWeakReference.prototype = {
    /**
     * Disposes of this instance. The resource is disposed.
     */
    dispose : function () {
        this.clear ();
    },
    
    /**
     * Gets the resource. The resource is created if needed.
     * The last access time is updated.
     */
    get : function () {
        if (!this.hasObject) {
            this.hasObject = true;
            this.object = this.fnCreate ();
            this.startTimer ();
        }
        this.lastAccess = new Date ().getTime ();
        return this.object;
    },
    
    /**
     * Forcibly disposes the held resource, if any.
     */
    clear : function () {
        if (this.hasObject) {
            this.hasObject = false;
            this.fnDispose (this.object);
            this.object = null;
            this.stopTimer ();
        }
    },
    
    /**
     * Stops the polling timer if it is running.
     * @private
     */
    stopTimer : function () {
        if (this.hasTimer) {
            clearTimeout (this.timerId);
            this.hasTimer = false;
        }
    },
    
    /**
     * Starts the polling timer if it isn't already running.
     * @private
     */
    startTimer : function () {
        if (!this.hasTimer) {
            var that = this;
            this.hasTimer = true;
            this.timerId = setTimeout (function () {
                    that.hasTimer = false;
                    that.update ();
                }, this.interval);
        }
    },
    
    /**
     * Disposes of the held resource if it hasn't been
     * accessed in {@link #interval} milliseconds.
     * @private
     */
    update : function () {
        if (this.hasObject) {
            var now = new Date ().getTime ();
            if (now - this.lastAccess > this.interval) {
                this.clear ();
            } else {
                this.startTimer ();
            }
        }
    }
}

