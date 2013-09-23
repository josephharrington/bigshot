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
 * Creates a new VR panorama parameter object and populates it with default values for
 * all values not explicitly given.
 *
 * @class VRPanoramaParameters parameter object.
 * You need not set any fields that can be read from the image descriptor that 
 * MakeImagePyramid creates. See the {@link bigshot.VRPanorama}
 * documentation for required parameters.
 *
 * <p>Usage:
 *
 * @example
 * var bvr = new bigshot.VRPanorama (
 *     new bigshot.VRPanoramaParameters ({
 *         basePath : "/bigshot.php?file=myvr.bigshot",
 *         fileSystemType : "archive",
 *         container : document.getElementById ("bigshot_canvas")
 *         }));
 * @param values named parameter map, see the fields below for parameter names and types.
 * @see bigshot.VRPanorama
 */
bigshot.VRPanoramaParameters = function (values) {
    /**
     * Size of low resolution preview image along the longest image
     * dimension. The preview is assumed to have the same aspect
     * ratio as the full image (specified by width and height).
     *
     * @default <i>Optional</i> set by MakeImagePyramid and loaded from descriptor
     * @type int
     * @public
     */
    this.posterSize = 0;
    
    /**
     * Url for the image tile to show while the tile is loading and no 
     * low-resolution preview is available.
     *
     * @default <code>null</code>, which results in an all-black image
     * @type String
     * @public
     */
    this.emptyImage = null;
    
    /**
     * Suffix to append to the tile filenames. Typically <code>".jpg"</code> or 
     * <code>".png"</code>.
     *
     * @default <i>Optional</i> set by MakeImagePyramid and loaded from descriptor
     * @type String
     */
    this.suffix = null;
    
    /**
     * The width of the full image; in pixels.
     *
     * @default <i>Optional</i> set by MakeImagePyramid and loaded from descriptor
     * @type int
     */
    this.width = 0;
    
    /**
     * The height of the full image; in pixels.
     *
     * @default <i>Optional</i> set by MakeImagePyramid and loaded from descriptor
     * @type int
     */
    this.height = 0;
    
    /**
     * For {@link bigshot.VRPanorama}, the {@code div} to render into.
     *
     * @type HTMLDivElement
     */
    this.container = null;
    
    /**
     * The maximum number of times to split a cube face into four quads.
     *
     * @type int
     * @default <i>Optional</i> set by MakeImagePyramid and loaded from descriptor
     */
    this.maxTesselation = -1;
    
    /**
     * Size of one tile in pixels.
     *
     * @type int
     * @default <i>Optional</i> set by MakeImagePyramid and loaded from descriptor
     */
    this.tileSize = 0;
    
    /**
     * Tile overlap. Not implemented.
     *
     * @type int
     * @default <i>Optional</i> set by MakeImagePyramid and loaded from descriptor
     */
    this.overlap = 0;
    
    /**
     * Base path for the image. This is filesystem dependent; but for the two most common cases
     * the following should be set
     *
     * <ul>
     * <li><b>archive</b>= The basePath is <code>"&lt;path&gt;/bigshot.php?file=&lt;path-to-bigshot-archive-relative-to-bigshot.php&gt;"</code>;
     *     for example; <code>"/bigshot.php?file=images/bigshot-sample.bigshot"</code>.
     * <li><b>folder</b>= The basePath is <code>"&lt;path-to-image-folder&gt;"</code>;
     *     for example; <code>"/images/bigshot-sample"</code>.
     * </ul>
     *
     * @type String
     */
    this.basePath = null;
    
    /**
     * The file system type. Used to create a filesystem instance unless
     * the fileSystem field is set. Possible values are <code>"archive"</code>, 
     * <code>"folder"</code> or <code>"dzi"</code>.
     *
     * @type String
     * @default "folder"
     */
    this.fileSystemType = "folder";
    
    /**
     * A reference to a filesystem implementation. If set; it overrides the
     * fileSystemType field.
     *
     * @default set depending on value of bigshot.VRPanoramaParameters#fileSystemType
     * @type bigshot.FileSystem
     */
    this.fileSystem = null;
    
    /**
     * Object used to load data files.
     *
     * @default bigshot.DefaultDataLoader
     * @type bigshot.DataLoader
     */
    this.dataLoader = new bigshot.DefaultDataLoader ();
    
    /**
     * The maximum magnification for the texture tiles making up the VR cube.
     * Used for level-of-detail tesselation.
     * A value of 1.0 means that textures will never be stretched (one texture pixel will
     * always be at most one screen pixel), unless there is no more detailed texture available. 
     * A value of 2.0 means that textures may be stretched at most 2x (one texture pixel 
     * will always be at most 2x2 screen pixels)
     * The bigger the value, the less texture data is required, but quality suffers.
     *
     * @type number
     * @default 1.0
     */
    this.maxTextureMagnification = 1.0;
    
    /**
     * The WebGL texture filter to use for magnifying textures. 
     * Possible values are all values valid for <code>TEXTURE_MAG_FILTER</code>.
     * <code>null</code> means <code>NEAREST</code>. 
     *
     * @default null / NEAREST.
     */
    this.textureMagFilter = null;
    
    /**
     * The WebGL texture filter to use for supersampling (minifying) textures. 
     * Possible values are all values valid for <code>TEXTURE_MIN_FILTER</code>.
     * <code>null</code> means <code>NEAREST</code>. 
     *
     * @default null / NEAREST.
     */
    this.textureMinFilter = null;
    
    /**
     * Minimum vertical field of view in degrees.
     *
     * @default 2.0
     * @type number
     */
    this.minFov = 2.0;
    
    /**
     * Maximum vertical field of view in degrees.
     *
     * @default 90.0
     * @type number
     */
    this.maxFov = 90;
    
    /**
     * Minimum pitch in degrees.
     *
     * @default -90
     * @type number
     */
    this.minPitch = -90;
    
    /**
     * Maximum pitch in degrees.
     *
     * @default 90.0
     * @type number
     */
    this.maxPitch = 90;
    
    /**
     * Minimum yaw in degrees. The number is interpreted modulo 360.
     * The default value, -360, is just to make sure that we won't accidentally
     * trip it. If the number is set to something in the interval 0-360,
     * the autoRotate function will pan back and forth.
     *
     * @default -360
     * @type number
     */
    this.minYaw = -360;
    
    /**
     * Maximum yaw in degrees. The number is interpreted modulo 360.
     * The default value, 720, is just to make sure that we won't accidentally
     * trip it. If the number is set to something in the interval 0-360,
     * the autoRotate function will pan back and forth.
     *
     * @default 720.0
     * @type number
     */
    this.maxYaw = 720;
    
    /**
     * Transform offset for yaw.
     * @default 0.0
     * @type number
     */
    this.yawOffset = 0.0;
    
    /**
     * Transform offset for pitch.
     * @default 0.0
     * @type number
     */
    this.pitchOffset = 0.0;
    
    /**
     * Transform offset for roll.
     * @default 0.0
     * @type number
     */
    this.rollOffset = 0.0;
    
    /**
     * Function to call when all six cube faces have loaded the base texture level
     * and can be rendered.
     *
     * @type function()
     * @default null
     */
    this.onload = null;
    
    /**
     * The rendering back end to use.
     * Values are "css" and "webgl".
     * 
     * @type String
     * @default null
     */
    this.renderer = null;
    
    /**
     * Controls whether the panorama can be "flung" by quickly dragging and releasing.
     * 
     * @type boolean 
     * @default true
     */
    this.fling = true;
    
    /**
     * Controls the decay of the "flinging" animation. The fling animation decays
     * as 2^(-flingScale * t) where t is the time in milliseconds since the animation started.
     * For the animation to decay to half-speed in X seconds,
     * flingScale should then be set to 1 / (X*1000).
     *
     * @type float
     * @default 0.004
     */
    this.flingScale = 0.004;
    
    if (values) {
        for (var k in values) {
            this[k] = values[k];
        }
    }
    
    this.merge = function (values, overwrite) {
        for (var k in values) {
            if (overwrite || !this[k]) {
                this[k] = values[k];
            }
        }
    }
    return this;        
};
