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
 * Creates a new VR cube face.
 *
 * @class a VR cube face. The {@link bigshot.VRPanorama} instance holds
 * six of these.
 *
 * @param {bigshot.VRPanorama} owner the VR panorama this face is part of.
 * @param {String} key the identifier for the face. "f" is front, "b" is back, "u" is
 * up, "d" is down, "l" is left and "r" is right.
 * @param {bigshot.Point3D} topLeft_ the top-left corner of the quad.
 * @param {number} width_ the length of the sides of the face, expressed in multiples of u and v.
 * @param {bigshot.Point3D} u basis vector going from the top left corner along the top edge of the face
 * @param {bigshot.Point3D} v basis vector going from the top left corner along the left edge of the face
 */
bigshot.VRFace = function (owner, key, topLeft_, width_, u, v, onLoaded) {
    var that = this;
    this.owner = owner;
    this.key = key;
    this.topLeft = topLeft_;
    this.width = width_;
    this.u = u;
    this.v = v;
    this.updated = false;
    this.parameters = new Object ();
    
    for (var k in this.owner.getParameters ()) {
        this.parameters[k] = this.owner.getParameters ()[k];
    }
    
    bigshot.setupFileSystem (this.parameters);
    this.parameters.fileSystem.setPrefix ("face_" + key);
    this.parameters.merge (this.parameters.fileSystem.getDescriptor (), false);
    
    
    /**
     * Texture cache.
     *
     * @private
     */
    this.tileCache = owner.renderer.createTileCache (function () { 
            that.updated = true;
            owner.renderUpdated (bigshot.VRPanorama.ONRENDER_TEXTURE_UPDATE);
        }, onLoaded, this.parameters);
    
    this.fullSize = this.parameters.width;
    this.overlap = this.parameters.overlap;
    this.tileSize = this.parameters.tileSize;
    
    this.minDivisions = 0;
    var fullZoom = Math.log (this.fullSize - this.overlap) / Math.LN2;
    var singleTile = Math.log (this.tileSize - this.overlap) / Math.LN2;
    this.maxDivisions = Math.floor (fullZoom - singleTile);
    this.maxTesselation = this.parameters.maxTesselation >= 0 ? this.parameters.maxTesselation : this.maxDivisions;
}

