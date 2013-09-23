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
 * Creates a new instance of a <code>.bigshot</code> archive filesystem adapter.
 * 
 * @class Bigshot archive filesystem.
 * @param {bigshot.ImageParameters|bigshot.VRPanoramaParameters} parameters the associated image parameters
 * @augments bigshot.FileSystem
 * @constructor
 */     
bigshot.ArchiveFileSystem = function (parameters) {
    this.indexSize = 0;
    this.offset = 0;
    this.index = {};
    this.prefix = "";
    this.suffix = "";
    this.parameters = parameters;
    
    var browser = new bigshot.Browser ();
    var req = browser.createXMLHttpRequest ();
    req.open("GET", this.parameters.basePath + "&start=0&length=24&type=text/plain", false);   
    req.send(null);  
    if(req.status == 200) {
        if (req.responseText.substring (0, 7) != "BIGSHOT") {
            alert ("\"" + this.parameters.basePath + "\" is not a valid bigshot file");
            return;
        }
        this.indexSize = parseInt (req.responseText.substring (8), 16);
        this.offset = this.indexSize + 24;
        
        req.open("GET", this.parameters.basePath + "&type=text/plain&start=24&length=" + this.indexSize, false);   
        req.send(null);  
        if(req.status == 200) {
            var substrings = req.responseText.split (":");
            for (var i = 0; i < substrings.length; i += 3) {
                this.index[substrings[i]] = {
                    start : parseInt (substrings[i + 1]) + this.offset,
                    length : parseInt (substrings[i + 2])
                };
            }
        } else {
            alert ("The index of \"" + this.parameters.basePath + "\" could not be loaded: " + req.status);
        }
    } else {
        alert ("The header of \"" + this.parameters.basePath + "\" could not be loaded: " + req.status);
    }
};


bigshot.ArchiveFileSystem.prototype = { 
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
    
    getFilename : function (name) {
        name = this.getPrefix () + name;
        if (!this.index[name] && console) {
            console.log ("Can't find " + name);
        }
        var f = this.parameters.basePath + "&start=" + this.index[name].start + "&length=" + this.index[name].length;
        if (name.substring (name.length - 4) == ".jpg") {
            f = f + "&type=image/jpeg";
        } else if (name.substring (name.length - 4) == ".png") {
            f = f + "&type=image/png";
        } else {
            f = f + "&type=text/plain";
        }
        return f;
    },
    
    getImageFilename : function (tileX, tileY, zoomLevel) {
        var key = (-zoomLevel) + "/" + tileX + "_" + tileY + this.suffix;
        return this.getFilename (key);
    },
    
    getPrefix : function () {
        if (this.prefix) {
            return this.prefix + "/";
        } else {
            return "";
        }
    },
    
    setPrefix : function (prefix) {
        this.prefix = prefix;
    }
}

bigshot.Object.validate ("bigshot.ArchiveFileSystem", bigshot.FileSystem);
