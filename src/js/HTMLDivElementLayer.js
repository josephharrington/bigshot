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
 * Creates a new HTML element layer. The layer must be added to the image using
 * {@link bigshot.ImageBase#addLayer}.
 *
 * @class A layer consisting of a single HTML element that is moved and scaled to cover
 * the layer.
 * @example
 * var image = new bigshot.Image (...);
 * image.addLayer (
 *     new bigshot.HTMLElementLayer (this, this.imgElement, this.parameters.width, this.parameters.height)
 * );
 * @param {bigshot.ImageBase} image the image this hotspot layer will be part of
 * @param {HTMLElement} element the element to present in this layer
 * @param {int} width the width, in image pixels (display size at zoom level 0), of the HTML element
 * @param {int} height the height, in image pixels (display size at zoom level 0), of the HTML element
 * @augments bigshot.Layer
 */
bigshot.HTMLDivElementLayer = function (image, element, width, height, wrapX, wrapY) {
    this.wrapX = wrapX;
    this.wrapY = wrapY;
    this.hotspots = new Array ();
    this.browser = new bigshot.Browser ();
    this.image = image;
    this.container = image.createLayerContainer ();
    this.parentContainer = image.getContainer ();
    this.element = element;
    this.parentContainer.appendChild (element);
    this.w = width;
    this.h = height;
    this.resize (0, 0);
}

bigshot.HTMLDivElementLayer.prototype = {
    
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
        
        var imW = (this.w * zoomFactor);
        var imH = (this.h * zoomFactor);
        
        this.element.style.backgroundSize = imW + "px " + imH + "px";
            
        var bposX = "0px";
        var bposY = "0px";
        
        if (this.wrapY) {
            this.element.style.top = "0px";
            this.element.style.height = (this.parentContainer.clientHeight) + "px";
            bposY = y0 + "px";
        } else {
            this.element.style.top = y0 + "px";
            this.element.style.height = imH + "px";
        }
        
        if (this.wrapX) {
            this.element.style.left = "0px";
            this.element.style.width = (this.parentContainer.clientWidth) + "px";            
            bposX = x0 + "px";
        } else {
            this.element.style.left = x0 + "px";
            this.element.style.width = imW + "px";
        }
        
        this.element.style.backgroundPosition = bposX + " " + bposY;
    },
    
    setMaxTiles : function (mtx, mty) {
    }
}

bigshot.Object.validate ("bigshot.HTMLDivElementLayer", bigshot.Layer);
