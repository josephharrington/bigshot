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
 * Creates a new browser helper object.
 *
 * @class Encapsulates common browser functions for cross-browser portability
 * and convenience.
 */
bigshot.Browser = function () {
    this.requestAnimationFrameFunction = 
        window.requestAnimationFrame || 
        window.mozRequestAnimationFrame ||  
        window.webkitRequestAnimationFrame || 
        window.msRequestAnimationFrame ||
        function (callback, element) { return setTimeout (callback, 0); };
}

bigshot.Browser.prototype = {
    /**
    * Removes all children from an element.
    * 
    * @public
    * @param {HTMLElement} element the element whose children are to be removed.
    */
    removeAllChildren : function (element) {
        element.innerHTML = "";
        /*
        if (element.children.length > 0) {
            for (var i = element.children.length - 1; i >= 0; --i) {
                element.removeChild (element.children[i]);
            }
        }
        */
    },
    
    /**
    * Thunk to implement a faked "mouseenter" event.
    * @private
    */
    mouseEnter : function (_fn) {
        var isAChildOf = this.isAChildOf;
        return function(_evt)
        {
            var relTarget = _evt.relatedTarget;
            if (this === relTarget || isAChildOf (this, relTarget))
            { return; }
            
            _fn.call (this, _evt);
        }
    },
    
    isAChildOf : function (_parent, _child) {
        if (_parent === _child) { return false; }
        while (_child && _child !== _parent)
        { _child = _child.parentNode; }
        
        return _child === _parent;
    },
    
    /**
    * Unregisters a listener from an element.
    *
    * @param {HTMLElement} elem the element
    * @param {String} eventName the event name ("click", "mouseover", etc.)
    * @param {function(e)} fn the callback function to detach
    * @param {boolean} useCapture specifies if we should unregister a listener from the capture chain.
    */
    unregisterListener : function (elem, eventName, fn, useCapture) {
        if (typeof (elem.removeEventListener) != 'undefined') {
            elem.removeEventListener (eventName, fn, useCapture);
        } else if (typeof (elem.detachEvent) != 'undefined') {
            elem.detachEvent('on' + eventName, fn);
        }
    },
    
    /**
    * Registers a listener to an element.
    *
    * @param {HTMLElement} elem the element
    * @param {String} eventName the event name ("click", "mouseover", etc.)
    * @param {function(e)} fn the callback function to attach
    * @param {boolean} useCapture specifies if we want to initiate capture.
    * See <a href="https://developer.mozilla.org/en/DOM/element.addEventListener">element.addEventListener</a>
    * on MDN for an explanation.
    */
    registerListener : function (_elem, _evtName, _fn, _useCapture) {
        if (typeof _elem.addEventListener != 'undefined')
        {
            if (_evtName === 'mouseenter')
            { _elem.addEventListener('mouseover', this.mouseEnter(_fn), _useCapture); }
            else if (_evtName === 'mouseleave')
            { _elem.addEventListener('mouseout', this.mouseEnter(_fn), _useCapture); }
            else
            { _elem.addEventListener(_evtName, _fn, _useCapture); }
        }
        else if (typeof _elem.attachEvent != 'undefined')
        {
            _elem.attachEvent('on' + _evtName, _fn);
        }
        else
        {
            _elem['on' + _evtName] = _fn;
        }
    },
    
    /**
    * Stops an event from bubbling.
    *
    * @param {Event} eventObject the event object
    */
    stopEventBubbling : function (eventObject) {
        if (eventObject) {
            if (eventObject.stopPropagation) {
                eventObject.stopPropagation ();
            } else { 
                eventObject.cancelBubble = true; 
            }
        }
    },
    
    /**
     * Creates a callback function that simply stops the event from bubbling.
     *
     * @example
     * var browser = new bigshot.Browser ();
     * browser.registerListener (element, 
     *     "mousedown", 
     *     browser.stopEventBubblingHandler (), 
     *     false);
     * @type function(event)
     * @return a new function that can be used to stop an event from bubbling
    */
    stopEventBubblingHandler : function () {
        var that = this;
        return function (event) {
            that.stopEventBubbling (event);
            return false;
        };
    },
    
    /**
     * Stops bubbling for all mouse events on the element.
     *
     * @param {HTMLElement} element the element
     */
    stopMouseEventBubbling : function (element) {
        this.registerListener (element, "mousedown", this.stopEventBubblingHandler (), false);
        this.registerListener (element, "mouseup", this.stopEventBubblingHandler (), false);
        this.registerListener (element, "mousemove", this.stopEventBubblingHandler (), false);
    },
    
    /**
     * Returns the size in pixels of the element
     *
     * @param {HTMLElement} obj the element
     * @return a size object with two integer members, w and h, for width and height respectively.
     */
    getElementSize : function (obj) {
        var size = {};
        if (obj.clientWidth) {
            size.w = obj.clientWidth;
        }
        if (obj.clientHeight) {
            size.h = obj.clientHeight;
        }
        return size;
    },
    
    /**
     * Returns true if the browser is scaling the window, such as on Mobile Safari.
     * The method used here is far from perfect, but it catches the most important use case:
     * If we are running on an iDevice and the page is zoomed out.
     */
    browserIsViewporting : function () {
        if (window.innerWidth <= screen.width) {
            return false;
        } else {
            return true;
        }
    },
    
    /**
     * Returns the device pixel scale, which is equal to the number of device 
     * pixels each css pixel corresponds to. Used to render the proper level of detail
     * on mobile devices, especially when zoomed out and more detailed textures are
     * simply wasted.
     *
     * @returns The number of device pixels each css pixel corresponds to.
     * For example, if the browser is zoomed out to 50% and a div with <code>width</code>
     * set to <code>100px</code> occupies 50 physical pixels, the function will return 
     * <code>0.5</code>.
     * @type number
     */
    getDevicePixelScale : function () {
        if (this.browserIsViewporting ()) {
            return screen.width / window.innerWidth;
        } else {
            return 1.0;
        }
    },
    
    /**
     * Requests an animation frame, if the API is supported
     * on the browser. If not, a <code>setTimeout</code> with 
     * a timeout of zero is used.
     *
     * @param {function()} callback the animation frame render function
     * @param {HTMLElement} element the element to use when requesting an
     * animation frame
     */
    requestAnimationFrame : function (callback, element) {
        var raff = this.requestAnimationFrameFunction;
        raff (callback, element);
    },
    
    /**
     * Returns the position in pixels of the element relative
     * to the top left corner of the document.
     *
     * @param {HTMLElement} obj the element
     * @return a position object with two integer members, x and y.
     */
    getElementPosition : function (obj) {
        var position = new Object();
        position.x = 0;
        position.y = 0;
        
        var o = obj;
        while (o) {
            position.x += o.offsetLeft;
            position.y += o.offsetTop;
            if (o.clientLeft) {
                position.x += o.clientLeft;
            }
            if (o.clientTop) {
                position.y += o.clientTop;
            }
            
            if (o.x) {
                position.x += o.x;
            }
            if (o.y) {
                position.y += o.y;
            }
            o = o.offsetParent;
        }
        return position;
    },
    
    /**
     * Creates an XMLHttpRequest object.
     *
     * @type XMLHttpRequest
     * @returns a XMLHttpRequest object.
     */
    createXMLHttpRequest : function  () {
        try { 
            return new ActiveXObject("Msxml2.XMLHTTP"); 
        } catch (e) {
        }
        
        try { 
            return new ActiveXObject("Microsoft.XMLHTTP"); 
        } catch (e) {
        }
        
        try { 
            return new XMLHttpRequest(); 
        } catch(e) {
        }
        
        alert("XMLHttpRequest not supported");
        
        return null;
    },
    
    /**
     * Creates an opacity transition from opaque to transparent.
     * If CSS transitions aren't supported, the element is
     * immediately made transparent without a transition.
     * 
     * @param {HTMLElement} element the element to fade out
     * @param {function()} onComplete function to call when
     * the transition is complete.
     */
    makeOpacityTransition : function (element, onComplete) {
        if (element.style.WebkitTransitionProperty != undefined) {
            element.style.opacity = 1.0;
            element.style.WebkitTransitionProperty = "opacity";
            element.style.WebkitTransitionTimingFunction = "linear";
            element.style.WebkitTransitionDuration = "1s";
            setTimeout (function () {
                element.addEventListener ("webkitTransitionEnd", function () {
                    onComplete ();
                });
                element.style.opacity = 0.0;
            }, 0);
        } else {
            element.style.opacity = 0.0;
            onComplete ();
        }
    }
};
