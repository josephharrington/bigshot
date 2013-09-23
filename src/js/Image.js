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
 * Creates a new tiled image viewer. (Note: See {@link bigshot.ImageBase#dispose} for important information.)
 *
 * @example
 * var bsi = new bigshot.Image (
 *     new bigshot.ImageParameters ({
 *         basePath : "/bigshot.php?file=myshot.bigshot",
 *         fileSystemType : "archive",
 *         container : document.getElementById ("bigshot_div")
 *     }));
 *
 * @param {bigshot.ImageParameters} parameters the image parameters. Required fields are: <code>basePath</code> and <code>container</code>.
 * If you intend to use the archive filesystem, you need to set the <code>fileSystemType</code> to <code>"archive"</code>
 * as well.
 * @see bigshot.ImageBase#dispose
 * @class A tiled, zoomable image viewer.
 *
 * <h3 id="creating-a-wrapping-image">Creating a Wrapping Image</h3>
 *
 * <p>If you have set the wrapX or wrapY parameters in the {@link bigshot.ImageParameters}, the 
 * image must be an integer multiple of the tile size at the desired minimum zoom level, otherwise
 * there will be a gap at the wrap point:
 *
 * <p>The way to figure out the proper input size is this:
 *
 * <ol>
 * <li><p>Decide on a tile size and call this <i>tileSize</i>.</p></li>
 * <li><p>Decide on a minimum integer zoom level, and call this <i>minZoom</i>.</p></li>
 * <li><p>Compute <i>tileSize * 2<sup>-minZoom</sup></i>, call this <i>S</i>.</p></li>
 * <li><p>The source image size along the wrapped axis must be evenly divisible by <i>S</i>.</p></li>
 * </ol>
 *
 * <p>An example:</p>
 *
 * <ol>
 * <li><p>I have an image that is 23148x3242 pixels.</p></li>
 * <li><p>I chose 256x256 pixel tiles: <i>tileSize = 256</i>.</p></li>
 * <li><p>When displaying the image, I want the user to be able to zoom out so that the 
 * whole image is less than or equal to 600 pixels tall. Since the image is 3242 pixels 
 * tall originally, I will need a <i>minZoom</i> of -3. A <i>minZoom</i> of -2 would only let me
 * zoom out to 1/4 (2<sup>-2</sup>), or an image that is 810 pixels tall. A <i>minZoom</i> of -3, however lets me
 * zoom out to 1/8 (2<sup>-3</sup>), or an image that is 405 pixels tall. Thus: <i>minZoom = -3</i></p></li>
 * <li><p>Computing <i>S</i> gives: <i>S = 256 * 2<sup>3</sup> = 256 * 8 = 2048</i></p></li>
 * <li><p>I want it to wrap along the X axis. Therefore I may have to adjust the width, 
 * currently 23148 pixels.</p></li>
 * <li><p>Rounding 23148 down to the nearest multiple of 2048 gives 22528. (23148 divided by 2048 is 11.3, and 11 times 2048 is 22528.)</p></li>
 * <li><p>I will shrink my source image to be 22528 pixels wide before building the image pyramid,
 * and I will set the <code>minZoom</code> parameter to -3 in the {@link bigshot.ImageParameters} when creating
 * the image. (I will also set <code>wrapX</code> to <code>true</code>.)</p></li>
 * </ol>
 * 
 * @augments bigshot.ImageBase
 */     
bigshot.Image = function (parameters) {
    bigshot.setupFileSystem (parameters);
    parameters.merge (parameters.fileSystem.getDescriptor (), false);
    
    bigshot.ImageBase.call (this, parameters);
}    

bigshot.Image.prototype = {
    setupLayers : function () {
        var that = this;
        this.thisTileCache = new bigshot.ImageTileCache (function () {
                that.layout ();     
            }, null, this.parameters);
        
        this.addLayer (
            new bigshot.TileLayer (this, this.parameters, 0, 0, this.thisTileCache)
        );
    }
};

bigshot.Object.extend (bigshot.Image, bigshot.ImageBase);

