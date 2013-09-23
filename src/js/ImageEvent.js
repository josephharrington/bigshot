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
 * Creates an image event.
 *
 * @class Base class for events dispatched by bigshot.ImageBase.
 * @param {Object} data a data object whose fields will be used to set the 
 * corresponding fields of the event object.
 * @extends bigshot.Event
 * @see bigshot.ImageBase
 */
bigshot.ImageEvent = function (data) {
    bigshot.Event.call (this, data);
}

/**
 * The image X coordinate of the event, if any.
 *
 * @name bigshot.ImageEvent#imageX
 * @field
 * @type number
 */

/**
 * The image Y coordinate of the event, if any.
 *
 * @name bigshot.ImageEvent#imageY
 * @field
 * @type number
 */

/**
 * The client X coordinate of the event, if any.
 *
 * @name bigshot.ImageEvent#clientX
 * @field
 * @type number
 */

/**
 * The client Y coordinate of the event, if any.
 *
 * @name bigshot.ImageEvent#clientY
 * @field
 * @type number
 */

/**
 * The local X coordinate of the event, if any.
 *
 * @name bigshot.ImageEvent#localX
 * @field
 * @type number
 */

/**
 * The local Y coordinate of the event, if any.
 *
 * @name bigshot.ImageEvent#localY
 * @field
 * @type number
 */


bigshot.ImageEvent.prototype = {
};

bigshot.Object.extend (bigshot.ImageEvent, bigshot.Event);