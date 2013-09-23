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
 * @class Data loader using standard browser functions that maintains
 * an in-memory cache of everything loaded.
 * @augments bigshot.DataLoader
 */
bigshot.CachingDataLoader = function () {
    this.cache = {};
    this.requested = {};
    this.requestedTiles = {};
}

bigshot.CachingDataLoader.prototype = {
    
    browser : new bigshot.Browser (),
    
    loadImage : function (url, onloaded) {
        if (this.cache[url]) {
            if (onloaded) {
                onloaded (this.cache[url]);
            }
            return this.cache[url];
        } else if (this.requested[url]) {
            if (onloaded) {
                this.requested[url].push (onloaded);
            }
            return this.requestedTiles[url];
        } else {
            var that = this;
            this.requested[url] = new Array ();
            if (onloaded) {
                this.requested[url].push (onloaded);
            }
            
            var tile = document.createElement ("img");
            this.requestedTiles[url] = tile;
            this.browser.registerListener (tile, "load", function () {                        
                    var listeners = that.requested[url];
                    delete that.requested[url];
                    delete that.requestedTiles[url];
                    that.cache[url] = tile;
                    
                    for (var i = 0; i < listeners.length; ++i) {
                        listeners[i] (tile);
                    }
                }, false);
            tile.src = url;
            return tile;
        }
    },
    
    loadXml : function (url, async, onloaded) {
        if (this.cache[url]) {
            if (onloaded) {
                onloaded (this.cache[url]);
            }
            return this.cache[url];
        } else if (this.requested[url] && async) {
            if (onloaded) {
                this.requested[url].push (onloaded);
            }
        } else {
            var req = this.browser.createXMLHttpRequest ();
            
            if (!this.requested[url]) {
                this.requested[url] = new Array ();
            }
            
            if (async) {
                if (onloaded) {
                    this.requested[url].push (onloaded);
                }
            }
            
            var that = this;
            var finishRequest = function () {
                if (that.requested[url]) {
                    var xml = null;
                    if(req.status == 200) {
                        xml = req.responseXML;
                    }
                    var listeners = that.requested[url];
                    delete that.requested[url];
                    that.cache[url] = xml
                    
                    for (var i = 0; i < listeners.length; ++i) {
                        listeners[i](xml);
                    }
                }
                return xml;
            };
            
            if (async) {
                req.onreadystatechange = function () {
                    if (req.readyState == 4) {
                        finishRequest ();
                    }
                };
                req.open("GET", url, true);
                req.send ();
            } else {
                req.open("GET", url, false);
                req.send ();
                return finishRequest ();                
            }
        }
    }
}

bigshot.Object.validate ("bigshot.CachingDataLoader", bigshot.DataLoader);
