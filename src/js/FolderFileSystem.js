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
 * Creates a new instance of a folder-based filesystem adapter.
 *
 * @augments bigshot.FileSystem
 * @class Folder-based filesystem.
 * @param {bigshot.ImageParameters|bigshot.VRPanoramaParameters} parameters the associated image parameters
 * @constructor
 */
bigshot.FolderFileSystem = function (parameters) {
    this.prefix = null;
    this.suffix = "";
    this.parameters = parameters;
}


bigshot.FolderFileSystem.prototype = {    
    getDescriptor : function () {
        this.browser = new bigshot.Browser ();
        var req = this.browser.createXMLHttpRequest ();
        
        req.open("GET", this.getFilename ("descriptor"), false);   
        req.send(null); 
        var descriptor = {};
        if(req.status == 200) {
            var substrings = req.responseText.split (":");
            for (var i = 0; i < substrings.length; i += 2) {
                if (substrings[i] == "suffix") {
                    descriptor[substrings[i]] = substrings[i + 1];
                } else {
                    descriptor[substrings[i]] = parseInt (substrings[i + 1]);
                }
            }
            this.suffix = descriptor.suffix;
            return descriptor;
        } else {
            throw new Error ("Unable to find descriptor.");
        }
    },
    
    getPosterFilename : function () {
        return this.getFilename ("poster" + this.suffix);
    },
    
    setPrefix : function (prefix) {
        this.prefix = prefix;
    },
    
    getPrefix : function () {
        if (this.prefix) {
            return this.prefix + "/";
        } else {
            return "";
        }
    },
    
    getFilename : function (name) {
        return this.parameters.basePath + "/" + this.getPrefix () + name;
    },
    
    getImageFilename : function (tileX, tileY, zoomLevel) {
        var key = (-zoomLevel) + "/" + tileX + "_" + tileY + this.suffix;
        return this.getFilename (key);
    }
};

bigshot.Object.validate ("bigshot.FolderFileSystem", bigshot.FileSystem);
