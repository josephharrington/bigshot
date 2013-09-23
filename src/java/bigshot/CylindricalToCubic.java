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
package bigshot;

import java.io.File;

/**
 * Transforms an cylindrical image map to rectilinear images. Used to create a cube map
 * for <a href="../../js/symbols/bigshot.VRPanorama.html">bigshot.VRPanorama</a>.
 */
public class CylindricalToCubic extends AbstractSphericalCubicTransform<CylindricalToCubic> {
    
    /**
     * Creates a new transform instance.
     */
    public CylindricalToCubic () {
    }
    
    @Override
        public CylindricalToCubic fromHuginPtoParameters (int w, int h, double v, int cropLeft, int cropRight, int cropTop, int cropBottom) {
        // figure out the horizon
        this.inputHorizon = (int) (h / 2 - cropTop);
        
        this.horizontalWrap = v >= 360;
        // Transform v to radians
        v = Math.PI * 2 * v / 360.0;
        
        double pa = v / w;
        double p = Math.tan (pa);
        
        // The input vfov is twice the angle at which we are input.height()/2 pixels away from the horizon
        double H2 = (input.height() / 2) * p;
        
        this.inputVfov = Math.atan (H2) * 2;
        this.inputHfov = v;
        
        return this;
    }
    
    @Override
        protected void invTransformPoint (int x, int y, Point2D output) {
        output.x = (inputHfov / 2) * (x - input.width () / 2) / (input.width () / 2);
        output.y = Math.atan (Math.tan (inputVfov / 2) * (y - inputHorizon) / (input.height () / 2));        
    }
    
    @Override
        protected void transformPoint (double theta, double phi, Point2D output) {
        output.x = (theta / (inputHfov / 2)) * (input.width () / 2) + input.width () / 2;
        output.y = Math.tan (phi) / Math.tan (inputVfov / 2) * (input.height () / 2) + inputHorizon;
    }
    
    /**
     * Convenience function to load an image from a file.
     *
     * @param imageName the image to load
     * @return the image
     */
    public static Image readImage (File imageName) throws Exception {
        return Image.read (imageName);
    }
    
    /**
     * Transforms a cylindrical map to a rectilinear image.
     *
     * @param in the equirectangular image map
     * @param outputSize the size (width and height), in pixels, of each face
     * @param vfov the vertical field of view, in degrees
     * @param oy the initial yaw offset, in degrees
     * @param op the initial pitch offset, in degrees
     * @param or the initial roll offset, in degrees
     * @param yaw the yaw angle of the viewer, in degrees
     * @param pitch the pitch angle of the viewer, in degrees
     * @param roll the roll angle of the viewer, in degrees
     */
    public static Image transformToFace (Image in, int outputSize, double vfov, double oy, double op, double or, double yaw, double pitch, double roll) throws Exception {
        return new CylindricalToCubic ()
            .input (in)
            .vfov (vfov)
            .offset (oy, op, or)
            .view (yaw, pitch, roll)
            .size (outputSize, outputSize)
            .transform ();
    }
    
    /**
     * Transforms an cylindrical map to a rectilinear image.
     *
     * @param imageName the equirectangular image map
     * @param output the output file name
     * @param outputSize the size (width and height), in pixels, of each face
     * @param vfov the vertical field of view, in degrees
     * @param oy the initial yaw offset, in degrees
     * @param op the initial pitch offset, in degrees
     * @param or the initial roll offset, in degrees
     * @param yaw the yaw angle of the viewer, in degrees
     * @param pitch the pitch angle of the viewer, in degrees
     * @param roll the roll angle of the viewer, in degrees
     */
    public static void transformToFace (File imageName, File output, int outputSize, double vfov, double oy, double op, double or, double yaw, double pitch, double roll) throws Exception {
        Image in = Image.read (imageName);
        transformToFace (in, outputSize, vfov, oy, op, or, yaw, pitch, roll).write (output);
    }    
}