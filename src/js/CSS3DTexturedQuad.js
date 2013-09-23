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
 * {@link bigshot.CSS3DTexturedQuadScene}.
 *
 * @param {bigshot.Point3D} p the top-left corner of the quad
 * @param {bigshot.Point3D} u vector pointing from p along the top edge of the quad
 * @param {bigshot.Point3D} v vector pointing from p along the left edge of the quad
 * @param {HTMLImageElement} the image to use.
 */
bigshot.CSS3DTexturedQuad = function (p, u, v, image) {
    this.p = p;
    this.u = u;
    this.v = v;
    this.image = image;
}

bigshot.CSS3DTexturedQuad.prototype = {
    /**
     * Computes the cross product of two vectors.
     * 
     * @param {bigshot.Point3D} a the first vector
     * @param {bigshot.Point3D} b the second vector
     * @type bigshot.Point3D
     * @return the cross product
     */
    crossProduct : function crossProduct (a, b) {
        return {
            x : a.y*b.z-a.z*b.y, 
            y : a.z*b.x-a.x*b.z, 
            z : a.x*b.y-a.y*b.x
        };
    },
    
    /**
     * Stringifies a vector as the x, y, and z components 
     * separated by commas.
     * 
     * @param {bigshot.Point3D} u the vector
     * @type String
     * @return the stringified vector
     */
    vecToStr : function vecToStr (u) {
        return (u.x) + "," + (u.y) + "," + (u.z);
    },
    
    /**
     * Creates a CSS3D matrix3d transform from 
     * an origin point and two basis vectors
     * 
     * @param {bigshot.Point3D} tl the top left corner
     * @param {bigshot.Point3D} u the vector pointing along the top edge
     * @param {bigshot.Point3D} y the vector pointing down the left edge
     * @type String
     * @return the matrix3d statement
     */
    quadTransform : function quadTransform (tl, u, v) {
        var w = this.crossProduct (u, v);
        var res = 
            "matrix3d(" + 
            this.vecToStr (u) + ",0," + 
        this.vecToStr (v) + ",0," + 
        this.vecToStr (w) + ",0," + 
        this.vecToStr (tl) + ",1)";
        return res;
    },
    
    /**
     * Computes the norm of a vector.
     *
     * @param {bigshot.Point3D} vec the vector
     */
    norm : function norm (vec) {
        return Math.sqrt (vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
    },
    
    /**
     * Renders the quad.
     *
     * @param {HTMLElement} world the world element
     * @param {number} scale the scale factor to apply to world space to get CSS pixel distances
     * @param {bigshot.Point3D} view the viewer position in world space
     */
    render : function render (world, scale, view) {
        var s = scale / (this.image.width - 1);
        var ps = scale * 1.0;
        var p = this.p;
        var u = this.u;
        var v = this.v;
        
        this.image.style.position = "absolute";
        if (!this.image.inWorld || this.image.inWorld != 1) {
            world.appendChild (this.image);
        }
        this.image.inWorld = 2;
        this.image.style.WebkitTransformOrigin = "0px 0px 0px";
        this.image.style.WebkitTransform = 
            this.quadTransform ({
                    x : (p.x + view.x) * ps, 
                    y : (-p.y + view.y) * ps, 
                    z : (p.z + view.z) * ps
                }, {
                    x : u.x * s, 
                    y : -u.y * s, 
                    z : u.z * s
                }, {
                    x : v.x * s, 
                    y : -v.y * s, 
                    z : v.z * s
                });
    }
}
