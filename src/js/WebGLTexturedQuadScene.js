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
 * @param {bigshot.WebGL} webGl the webGl instance to use for rendering.
 *
 * @class A "scene" consisting of a number of quads, all with
 * a unique texture. Used by the {@link bigshot.VRPanorama} to render the VR cube.
 *
 * @see bigshot.WebGLTexturedQuad
 */
bigshot.WebGLTexturedQuadScene = function (webGl, buffers) {
    this.quads = new Array ();
    this.webGl = webGl;
    this.buffers = buffers;
}

bigshot.WebGLTexturedQuadScene.prototype = {
    /** 
     * Adds a new quad to the scene.
     */
    addQuad : function (quad) {
        this.quads.push (quad);
    },
    
    /** 
     * Renders all quads.
     */
    render : function () {
        var b = this.buffers.get ();
        var vertexPositionBuffer = b.vertexPositionBuffer;
        var textureCoordBuffer = b.textureCoordBuffer;
        var vertexIndexBuffer = b.vertexIndexBuffer;
        
        this.webGl.setMatrixUniforms();
        
        for (var i = 0; i < this.quads.length; ++i) {
            this.quads[i].render (this.webGl, vertexPositionBuffer, textureCoordBuffer, vertexIndexBuffer);
        }
    }
};
