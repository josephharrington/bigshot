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
 * Abstract filesystem definition.
 *
 * @class Abstract filesystem definition.
 */
bigshot.FileSystem = function () {
}

bigshot.FileSystem.prototype = {
    /**
     * Returns the URL filename for the given filesystem entry.
     *
     * @param {String} name the entry name
     */
    getFilename : function (name) {},
    
    /**
     * Returns the entry filename for the given tile.
     * 
     * @param {int} tileX the column of the tile
     * @param {int} tileY the row of the tile
     * @param {int} zoomLevel the zoom level
     */
    getImageFilename : function (tileX, tileY, zoomLevel) {},
    
    /**
     * Sets an optional prefix that is prepended, along with a forward
     * slash ("/"), to all names.
     *
     * @param {String} prefix the prefix
     */
    setPrefix : function (prefix) {},
    
    /**
     * Returns an image descriptor object from the descriptor file.
     *
     * @return a descriptor object
     */
    getDescriptor : function () {},
    
    /**
     * Returns the poster URL filename. For Bigshot images this is
     * typically the URL corresponding to the entry "poster.jpg", 
     * but for other filesystems it can be different.
     */
    getPosterFilename : function () {}
};

/**
 * Sets up a filesystem instance in the given parameters object, if none exist.
 * If the {@link bigshot.ImageParameters#fileSystem} member isn't set, the 
 * {@link bigshot.ImageParameters#fileSystemType} member is used to create a new 
 * {@link bigshot.FileSystem} instance and set it.
 *
 * @param {bigshot.ImageParameters or bigshot.VRPanoramaParameters or bigshot.ImageCarouselPanoramaParameters} parameters the parameters object to populate
 */
bigshot.setupFileSystem = function (parameters) {
    if (!parameters.fileSystem) {
        if (parameters.fileSystemType == "archive") {
            parameters.fileSystem = new bigshot.ArchiveFileSystem (parameters);
        } else if (parameters.fileSystemType == "dzi") {
            parameters.fileSystem = new bigshot.DeepZoomImageFileSystem (parameters);
        } else if (parameters.fileSystemType == "simple") {
            parameters.fileSystem = new bigshot.SimpleFileSystem (parameters);
        } else {
            parameters.fileSystem = new bigshot.FolderFileSystem (parameters);
        }
    }
}
