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
 * Creates an event dispatcher.
 *
 * @class Base class for objects that dispatch events.
 */
bigshot.EventDispatcher = function () {
    /**
     * The event listeners. Each key-value pair in the map is
     * an event name and an <code>Array</code> of listeners.
     * 
     * @type Object
     */
    this.eventListeners = {};
}

bigshot.EventDispatcher.prototype = {
    /**
     * Adds an event listener to the specified event.
     *
     * @example
     * image.addEventListener ("click", function (event) { ... });
     *
     * @param {String} eventName the name of the event to add a listener for
     * @param {Function} handler function that is invoked with an event object
     * when the event is fired
     */
    addEventListener : function (eventName, handler) {
        if (this.eventListeners[eventName] == undefined) {
            this.eventListeners[eventName] = new Array ();
        }
        this.eventListeners[eventName].push (handler);
    },
    
    /**
     * Removes an event listener.
     * @param {String} eventName the name of the event to remove a listener for
     * @param {Function} handler the handler to remove
     */
    removeEventListener : function (eventName, handler) {
        if (this.eventListeners[eventName] != undefined) {
            var el = this.eventListeners[eventName];
            for (var i = 0; i < el.length; ++i) {
                if (el[i] === listener) {
                    el.splice (i, 1);
                    if (el.length == 0) {
                        delete this.eventListeners[eventName];
                    }
                    break;
                }
            }
        }
    },
    
    /**
     * Fires an event.
     *
     * @param {String} eventName the name of the event to fire
     * @param {bigshot.Event} eventObject the event object to pass to the handlers
     */
    fireEvent : function (eventName, eventObject) {
        if (this.eventListeners[eventName] != undefined) {
            var el = this.eventListeners[eventName];
            for (var i = 0; i < el.length; ++i) {
                el[i](eventObject);
            }
        }
    }
};