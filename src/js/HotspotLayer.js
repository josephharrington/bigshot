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
 * Creates a new hotspot layer. The layer must be added to the image using
 * {@link bigshot.ImageBase#addLayer}.
 *
 * @class A hotspot layer.
 * @example
 * var image = new bigshot.Image (...);
 * var hotspotLayer = new bigshot.HotspotLayer (image);
 * var hotspot = new bigshot.LinkHotspot (100, 100, 200, 100, 
 *    "Bigshot on Google Code", 
 *    "http://code.google.com/p/bigshot/");
 *
 * // Style the hotspot a bit
 * hotspot.getElement ().className = "hotspot"; 
 * hotspot.getLabel ().className = "label";
 *
 * hotspotLayer.addHotspot (hotspot);
 *
 * image.addLayer (hotspotLayer);
 * 
 * @param {bigshot.ImageBase} image the image this hotspot layer will be part of
 * @augments bigshot.Layer
 * @constructor
 */
bigshot.HotspotLayer = function (image) {
    this.image = image;
    this.hotspots = new Array ();
    this.browser = new bigshot.Browser ();
    this.container = image.createLayerContainer ();
    this.parentContainer = image.getContainer ();
    this.resize (0, 0);
}

bigshot.HotspotLayer.prototype = {
    
    getContainer : function () {
        return this.container;
    },
    
    resize : function (w, h) {
        this.container.style.width = this.parentContainer.clientWidth + "px";
        this.container.style.height = this.parentContainer.clientHeight + "px";
    },
    
    layout : function (zoom, x0, y0, tx0, ty0, size, stride, opacity) {
        var zoomFactor = Math.pow (2, this.image.getZoom ());
        x0 -= stride * tx0;
        y0 -= stride * ty0;
        for (var i = 0; i < this.hotspots.length; ++i) {
            this.hotspots[i].layout (x0, y0, zoomFactor);
        }            
    },
    
    setMaxTiles : function (mtx, mty) {
    },
    
    /**
     * Adds a hotspot to the layer. 
     *
     * @param {bigshot.Hotspot} hotspot the hotspot to add.
     */
    addHotspot : function (hotspot) {
        this.container.appendChild (hotspot.getElement ());
        this.hotspots.push (hotspot);
    }
}

bigshot.Object.validate ("bigshot.HotspotLayer", bigshot.Layer);
