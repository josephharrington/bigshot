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
 * Abstract interface description for a Layer.
 *
 * @class Abstract interface description for a layer.
 */
bigshot.Layer = function () {
}

bigshot.Layer.prototype = {
    /**
     * Returns the layer container.
     *
     * @type HTMLDivElement
     */
    getContainer : function () {},
    
    /**
     * Sets the maximum number of image tiles that will be visible in the image.
     *
     * @param {int} x the number of tiles horizontally
     * @param {int} y the number of tiles vertically
     */
    setMaxTiles : function (x, y) {},
    
    /**
     * Called when the image's viewport is resized.
     *
     * @param {int} w the new width of the viewport, in css pixels
     * @param {int} h the new height of the viewport, in css pixels
     */
    resize : function (w, h) {},
    
    /**
     * Lays out the layer.
     *
     * @param {number} zoom the zoom level, adjusted for texture stretching
     * @param {number} x0 the x-coordinate of the top-left corner of the top-left tile in css pixels
     * @param {number} y0 the y-coordinate of the top-left corner of the top-left tile in css pixels
     * @param {number} tx0 column number (starting at zero) of the top-left tile
     * @param {number} ty0 row number (starting at zero) of the top-left tile
     * @param {number} size the {@link bigshot.ImageParameters#tileSize} - width of each 
     *                 image tile in pixels - of the image
     * @param {number} stride offset (vertical and horizontal) from the top-left corner
     *                 of a tile to the next tile's top-left corner.
     * @param {number} opacity the opacity of the layer as a CSS opacity value.
     */
    layout : function (zoom, x0, y0, tx0, ty0, size, stride, opacity) {}
};
