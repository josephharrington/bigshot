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
 * Creates a textured quad object.
 *
 * @class An abstraction for textured quads. Used in the
 * {@link bigshot.WebGLTexturedQuadScene}.
 *
 * @param {bigshot.Point3D} p the top-left corner of the quad
 * @param {bigshot.Point3D} u vector pointing from p along the top edge of the quad
 * @param {bigshot.Point3D} v vector pointing from p along the left edge of the quad
 * @param {WebGLTexture} the texture to use.
 */
bigshot.WebGLTexturedQuad = function (p, u, v, texture) {
    this.p = p;
    this.u = u;
    this.v = v;
    this.texture = texture;
}

bigshot.WebGLTexturedQuad.prototype = {
    
    /**
     * Renders the quad using the given {@link bigshot.WebGL} instance.
     * Currently creates, fills, draws with and then deletes three buffers -
     * not very efficient, but works.
     *
     * @param {bigshot.WebGL} webGl the WebGL wrapper instance to use for rendering.
     */
    render : function (webGl, vertexPositionBuffer, textureCoordBuffer, vertexIndexBuffer) {
        webGl.gl.bindBuffer(webGl.gl.ARRAY_BUFFER, vertexPositionBuffer);
        var vertices = [
            this.p.x, this.p.y,  this.p.z,
            this.p.x + this.u.x, this.p.y + this.u.y,  this.p.z + this.u.z,
            this.p.x + this.u.x + this.v.x, this.p.y + this.u.y + this.v.y,  this.p.z + this.u.z + this.v.z,
            this.p.x + this.v.x, this.p.y + this.v.y,  this.p.z + this.v.z
        ];
        webGl.gl.bufferData(webGl.gl.ARRAY_BUFFER, new Float32Array (vertices), webGl.gl.STATIC_DRAW);
        
        webGl.gl.activeTexture(webGl.gl.TEXTURE0);
        webGl.gl.bindTexture(webGl.gl.TEXTURE_2D, this.texture);
        webGl.gl.uniform1i(webGl.shaderProgram.samplerUniform, 0);
        
        webGl.gl.bindBuffer(webGl.gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
        webGl.gl.drawElements(webGl.gl.TRIANGLES, 6, webGl.gl.UNSIGNED_SHORT, 0);
        
        webGl.gl.bindTexture(webGl.gl.TEXTURE_2D, null);
    }
}
