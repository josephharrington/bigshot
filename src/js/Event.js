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
 * Creates an event.
 *
 * @class Base class for events. The interface is supposed to be as similar to
 * standard DOM events as possible.
 * @param {Object} data a data object whose fields will be used to set the 
 * corresponding fields of the event object.
 */
bigshot.Event = function (data) {

    /**
     * Indicates whether the event bubbles.
     * @default false
     * @type boolean
     */
    this.bubbles = false;
    
    /**
     * Indicates whether the event is cancelable.
     * @default false
     * @type boolean
     */
    this.cancelable = false;
    
    /**
     * The current target of the event
     * @default null
     */
    this.currentTarget = null;
    
    /**
     * Set if the preventDefault method has been called.
     * @default false
     * @type boolean
     */
    this.defaultPrevented = false;

    /**
     * The target to which the event is dispatched.
     * @default null
     */
    this.target = null;
    
    /**
     * The time the event was created, in milliseconds since the epoch.
     * @default the current time, as given by <code>new Date ().getTime ()</code>
     * @type number
     */
    this.timeStamp = new Date ().getTime ();
    
    /**
     * The event type.
     * @default null
     * @type String
     */
    this.type = null;
    
    /**
     * Flag indicating origin of event.
     * @default false
     * @type boolean
     */
    this.isTrusted = false;
    
    for (var k in data) {
        this[k] = data[k];
    }
}

bigshot.Event.prototype = {
    /**
     * Prevents default handling of the event.
     */
    preventDefault : function () {
        this.defaultPrevented = true;
    }
};