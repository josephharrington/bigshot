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
 * Creates a new point-hotspot and attaches it to a VR panorama.
 *
 * @class A VR panorama point-hotspot.
 *
 * A Hotspot is simply an HTML element that is moved / hidden etc.
 * to overlay a given position in the panorama. The element is moved
 * by setting its <code>style.top</code> and <code>style.left</code>
 * values.
 *
 * @augments bigshot.VRHotspot
 * @param {bigshot.VRPanorama} panorama the panorama to attach this hotspot to
 * @param {number} yaw the yaw coordinate of the hotspot
 * @param {number} pitch the pitch coordinate of the hotspot
 * @param {HTMLElement} element the HTML element
 * @param {number} offsetX the offset to add to the screen coordinate corresponding
 * to the hotspot's polar coordinates. Use this to center the hotspot horizontally.
 * @param {number} offsetY the offset to add to the screen coordinate corresponding
 * to the hotspot's polar coordinates. Use this to center the hotspot vertically.
 */
bigshot.VRPointHotspot = function (panorama, yaw, pitch, element, offsetX, offsetY) {
    bigshot.VRHotspot.call (this, panorama);
    this.element = element;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.point = this.toVector (yaw, pitch);
}
 
bigshot.VRPointHotspot.prototype = {
    layout : function () {
        var p = this.toScreen (this.point);
        
        var visible = false;
        if (p != null) {
            var s = this.panorama.browser.getElementSize (this.element);
            p.w = s.w;
            p.h = s.h;
            
            p.x += this.offsetX;
            p.y += this.offsetY;
            
            if (this.clip (p)) {
                this.element.style.top = (p.y) + "px";
                this.element.style.left = (p.x) + "px";
                this.element.style.width = (p.w) + "px";
                this.element.style.height = (p.h) + "px";
                if (p.opacity) {
                    this.element.style.opacity = p.opacity;
                }
                this.element.style.visibility = "inherit";
                visible = true;
            }
        }
        
        if (!visible) {
            this.element.style.visibility = "hidden";
        }
    }
}

bigshot.Object.extend (bigshot.VRPointHotspot, bigshot.VRHotspot);
bigshot.Object.validate ("bigshot.VRPointHotspot", bigshot.VRHotspot);
