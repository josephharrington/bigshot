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
 * @class Object-oriented support functions, used to make JavaScript
 * a bit more palatable to a Java-head.
 */
bigshot.Object = {
    /**
     * Extends a base class with a derived class.
     *
     * @param {Function} derived the derived-class
     * @param {Function} base the base-class
     */
    extend : function (derived, base) {
        for (var k in base.prototype) {
            if (derived.prototype[k]) {
                derived.prototype[k]._super = base.prototype[k];
            } else {
                derived.prototype[k] = base.prototype[k];
            }
        }
    },
    
    /**
     * Resolves a name relative to <code>self</code>.
     *
     * @param {String} name the name to resolve
     * @type {Object}
     */
    resolve : function (name) {
        var c = name.split (".");
        var clazz = self;
        for (var i = 0; i < c.length; ++i) {
            clazz = clazz[c[i]];
        }
        return clazz;
    },
    
    validate : function (clazzName, iface) {
        #ifdef DEBUG
            console.log ("Validating " + clazzName);
        var clazz = this.resolve (clazzName);
        for (var k in iface.prototype) {
            if (!clazz.prototype[k]) {
                throw new Error (clazzName + " doesn't implement " + k);
            }
        }
        #endif
    },
    
    /**
     * Utility function to show an object's fields in a message box.
     *
     * @param {Object} o the object
     */
    alertr : function (o) {
        var sb = "";
        for (var k in o) {
            sb += k + ":" + o[k] + "\n";
        }
        alert (sb);
    },
    
    /**
     * Utility function to show an object's fields in the console log.
     *
     * @param {Object} o the object
     */
    logr : function (o) {
        var sb = "";
        for (var k in o) {
            sb += k + ":" + o[k] + "\n";
        }
        if (console) {
            console.log (sb);
        }
    }
};
