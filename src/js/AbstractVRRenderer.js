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
 * @class Abstract VR renderer base class.
 */
bigshot.AbstractVRRenderer = function () {
}

bigshot.AbstractVRRenderer.prototype = {
    /**
     * Transforms a vector to world coordinates.
     *
     * @param {bigshot.Point3D} vector the vector to transform
     */
    transformToWorld : function transformToWorld (vector) {
        var world = this.mvMatrix.matrix ().xPoint3Dhom1 (vector);
        
        return world;
    },
    
    /**
     * Transforms a world vector to screen coordinates.
     *
     * @param {bigshot.Point3D} world the world-vector to transform
     */
    transformWorldToScreen : function transformWorldToScreen (world) {
        if (world.z > 0) {
            return null;
        }
        
        var screen = this.pMatrix.matrix ().xPoint3Dhom (world);
        if (Math.abs (screen.w) < Sylvester.precision) {
            return null;
        }
        
        var sx = screen.x;
        var sy = screen.y;
        var sz = screen.z;
        var vw = this.getViewportWidth ();
        var vh = this.getViewportHeight ();
        
        var r = {
            x: (vw / 2) * sx / sz + vw / 2, 
            y: - (vh / 2) * sy / sz + vh / 2
        };
        return r;
    },
    
    /**
     * Transforms a vector to screen coordinates.
     *
     * @param {bigshot.Point3D} vector the vector to transform
     * @return the transformed vector, or null if the vector is nearer than the near-z plane.
     */
    transformToScreen : function transformToScreen (vector) {
        var sel = this.mvpMatrix.xPoint3Dhom (vector);
        
        if (sel.z < 0) {
            return null;
        }
        
        var sz = sel.w;
        
        if (Math.abs (sel.w) < Sylvester.precision) {
            return null;
        }
        
        var sx = sel.x;
        var sy = sel.y;
        var vw = this.getViewportWidth ();
        var vh = this.getViewportHeight ();
        
        var r = {
            x: (vw / 2) * sx / sz + vw / 2, 
            y: - (vh / 2) * sy / sz + vh / 2
        };

        return r;
    }
}
