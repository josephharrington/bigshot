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
 * Creates a new, empty, LRUMap instance.
 * 
 * @class Implementation of a Least-Recently-Used cache map.
 * Used by the ImageTileCache to keep track of cache entries.
 * @constructor
 */
bigshot.LRUMap = function () {
    /** 
     * Key to last-accessed time mapping.
     *
     * @type Object
     */
    this.keyToTime = {};
    
    /**
     * Current time counter. Incremented for each access of
     * a key in the map.
     * @type int
     */
    this.counter = 0;
    
    /** 
     * Current size of the map.
     * @type int
     */
    this.size = 0;
}

bigshot.LRUMap.prototype = {
    /**
     * Marks access to an item, represented by its key in the map. 
     * The key's last-accessed time is updated to the current time
     * and the current time is incremented by one step.
     *
     * @param {String} key the key associated with the accessed item
     */
    access : function (key) {
        this.remove (key);
        this.keyToTime[key] = this.counter;
        ++this.counter;
        ++this.size;
    },
    
    /**
     * Removes a key from the map.
     *
     * @param {String} key the key to remove
     * @returns true iff the key existed in the map.
     * @type boolean
     */
    remove : function (key) {
        if (this.keyToTime[key]) {
            delete this.keyToTime[key];
            --this.size;
            return true;
        } else {
            return false;
        }
    },
    
    /**
     * Returns the current number of keys in the map.
     * @type int
     */
    getSize : function () {
        return this.size;
    },
    
    /**
     * Returns the key in the map with the lowest
     * last-accessed time. This is done as a linear
     * search through the map. It could be done much 
     * faster with a sorted map, but unless this becomes
     * a bottleneck it is just not worth the effort.
     * @type String
     */
    leastUsed : function () {
        var least = this.counter + 1;
        var leastKey = null;
        for (var k in this.keyToTime) {
            if (this.keyToTime[k] < least) {
                least = this.keyToTime[k];
                leastKey = k;
            }
        }
        return leastKey;
    }
};
