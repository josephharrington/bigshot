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
 * Creates a new instance of a filesystem adapter for the SimpleImage class.
 * 
 * @class Filesystem adapter for bigshot.SimpleImage. This class is not
 * supposed to be used outside of the {@link bigshot.SimpleImage} class.
 * @param {bigshot.ImageParameters} parameters the associated image parameters
 * @augments bigshot.FileSystem
 * @see bigshot.SimpleImage
 */     
bigshot.SimpleFileSystem = function (parameters) {
    this.parameters = parameters;
};


bigshot.SimpleFileSystem.prototype = { 
    getDescriptor : function () {
        return {};
    },
    
    getPosterFilename : function () {
        return null;
    },
    
    getFilename : function (name) {
        return null;
    },
    
    getImageFilename : function (tileX, tileY, zoomLevel) {
        return null;
    },
    
    getPrefix : function () {
        return "";
    },
    
    setPrefix : function (prefix) {
        this.prefix = prefix;
    }
}

bigshot.Object.validate ("bigshot.SimpleFileSystem", bigshot.FileSystem);
