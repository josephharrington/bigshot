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
 * Creates a new rectangular hotspot and attaches it to a VR panorama.
 *
 * @class A rectangular VR panorama hotspot.
 *
 * A rectangular hotspot is simply an HTML element that is moved / resized / hidden etc.
 * to overlay a given rectangle in the panorama. The element is moved
 * by setting its <code>style.top</code> and <code>style.left</code>
 * values, and resized by setting its <code>style.width</code> and <code>style.height</code>
 * values.
 *
 * @augments bigshot.VRHotspot
 * @param {bigshot.VRPanorama} panorama the panorama to attach this hotspot to
 * @param {number} yaw0 the yaw coordinate of the top-left corner of the hotspot
 * @param {number} pitch0 the pitch coordinate of the top-left corner of the hotspot
 * @param {number} yaw1 the yaw coordinate of the bottom-right corner of the hotspot
 * @param {number} pitch1 the pitch coordinate of the bottom-right corner of the hotspot
 * @param {HTMLElement} element the HTML element
 */
bigshot.VRRectangleHotspot = function (panorama, yaw0, pitch0, yaw1, pitch1, element) {
    bigshot.VRHotspot.call (this, panorama);
    
    this.element = element;
    this.point0 = this.toVector (yaw0, pitch0);
    this.point1 = this.toVector (yaw1, pitch1);
}

bigshot.VRRectangleHotspot.prototype = {
    layout : function () {
        var p = this.toScreen (this.point0);
        var p1 = this.toScreen (this.point1);
        
        var visible = false;
        if (p != null && p1 != null) {
            var cd = {
                x : p.x,
                y : p.y,
                opacity : 1.0,
                w : p1.x - p.x,
                h : p1.y - p.y
            };
            
            if (this.clip (cd)) {
                this.element.style.top = (cd.y) + "px";
                this.element.style.left = (cd.x) + "px";
                this.element.style.width = (cd.w) + "px";
                this.element.style.height = (cd.h) + "px";
                this.element.style.visibility = "inherit";
                visible = true;
            }
        }
        
        if (!visible) {
            this.element.style.visibility = "hidden";
        }
    }
}

bigshot.Object.extend (bigshot.VRRectangleHotspot, bigshot.VRHotspot);
bigshot.Object.validate ("bigshot.VRRectangleHotspot", bigshot.VRHotspot);
