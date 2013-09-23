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
 * Sets up base image functionality.
 * 
 * @param {bigshot.ImageParameters} parameters the image parameters
 * @class Base class for image viewers.
 * @extends bigshot.EventDispatcher
 */     
bigshot.ImageBase = function (parameters) {
    // Base class init
    bigshot.EventDispatcher.call (this);
    
    this.parameters = parameters;
    this.flying = 0;
    this.container = parameters.container;
    this.x = parameters.width / 2.0;
    this.y = parameters.height / 2.0;
    this.zoom = 0.0;
    this.width = parameters.width;
    this.height = parameters.height;
    this.minZoom = parameters.minZoom;
    this.maxZoom = parameters.maxZoom;
    this.tileSize = parameters.tileSize;
    this.overlap = 0;
    this.imageTileCache = null;
    
    this.dragStart = null;
    this.dragged = false;
    
    this.layers = new Array ();
    
    this.fullScreenHandler = null;
    this.currentGesture = null;
    
    var that = this;
    this.onresizeHandler = function (e) {
        that.onresize ();
    }
    
    /**
     * Helper function to consume events.
     * @private
     */
    var consumeEvent = function (event) {
        if (event.preventDefault) {
            event.preventDefault ();
        }
        return false;
    };
    
    /**
     * Helper function to translate touch events to mouse-like events.
     * @private
     */
    var translateEvent = function (event) {
        if (event.clientX) {
            return event;
        } else {
            return {
                clientX : event.changedTouches[0].clientX,
                clientY : event.changedTouches[0].clientY,
                changedTouches : event.changedTouches
            };
        };
    };
    
    this.setupLayers ();
    
    this.resize ();
    
    this.allListeners = {
        "DOMMouseScroll" : function (e) {
            that.mouseWheel (e);
            return consumeEvent (e);
        },
        "mousewheel" : function (e) {
            that.mouseWheel (e);
            return consumeEvent (e);
        },
        "dblclick" : function (e) {
            that.mouseDoubleClick (e);
            return consumeEvent (e);
        },
        "mousedown" : function (e) {
            that.dragMouseDown (e);
            return consumeEvent (e);
        },
        "gesturestart" : function (e) {
            that.gestureStart (e);
            return consumeEvent (e);
        },
        "gesturechange" : function (e) {
            that.gestureChange (e);
            return consumeEvent (e);
        },
        "gestureend" : function (e) {
            that.gestureEnd (e);
            return consumeEvent (e);
        },
        "touchstart" : function (e) {
            that.dragMouseDown (translateEvent (e));
            return consumeEvent (e);
        },
        "mouseup" : function (e) {
            that.dragMouseUp (e);
            return consumeEvent (e);
        },
        "touchend" : function (e) {
            that.dragMouseUp (translateEvent (e));
            return consumeEvent (e);
        },
        "mousemove" : function (e) {
            that.dragMouseMove (e);
            return consumeEvent (e);
        },
        "mouseout" : function (e) {
            //that.dragMouseUp (e);
            return consumeEvent (e);
        },
        "touchmove" : function (e) {
            that.dragMouseMove (translateEvent (e));
            return consumeEvent (e);
        }
    };
    
    this.addEventListeners ();
    this.browser.registerListener (window, 'resize', that.onresizeHandler, false);
    this.zoomToFit ();
}    

