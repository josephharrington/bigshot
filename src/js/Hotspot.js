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
 * Creates a new hotspot instance.
 *
 * @class Base class for hotspots in a {@link bigshot.HotspotLayer}. See {@link bigshot.HotspotLayer} for 
 * examples.
 *
 * @param {number} x x-coordinate of the top-left corner, given in full image pixels
 * @param {number} y y-coordinate of the top-left corner, given in full image pixels
 * @param {number} w width of the hotspot, given in full image pixels
 * @param {number} h height of the hotspot, given in full image pixels
 * @see bigshot.HotspotLayer
 * @see bigshot.LabeledHotspot
 * @see bigshot.LinkHotspot
 * @constructor
 */
bigshot.Hotspot = function (x, y, w, h) {
    var element = document.createElement ("div");
    element.style.position = "absolute";
    element.style.overflow = "visible";
    
    this.element = element;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
}

bigshot.Hotspot.prototype = {
    
    browser : new bigshot.Browser (),
    
    /**
     * Lays out the hotspot in the viewport.
     *
     * @name bigshot.Hotspot#layout
     * @param x0 x-coordinate of top-left corner of the full image in css pixels
     * @param y0 y-coordinate of top-left corner of the full image in css pixels
     * @param zoomFactor the zoom factor.
     * @function
     */
    layout : function (x0, y0, zoomFactor) {
        var sx = this.x * zoomFactor + x0;
        var sy = this.y * zoomFactor + y0;
        var sw = this.w * zoomFactor;
        var sh = this.h * zoomFactor;
        this.element.style.top = sy + "px";
        this.element.style.left = sx + "px";
        this.element.style.width = sw + "px";
        this.element.style.height = sh + "px";
    },
    
    /**
     * Returns the HTMLDivElement used to show the hotspot.
     * Clients can access this element in order to style it.
     *
     * @type HTMLDivElement
     */
    getElement : function () {
        return this.element;
    }
};
