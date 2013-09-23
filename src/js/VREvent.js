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
 * @class Base class for events dispatched by bigshot.VRPanorama.
 * @param {Object} data a data object whose fields will be used to set the 
 * corresponding fields of the event object.
 * @extends bigshot.Event
 * @see bigshot.VRPanorama
 */
bigshot.VREvent = function (data) {
    bigshot.Event.call (this, data);
}

/**
 * The yaw coordinate of the event, if any.
 *
 * @name bigshot.VREvent#yaw
 * @field
 * @type number
 */

/**
 * The pitch coordinate of the event, if any.
 *
 * @name bigshot.VREvent#pitch
 * @field
 * @type number
 */

/**
 * The client X coordinate of the event, if any.
 *
 * @name bigshot.VREvent#clientX
 * @field
 * @type number
 */

/**
 * The client Y coordinate of the event, if any.
 *
 * @name bigshot.VREvent#clientY
 * @field
 * @type number
 */

/**
 * The local X coordinate of the event, if any.
 *
 * @name bigshot.VREvent#localX
 * @field
 * @type number
 */

/**
 * The local Y coordinate of the event, if any.
 *
 * @name bigshot.VREvent#localY
 * @field
 * @type number
 */

/**
 * A x,y,z triplet specifying a 3D ray from the viewer in the direction the 
 * event took place. The same as the yaw and pitch fields, but in Cartesian 
 * coordinates.
 *
 * @name bigshot.VREvent#ray
 * @field
 * @type xyz-triplet
 */


bigshot.VREvent.prototype = {
};

bigshot.Object.extend (bigshot.VREvent, bigshot.Event);