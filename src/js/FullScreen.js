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
 * Creates a new full-screen handler for an element.
 * 
 * @class A utility class for making an element "full screen", or as close to that
 * as browser security allows. If the browser supports the <code>requestFullScreen</code>
 * API - as standard or as <code>moz</code>- or <code>webkit</code>- extensions,
 * this will be used.
 *
 * @param {HTMLElement} container the element that is to be made full screen
 */
bigshot.FullScreen = function (container) {
    this.container = container;
    
    this.isFullScreen = false;
    this.savedBodyStyle = null;
    this.savedParent = null;
    this.savedSize = null;
    this.expanderDiv = null;
    this.restoreSize = false;
    
    this.onCloseHandlers = new Array ();
    this.onResizeHandlers = new Array ();
    
    var findFunc = function (el, list) {
        for (var i = 0; i < list.length; ++i) {
            if (el[list[i]]) {
                return list[i];
            }
        }
        return null;
    };
    
    this.requestFullScreen = findFunc (container, ["requestFullScreen", "mozRequestFullScreen", "webkitRequestFullScreen"]);
    this.cancelFullScreen = findFunc (document, ["cancelFullScreen", "mozCancelFullScreen", "webkitCancelFullScreen"]);
    
    this.restoreSize = this.requestFullScreen != null;
}

