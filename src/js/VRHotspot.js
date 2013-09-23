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
 * Abstract base class for panorama hotspots.
 *
 * @class Abstract base class for panorama hotspots.
 *
 * A Hotspot is simply an HTML element that is moved / hidden etc.
 * to overlay a given position in the panorama.
 *
 * @param {bigshot.VRPanorama} panorama the panorama to attach this hotspot to
 */
bigshot.VRHotspot = function (panorama) {
    this.panorama = panorama;
    
    /**
     * The method to use for dealing with hotspots that extend outside the 
     * viewport. Note that {@link #CLIP_ADJUST} et al are functions, not constants.
     * To set the value, you must call the function to get a clipping strategy:
     *
     * @example
     * var hotspot = ...;
     * // note the function call below ---------------v
     * hotspot.clippingStrategy = hotspot.CLIP_ADJUST ();
     *
     * @see bigshot.VRHotspot#CLIP_ADJUST
     * @see bigshot.VRHotspot#CLIP_CENTER
     * @see bigshot.VRHotspot#CLIP_FRACTION
     * @see bigshot.VRHotspot#CLIP_ZOOM
     * @see bigshot.VRHotspot#CLIP_FADE
     * @see bigshot.VRHotspot#clip
     * @type function(clipData)
     * @default bigshot.VRHotspot#CLIP_ADJUST
     */
    this.clippingStrategy = bigshot.VRHotspot.CLIP_ADJUST (panorama);
    
}

/**
 * Hides the hotspot if less than <code>frac</code> of its area is visible.
 * 
 * @param {number} frac the fraction (0.0 - 1.0) of the hotspot that must be visible for
 * it to be shown.
 * @type function(clipData)
 * @see bigshot.VRHotspot#clip
 * @see bigshot.VRHotspot#clippingStrategy
 */
bigshot.VRHotspot.CLIP_FRACTION = function (panorama, frac) {
    return function (clipData) {
        var r = {
            x0 : Math.max (clipData.x, 0),
            y0 : Math.max (clipData.y, 0),
            x1 : Math.min (clipData.x + clipData.w, panorama.renderer.getViewportWidth ()),
            y1 : Math.min (clipData.y + clipData.h, panorama.renderer.getViewportHeight ())
        };
        var full = clipData.w * clipData.h;
        var visibleWidth = (r.x1 - r.x0);
        var visibleHeight = (r.y1 - r.y0);
        if (visibleWidth > 0 && visibleHeight > 0) {
            var visible = visibleWidth * visibleHeight;
            
            return (visible / full) >= frac;
        } else {
            return false;
        }
    }
};

/**
 * Hides the hotspot if its center is outside the viewport.
 * 
 * @type function(clipData)
 * @see bigshot.VRHotspot#clip
 * @see bigshot.VRHotspot#clippingStrategy
 */
bigshot.VRHotspot.CLIP_CENTER = function (panorama) {
    return function (clipData) {
        var c = {
            x : clipData.x + clipData.w / 2,
            y : clipData.y + clipData.h / 2
        };
        return c.x >= 0 && c.x < panorama.renderer.getViewportWidth () && 
        c.y >= 0 && c.y < panorama.renderer.getViewportHeight ();
    }
}

/**
 * Resizes the hotspot to fit in the viewport. Hides the hotspot if 
 * it is completely outside the viewport.
 * 
 * @type function(clipData)
 * @see bigshot.VRHotspot#clip
 * @see bigshot.VRHotspot#clippingStrategy
 */
bigshot.VRHotspot.CLIP_ADJUST = function (panorama) {
    return function (clipData) {
        if (clipData.x < 0) {
            clipData.w -= -clipData.x;
            clipData.x = 0;
        }
        if (clipData.y < 0) {
            clipData.h -= -clipData.y;
            clipData.y = 0;
        }
        if (clipData.x + clipData.w > panorama.renderer.getViewportWidth ()) {
            clipData.w = panorama.renderer.getViewportWidth () - clipData.x - 1;
        }
        if (clipData.y + clipData.h > panorama.renderer.getViewportHeight ()) {
            clipData.h = panorama.renderer.getViewportHeight () - clipData.y - 1;
        }
        
        return clipData.w > 0 && clipData.h > 0;
    }
}

/**
 * Shrinks the hotspot as it approaches the viewport edges.
 *
 * @param s The full size of the hotspot.
 * @param s.w The full width of the hotspot, in pixels.
 * @param s.h The full height of the hotspot, in pixels.
 * @see bigshot.VRHotspot#clip
 * @see bigshot.VRHotspot#clippingStrategy
 */