bigshot.ImageBase.prototype = {
    /**
     * Browser helper and compatibility functions.
     *
     * @private
     * @type bigshot.Browser
     */
    browser : new bigshot.Browser (),
    
    /**
     * Adds all event listeners to the container object.
     * @private
     */
    addEventListeners : function () {
        for (var k in this.allListeners) {
            this.browser.registerListener (this.container, k, this.allListeners[k], false);
        }
    },
    
    /**
     * Removes all event listeners from the container object.
     * @private
     */
    removeEventListeners : function () {
        for (var k in this.allListeners) {
            this.browser.unregisterListener (this.container, k, this.allListeners[k], false);
        }
    },
    
    /**
     * Sets up the initial layers of the image. Override in subclass.
     */
    setupLayers : function () {
    },
    
    /**
     * Returns the base 2 logarithm of the maximum texture stretching, allowing for device pixel scaling.
     * @type number
     * @private
     */
    getTextureStretch : function () {
        var ts = Math.log (this.parameters.maxTextureMagnification / this.browser.getDevicePixelScale ()) / Math.LN2;
        return ts;
    },
    
    /**
     * Constrains the x and y coordinates to allowed values
     * @param {number} x the initial x coordinate
     * @param {number} y the initial y coordinate
     * @return {number} .x the constrained x coordinate
     * @return {number} .y the constrained y coordinate
     */
    clampXY : function (x, y) {
        var viewportWidth = this.container.clientWidth;
        var viewportHeight = this.container.clientHeight;
        
        var realZoomFactor = Math.pow (2, this.zoom);
        /*
        Constrain X and Y
        */
        var viewportWidthInImagePixels = viewportWidth / realZoomFactor;
        var viewportHeightInImagePixels = viewportHeight / realZoomFactor;
        
        var constrain = function (viewportSizeInImagePixels, imageSizeInImagePixels, p) {
            var min = viewportSizeInImagePixels / 2;
            min = Math.min (imageSizeInImagePixels / 2, min);
            if (p < min) {
                p = min;
            }
            
            var max = imageSizeInImagePixels - viewportSizeInImagePixels / 2;
            max = Math.max (imageSizeInImagePixels / 2, max);
            if (p > max) {
                p = max;
            }
            return p;
        };
        
        var o = {};
        if (x != null) {
            o.x = constrain (viewportWidthInImagePixels, this.width, x);
        }
        
        if (y != null) {
            o.y = constrain (viewportHeightInImagePixels, this.height, y);
        }
        
        return o;
    },
    
    /**
     * Lays out all layers according to the current 
     * x, y and zoom values.
     *
     * @public
     */
    layout : function () {
        var viewportWidth = this.container.clientWidth;
        var viewportHeight = this.container.clientHeight;
        
        var zoomWithStretch = Math.min (this.maxZoom, Math.max (this.zoom - this.getTextureStretch (), this.minZoom));
        
        var zoomLevel = Math.min (0, Math.ceil (zoomWithStretch));
        var zoomFactor = Math.pow (2, zoomLevel);
        
        var clamped = this.clampXY (this.x, this.y);
        
        if (!this.parameters.wrapY) {
            this.y = clamped.y;
        }
        
        if (!this.parameters.wrapX) {
            this.x = clamped.x;
        }
        
        var tileWidthInRealPixels = this.tileSize / zoomFactor;
        
        var fractionalZoomFactor = Math.pow (2, this.zoom - zoomLevel);
        var tileDisplayWidth = this.tileSize * fractionalZoomFactor;
        
        var widthInTiles = this.width / tileWidthInRealPixels;
        var heightInTiles = this.height / tileWidthInRealPixels;
        var centerInTilesX = this.x / tileWidthInRealPixels;
        var centerInTilesY = this.y / tileWidthInRealPixels;
        
        var topLeftInTilesX = centerInTilesX - (viewportWidth / 2) / tileDisplayWidth;
        var topLeftInTilesY = centerInTilesY - (viewportHeight / 2) / tileDisplayWidth;
        
        var topLeftTileX = Math.floor (topLeftInTilesX);
        var topLeftTileY = Math.floor (topLeftInTilesY);
        var topLeftTileXoffset = Math.round ((topLeftInTilesX - topLeftTileX) * tileDisplayWidth);
        var topLeftTileYoffset = Math.round ((topLeftInTilesY - topLeftTileY) * tileDisplayWidth);
        
        for (var i = 0; i < this.layers.length; ++i) {
            this.layers[i].layout (
                zoomWithStretch, 
                -topLeftTileXoffset - tileDisplayWidth, -topLeftTileYoffset - tileDisplayWidth, 
                topLeftTileX - 1, topLeftTileY - 1, 
                Math.ceil (tileDisplayWidth), Math.ceil (tileDisplayWidth), 
                1.0);
        }
    },
    
    /**
     * Resizes the layers of this image.
     *
     * @public
     */
    resize : function () {
        var tilesW = Math.ceil (2 * this.container.clientWidth / this.tileSize) + 2;
        var tilesH = Math.ceil (2 * this.container.clientHeight / this.tileSize) + 2;
        for (var i = 0; i < this.layers.length; ++i) {
            this.layers[i].resize (tilesW, tilesH);
        }
    },
    
    /**
     * Creates a HTML div container for a layer. This method
     * is called by the layer's constructor to obtain a 
     * container.
     *
     * @public
     * @type HTMLDivElement
     */
    createLayerContainer : function () {
        var layerContainer = document.createElement ("div");
        layerContainer.style.position = "absolute";
        layerContainer.style.overflow = "hidden";
        return layerContainer;
    },
    
    /**
     * Returns the div element used as viewport.
     *
     * @public
     * @type HTMLDivElement
     */
    getContainer : function () {
        return this.container;
    },
    
    /**
     * Adds a new layer to the image.
     *
     * @public
     * @see bigshot.HotspotLayer for usage example
     * @param {bigshot.Layer} layer the layer to add.
     */
    addLayer : function (layer) {
        this.container.appendChild (layer.getContainer ());
        this.layers.push (layer);
    },
    
    /**
     * Clamps the zoom value to be between minZoom and maxZoom.
     *
     * @param {number} zoom the zoom value
     * @type number
     */
    clampZoom : function (zoom) {
        return Math.min (this.maxZoom, Math.max (zoom, this.minZoom));
    },
    
    /**
     * Sets the current zoom value.
     *
     * @private
     * @param {number} zoom the zoom value.
     * @param {boolean} [layout] trigger a viewport update after setting. Defaults to <code>false</code>.
     */
    setZoom : function (zoom, updateViewport) {
        this.zoom = this.clampZoom (zoom);
        var zoomLevel = Math.ceil (this.zoom - this.getTextureStretch ());
        var zoomFactor = Math.pow (2, zoomLevel);
        var maxTileX = Math.ceil (zoomFactor * this.width / this.tileSize);
        var maxTileY = Math.ceil (zoomFactor * this.height / this.tileSize);
        for (var i = 0; i < this.layers.length; ++i) {
            this.layers[i].setMaxTiles (maxTileX, maxTileY);
        }
        if (updateViewport) {
            this.layout ();
        }
    },
    
    /**
     * Sets the maximum zoom value. The maximum magnification (of the full-size image)
     * is 2<sup>maxZoom</sup>. Set to 0.0 to avoid pixelation.
     *
     * @public
     * @param {number} maxZoom the maximum zoom value
     */
    setMaxZoom : function (maxZoom) {
        this.maxZoom = maxZoom;
    },
    
    /**
     * Gets the maximum zoom value. The maximum magnification (of the full-size image)
     * is 2<sup>maxZoom</sup>.
     * 
     * @public
     * @type number
     */
    getMaxZoom : function () {
        return this.maxZoom;
    },
    
    /**
     * Sets the minimum zoom value. The minimum magnification (of the full-size image)
     * is 2<sup>minZoom</sup>, so a minZoom of <code>-3</code> means that the smallest
     * image shown will be one-eighth of the full-size image.
     *
     * @public
     * @param {number} minZoom the minimum zoom value for this image
     */
    setMinZoom : function (minZoom) {
        this.minZoom = minZoom;
    },
    
    /**
     * Gets the minimum zoom value. The minimum magnification (of the full-size image)
     * is 2<sup>minZoom</sup>, so a minZoom of <code>-3</code> means that the smallest
     * image shown will be one-eighth of the full-size image.
     * 
     * @public
     * @type number
     */
    getMinZoom : function () {
        return this.minZoom;
    },
    
    /**
     * Adjusts a coordinate so that the center of zoom
     * remains constant during zooming operations. The
     * method is intended to be called twice, once for x 
     * and once for y. The <code>current</code> and 
     * <code>centerOfZoom</code> values will be the current
     * and the center for the x and y, respectively.
     *
     * @example
     * this.x = this.adjustCoordinateForZoom (this.x, zoomCenterX, oldZoom, newZoom);
     * this.y = this.adjustCoordinateForZoom (this.y, zoomCenterY, oldZoom, newZoom);
     *
     * @param {number} current the current value of the coordinate
     * @param {number} centerOfZoom the center of zoom along the coordinate axis
     * @param {number} oldZoom the old zoom value
     * @param {number} oldZoom the new zoom value 
     * @type number
     * @returns the new value for the coordinate
     */
    adjustCoordinateForZoom : function (current, centerOfZoom, oldZoom, newZoom) {
        var zoomRatio = Math.pow (2, oldZoom) / Math.pow (2, newZoom);
        return centerOfZoom + (current - centerOfZoom) * zoomRatio;
    },
    
    /**
     * Begins a potential drag event.
     *
     * @private
     */
    gestureStart : function (event) {
        this.currentGesture = {
            startZoom : this.zoom,
            scale : event.scale
        };            
    },
    
    /**
     * Ends a gesture.
     *
     * @param {Event} event the <code>gestureend</code> event
     * @private
     */
    gestureEnd : function (event) {
        this.currentGesture = null;
        if (this.dragStart) {
            this.dragStart.hadGesture = true;
        }
    },
    
    /**
     * Adjusts the zoom level based on the scale property of the
     * gesture.
     *
     * @private
     */
    gestureChange : function (event) {
        if (this.currentGesture) {
            if (this.dragStart) {
                this.dragStart.hadGesture = true;
            }
            
            var newZoom = this.clampZoom (this.currentGesture.startZoom + Math.log (event.scale) / Math.log (2));
            var oldZoom = this.getZoom ();
            if (this.currentGesture.clientX !== undefined && this.currentGesture.clientY !== undefined) {
                var centerOfZoom = this.clientToImage (this.currentGesture.clientX, this.currentGesture.clientY);
                
                var nx = this.adjustCoordinateForZoom (this.x, centerOfZoom.x, oldZoom, newZoom);
                var ny = this.adjustCoordinateForZoom (this.y, centerOfZoom.y, oldZoom, newZoom);
                
                this.moveTo (nx, ny, newZoom);
            } else {
                this.setZoom (newZoom);
                this.layout ();
            }
        }
    },
    
    /**
     * Begins a potential drag event.
     *
     * @private
     */
    dragMouseDown : function (event) {
        this.dragStart = {
            x : event.clientX,
            y : event.clientY
        };
        this.dragLast = {
            clientX : event.clientX,
            clientY : event.clientY,
            dx : 0,
            dy : 0,
            dt : 1000000,
            time : new Date ().getTime ()
        };
        this.dragged = false;
    },
    
    /**
     * Handles a mouse drag event by panning the image.
     * Also sets the dragged flag to indicate that the
     * following <code>click</code> event should be ignored.
     * @private
     */
    dragMouseMove : function (event) {
        if (this.currentGesture != null && event.changedTouches != null && event.changedTouches.length > 0) {
            var cx = 0;
            var cy = 0;
            for (var i = 0; i < event.changedTouches.length; ++i) {
                cx += event.changedTouches[i].clientX;
                cy += event.changedTouches[i].clientY;
            }
            this.currentGesture.clientX = cx / event.changedTouches.length;
            this.currentGesture.clientY = cy / event.changedTouches.length;
        }        
        
        if (this.currentGesture == null && this.dragStart != null) {
            var delta = {
                x : event.clientX - this.dragStart.x,
                y : event.clientY - this.dragStart.y
            };
            if (delta.x != 0 || delta.y != 0) {
                this.dragged = true;
            }
            var zoomFactor = Math.pow (2, this.zoom);
            var realX = delta.x / zoomFactor;
            var realY = delta.y / zoomFactor;
            
            this.dragStart = {
                x : event.clientX,
                y : event.clientY
            };
            
            var dt = new Date ().getTime () - this.dragLast.time;
            if (dt > 20) {
                this.dragLast = {
                    dx : this.dragLast.clientX - event.clientX,
                    dy : this.dragLast.clientY - event.clientY,
                    dt : dt,
                    clientX : event.clientX,
                    clientY : event.clientY,
                    time : new Date ().getTime ()
                };
            }
            
            this.moveTo (this.x - realX, this.y - realY);
        }
    },
    
    /**
     * Ends a drag event by freeing the associated structures.
     * @private
     */
    dragMouseUp : function (event) {
        if (this.currentGesture == null && !this.dragStart.hadGesture && this.dragStart != null) {
            this.dragStart = null;
            if (!this.dragged) {
                this.mouseClick (event);
            } else {
                var scale = Math.pow (2, this.zoom);
                var dx = this.dragLast.dx / scale;
                var dy = this.dragLast.dy / scale;
                var ds = Math.sqrt (dx * dx + dy * dy);
                var dt = this.dragLast.dt;
                var dtb = new Date ().getTime () - this.dragLast.time;
                this.dragLast = null;
                
                var v = dt > 0 ? (ds / dt) : 0;
                if (v > 0.05 && dtb < 250 && dt > 20 && this.parameters.fling) {
                    var t0 = new Date ().getTime ();
                    
                    dx /= dt;
                    dy /= dt;
                    
                    this.flyTo (this.x + dx * 250, this.y + dy * 250, this.zoom);
                }   
            }
        }
    },
    
    /**
     * Mouse double-click handler. Pans to the clicked point and
     * zooms in half a zoom level (approx 40%).
     * @private
     */
    mouseDoubleClick : function (event) {
        var eventData = this.createImageEventData ({
                type : "dblclick",
                clientX : event.clientX,
                clientY : event.clientY
            });
        this.fireEvent ("dblclick", eventData);
        if (!eventData.defaultPrevented) {
            this.flyTo (eventData.imageX, eventData.imageY, this.zoom + 0.5);
        }
    },
    
    /**
     * Returns the current zoom level.
     *
     * @public
     * @type number
     */
    getZoom : function () {
        return this.zoom;
    },
    
    /**
     * Stops any current flyTo operation and sets the current position.
     *
     * @param [x] the new x-coordinate
     * @param [y] the new y-coordinate
     * @param [zoom] the new zoom level
     * @param [updateViewport=true] updates the viewport
     * @public
     */
    moveTo : function (x, y, zoom, updateViewport) {
        this.stopFlying ();
        
        if (x != null || y != null) {
            this.setPosition (x, y, false);
        }
        if (zoom != null) {
            this.setZoom (zoom, false);
        }
        if (updateViewport == undefined || updateViewport == true) {
            this.layout ();
        }
    },
    
    /**
     * Sets the current position.
     *
     * @param [x] the new x-coordinate
     * @param [y] the new y-coordinate
     * @param [updateViewport=true] if the viewport should be updated
     * @private
     */
    setPosition : function (x, y, updateViewport) {
        var clamped = this.clampXY (x, y);
        
        if (x != null) {
            if (this.parameters.wrapX) {
                if (x < 0 || x >= this.width) {
                    x = (x + this.width) % this.width;
                }
            } else {
                x = clamped.x;
            }
            this.x = Math.max (0, Math.min (this.width, x));
        }
        
        if (y != null) {
            if (this.parameters.wrapY) {
                if (y < 0 || y >= this.height) {
                    y = (y + this.height) % this.height;
                }
            } else {
                y = clamped.y;
            }
            this.y = Math.max (0, Math.min (this.height, y));
        }
        
        if (updateViewport != false) {
            this.layout ();
        }
    },
    
    /**
     * Helper function for calculating zoom levels.
     *
     * @public
     * @returns the zoom level at which the given number of full-image pixels
     * occupy the given number of screen pixels.
     * @param {number} imageDimension the image dimension in full-image pixels
     * @param {number} containerDimension the container dimension in screen pixels
     * @type number
     */
    fitZoom : function (imageDimension, containerDimension) {
        var scale = containerDimension / imageDimension;
        return Math.log (scale) / Math.LN2;
    },
    
    /**
     * Returns the maximum zoom level at which the full image
     * is visible in the viewport.
     * @public
     * @type number
     */
    getZoomToFitValue : function () {
        return Math.min (
            this.fitZoom (this.parameters.width, this.container.clientWidth),
            this.fitZoom (this.parameters.height, this.container.clientHeight));
    },
    
    /**
     * Returns the zoom level at which the image fills the whole
     * viewport.
     * @public
     * @type number
     */
    getZoomToFillValue : function () {
        return Math.max (
            this.fitZoom (this.parameters.width, this.container.clientWidth),
            this.fitZoom (this.parameters.height, this.container.clientHeight));
    },
    
    /**
     * Adjust the zoom level to fit the image in the viewport.
     * @public
     */
    zoomToFit : function () {
        this.moveTo (null, null, this.getZoomToFitValue ());
    },
    
    /**
     * Adjust the zoom level to fit the image in the viewport.
     * @public
     */
    zoomToFill : function () {
        this.moveTo (null, null, this.getZoomToFillValue ());
    },
    
    /**
     * Adjust the zoom level to fit the 
     * image height in the viewport.
     * @public
     */
    zoomToFitHeight : function () {
        this.moveTo (null, null, this.fitZoom (this.parameters.height, this.container.clientHeight));
    },
    
    /**
     * Adjust the zoom level to fit the 
     * image width in the viewport.
     * @public
     */
    zoomToFitWidth : function () {
        this.moveTo (null, null, this.fitZoom (this.parameters.width, this.container.clientWidth));
    },
    
    /**
     * Smoothly adjust the zoom level to fit the 
     * image height in the viewport.
     * @public
     */
    flyZoomToFitHeight : function () {
        this.flyTo (null, this.parameters.height / 2, this.fitZoom (this.parameters.height, this.container.clientHeight));
    },
    
    /**
     * Smoothly adjust the zoom level to fit the 
     * image width in the viewport.
     * @public
     */
    flyZoomToFitWidth : function () {
        this.flyTo (this.parameters.width / 2, null, this.fitZoom (this.parameters.width, this.container.clientWidth));
    },
    
    /**
     * Smoothly adjust the zoom level to fit the 
     * full image in the viewport.
     * @public
     */
    flyZoomToFit : function () {
        this.flyTo (this.parameters.width / 2, this.parameters.height / 2, this.getZoomToFitValue ());
    },
    
    /**
     * Converts client-relative screen coordinates to image coordinates.
     *
     * @param {number} clientX the client x-coordinate
     * @param {number} clientY the client y-coordinate
     *
     * @returns {number} .x the image x-coordinate
     * @returns {number} .y the image y-coordinate
     * @type Object
     */
    clientToImage : function (clientX, clientY) {
        var zoomFactor = Math.pow (2, this.zoom);
        return {
            x : (clientX - this.container.clientWidth / 2) / zoomFactor + this.x,
            y : (clientY - this.container.clientHeight / 2) / zoomFactor + this.y
        };
    },
    
    /**
     * Handles mouse wheel actions.
     * @private
     */
    mouseWheelHandler : function (delta, event) {
        var zoomDelta = false;
        if (delta > 0) {
            zoomDelta = 0.5;
        } else if (delta < 0) {
            zoomDelta = -0.5;
        }
        
        if (zoomDelta) {
            var centerOfZoom = this.clientToImage (event.clientX, event.clientY);
            var newZoom = Math.min (this.maxZoom, Math.max (this.getZoom () + zoomDelta, this.minZoom));
            
            var nx = this.adjustCoordinateForZoom (this.x, centerOfZoom.x, this.getZoom (), newZoom);
            var ny = this.adjustCoordinateForZoom (this.y, centerOfZoom.y, this.getZoom (), newZoom);
            
            this.flyTo (nx, ny, newZoom, true);
        }
    },
    
    /**
     * Translates mouse wheel events.
     * @private
     */
    mouseWheel : function (event){
        var delta = 0;
        if (!event) /* For IE. */
            event = window.event;
        if (event.wheelDelta) { /* IE/Opera. */
            delta = event.wheelDelta / 120;
            /*
             * In Opera 9, delta differs in sign as compared to IE.
             */
            if (window.opera)
                delta = -delta;
        } else if (event.detail) { /* Mozilla case. */
            /*
             * In Mozilla, sign of delta is different than in IE.
             * Also, delta is multiple of 3.
             */
            delta = -event.detail;
        }
        
        /*
         * If delta is nonzero, handle it.
         * Basically, delta is now positive if wheel was scrolled up,
         * and negative, if wheel was scrolled down.
         */
        if (delta) {
            this.mouseWheelHandler (delta, event);
        }
        
        /*
         * Prevent default actions caused by mouse wheel.
         * That might be ugly, but we handle scrolls somehow
         * anyway, so don't bother here..
         */
        if (event.preventDefault) {
            event.preventDefault ();
        }
        event.returnValue = false;
    },
    
    /**
     * Triggers a right-sizing of all layers.
     * Called on window resize via the {@link bigshot.ImageBase#onresizeHandler} stub.
     * @public
     */
    onresize : function () {
        this.resize ();
        this.layout ();
    },
    
    /**
     * Returns the current x-coordinate, which is the full-image x coordinate
     * in the center of the viewport.
     * @public
     * @type number
     */
    getX : function () {
        return this.x;
    },
    
    /**
     * Returns the current y-coordinate, which is the full-image x coordinate
     * in the center of the viewport.
     * @public
     * @type number
     */
    getY : function () {
        return this.y;
    },
    
    /**
     * Interrupts the current {@link #flyTo}, if one is active.
     * @public
     */
    stopFlying : function () {
        this.flying++;
    },
    
    /**
     * Smoothly flies to the specified position.
     *
     * @public
     * @param {number} [x=current x] the new x-coordinate
     * @param {number} [y=current y] the new y-coordinate
     * @param {number} [zoom=current zoom] the new zoom level
     * @param {boolean} [uniformApproach=false] if true, uses the same interpolation curve for x, y and zoom.
     */
    flyTo : function (x, y, zoom, uniformApproach) {
        var that = this;
        
        x = x != null ? x : this.x;
        y = y != null ? y : this.y;
        zoom = zoom != null ? zoom : this.zoom;
        uniformApproach = uniformApproach != null ? uniformApproach : false;
        
        var startX = this.x;
        var startY = this.y;
        var startZoom = this.zoom;
        
        var clamped = this.clampXY (x, y);
        var targetX = this.parameters.wrapX ? x : clamped.x;
        var targetY = this.parameters.wrapY ? y : clamped.y;
        var targetZoom = Math.min (this.maxZoom, Math.max (zoom, this.minZoom));
        
        this.flying++;
        var flyingAtStart = this.flying;
        
        var t0 = new Date ().getTime ();
        
        var approach = function (start, target, dt, step, linear) {
            var delta = (target - start);
            
            var diff = - delta * Math.pow (2, -dt * step);
            
            var lin = dt * linear;
            if (delta < 0) {
                diff = Math.max (0, diff - lin);
            } else {
                diff = Math.min (0, diff + lin);
            }
            
            return target + diff;
        };
        
        
        var iter = function () {
            if (that.flying == flyingAtStart) {
                var dt = (new Date ().getTime () - t0) / 1000;
                
                var nx = approach (startX, targetX, dt, uniformApproach ? 10 : 4, uniformApproach ? 0.2 : 1.0);
                var ny = approach (startY, targetY, dt, uniformApproach ? 10 : 4, uniformApproach ? 0.2 : 1.0);
                var nz = approach (startZoom, targetZoom, dt, 10, 0.2);
                var done = true;
                
                var zoomFactor = Math.min (Math.pow (2, that.getZoom ()), 1);
                
                if (Math.abs (nx - targetX) < (0.5 * zoomFactor)) {
                    nx = targetX;
                } else {
                    done = false;
                }
                if (Math.abs (ny - targetY) < (0.5 * zoomFactor)) {
                    ny = targetY;
                } else {
                    done = false;
                }
                if (Math.abs (nz - targetZoom) < 0.02) {
                    nz = targetZoom;
                } else {
                    done = false;
                }
                that.setPosition (nx, ny, false);
                that.setZoom (nz, false);
                that.layout ();
                if (!done) {
                    that.browser.requestAnimationFrame (iter, that.container);
                }
            };
        }
        this.browser.requestAnimationFrame (iter, this.container);
    },
    
    /**
     * Returns the maximum zoom level at which a rectangle with the given dimensions
     * fit into the viewport.
     *
     * @public
     * @param {number} w the width of the rectangle, given in full-image pixels
     * @param {number} h the height of the rectangle, given in full-image pixels
     * @type number
     * @returns the zoom level that will precisely fit the given rectangle
     */        
    rectVisibleAtZoomLevel : function (w, h) {
        return Math.min (
            this.fitZoom (w, this.container.clientWidth),
            this.fitZoom (h, this.container.clientHeight));
    },
    
    /**
     * Returns the base size in screen pixels of the two zoom touch areas.
     * The zoom out border will be getTouchAreaBaseSize() pixels wide,
     * and the center zoom in hotspot will be 2*getTouchAreaBaseSize() pixels wide
     * and tall.
     * @deprecated
     * @type number
     * @public
     */
    getTouchAreaBaseSize : function () {
        var averageSize = ((this.container.clientWidth + this.container.clientHeight) / 2) * 0.2;
        return Math.min (averageSize, Math.min (this.container.clientWidth, this.container.clientHeight) / 6);
    },
    
    /**
     * Creates a new {@link bigshot.ImageEvent} using the supplied data object,
     * transforming the client x- and y-coordinates to local and image coordinates.
     * The returned event object will have the {@link bigshot.ImageEvent#localX}, 
     * {@link bigshot.ImageEvent#localY}, {@link bigshot.ImageEvent#imageX}, 
     * {@link bigshot.ImageEvent#imageY}, {@link bigshot.Event#target} and 
     * {@link bigshot.Event#currentTarget} fields set.
     *
     * @param {Object} data data object with initial values for the event object
     * @param {number} data.clientX the clientX of the event
     * @param {number} data.clientY the clientY of the event
     * @returns the new event object
     * @type bigshot.ImageEvent
     */
    createImageEventData : function (data) {
        var elementPos = this.browser.getElementPosition (this.container);
        data.localX = data.clientX - elementPos.x;
        data.localY = data.clientY - elementPos.y;
        
        var scale = Math.pow (2, this.zoom);
        
        data.imageX = (data.localX - this.container.clientWidth / 2) / scale + this.x;
        data.imageY = (data.localY - this.container.clientHeight / 2) / scale + this.y;
        
        data.target = this;
        data.currentTarget = this;
        
        return new bigshot.ImageEvent (data);
    },
    
    /**
     * Handles mouse click events. If the touch UI is active,
     * we'll pan and/or zoom, as appropriate. If not, we just ignore
     * the event.
     * @private
     */
    mouseClick : function (event) {
        var eventData = this.createImageEventData ({
                type : "click",
                clientX : event.clientX,
                clientY : event.clientY
            });
        this.fireEvent ("click", eventData);
        /*
        if (!eventData.defaultPrevented) {
            if (!this.parameters.touchUI) {
                return;
            }
            if (this.dragged) {
                return;
            }
            
            var zoomOutBorderSize = this.getTouchAreaBaseSize ();
            var zoomInHotspotSize = this.getTouchAreaBaseSize ();
            
            if (Math.abs (clickPos.x) > (this.container.clientWidth / 2 - zoomOutBorderSize) || Math.abs (clickPos.y) > (this.container.clientHeight / 2 - zoomOutBorderSize)) {
                this.flyTo (this.x, this.y, this.zoom - 0.5);
            } else {
                var newZoom = this.zoom;
                if (Math.abs (clickPos.x) < zoomInHotspotSize && Math.abs (clickPos.y) < zoomInHotspotSize) {
                    newZoom += 0.5;
                }
                var scale = Math.pow (2, this.zoom);
                clickPos.x /= scale;
                clickPos.y /= scale;
                this.flyTo (this.x + clickPos.x, this.y + clickPos.y, newZoom);
            }
        }
        */
    },
    
    /**
     * Briefly shows the touch ui zones. See the {@link bigshot.ImageParameters#touchUI}
     * documentation for an explanation of the touch ui.
     * 
     * @public
     * @deprecated All common touch gestures are supported by default.
     * @see bigshot.ImageParameters#touchUI
     * @param {int} [delay] milliseconds before fading out
     * @param {int} [fadeOut] milliseconds to fade out the zone overlays in
     */
    showTouchUI : function (delay, fadeOut) {
        if (!delay) {
            delay = 2500;
        }
        if (!fadeOut) {
            fadeOut = 1000;
        }
        
        var zoomOutBorderSize = this.getTouchAreaBaseSize ();
        var zoomInHotspotSize = this.getTouchAreaBaseSize ();
        var centerX = this.container.clientWidth / 2;
        var centerY = this.container.clientHeight / 2;
        
        var frameDiv = document.createElement ("div");
        frameDiv.style.position = "absolute";
        frameDiv.style.zIndex = "9999";
        frameDiv.style.opacity = 0.9;
        frameDiv.style.width = this.container.clientWidth + "px";
        frameDiv.style.height = this.container.clientHeight + "px";
        
        var centerSpotAnchor = document.createElement ("div");
        centerSpotAnchor.style.position = "absolute";
        
        var centerSpot = document.createElement ("div");
        centerSpot.style.position = "relative";
        centerSpot.style.background = "black";
        centerSpot.style.textAlign = "center";
        centerSpot.style.top = (centerY - zoomInHotspotSize) + "px";
        centerSpot.style.left = (centerX - zoomInHotspotSize) + "px";
        centerSpot.style.width = (2 * zoomInHotspotSize) + "px";
        centerSpot.style.height = (2 * zoomInHotspotSize) + "px";
        
        frameDiv.appendChild (centerSpotAnchor);
        centerSpotAnchor.appendChild (centerSpot);
        centerSpot.innerHTML = "<span style='display:inline-box; position:relative; vertical-align:middle; font-size: 20pt; top: 10pt; color:white'>ZOOM IN</span>";
        
        var zoomOutBorderAnchor = document.createElement ("div");
        zoomOutBorderAnchor.style.position = "absolute";
        
        var zoomOutBorder = document.createElement ("div");
        zoomOutBorder.style.position = "relative";
        zoomOutBorder.style.border = zoomOutBorderSize + "px solid black";
        zoomOutBorder.style.top = "0px";
        zoomOutBorder.style.left = "0px";
        zoomOutBorder.style.textAlign = "center";
        zoomOutBorder.style.width = this.container.clientWidth + "px";
        zoomOutBorder.style.height = this.container.clientHeight + "px";
        zoomOutBorder.style.MozBoxSizing = 
            zoomOutBorder.style.boxSizing = 
            zoomOutBorder.style.WebkitBoxSizing = 
            "border-box";
        
        zoomOutBorder.innerHTML = "<span style='position:relative; font-size: 20pt; top: -25pt; color:white'>ZOOM OUT</span>";
        
        zoomOutBorderAnchor.appendChild (zoomOutBorder);
        frameDiv.appendChild (zoomOutBorderAnchor);
        
        this.container.appendChild (frameDiv);
        
        var that = this;
        var opacity = 0.9;
        var fadeOutSteps = fadeOut / 50;
        if (fadeOutSteps < 1) {
            fadeOutSteps = 1;
        }
        var iter = function () {
            opacity = opacity - (0.9 / fadeOutSteps);
            if (opacity < 0.0) {
                that.container.removeChild (frameDiv);
            } else {
                frameDiv.style.opacity = opacity;
                setTimeout (iter, 50);
            }
        };
        setTimeout (iter, delay);
    },
    
    /**
     * Forces exit from full screen mode, if we're there.
     * @public
     */
    exitFullScreen : function () {
        if (this.fullScreenHandler) {
            this.removeEventListeners ();
            this.fullScreenHandler.close ();
            this.addEventListeners ();
            this.fullScreenHandler = null;
            return;
        }
    },
    
    /**
     * Maximizes the image to cover the browser viewport.
     * The container div is removed from its parent node upon entering 
     * full screen mode. When leaving full screen mode, the container
     * is appended to its old parent node. To avoid rearranging the
     * nodes, wrap the container in an extra div.
     *
     * <p>For unknown reasons (probably security), browsers will
     * not let you open a window that covers the entire screen.
     * Even when specifying "fullscreen=yes", all you get is a window
     * that has a title bar and only covers the desktop (not any task
     * bars or the like). For now, this is the best that I can do,
     * but should the situation change I'll update this to be
     * full-screen<i>-ier</i>.
     * @public
     */
    fullScreen : function (onClose) {
        if (this.fullScreenHandler) {
            return;
        }
        
        var message = document.createElement ("div");
        message.style.position = "absolute";
        message.style.fontSize = "16pt";
        message.style.top = "128px";
        message.style.width = "100%";
        message.style.color = "white";
        message.style.padding = "16px";
        message.style.zIndex = "9999";
        message.style.textAlign = "center";
        message.style.opacity = "0.75";
        message.innerHTML = "<span style='border-radius: 16px; -moz-border-radius: 16px; padding: 16px; padding-left: 32px; padding-right: 32px; background:black'>Press Esc to exit full screen mode.</span>";
        
        var that = this;
        
        this.fullScreenHandler = new bigshot.FullScreen (this.container);
        this.fullScreenHandler.restoreSize = true;
        
        this.fullScreenHandler.addOnResize (function () {
                if (that.fullScreenHandler && that.fullScreenHandler.isFullScreen) {
                    that.container.style.width = window.innerWidth + "px";
                    that.container.style.height = window.innerHeight + "px";                
                }
                that.onresize ();
            });
        
        this.fullScreenHandler.addOnClose (function () {
                if (message.parentNode) {
                    try {
                        div.removeChild (message);
                    } catch (x) {
                    }
                }
                that.fullScreenHandler = null;
            });
        
        if (onClose) {
            this.fullScreenHandler.addOnClose (function () {
                    onClose ();
                });
        }
        
        this.removeEventListeners ();
        this.fullScreenHandler.open ();
        this.addEventListeners ();
        if (this.fullScreenHandler.getRootElement ()) {
            this.fullScreenHandler.getRootElement ().appendChild (message);
            
            setTimeout (function () {
                    var opacity = 0.75;
                    var iter = function () {
                        opacity -= 0.02;
                        if (message.parentNode) {
                            if (opacity <= 0) {
                                try {
                                    div.removeChild (message);
                                } catch (x) {}
                            } else {
                                message.style.opacity = opacity;
                                setTimeout (iter, 20);
                            }
                        }
                    };
                    setTimeout (iter, 20);
                }, 3500);
        }
        
        return function () {
            that.fullScreenHandler.close ();
        };        
    },
    
    /**
     * Unregisters event handlers and other page-level hooks. The client need not call this
     * method unless bigshot images are created and removed from the page
     * dynamically. In that case, this method must be called when the client wishes to
     * free the resources allocated by the image. Otherwise the browser will garbage-collect
     * all resources automatically.
     * @public
     */
    dispose : function () {
        this.browser.unregisterListener (window, "resize", this.onresizeHandler, false);
        this.removeEventListeners ();
    }
};

/**
 * Fired when the user double-clicks on the image
 *
 * @name bigshot.ImageBase#dblclick
 * @event
 * @param {bigshot.ImageEvent} event the event object
 */

/**
 * Fired when the user clicks on (but does not drag) the image
 *
 * @name bigshot.ImageBase#click
 * @event
 * @param {bigshot.ImageEvent} event the event object
 */

bigshot.Object.extend (bigshot.ImageBase, bigshot.EventDispatcher);
