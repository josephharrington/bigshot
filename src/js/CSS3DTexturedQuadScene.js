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
 * Creates a textured quad scene.
 *
 * @param {HTMLElement} world element used as container for 
 * the world coordinate system.
 * @param {number} scale the scaling factor to use to avoid 
 * numeric errors.
 * @param {bigshot.Point3D} view the 3d-coordinates of the viewer
 *
 * @class A scene consisting of a number of quads, all with
 * a unique texture. Used by the {@link bigshot.VRPanorama} to render the VR cube.
 *
 * @see bigshot.CSS3DTexturedQuad
 */
bigshot.CSS3DTexturedQuadScene = function (world, scale, view) {
    this.quads = new Array ();
    this.world = world;
    this.scale = scale;
    this.view = view;
}

bigshot.CSS3DTexturedQuadScene.prototype = {  
    /** 
     * Adds a new quad to the scene.
     *
     * @param {bigshot.TexturedQuad} quad the quad to add to the scene
     */
    addQuad : function (quad) {
        this.quads.push (quad);
    },
    
    /** 
     * Renders all quads.
     */
    render : function () {            
        for (var i = 0; i < this.quads.length; ++i) {
            this.quads[i].render (this.world, this.scale, this.view);
        }
    }
};