bigshot.VRFace.prototype = {
    browser : new bigshot.Browser (),
    
    dispose : function () {
        this.tileCache.dispose ();
    },
    
    /**
     * Utility function to do a multiply-and-add of a 3d point.
     *
     * @private
     * @param p {bigshot.Point3D} the point to multiply
     * @param m {number} the number to multiply the elements of p with
     * @param a {bigshot.Point3D} the point to add
     * @return p * m + a
     */
    pt3dMultAdd : function (p, m, a) {
        return {
            x : p.x * m + a.x,
            y : p.y * m + a.y,
            z : p.z * m + a.z
        };
    },
    
    /**
     * Utility function to do an element-wise multiply of a 3d point.
     *
     * @private
     * @param p {bigshot.Point3D} the point to multiply
     * @param m {number} the number to multiply the elements of p with
     * @return p * m
     */
    pt3dMult : function (p, m) {
        return {
            x : p.x * m,
            y : p.y * m,
            z : p.z * m
        };
    },
    
    /**
     * Creates a textured quad.
     *
     * @private
     */
    generateFace : function (scene, topLeft, width, tx, ty, divisions) {
        width *= this.tileSize / (this.tileSize - this.overlap);
        var texture = this.tileCache.getTexture (tx, ty, -this.maxDivisions + divisions);
        scene.addQuad (this.owner.renderer.createTexturedQuad (
                topLeft,
                this.pt3dMult (this.u, width),
                this.pt3dMult (this.v, width),
                texture
            )
        );
    },
    
    VISIBLE_NONE : 0,
    VISIBLE_SOME : 1,
    VISIBLE_ALL : 2,
    
    /**
     * Tests whether the point is in the axis-aligned rectangle.
     * 
     * @private
     * @param point the point
     * @param min top left corner of the rectangle
     * @param max bottom right corner of the rectangle
     */
    pointInRect : function (point, min, max) {
        return (point.x >= min.x && point.y >= min.y && point.x < max.x && point.y < max.y);
    },
    
    /**
     * Intersects a quadrilateral with the view frustum.
     * The test is a simple rectangle intersection of the AABB of
     * the transformed quad with the viewport.
     *
     * @private
     * @return VISIBLE_NONE, VISIBLE_SOME or VISIBLE_ALL
     */
    intersectWithView : function intersectWithView (transformed) {
        var numNull = 0;
        var tf = [];
        var tfl = transformed.length;
        for (var i = 0; i < tfl; ++i) {
            if (transformed[i] == null) {
                numNull++;
            } else {
                tf.push (transformed[i]);
            }
        }
        if (numNull == 4) {
            return this.VISIBLE_NONE;
        }
        
        var minX = tf[0].x;
        var minY = tf[0].y;
        
        var maxX = minX;
        var maxY = minY;
        
        var viewMinX = 0;
        var viewMinY = 0;
        
        var viewMaxX = this.viewportWidth;
        var viewMaxY = this.viewportHeight;
        
        var pointsInViewport = 0;
        var tl = tf.length;
        for (var i = 1; i < tl; ++i) {
            var tix = tf[i].x;
            var tiy = tf[i].y;
            
            minX = minX < tix ? minX : tix;
            minY = minY < tiy ? minY : tiy;
            
            
            maxX = maxX > tix ? maxX : tix;
            maxY = maxY > tiy ? maxY : tiy;
        }
        
        var iminX = minX > viewMinX ? minX : viewMinX;
        var iminY = minY > viewMinY ? minY : viewMinY;
        
        var imaxX = maxX < viewMaxX ? maxX : viewMaxX;
        var imaxY = maxY < viewMaxY ? maxY : viewMaxY;
        
        if (iminX <= imaxX && iminY <= imaxY) {
            return this.VISIBLE_SOME;
        }            
        
        return this.VISIBLE_NONE;
    },
    
    /**
     * Quick and dirty computation of the on-screen distance in pixels
     * between two 2d points. We use the max of the x and y differences.
     * In case a point is null (that is, it's not on the screen), we 
     * return an arbitrarily high number.
     *
     * @private
     */
    screenDistance : function screenDistance (p0, p1) {
        if (p0 == null || p1 == null) {
            return 0;
        }
        return Math.max (Math.abs (p0.x - p1.x), Math.abs (p0.y - p1.y));
    },
    
    transformToScreen : function transformToScreen (v) {
        return this.owner.renderer.transformToScreen (v);
    },
    
    /**
     * Optionally subdivides a quad into fourn new quads, depending on the
     * position and on-screen size of the quad.
     *
     * @private
     * @param {bigshot.WebGLTexturedQuadScene} scene the scene to add quads to
     * @param {bigshot.Point3D} topLeft the top left corner of this quad
     * @param {number} width the sides of the quad, expressed in multiples of u and v
     * @param {int} divisions the current number of divisions done (increases by one for each
     * split-in-four).
     * @param {int} tx the tile column this face is in
     * @param {int} ty the tile row this face is in 
     */
    generateSubdivisionFace : function generateSubdivisionFace (scene, topLeft, width, divisions, tx, ty, transformed) {
        if (!transformed) {
            transformed = new Array (4);
            transformed[0] = this.transformToScreen (topLeft);
            var topRight = this.pt3dMultAdd (this.u, width, topLeft);
            transformed[1] = this.transformToScreen (topRight);
            
            var bottomLeft = this.pt3dMultAdd (this.v, width, topLeft);
            transformed[3] = this.transformToScreen (bottomLeft);
            
            var bottomRight = this.pt3dMultAdd (this.v, width, topRight);
            transformed[2] = this.transformToScreen (bottomRight);            
        };
        
        var numVisible = this.intersectWithView (transformed);
        
        if (numVisible == this.VISIBLE_NONE) {
            return;
        }
        
        var dmax = 0;
        for (var i = 0; i < transformed.length; ++i) {
            var next = (i + 1) % 4;
            dmax = Math.max (this.screenDistance (transformed[i], transformed[next]), dmax);
        }
        
        // Convert the distance to physical pixels
        dmax *= this.owner.browser.getDevicePixelScale ();
        
        if (divisions < this.minDivisions 
                || 
                (
                    (
                        dmax > this.owner.maxTextureMagnification * (this.tileSize - this.overlap) 
                    ) && divisions < this.maxDivisions && divisions < this.maxTesselation
                )
            ) {
                var center = this.pt3dMultAdd ({x: this.u.x + this.v.x, y: this.u.y + this.v.y, z: this.u.z + this.v.z }, width / 2, topLeft);
                var midTop = this.pt3dMultAdd (this.u, width / 2, topLeft);
                var midLeft = this.pt3dMultAdd (this.v, width / 2, topLeft);
                
                var tCenter = this.transformToScreen (center);
                var tMidLeft = this.transformToScreen (midLeft);
                var tMidTop = this.transformToScreen (midTop);
                var tMidRight = this.transformToScreen (this.pt3dMultAdd (this.u, width, midLeft));
                var tMidBottom = this.transformToScreen (this.pt3dMultAdd (this.v, width, midTop));
                
                this.generateSubdivisionFace (scene, topLeft, width / 2, divisions + 1, tx * 2, ty * 2, [transformed[0], tMidTop, tCenter, tMidLeft]);
                this.generateSubdivisionFace (scene, midTop, width / 2, divisions + 1, tx * 2 + 1, ty * 2, [tMidTop, transformed[1], tMidRight, tCenter]);
                this.generateSubdivisionFace (scene, midLeft, width / 2, divisions + 1, tx * 2, ty * 2 + 1, [tMidLeft, tCenter, tMidBottom, transformed[3]]);
                this.generateSubdivisionFace (scene, center, width / 2, divisions + 1, tx * 2 + 1, ty * 2 + 1, [tCenter, tMidRight, transformed[2], tMidBottom]);
            } else {
                this.generateFace (scene, topLeft, width, tx, ty, divisions);
            }
    },
    
    /**
     * Tests if the face has had any updated texture
     * notifications from the tile cache.
     *
     * @public
     */
    isUpdated : function () {
        return this.updated;
    },
    
    /**
     * Renders this face into a scene.
     * 
     * @public
     * @param {bigshot.WebGLTexturedQuadScene} scene the scene to render into
     */
    render : function (scene) {
        this.updated = false;
        this.viewportWidth = this.owner.renderer.getViewportWidth ();
        this.viewportHeight = this.owner.renderer.getViewportHeight ();        
        this.generateSubdivisionFace (scene, this.topLeft, this.width, 0, 0, 0);
    },
    
    /**
     * Performs post-render cleanup.
     */
    endRender : function () {
        this.tileCache.purge ();
    }
}
