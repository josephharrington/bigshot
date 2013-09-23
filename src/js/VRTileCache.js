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
 * @class Abstract base class.
 */
bigshot.VRTileCache = function () {
}

bigshot.VRTileCache.prototype = {
    /**
     * Returns the texture object for the given tile-x, tile-y and zoom level.
     * The return type is dependent on the renderer. The WebGL renderer, for example
     * uses a tile cache that returns WebGL textures, while the CSS3D renderer
     * returns HTML img or canvas elements.
     */
    getTexture : function (tileX, tileY, zoomLevel) {},
    
    /**
     * Purges the cache of old entries.
     *
     * @type void
     */
    purge : function () {},
    
    /**
     * Disposes the cache and all its entries.
     *
     * @type void
     */
    dispose : function () {}
}
