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
 * Creates a new image parameter object and populates it with default values for
 * all values not explicitly given.
 *
 * @class ImageParameters parameter object.
 * You need not set any fields that can be read from the image descriptor that 
 * MakeImagePyramid creates. See the {@link bigshot.Image} documentation for 
 * required parameters.
 *
 * <p>Usage:
 *
 * @example
 * var bsi = new bigshot.Image (
 *     new bigshot.ImageParameters ({
 *         basePath : "/bigshot.php?file=myshot.bigshot",
 *         fileSystemType : "archive",
 *         container : document.getElementById ("bigshot_div")
 *         }));
 * 
 * @param values named parameter map, see the fields below for parameter names and types.
 * @see bigshot.Image
 */
bigshot.ImageParameters = function (values) {
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
     * For {@link bigshot.Image} and {@link bigshot.SimpleImage}, the <code>div</code> 
     * to use as a container for the image.
     *
     * @type HTMLDivElement
     */
    this.container = null;
    
    /**
     * The minimum zoom value. Zoom values are specified as a magnification; where
     * 2<sup>n</sup> is the magnification and n is the zoom value. So a zoom value of
     * 2 means a 4x magnification of the full image. -3 means showing an image that
     * is a eighth (1/8 or 1/2<sup>3</sup>) of the full size.
     *
     * @type number
     * @default <i>Optional</i> set by MakeImagePyramid and loaded from descriptor
     */
    this.minZoom = 0.0;
    
    /**
     * The maximum zoom value. Zoom values are specified as a magnification; where
     * 2<sup>n</sup> is the magnification and n is the zoom value. So a zoom value of
     * 2 means a 4x magnification of the full image. -3 means showing an image that
     * is a eighth (1/8 or 1/2<sup>3</sup>) of the full size.
     *
     * @type number
     * @default 0.0
     */
    this.maxZoom = 0.0;
    
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
     * Flag indicating that the image should wrap horizontally. The image wraps on tile
     * boundaries; so in order to get a seamless wrap at zoom level -n; the image width must
     * be evenly divisible by <code>tileSize * 2^n</code>. Set the minZoom value appropriately.
     * 
     * @type boolean
     * @default false
     */
    this.wrapX = false;
    
    /**
     * Flag indicating that the image should wrap vertically. The image wraps on tile
     * boundaries; so in order to get a seamless wrap at zoom level -n; the image height must
     * be evenly divisible by <code>tileSize * 2^n</code>. Set the minZoom value appropriately.
     *
     * @type boolean
     * @default false
     */
    this.wrapY = false;
    
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
     * @default set depending on value of bigshot.ImageParameters.fileSystemType
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
     * Enable the touch-friendly ui. The touch-friendly UI splits the viewport into
     * three click-sensitive regions:
     * <p style="text-align:center"><img src="../images/touch-ui.png"/></p>
     * 
     * <p>Clicking (or tapping with a finger) on the outer region causes the viewport to zoom out.
     * Clicking anywhere within the middle, "pan", region centers the image on the spot clicked.
     * Finally, clicking in the center hotspot will center the image on the spot clicked and zoom
     * in half a zoom level.
     *
     * <p>As before, you can drag to pan anywhere.
     *
     * <p>If you have navigation tools for mouse users that hover over the image container, it 
     * is recommended that any click events on them are kept from bubbling, otherwise the click 
     * will propagate to the touch ui. One way is to use the 
     * {@link bigshot.Browser#stopMouseEventBubbling} method:
     *
     * @example
     * var browser = new bigshot.Browser ();
     * browser.stopMouseEventBubbling (document.getElementById ("myBigshotControlDiv"));
     *
     * @see bigshot.ImageBase#showTouchUI
     *
     * @type boolean
     * @default true
     * @deprecated Bigshot supports all common touch-gestures.
     */
    this.touchUI = false;
    
    /**
     * Lets you "fling" the image.
     * 
     * @type boolean
     * @default true
     */
    this.fling = true;
    
    /**
     * The maximum amount that a tile will be stretched until we try to show
     * the next more detailed level.
     *
     * @type float
     * @default 1.0
     */
    this.maxTextureMagnification = 1.0;
    
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