bigshot.VRHotspot.CLIP_ZOOM = function (panorama, s, maxDistanceInViewportHeights) {
    return function (clipData) {
        if (clipData.x >= 0 && clipData.y >= 0 && (clipData.x + s.w) < panorama.renderer.getViewportWidth ()
                && (clipData.y + s.h) < panorama.renderer.getViewportHeight ()) {
                    clipData.w = s.w;
                    clipData.h = s.h;
                    return true;
                }
        
        var distance = 0;
        if (clipData.x < 0) {
            distance = Math.max (-clipData.x, distance);
        }
        if (clipData.y < 0) {
            distance = Math.max (-clipData.y, distance);
        }
        if (clipData.x + s.w > panorama.renderer.getViewportWidth ()) {
            distance = Math.max (clipData.x + s.w - panorama.renderer.getViewportWidth (), distance);
        }
        if (clipData.y + s.h > panorama.renderer.getViewportHeight ()) {
            distance = Math.max (clipData.y + s.h - panorama.renderer.getViewportHeight (), distance);
        }
        
        distance /= panorama.renderer.getViewportHeight ();
        if (distance > maxDistanceInViewportHeights) {
            return false;
        }
        
        var scale = 1 / (1 + distance);
        
        clipData.w = s.w * scale;
        clipData.h = s.w * scale;
        if (clipData.x < 0) {
            clipData.x = 0;
        }
        if (clipData.y < 0) {
            clipData.y = 0;
        }
        if (clipData.x + clipData.w > panorama.renderer.getViewportWidth ()) {
            clipData.x = panorama.renderer.getViewportWidth () - clipData.w;
        }
        if (clipData.y + clipData.h > panorama.renderer.getViewportHeight ()) {
            clipData.y = panorama.renderer.getViewportHeight () - clipData.h;
        }
        
        return true;
    }
}

/**
 * Progressively fades the hotspot as it gets closer to the viewport edges.
 *
 * @param {number} borderSizeInPixels the distance from the edge, in pixels,
 * where the hotspot is completely opaque.
 * @see bigshot.VRHotspot#clip
 * @see bigshot.VRHotspot#clippingStrategy
 */
bigshot.VRHotspot.CLIP_FADE = function (panorama, borderSizeInPixels) {
    return function (clipData) {
        var distance = Math.min (
            clipData.x, 
            clipData.y, 
            panorama.renderer.getViewportWidth () - (clipData.x + clipData.w), 
            panorama.renderer.getViewportHeight () - (clipData.y + clipData.h));
        
        if (distance <= 0) {
            return false;
        } else if (distance <= borderSizeInPixels) {
            clipData.opacity = (distance / borderSizeInPixels);
            return true;
        } else {
            clipData.opacity = 1.0;
            return true;
        }
    }
}

bigshot.VRHotspot.prototype = {
    
    /**
     * Layout and resize the hotspot. Called by the panorama.
     */
    layout : function () {},
    
    /**
     * Helper function to rotate a point around an axis.
     *
     * @param {number} ang the angle
     * @param {bigshot.Point3D} vector the vector to rotate around
     * @param {Vector} point the point
     * @type Vector
     * @private
     */
    rotate : function (ang, vector, point) {
        var arad = ang * Math.PI / 180.0;
        var m = Matrix.Rotation(arad, $V([vector.x, vector.y, vector.z])).ensure4x4 ();
        return m.xPoint3Dhom1 (point);
    },
    
    /**
     * Converts the polar coordinates to world coordinates.
     * The distance is assumed to be 1.0.
     *
     * @param yaw the yaw, in degrees
     * @param pitch the pitch, in degrees
     * @type bigshot.Point3D
     */
    toVector : function (yaw, pitch) {
        var point = { x : 0, y : 0, z : -1 };
        point = this.rotate (-pitch, { x : 1, y : 0, z : 0 }, point);
        point = this.rotate (-yaw, { x : 0, y : 1, z : 0 }, point);
        return point;
    },
    
    /**
     * Converts the world-coordinate point p to screen coordinates.
     *
     * @param {bigshot.Point3D} p the world-coordinate point
     * @type point
     */
    toScreen : function (p) {
        var res = this.panorama.renderer.transformToScreen (p)
        return res;
    },
    
    /**
     * Clips the hotspot against the viewport. Both parameters 
     * are in/out. Clipping is done by adjusting the values of the
     * parameters.
     * 
     * @param clipData Information about the hotspot.
     * @param {number} clipData.x the x-coordinate of the top-left corner of the hotspot, in pixels.
     * @param {number} clipData.y the y-coordinate of the top-left corner of the hotspot, in pixels.
     * @param {number} clipData.w the width of the hotspot, in pixels.
     * @param {number} clipData.h the height of the hotspot, in pixels.
     * @param {number} [clipData.opacity] the opacity of the hotspot, ranging from 0.0 (transparent) 
     * to 1.0 (opaque). If set, the opacity of the hotspot element is adjusted.
     * @type boolean
     * @return true if the hotspot is visible, false otherwise
     */
    clip : function (clipData) {
        return this.clippingStrategy (clipData);
    }
}
