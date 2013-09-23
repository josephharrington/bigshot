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
 * @class CSS 3D Transform-based renderer.
 * @param {HTMLElement} _container the HTML container element for the render viewport
 *
 * @augments bigshot.VRRenderer
 */
bigshot.CSS3DVRRenderer = function (_container) {
    this.container = _container;
    this.canvasOrigin = document.createElement ("div");
    
    this.canvasOrigin.style.WebkitTransformOrigin = "0px 0px 0px";
    this.canvasOrigin.style.WebkitTransformStyle = "preserve-3d";
    this.canvasOrigin.style.WebkitPerspective= "600px";
    
    this.canvasOrigin.style.position = "relative";
    this.canvasOrigin.style.left = "50%";
    this.canvasOrigin.style.top = "50%";
    
    this.container.appendChild (this.canvasOrigin);
    
    this.viewport = document.createElement ("div");
    this.viewport.style.WebkitTransformOrigin = "0px 0px 0px";
    this.viewport.style.WebkitTransformStyle = "preserve-3d";
    this.canvasOrigin.appendChild (this.viewport);
    
    this.world = document.createElement ("div");
    this.world.style.WebkitTransformOrigin = "0px 0px 0px";
    this.world.style.WebkitTransformStyle = "preserve-3d";
    this.viewport.appendChild (this.world);
    
    this.browser.removeAllChildren (this.world);
    
    this.view = null;
    
    this.mvMatrix = new bigshot.TransformStack ();
    
    this.yaw = 0;
    this.pitch = 0;
    this.fov = 0;
    this.pMatrix = new bigshot.TransformStack ();
    
    this.onresize = function () {
    };
    
    this.viewportSize = null;
};

bigshot.CSS3DVRRenderer.prototype = {
    browser : new bigshot.Browser (),
    
    dispose : function () {
        
    },
    
    createTileCache : function (onloaded, onCacheInit, parameters) {
        return new bigshot.ImageVRTileCache (onloaded, onCacheInit, parameters);
    },
    
    createTexturedQuadScene : function () {
        return new bigshot.CSS3DTexturedQuadScene (this.world, 128, this.view);
    },
    
    createTexturedQuad : function (p, u, v, texture) {
        return new bigshot.CSS3DTexturedQuad (p, u, v, texture);
    },
    
    getElement : function () {
        return this.container;
    },
    
    supportsUpdate : function () {
        return false;
    },
    
    getViewportWidth : function () {
        if (this.viewportSize) {
            return this.viewportSize.w;
        }
        return this.browser.getElementSize (this.container).w;
    },
    
    getViewportHeight : function () {
        if (this.viewportSize) {
            return this.viewportSize.h;
        }
        return this.browser.getElementSize (this.container).h;
    },
    
    onresize : function () {
    },
    
    resize : function (w, h) {
        if (this.container.style.width != "") {
            this.container.style.width = w + "px";
        }
        if (this.container.style.height != "") {
            this.container.style.height = h + "px";
        }
    },
    
    beginRender : function (rotation, fov, translation, rotationOffsets) {
        this.viewportSize = this.browser.getElementSize (this.container);
        
        this.yaw = rotation.y;
        this.pitch = rotation.p;
        this.fov = fov;
        
        var halfFovInRad = 0.5 * fov * Math.PI / 180;
        var halfHeight = this.getViewportHeight () / 2;
        var perspectiveDistance = halfHeight / Math.tan (halfFovInRad);
        
        this.mvMatrix.reset ();
        
        this.view = translation;
        this.mvMatrix.translate (this.view);
        
        
        this.mvMatrix.rotateZ (rotationOffsets.r);
        this.mvMatrix.rotateX (rotationOffsets.p);
        this.mvMatrix.rotateY (rotationOffsets.y);
        
        this.mvMatrix.rotateY (this.yaw);
        this.mvMatrix.rotateX (this.pitch);
        
        
        this.pMatrix.reset ();
        this.pMatrix.perspective (this.fov, this.getViewportWidth () / this.getViewportHeight (), 0.1, 100.0);
        
        this.mvpMatrix = this.pMatrix.matrix ().multiply (this.mvMatrix.matrix ());
        
        this.canvasOrigin.style.WebkitPerspective= perspectiveDistance + "px";
        
        for (var i = this.world.children.length - 1; i >= 0; --i) {
            this.world.children[i].inWorld = 1;
        }
        
        this.world.style.WebkitTransform = 
            "rotate3d(1,0,0," + (-rotation.p) + "deg) " +
            "rotate3d(0,1,0," + rotation.y + "deg) " +
            "rotate3d(0,1,0," + (rotationOffsets.y) + "deg) " +
            "rotate3d(1,0,0," + (-rotationOffsets.p) + "deg) " +
            "rotate3d(0,0,1," + (-rotationOffsets.r) + "deg) ";
        this.world.style.WebkitTransformStyle = "preserve-3d";
        this.world.style.WebKitBackfaceVisibility = "hidden";
        
        this.viewport.style.WebkitTransform = 
            "translateZ(" + perspectiveDistance + "px)";
    },
    
    endRender : function () {
        for (var i = this.world.children.length - 1; i >= 0; --i) {
            var child = this.world.children[i];
            if (!child.inWorld || child.inWorld != 2) {
                delete child.inWorld;
                this.world.removeChild (child);
            }
        }
        
        this.viewportSize = null;
    }    
};

bigshot.Object.extend (bigshot.CSS3DVRRenderer, bigshot.AbstractVRRenderer);
bigshot.Object.validate ("bigshot.CSS3DVRRenderer", bigshot.VRRenderer);
