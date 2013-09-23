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
 * Creates a new link-hotspot instance.
 *
 * @class A labeled hotspot that takes the user to another
 * location when it is clicked on. See {@link bigshot.HotspotLayer} for 
 * examples.
 *
 * @see bigshot.HotspotLayer
 * @param {number} x x-coordinate of the top-left corner, given in full image pixels
 * @param {number} y y-coordinate of the top-left corner, given in full image pixels
 * @param {number} w width of the hotspot, given in full image pixels
 * @param {number} h height of the hotspot, given in full image pixels
 * @param {String} labelText text of the label
 * @param {String} url url to go to on click
 * @augments bigshot.LabeledHotspot
 * @constructor
 */
bigshot.LinkHotspot = function (x, y, w, h, labelText, url) {
    bigshot.LabeledHotspot.call (this, x, y, w, h, labelText);
    this.browser.registerListener (this.getElement (), "click", function () {
            document.location.href = url;
        });
};

bigshot.Object.extend (bigshot.LinkHotspot, bigshot.LabeledHotspot);
