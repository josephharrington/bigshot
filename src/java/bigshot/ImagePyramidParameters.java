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

import java.util.Map;
import java.util.TreeMap;

/**
 * A typesafe interface to the parameters for MakeImagePyramid.
 */
public class ImagePyramidParameters extends TreeMap<String,String> {
    
    /**
     * Creates an empty parameter set.
     */
    public ImagePyramidParameters () {
    }
    
    /**
     * Creates a parameter set by copying another set.
     */
    public ImagePyramidParameters (Map<String,String> params) {
        this.putAll (params);
    }
    
    /**
     * Sets the given parameter if it is not set.
     */
    public void putIfEmpty (String key, String value) {
        if (!containsKey (key)) {
            put (key, value);
        }
    }
    
    @CLASSNAME
        ImagePyramidParameters
        ;
    
    @STRINGENUM 
        Preset
        A preset set of parameters.
        dzi-cubemap 
        Preset for Deep Zoom cubemaps
        ;
    
    @STRINGENUM 
        Format
        The output format for the image pyramid.
        archive
        A single-file {@code .bigshot} archive.
        folders
        A folder structure.
        ;
    
    @STRINGENUM
        Transform
        The input image transform
        facemap
        Create a cubic facemap from an equirectangular projection image map
        cylinder-facemap
        Create a cubic facemap from a cylindrical projection image map
        face
        Output a single rectilinear image
        ;
    
    @INTEGER
        inputWidth
        Width of the source image. Set internally by the application.
        ;
    
    @INTEGER
        inputHeight
        Height of the source image. Set internally by the application.
        ;
    
    @INTEGER
        posterSize
        Size of the low-resolution preview image along the longest image dimension (width or height).
        ;

    @INTEGER
        tileSize
        Size in pixels of an image tile.
        ;

    @INTEGER
        levels
        Number of levels in the image pyramid. Cannot be used with wrapX. Default: Enough to shrink the image to half a tile along the longest dimension.
        ;
        
    @BOOLEAN
        wrapX
        The number of levels in the pyramid to the number of times the image can be reduced by a factor of 2 before it no longer falls on tile boundaries. Cannot be used with levels.
        ;
    
    @INTEGER
        overlap
        Number of pixels overlap between tiles. Default: 0
        ;

    @STRINGENUM
        ImageFormat
        Image format for the tiles and everything.
        jpg 
        Create JPEG files.
        png 
        Create PNG files.
        ;
        
    @FLOAT
        jpegQuality
        Jpeg output quality, between 0.0 and 1.0. Only has effect if imageFormat is JPG. Default: 0.7
        ;

    @INTEGER
        faceSize
        The size of each cube map face. Only applicable when using Transform.FACEMAP or Transform.CYLINDER_FACEMAP
        ;

    @STRINGENUM
        FolderLayout
        The folder structure of the output pyramid. Default is BIGSHOT.
        bigshot
        Outputs a folder layout compatible with the default Bigshot filesystem adapters.
        dzi
        Outputs a folder layout compatible with Microsoft's Deep Zoom Image format.
        ;

    @STRINGENUM
        DescriptorFormat
        The descriptor format for the output pyramid.
        bigshot
        Outputs a descriptor compatible with the default Bigshot filesystem adapters.
        dzi
        Outputs a descriptor compatible with Microsoft's Deep Zoom Image format.
        ;

    @STRINGENUM
        LevelNumbering 
        If set to "invert", inverts the level numbering. By default, zoom level 0 is the full-size image, level 1 is half the size of level 0, and so on. In the Deep Zoom Image format, level N is the image at a resolution where the largest dimension is 2^n pixels. For example, a 2048x2048 Deep Zoom image would be at full resolution at level 11, half resolution at level 10, and so on.
        invert
        Inverts the level numbering.
        ;
        

    @FLOAT
        yaw
        The yaw angle, in degrees, of the viewer when using the "face" transform.
        ;

    @FLOAT
        pitch
        The pitch angle, in degrees, of the viewer when using the "face" transform.
        ;

    @FLOAT
        roll
        The roll angle, in degrees, of the viewer when using the "face" transform.
        ;

    @FLOAT
        yawOffset
        The initial yaw offset to apply when using the "face" or "*-facemap" transforms, in degrees.
        ;

    @FLOAT
        pitchOffset
        The initial pitch offset to apply when using the "face" or "*-facemap" transforms, in degrees.
        ;

    @FLOAT
        rollOffset
        The initial roll offset to apply when using the "face" or "*-facemap" transforms, in degrees.
        ;

    @INTEGER
        inputHorizon
        For the "*-facemap" transforms, the y-coordinate of the horizon in the map image.
        ;

    @FLOAT
        inputVfov
        For the "*-facemap" transforms, the vertical field of view of the map image, in degrees.
        ;

    @FLOAT
        inputHfov
        For the "*-facemap" transforms, the horizontal field of view of the map image, in degrees.
        ;

    @STRING 
        transformPto
        For the "*-facemap" transforms, sets the input-vfov, input-hfov and input-horizon parameters from a Hugin .pto file. Note: You must still specify the transform (cylindrical or equirectangular).
        ;

    @INTEGER
        oversampling
        The resolution, along each axis, of the oversampling grid when using the "face" transform.
        ;

    @FLOAT
        jitter
        The random sampling jitter to use when using the "face" transform.
        ;

    @FLOAT
        fov
        The output field of view when using the "face" transform.
        ;

    @INTEGER
        outputWidth
        The output image width when using the "face" transform.
        ;

    @INTEGER
        outputHeight
        The output image width when using the "face" transform.
        ;

    @BOOLEAN
        topCap
        Set to true to attempt to fill in the missing top-section of VR panoramas where the map doesn't go all the way to zenith.
        ;
    
    @BOOLEAN
        bottomCap
        Set to true to attempt to fill in the missing bottom-section of VR panoramas where the map doesn't go all the way to nadir.
        ;
}