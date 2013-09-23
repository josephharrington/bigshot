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
 * @class Abstract base for 3d rendering system.
 */
bigshot.VRRenderer = function () {
}

bigshot.VRRenderer.prototype = {
    /**
     * Creates a new {@link bigshot.VRTileCache}, appropriate for the rendering system.
     *
     * @param {function()} onloaded function that is called whenever a texture tile has been loaded
     * @param {function()} onCacheInit function that is called when the texture cache is fully initialized
     * @param {bigshot.VRPanoramaParameters} parameters the parameters for the panorama
     */
    createTileCache : function (onloaded, onCacheInit, parameters) {},
    
    /**
     * Creates a bigshot.TexturedQuadScene.
     */
    createTexturedQuadScene : function () {},
    
    /**
     * Creates a bigshot.TexturedQuad.
     *
     * @param {bigshot.Point3D} p the top-left corner of the quad
     * @param {bigshot.Point3D} u a vector going along the top edge of the quad
     * @param {bigshot.Point3D} v a vector going down the left edge of the quad
     * @param {Object} texture a texture to use for the quad. The texture type may vary among different
     * VRRenderer implementations. The VRTileCache that is created using the createTileCache method will
     * supply the correct type.
     */
    createTexturedQuad : function (p, u, v, texture) {},
    
    /**
     * Returns the viewport width, in pixels.
     *
     * @type int
     */
    getViewportWidth : function () {},
    
    /**
     * Returns the viewport height, in pixels.
     *
     * @type int
     */
    getViewportHeight : function () {},
    
    /**
     * Transforms a vector to world coordinates.
     *
     * @param {bigshot.Point3D} v the view-space point to transform
     */
    transformToWorld : function (v) {},
    
    /**
     * Transforms a world vector to screen coordinates.
     *
     * @param {bigshot.Point3D} worldVector the world-space point to transform
     */
    transformWorldToScreen : function (worldVector) {},
    
    /**
     * Transforms a 3D vector to screen coordinates.
     *
     * @param {bigshot.Point3D} vector the vector to transform. 
     * If it is already in homogenous coordinates (4-element array) 
     * the transformation is faster. Otherwise it will be converted.
     */
    transformToScreen : function (vector) {},
    
    /**
     * Disposes the renderer and associated resources.
     */
    dispose : function () {},
    
    /**
     * Called to begin a render.
     *
     * @param {bigshot.Rotation} rotation the rotation of the viewer
     * @param {number} fov the vertical field of view, in degrees
     * @param {bigshot.Point3D} translation the position of the viewer in world space
     * @param {bigshot.Rotation} rotationOffsets the rotation to apply to the VR cube 
     * before the viewer rotation is applied
     */
    beginRender : function (rotation, fov, translation, rotationOffsets) {},
    
    /**
     * Called to end a render.
     */
    endRender : function () {},
    
    /**
     * Called by client code to notify the renderer that the viewport has been resized.
     */
    onresize : function () {},
    
    /**
     * Resizes the viewport.
     *
     * @param {int} w the new width of the viewport, in pixels
     * @param {int} h the new height of the viewport, in pixels
     */
    resize : function (w, h) {},
    
    /**
     * Gets the container element for the renderer. This is used
     * when calling the requestAnimationFrame API.
     */
    getElement : function () {}
}
