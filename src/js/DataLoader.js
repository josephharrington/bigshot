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
 * @class Loads image and XML data.
 */
bigshot.DataLoader = function () {
}

bigshot.DataLoader.prototype = {
    /**
     * Loads an image.
     *
     * @param {String} url the url to load
     * @param {function(success,img)} onloaded called on complete 
     */
    loadImage : function (url, onloaded) {},
    
    /**
     * Loads XML data.
     *
     * @param {String} url the url to load
     * @param {boolean} async use async request
     * @param {function(success,xml)} [onloaded] called on complete for async requests
     * @return the xml for synchronous calls
     */
    loadXml : function (url, async, onloaded) {}
}
