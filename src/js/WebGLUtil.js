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
 * @class WebGL utility functions.
 */
bigshot.WebGLUtil = {
    /**
     * Flag indicating whether we want to wrap the WebGL context in a 
     * WebGLDebugUtils.makeDebugContext. Defaults to false.
     * 
     * @type boolean
     * @public
     */
    debug : false,
    
    /**
     * List of context identifiers WebGL may be accessed via.
     *
     * @type String[]
     * @private
     */
    contextNames : ["webgl", "experimental-webgl"],
    
    /**
     * Utility function for creating a context given a canvas and 
     * a context identifier.
     * @type WebGLRenderingContext
     * @private
     */
    createContext0 : function (canvas, context) {
        var gl = this.debug
            ?
            WebGLDebugUtils.makeDebugContext(canvas.getContext(context))
        :
        canvas.getContext (context);
        return gl;
    },
    
    /**
     * Creates a WebGL context for the given canvas, if possible.
     *
     * @public
     * @type WebGLRenderingContext
     * @param {HTMLCanvasElement} canvas the canvas
     * @return The WebGL context
     * @throws {Error} If WebGL isn't supported.
     */
    createContext : function (canvas) {
        for (var i = 0; i < this.contextNames.length; ++i) {
            try {
                var gl = this.createContext0 (canvas, this.contextNames[i]);
                if (gl) {
                    return gl;
                }
            } catch (e) {
            }
        }
        throw new Error ("Could not initialize WebGL.");
    },
    
    /**
     * Tests whether WebGL is supported.
     *
     * @type boolean
     * @public
     * @return true If WebGL is supported, false otherwise.
     */
    isWebGLSupported : function () {
        var canvas = document.createElement ("canvas");
        if (!canvas["width"]) {
            // Not even canvas support
            return false;
        }
        
        try {
            this.createContext (canvas);
            return true;
        } catch (e) {
            // No WebGL support
            return false;
        }
    }
}
