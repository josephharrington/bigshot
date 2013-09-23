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
 * Creates a new labeled hotspot instance.
 *
 * @class A point hotspot consisting of an image.
 *
 * @see bigshot.HotspotLayer
 * @param {number} x x-coordinate of the center corner, given in full image pixels
 * @param {number} y y-coordinate of the center corner, given in full image pixels
 * @param {number} w width of the hotspot, given in screen pixels
 * @param {number} h height of the hotspot, given in screen pixels
 * @param {number} xo x-offset, given in screen pixels
 * @param {number} yo y-offset, given in screen pixels
 * @param {HTMLElement} element the HTML element to position
 * @param {String} [imageUrl] the image to use as hotspot sprite
 * @augments bigshot.Hotspot
 */
bigshot.PointHotspot = function (x, y, w, h, xo, yo, imageUrl) {
    bigshot.Hotspot.call (this, x, y, w, h);
    this.xo = xo;
    this.yo = yo;
    
    if (imageUrl) {
        var el = this.getElement ();
        el.style.backgroundImage = "url('" + imageUrl + "')";
        el.style.backgroundRepeat = "no-repeat";
    }
}

bigshot.PointHotspot.prototype = {
    /**
     * Returns the label element.
     *
     * @type HTMLDivElement
     */
    getLabel : function () {
        return this.label;
    },
    
    layout : function (x0, y0, zoomFactor) {
        var sx = this.x * zoomFactor + x0 + this.xo;
        var sy = this.y * zoomFactor + y0 + this.yo;
        this.element.style.top = sy + "px";
        this.element.style.left = sx + "px";
        this.element.style.width = this.w + "px";
        this.element.style.height = this.h + "px";
    }
};

bigshot.Object.extend (bigshot.PointHotspot, bigshot.Hotspot);