bigshot.FullScreen.prototype = {
    browser : new bigshot.Browser (),
    
    getRootElement : function () {
        return this.div;
    },
    
    /**
     * Adds a function that will run when exiting full screen mode.
     *
     * @param {function()} onClose the function to call
     */
    addOnClose : function (onClose) {
        this.onCloseHandlers.push (onClose);
    },
    
    /**
     * Notifies all <code>onClose</code> handlers.
     *
     * @private
     */
    onClose : function () {
        for (var i = 0; i < this.onCloseHandlers.length; ++i) {
            this.onCloseHandlers[i] ();
        }
    },
    
    /**
     * Adds a function that will run when the element is resized.
     *
     * @param {function()} onResize the function to call
     */
    addOnResize : function (onResize) {
        this.onResizeHandlers.push (onResize);
    },
    
    /**
     * Notifies all resize handlers.
     *
     * @private
     */
    onResize : function () {
        for (var i = 0; i < this.onResizeHandlers.length; ++i) {
            this.onResizeHandlers[i] ();
        }
    },
    
    /**
     * Begins full screen mode.
     */
    open : function () {
        this.isFullScreen = true;
        
        if (this.requestFullScreen) {
            return this.openRequestFullScreen ();
        } else {
            return this.openCompat ();
        }
    },
    
    /**
     * Makes the element really full screen using the <code>requestFullScreen</code>
     * API.
     *
     * @private
     */
    openRequestFullScreen : function () {
        this.savedSize = {
            width : this.container.style.width,
            height : this.container.style.height
        };
        
        this.container.style.width = "100%";
        this.container.style.height = "100%";
        
        var that = this;
        
        if (this.requestFullScreen == "mozRequestFullScreen") {
            /**
             * @private
             */
            var errFun = function () {
                that.container.removeEventListener ("mozfullscreenerror", errFun);
                that.isFullScreen = false;
                that.exitFullScreenHandler ();
                that.onClose ();
            };
            this.container.addEventListener ("mozfullscreenerror", errFun);
            
            /**
             * @private
             */
            var changeFun = function () {
                if (document.mozFullScreenElement !== that.container) {
                    document.removeEventListener ("mozfullscreenchange", changeFun);
                    that.exitFullScreenHandler ();
                } else {
                    that.onResize ();
                }
            };
            document.addEventListener ("mozfullscreenchange", changeFun);
        } else {
            /**
             * @private
             */
            var changeFun = function () {
                if (document.webkitCurrentFullScreenElement !== that.container) {
                    that.container.removeEventListener ("webkitfullscreenchange", changeFun);
                    that.exitFullScreenHandler ();
                } else {
                    that.onResize ();
                }
            };
            this.container.addEventListener ("webkitfullscreenchange", changeFun);
        }
        
        this.exitFullScreenHandler = function () {
            if (that.isFullScreen) {
                that.isFullScreen = false;
                document[that.cancelFullScreen]();
                if (that.restoreSize) {
                    that.container.style.width = that.savedSize.width;
                    that.container.style.height = that.savedSize.height;
                }
                that.onResize ();
                that.onClose ();
            }
        };
        this.container[this.requestFullScreen]();
    },
    
    /**
     * Makes the element "full screen" in older browsers by covering the browser's client area.
     * 
     * @private
     */
    openCompat : function () {
        this.savedParent = this.container.parentNode;
        
        this.savedSize = {
            width : this.container.style.width,
            height : this.container.style.height
        };
        this.savedBodyStyle = document.body.style.cssText;
        
        document.body.style.overflow = "hidden";
        
        this.expanderDiv = document.createElement ("div");
        this.expanderDiv.style.position = "absolute";
        this.expanderDiv.style.top = "0px";
        this.expanderDiv.style.left = "0px";
        this.expanderDiv.style.width = Math.max (window.innerWidth, document.documentElement.clientWidth) + "px";
        this.expanderDiv.style.height = Math.max (window.innerHeight, document.documentElement.clientHeight) + "px";
        
        document.body.appendChild (this.expanderDiv);
        
        this.div = document.createElement ("div");
        this.div.style.position = "fixed";
        this.div.style.top = window.pageYOffset + "px";
        this.div.style.left = window.pageXOffset + "px";
        
        this.div.style.width = window.innerWidth + "px";
        this.div.style.height = window.innerHeight + "px";
        this.div.style.zIndex = 9998;
        
        this.div.appendChild (this.container);
        
        //this.container.style.width = window.innerWidth + "px";
        //this.container.style.height = window.innerHeight + "px";
        
        document.body.appendChild (this.div);
        
        var that = this;
        var resizeHandler = function (e) {
            setTimeout (function () {
                    that.div.style.width = window.innerWidth + "px";
                    that.div.style.height = window.innerHeight + "px";                    
                    setTimeout (function () {
                            that.onResize ();
                        }, 1);
                }, 1);
        };
        
        
        var rotationHandler = function (e) {
            that.expanderDiv.style.width = Math.max (window.innerWidth, document.documentElement.clientWidth) + "px";
            that.expanderDiv.style.height = Math.max (window.innerHeight, document.documentElement.clientHeight) + "px";
            setTimeout (function () {
                    that.div.style.top = window.pageYOffset + "px";
                    that.div.style.left = window.pageXOffset + "px";
                    that.div.style.width = window.innerWidth + "px";
                    that.div.style.height = window.innerHeight + "px";
                    setTimeout (function () {
                            that.onResize ();
                        }, 1);
                }, 1);
        };
        
        var escHandler = function (e) {
            if (e.keyCode == 27) {
                that.exitFullScreenHandler ();
            }
        };
        
        this.exitFullScreenHandler = function () {
            that.isFullScreen = false;
            that.browser.unregisterListener (document, "keydown", escHandler);
            that.browser.unregisterListener (window, "resize", resizeHandler);
            that.browser.unregisterListener (document.body, "orientationchange", rotationHandler);
            if (that.restoreSize) {
                that.container.style.width = that.savedSize.width;
                that.container.style.height = that.savedSize.height;
            }     
            
            document.body.style.cssText = that.savedBodyStyle;
            
            that.savedParent.appendChild (that.container);
            document.body.removeChild (that.div);
            document.body.removeChild (that.expanderDiv);
            
            that.onResize ();            
            that.onClose ();
            setTimeout (function () {
                    that.onResize ();
                }, 1);
        };
        
        this.browser.registerListener (document, "keydown", escHandler, false);
        this.browser.registerListener (window, "resize", resizeHandler, false);
        this.browser.registerListener (document.body, "orientationchange", rotationHandler, false);
        
        this.onResize ();
        
        return this.exitFullScreenHandler;
    },
    
    /**
     * Ends full screen mode.
     */
    close : function () {
        this.exitFullScreenHandler ();
    }
};

