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
 * Creates a new VR panorama in a canvas. <b>Requires WebGL or CSS3D support.</b>
 * (Note: See {@link bigshot.VRPanorama#dispose} for important information.)
 * 
 * <h3 id="creating-a-cubemap">Creating a Cube Map</h3>
 *
 * <p>The panorama consists of six image pyramids, one for each face of the VR cube.
 * Due to restrictions in WebGL, each texture tile must have a power-of-two (POT) size -
 * that is, 2, 4, ..., 128, 256, etc. Furthermore, due to the way the faces are tesselated
 * the largest image must consist of POT x POT tiles. The final restriction is that the 
 * tiles must overlap for good seamless results.
 *
 * <p>The MakeImagePyramid has some sensible defaults built-in. If you just use the
 * command line:
 *
 * <code><pre>
 * java -jar bigshot.jar input.jpg temp/dzi \
 *     --preset dzi-cubemap \ 
 *     --format folders
 * </pre></code>
 * 
 * <p>You will get 2034 pixels per face, and a tile size of 256 pixels with 2 pixels
 * overlap. If you don't like that, you can use the <code>overlap</code>, <code>face-size</code>
 * and <code>tile-size</code> parameters. Let's take these one by one:
 *
 * <ul>
 * <li><p><code>overlap</code>: Overlap defines how much tiles should overlap, just to avoid
 * seams in the rendered results caused by finite numeric precision. The default is <b>2</b>, which
 * I've found works great for me.</p></li>
 * <li><p><code>tile-size</code>: First you need to decide what POT size the output should be.
 * Then subtract the overlap value. For example, if you set overlap to 1, <code>tile-size</code>
 * could be 127, 255, 511, or any 2<sup>n</sup>-1 value.</p></li>
 * <li><p><code>face-size</code>: Finally, we decide on a size for the full cube face. This should be
 * tile-size * 2<sup>n</sup>. Let's say we set n=3, which makes each face 8x8 tiles at the most zoomed-in
 * level. For a tile-size of 255, then, face-size is 255*2<sup>3</sup> = 255*8 = <b>2040</b>.</p></li>
 * </ul>
 * 
 * <p>A command line for the hypothetical scenario above would be:
 * 
 * <code><pre>
 * java -jar bigshot.jar input.jpg temp/dzi \
 *     --preset dzi-cubemap \ 
 *     --overlap 1 \
 *     --tile-size 255 \
 *     --face-size 2040 \
 *     --format folders
 * </pre></code>
 *
 * <p>If your tile size numbers don't add up, you'll get a warning like:
 *
 * <code><pre>
 * WARNING: Resulting image tile size (tile-size + overlap) is not a power of two: 255
 * </pre></code>
 *
 * <p>If your face size don't add up, you'll get another warning:
 *
 * <code><pre>
 * WARNING: face-size is not an even multiple of tile-size: 2040 % 254 != 0
 * </pre></code>
 *
 * <h3 id="integration-with-saladoplayer">Integration With SaladoPlayer</h3>
 *
 * <p><a href="http://panozona.com/wiki/">SaladoPlayer</a> is a cool
 * Flash-based VR panorama viewer that can display Deep Zoom Images.
 * It can be used as a fallback for Bigshot for browsers that don't
 * support WebGL.
 *
 * <p>Since Bigshot can use a Deep Zoom Image (DZI) via a {@link bigshot.DeepZoomImageFileSystem}
 * adapter, the common file format is DZI. There are two cases: The first is
 * when the DZI is served up as a folder structure, the second when
 * we pack the DZI into a Bigshot archive and serve it using bigshot.php.
 *
 * <h4>Serving DZI as Folders</h4>
 *
 * <p>This is an easy one. First, we generate the required DZIs:
 *
 * <code><pre>
 * java -jar bigshot.jar input.jpg temp/dzi \
 *     --preset dzi-cubemap \ 
 *     --format folders
 * </pre></code>
 * 
 * <p>We'll assume that we have the six DZI folders in "temp/dzi", and that
 * they have "face_" as a common prefix (which is what Bigshot's MakeImagePyramid
 * outputs). So we have, for example, "temp/dzi/face_f.xml" and the tiles for face_f
 * in "temp/dzi/face_f/". Set up Bigshot like this:
 *
 * <code><pre>
 * bvr = new bigshot.VRPanorama (
 *     new bigshot.VRPanoramaParameters ({
 *             container : document.getElementById ("canvas"),
 *             basePath : "temp/dzi",
 *             fileSystemType : "dzi"
 *         }));
 * </pre></code>
 * 
 * <p>SaladoPlayer uses an XML config file, which in this case will
 * look something like this:
 * 
 * <code><pre>
 * &lt;SaladoPlayer>
 *     &lt;global debug="false" firstPanorama="pano"/>
 *     &lt;panoramas>
 *         &lt;panorama id="pano" path="temp/dzi/face_f.xml"/>
 *     &lt;/panoramas>
 * &lt;/SaladoPlayer>
 * </pre></code>
 *
 * <h4>Serving DZI as Archive</h4>
 *
 * <p>This one is a bit more difficult. First we create a DZI as a bigshot archive:
 *
 * <code><pre>
 * java -jar bigshot.jar input.jpg temp/dzi.bigshot \
 *     --preset dzi-cubemap \ 
 *     --format archive
 * </pre></code>
 *
 * <p>We'll assume that we have our Bigshot archive at
 * "temp/dzi.bigshot". For this we will use the "entry" parameter of bigshot.php
 * to serve up the right files:
 *
 * <code><pre>
 * bvr = new bigshot.VRPanorama (
 *     new bigshot.VRPanoramaParameters ({
 *             container : document.getElementById ("canvas"),
 *             basePath : "/bigshot.php?file=temp/dzi.bigshot&entry=",
 *             fileSystemType : "dzi"
 *         }));
 * </pre></code>
 * 
 * <p>SaladoPlayer uses an XML config file, which in this case will
 * look something like this:
 * 
 * <code><pre>
 * &lt;SaladoPlayer>
 *     &lt;global debug="false" firstPanorama="pano"/>
 *     &lt;panoramas>
 *         &lt;panorama id="pano" path="/bigshot.php?file=dzi.bigshot&amp;amp;entry=face_f.xml"/>
 *     &lt;/panoramas>
 * &lt;/SaladoPlayer>
 * </pre></code>
 *
 * <h3>Usage example:</h3>
 * @example
 * var bvr = new bigshot.VRPanorama (
 *     new bigshot.VRPanoramaParameters ({
 *             basePath : "/bigshot.php?file=myvr.bigshot",
 *             fileSystemType : "archive",
 *             container : document.getElementById ("bigshot_canvas")
 *         }));
 * @class A cube-map VR panorama.
 * @extends bigshot.EventDispatcher
 *
 * @param {bigshot.VRPanoramaParameters} parameters the panorama parameters.
 *
 * @see bigshot.VRPanoramaParameters
 */
bigshot.VRPanorama = function (parameters) {
    bigshot.EventDispatcher.call (this);
    
    var that = this;
    
    this.parameters = parameters;
    this.maxTextureMagnification = parameters.maxTextureMagnification;
    this.container = parameters.container;
    this.browser = new bigshot.Browser ();
    this.dragStart = null;
    this.dragDistance = 0;
    this.hotspots = [];
    this.disposed = false;
    
    this.transformOffsets = {
        y : parameters.yawOffset,
        p : parameters.pitchOffset,
        r : parameters.rollOffset
    };
    
    /**
     * Current camera state.
     * @private
     */
    this.state = {
        rotation : {
            /**
             * Pitch in degrees.
             * @type float
             * @private
             */
            p : 0.0,
            
            /**
             * Yaw in degrees.
             * @type float
             * @private
             */
            y : 0.0,
            
            r : 0
        },
        
        /**
         * Field of view (vertical) in degrees.
         * @type float
         * @private
         */
        fov : 45,
        
        translation : {
            /**
             * Translation along X-axis.
             * @private
             * @type float
             */
            x : 0.0,
            
            /**
             * Translation along Y-axis.
             * @private
             * @type float
             */
            y : 0.0,
            
            /**
             * Translation along Z-axis.
             * @private
             * @type float
             */
            z : 0.0
        }
    };
    
    /**
     * Renderer wrapper.
     * @private
     * @type bigshot.VRRenderer
     */
    this.renderer = null;
    if (this.parameters.renderer) {
        if (this.parameters.renderer == "css") {
            this.renderer = new bigshot.CSS3DVRRenderer (this.container);
        } else if (this.parameters.renderer == "webgl") {
            this.renderer = new bigshot.WebGLVRRenderer (this.container)
        } else {
            throw new Error ("Unknown renderer: " + this.parameters.renderer);
        }
    } else {
        this.renderer = 
            bigshot.WebGLUtil.isWebGLSupported () ? 
        new bigshot.WebGLVRRenderer (this.container)
        :
        new bigshot.CSS3DVRRenderer (this.container);
    }
    
    /**
     * List of render listeners to call at the start and end of each render.
     *
     * @private
     */
    this.renderListeners = new Array (); 
    
    this.renderables = new Array ();
    
    /**
     * Current value of the idle counter.
     *
     * @private
     */
    this.idleCounter = 0;
    
    /**
     * Maximum value of the idle counter before any idle events start,
     * such as autorotation.
     *
     * @private
     */
    this.maxIdleCounter = -1;
    
    
    /**
     * Integer acting as a "permit". When the smoothRotate function
     * is called, the current value is incremented and saved. If the number changes
     * that particular call to smoothRotate stops. This way we avoid
     * having multiple smoothRotate rotations going in parallel.
     * @private
     * @type int
     */
    this.smoothrotatePermit = 0;
    
    /**
     * Helper function to consume events.
     * @private
     */
    var consumeEvent = function (event) {
        if (event.preventDefault) {
            event.preventDefault ();
        }
        return false;
    };
    
    /**
     * Full screen handler.
     *
     * @private
     */
    this.fullScreenHandler = null;
    
    this.renderAsapPermitTaken = false;
    
    /**
     * An element to use as reference when resizing the canvas element.
     * If non-null, any onresize() calls will result in the canvas being
     * resized to the size of this element.
     *
     * @private
     */
    this.sizeContainer = null;
    
    /**
     * The six cube faces.
     *
     * @type bigshot.VRFace[]
     * @private
     */
    var facesInit = {
        facesLeft : 6,
        faceLoaded : function () {
            this.facesLeft--;
            if (this.facesLeft == 0) {
                if (that.parameters.onload) {
                    that.parameters.onload ();
                }
            }
        }
    };
    var onFaceLoad = function () { 
        facesInit.faceLoaded () 
    };
    
    this.vrFaces = new Array ();
    this.vrFaces[0] = new bigshot.VRFace (this, "f", {x:-1, y:1, z:-1}, 2.0, {x:1, y:0, z:0}, {x:0, y:-1, z:0}, onFaceLoad);
    this.vrFaces[1] = new bigshot.VRFace (this, "b", {x:1, y:1, z:1}, 2.0, {x:-1, y:0, z:0}, {x:0, y:-1, z:0}, onFaceLoad);
    this.vrFaces[2] = new bigshot.VRFace (this, "l", {x:-1, y:1, z:1}, 2.0, {x:0, y:0, z:-1}, {x:0, y:-1, z:0}, onFaceLoad);
    this.vrFaces[3] = new bigshot.VRFace (this, "r", {x:1, y:1, z:-1}, 2.0, {x:0, y:0, z:1}, {x:0, y:-1, z:0}, onFaceLoad);
    this.vrFaces[4] = new bigshot.VRFace (this, "u", {x:-1, y:1, z:1}, 2.0, {x:1, y:0, z:0}, {x:0, y:0, z:-1}, onFaceLoad);
    this.vrFaces[5] = new bigshot.VRFace (this, "d", {x:-1, y:-1, z:-1}, 2.0, {x:1, y:0, z:0}, {x:0, y:0, z:1}, onFaceLoad);
    
    /**
     * Helper function to translate touch events to mouse-like events.
     * @private
     */
    var translateEvent = function (event) {
        if (event.clientX) {
            return event;
        } else {
            return {
                clientX : event.changedTouches[0].clientX,
                clientY : event.changedTouches[0].clientY
            };
        };
    };
    
    this.lastTouchStartAt = -1;
    
    this.allListeners = {
        "mousedown" : function (e) {
            that.smoothRotate ();
            that.resetIdle ();            
            that.dragMouseDown (e);
            return consumeEvent (e);
        },
        "mouseup" : function (e) {
            that.resetIdle ();
            that.dragMouseUp (e);
            return consumeEvent (e);
        },
        "mousemove" : function (e) {
            that.resetIdle ();
            that.dragMouseMove (e);
            return consumeEvent (e);
        },
        "gesturestart" : function (e) {
            that.gestureStart (e);
            return consumeEvent (e);
        },
        "gesturechange" : function (e) {
            that.gestureChange (e);
            return consumeEvent (e);
        },
        "gestureend" : function (e) {
            that.gestureEnd (e);
            return consumeEvent (e);
        },
        
        "DOMMouseScroll" : function (e) {
            that.resetIdle ();
            that.mouseWheel (e);
            return consumeEvent (e);
        },
        "mousewheel" : function (e) {
            that.resetIdle ();
            that.mouseWheel (e);
            return consumeEvent (e);
        },
        "dblclick" : function (e) {
            that.mouseDoubleClick (e);
            return consumeEvent (e);
        },
        
        "touchstart" : function (e) {
            that.smoothRotate ();
            that.lastTouchStartAt = new Date ().getTime ();
            that.resetIdle ();
            that.dragMouseDown (translateEvent (e));
            return consumeEvent (e);
        },
        "touchend" : function (e) {
            that.resetIdle ();
            var handled = that.dragMouseUp (translateEvent (e));
            if (!handled && (that.lastTouchStartAt > new Date().getTime() - 350)) {
                that.mouseDoubleClick (translateEvent (e));
            }
            that.lastTouchStartAt = -1;
            return consumeEvent (e);
        },
        "touchmove" : function (e) {
            if (that.dragDistance > 24) {                
                that.lastTouchStartAt = -1;
            }
            that.resetIdle ();
            that.dragMouseMove (translateEvent (e));
            return consumeEvent (e);
        }
    };
    this.addEventListeners ();
    
    /**
     * Stub function to call onresize on this instance.
     *
     * @private
     */
    this.onresizeHandler = function (e) {
        that.onresize ();
    };
    
    this.browser.registerListener (window, 'resize', this.onresizeHandler, false);
    this.browser.registerListener (document.body, 'orientationchange', this.onresizeHandler, false);
    
    this.setPitch (0.0);
    this.setYaw (0.0);
    this.setFov (45.0);
}

/*
 * Statics
 */

/**
 * When the mouse is pressed and dragged, the camera rotates
 * proportionally to the length of the dragging.
 *
 * @constant
 * @public
 * @static
 */
bigshot.VRPanorama.DRAG_GRAB = "grab";

/**
 * When the mouse is pressed and dragged, the camera continuously
 * rotates with a speed that is proportional to the length of the 
 * dragging.
 *
 * @constant
 * @public
 * @static
 */
bigshot.VRPanorama.DRAG_PAN = "pan";

/**
 * @name bigshot.VRPanorama.RenderState
 * @class The state the renderer is in when a {@link bigshot.VRPanorama.RenderListener} is called.
 *
 * @see bigshot.VRPanorama.ONRENDER_BEGIN
 * @see bigshot.VRPanorama.ONRENDER_END
 */

/**
 * A RenderListener state parameter value used at the start of each render.
 * 
 * @constant
 * @public
 * @static
 * @type bigshot.VRPanorama.RenderState
 */
bigshot.VRPanorama.ONRENDER_BEGIN = 0;

/**
 * A RenderListener state parameter value used at the end of each render.
 * 
 * @constant
 * @public
 * @static
 * @type bigshot.VRPanorama.RenderState
 */
bigshot.VRPanorama.ONRENDER_END = 1;

/**
 * A RenderListener cause parameter indicating that a previously requested 
 * texture has loaded and a render is forced. The data parameter is not used.
 *
 * @constant
 * @public
 * @static
 * @param {bigshot.VRPanorama.RenderCause}
 */
bigshot.VRPanorama.ONRENDER_TEXTURE_UPDATE = 0;

/**
 * @name bigshot.VRPanorama.RenderCause
 * @class The reason why the {@link bigshot.VRPanorama} is being rendered.
 * Due to the events outside of the panorama, the VR panorama may be forced to
 * re-render itself. When this happens, the {@link bigshot.VRPanorama.RenderListener}s
 * receive a constant indicating the cause of the rendering.
 * 
 * @see bigshot.VRPanorama.ONRENDER_TEXTURE_UPDATE
 */

/**
 * Specification for functions passed to {@link bigshot.VRPanorama#addRenderListener}.
 *
 * @name bigshot.VRPanorama.RenderListener
 * @function
 * @param {bigshot.VRPanorama.RenderState} state The state of the renderer. Can be {@link bigshot.VRPanorama.ONRENDER_BEGIN} or {@link bigshot.VRPanorama.ONRENDER_END}
 * @param {bigshot.VRPanorama.RenderCause} [cause] The reason for rendering the scene. Can be undefined or {@link bigshot.VRPanorama.ONRENDER_TEXTURE_UPDATE}
 * @param {Object} [data] An optional data object that is dependent on the cause. See the documentation 
 *             for the different causes.
 */

/**
 * Specification for functions passed to {@link bigshot.VRPanorama#addRenderable}.
 *
 * @name bigshot.VRPanorama.Renderable
 * @function
 * @param {bigshot.VRRenderer} renderer The renderer object to use.
 * @param {bigshot.TexturedQuadScene} scene The scene to render into.
 */

/** */
bigshot.VRPanorama.prototype = {
    /**
     * Adds a hotstpot.
     *
     * @param {bigshot.VRHotspot} hs the hotspot to add
     */
    addHotspot : function (hs) {
        this.hotspots.push (hs);
    },
    
    /**
     * Returns the {@link bigshot.VRPanoramaParameters} object used by this instance.
     *
     * @type bigshot.VRPanoramaParameters
     */
    getParameters : function () {
        return this.parameters;
    },
    
    /**
     * Sets the view translation.
     *
     * @param x translation of the viewer along the X axis
     * @param y translation of the viewer along the Y axis
     * @param z translation of the viewer along the Z axis
     */
    setTranslation : function (x, y, z) {
        this.state.translation.x = x;
        this.state.translation.y = y;
        this.state.translation.z = z;
    },
    
    /**
     * Returns the current view translation as an x-y-z triplet.
     *
     * @returns {number} x translation of the viewer along the X axis
     * @returns {number} y translation of the viewer along the Y axis
     * @returns {number} z translation of the viewer along the Z axis
     */
    getTranslation : function () {
        return this.state.translation;
    },
    
    /**
     * Sets the field of view.
     *
     * @param {number} fov the vertical field of view, in degrees
     */
    setFov : function (fov) {
        fov = Math.min (this.parameters.maxFov, fov);
        fov = Math.max (this.parameters.minFov, fov);
        this.state.fov = fov;
    },
    
    /**
     * Gets the field of view.
     *
     * @return {number} the vertical field of view, in degrees
     */
    getFov : function () {
        return this.state.fov;
    },
    
    /**
     * Returns the angle (yaw, pitch) for a given pixel coordinate.
     *
     * @param {number} x the x-coordinate of the pixel, measured in pixels 
     *                 from the left edge of the panorama.
     * @param {number} y the y-coordinate of the pixel, measured in pixels 
     *                 from the top edge of the panorama.
     * @return {number} .yaw the yaw angle of the pixel (0 &lt;= yaw &lt; 360)
     * @return {number} .pitch the pitch angle of the pixel (-180 &lt;= pitch &lt;= 180)
     *
     * @example
     * var container = ...; // an HTML element
     * var pano = ...; // a bigshot.VRPanorama
     * ...
     * container.addEventListener ("click", function (e) {
     *     var clickX = e.clientX - container.offsetX;
     *     var clickY = e.clientY - container.offsetY;
     *     var polar = pano.screenToPolar (clickX, clickY);
     *     alert ("You clicked at: " + 
     *            "Yaw: " + polar.yaw + 
     *            "  Pitch: " + polar.pitch);
     * });
     */
    screenToPolar : function (x, y) {
        var dray = this.screenToRayDelta (x, y);
        var ray = $V([dray.x, dray.y, dray.z, 1.0]);
        
        ray = Matrix.RotationX (this.getPitch () * Math.PI / 180.0).ensure4x4 ().x (ray);
        ray = Matrix.RotationY (-this.getYaw () * Math.PI / 180.0).ensure4x4 ().x (ray);
        
        var dx = ray.e(1);
        var dy = ray.e(2);
        var dz = ray.e(3);
        
        var dxz = Math.sqrt (dx * dx + dz * dz);
        
        var dyaw = Math.atan2 (dx, -dz) * 180 / Math.PI;
        var dpitch = Math.atan2 (dy, dxz) * 180 / Math.PI;
        
        var res = {};
        res.yaw = (dyaw + 360) % 360.0;
        res.pitch = dpitch;
        
        return res;
    },
    
    /**
     * Restricts the pitch value to be between the minPitch and maxPitch parameters.
     * 
     * @param {number} p the pitch value
     * @returns the constrained pitch value.
     */
    snapPitch : function (p) {
        p = Math.min (this.parameters.maxPitch, p);
        p = Math.max (this.parameters.minPitch, p);
        return p;
    },
    
    /**
     * Sets the current camera pitch.
     *
     * @param {number} p the pitch, in degrees
     */
    setPitch : function (p) {
        this.state.rotation.p = this.snapPitch (p);
    },
    
    /**
     * Subtraction mod 360, sort of...
     *
     * @private
     * @returns the angular distance with smallest magnitude to add to p0 to get to p1 % 360
     */
    circleDistance : function (p0, p1) {
        if (p1 > p0) {
            // p1 is somewhere clockwise to p0
            var d1 = (p1 - p0); // move clockwise
            var d2 = ((p1 - 360) - p0); // move counterclockwise, first -p0 to get to 0, then p1 - 360.
            return Math.abs (d1) < Math.abs (d2) ? d1 : d2;
        } else {
            // p1 is somewhere counterclockwise to p0
            var d1 = (p1 - p0); // move counterclockwise
            var d2 = (360 - p0) + p1; // move clockwise, first (360-p= to get to 0, then another p1 degrees
            return Math.abs (d1) < Math.abs (d2) ? d1 : d2;
        }
    },
    
    /**
     * Subtraction mod 360, sort of...
     *
     * @private
     */
    circleSnapTo : function (p, p1, p2) {
        var d1 = this.circleDistance (p, p1);
        var d2 = this.circleDistance (p, p2);
        return Math.abs (d1) < Math.abs (d2) ? p1 : p2;
    },
    
    /**
     * Constrains a yaw value to the required minimum and maximum values.
     *
     * @private
     */
    snapYaw : function (y) {
        y %= 360;
        if (y < 0) {
            y += 360;
        }
        if (this.parameters.minYaw < this.parameters.maxYaw) {
            if (y > this.parameters.maxYaw || y < this.parameters.minYaw) {
                y = circleSnapTo (y, this.parameters.minYaw, this.parameters.maxYaw);
            }
        } else {
            // The only time when minYaw > maxYaw is when the interval
            // contains the 0 angle.
            if (y > this.parameters.minYaw) {
                // ok, we're somewhere between minYaw and 0.0
            } else if (y > this.parameters.maxYaw) {
                // we're somewhere between maxYaw and minYaw 
                // (but on the wrong side).
                // figure out the nearest point and snap to it
                y = circleSnapTo (y, this.parameters.minYaw, this.parameters.maxYaw);
            } else {
                // ok, we're somewhere between 0.0 and maxYaw
            }
        }
        return y;
    },
    
    /**
     * Sets the current camera yaw. The yaw is normalized between
     * 0 <= y < 360.
     *
     * @param {number} y the yaw, in degrees
     */
    setYaw : function (y) {
        this.state.rotation.y = this.snapYaw (y);
    },
    
    /**
     * Gets the current camera yaw.
     *
     * @return {number} the yaw, in degrees
     */
    getYaw : function () {
        return this.state.rotation.y;
    },
    
    /**
     * Gets the current camera pitch.
     *
     * @return {number} the pitch, in degrees
     */
    getPitch : function () {
        return this.state.rotation.p;
    },
    
    /**
     * Unregisters event handlers and other page-level hooks. The client need not call this
     * method unless bigshot images are created and removed from the page
     * dynamically. In that case, this method must be called when the client wishes to
     * free the resources allocated by the image. Otherwise the browser will garbage-collect
     * all resources automatically.
     * @public
     */
    dispose : function () {
        this.disposed = true;
        this.browser.unregisterListener (window, "resize", this.onresizeHandler, false);
        this.browser.unregisterListener (document.body, "orientationchange", this.onresizeHandler, false);
        this.removeEventListeners ();
        
        for (var i = 0; i < this.vrFaces.length; ++i) {
            this.vrFaces[i].dispose ();
        }
        this.renderer.dispose ();
    },
    
    /**
     * Creates and initializes a {@link bigshot.VREvent} object.
     * The {@link bigshot.VREvent#ray}, {@link bigshot.VREvent#yaw},
     * {@link bigshot.VREvent#pitch}, {@link bigshot.Event#target} and
     * {@link bigshot.Event#currentTarget} fields are set.
     * 
     * @param {Object} data the data object for the event
     * @param {number} data.clientX the client x-coordinate of the event
     * @param {number} data.clientY the client y-coordinate of the event
     * @returns the new event object
     * @type bigshot.VREvent
     */
    createVREventData : function (data) {
        var elementPos = this.browser.getElementPosition (this.container);
        data.localX = data.clientX - elementPos.x;
        data.localY = data.clientY - elementPos.y;
        
        data.ray = this.screenToRay (data.localX, data.localY);
        
        var polar = this.screenToPolar (data.localX, data.localY);
        data.yaw = polar.yaw;
        data.pitch = polar.pitch;
        data.target = this;
        data.currentTarget = this;
        
        return new bigshot.VREvent (data);
    },
    
    
    /**
     * Sets up transformation matrices etc. Calls all render listeners with a state parameter
     * of {@link bigshot.VRPanorama.ONRENDER_BEGIN}.
     *
     * @private
     *
     * @param [cause] parameter for the {@link bigshot.VRPanorama.RenderListener}s.
     * @param [data] parameter for the {@link bigshot.VRPanorama.RenderListener}s.
     */
    beginRender : function (cause, data) {
        this.onrender (bigshot.VRPanorama.ONRENDER_BEGIN, cause, data);
        this.renderer.beginRender (this.state.rotation, this.state.fov, this.state.translation, this.transformOffsets);
    },
    
    
    /**
     * Add a function that will be called at various times during the render.
     *
     * @param {bigshot.VRPanorama.RenderListener} listener the listener function
     */
    addRenderListener : function (listener) {
        var rl = new Array ();
        rl = rl.concat (this.renderListeners);
        rl.push (listener);
        this.renderListeners = rl;
    },
    
    /**
     * Removes a function that will be called at various times during the render.
     *
     * @param {bigshot.VRPanorama.RenderListener} listener the listener function
     */
    removeRenderListener : function (listener) {
        var rl = new Array ();
        rl = rl.concat (this.renderListeners);
        for (var i = 0; i < rl.length; ++i) {
            if (rl[i] === listener) {
                rl.splice (i, 1);
                break;
            }
        }
        this.renderListeners = rl;
    },
    
    /**
     * Called at the start and end of every render.
     *
     * @event
     * @private
     * @type function()
     * @param {bigshot.VRPanorama.RenderState} state the current render state
     */
    onrender : function (state, cause, data) {
        var rl = this.renderListeners;
        for (var i = 0; i < rl.length; ++i) {
            rl[i](state, cause, data);
        }
    },
    
    /**
     * Performs per-render cleanup. Calls all render listeners with a state parameter
     * of {@link bigshot.VRPanorama.ONRENDER_END}.
     *
     * @private
     * 
     * @param [cause] parameter for the {@link bigshot.VRPanorama.RenderListener}s.
     * @param [data] parameter for the {@link bigshot.VRPanorama.RenderListener}s.
     */
    endRender : function (cause, data) {
        for (var f in this.vrFaces) {
            this.vrFaces[f].endRender ();
        }
        this.renderer.endRender ();
        this.onrender (bigshot.VRPanorama.ONRENDER_END, cause, data);
    },
    
    /**
     * Add a function that will be called to render any additional quads.
     *
     * @param {bigshot.VRPanorama.Renderable} renderable The renderable, a function responsible for
     * rendering additional scene elements.
     */
    addRenderable : function (renderable) {
        var rl = new Array ();
        rl.concat (this.renderables);
        rl.push (renderable);
        this.renderables = rl;
    },
    
    /**
     * Removes a function that will be called to render any additional quads.
     *
     * @param {bigshot.VRPanorama.Renderable} renderable The renderable added using
     * {@link bigshot.VRPanorama#addRenderable}.
     */
    removeRenderable : function (renderable) {
        var rl = new Array ();
        rl.concat (this.renderables);
        for (var i = 0; i < rl.length; ++i) {
            if (rl[i] == listener) {
                rl.splice (i, 1);
                break;
            }
        }
        this.renderables = rl;
    },
    
    /**
     * Renders the VR cube.
     *
     * @param [cause] parameter for the {@link bigshot.VRPanorama.RenderListener}s.
     * @param [data] parameter for the {@link bigshot.VRPanorama.RenderListener}s.
     */
    render : function (cause, data) {
        if (!this.disposed) {
            this.beginRender (cause, data);
            
            var scene = this.renderer.createTexturedQuadScene ();
            
            for (var f in this.vrFaces) {
                this.vrFaces[f].render (scene);
            }
            
            for (var i = 0; i < this.renderables.length; ++i) {
                this.renderables[i](this.renderer, scene);
            }
            
            scene.render ();
            
            for (var i = 0; i < this.hotspots.length; ++i) {
                this.hotspots[i].layout ();
            }
            
            this.endRender (cause, data);
        }
    },
    
    /**
     * Render updated faces. Called as tiles are loaded from the server.
     *
     * @param [cause] parameter for the {@link bigshot.VRPanorama.RenderListener}s.
     * @param [data] parameter for the {@link bigshot.VRPanorama.RenderListener}s.
     */
    renderUpdated : function (cause, data) {
        if (!this.disposed && this.renderer.supportsUpdate ()) {
            this.beginRender (cause, data);
            
            var scene = this.renderer.createTexturedQuadScene ();
            
            for (var f in this.vrFaces) {
                if (this.vrFaces[f].isUpdated ()) {
                    this.vrFaces[f].render (scene);
                }
            }
            
            scene.render ();
            
            for (var i = 0; i < this.hotspots.length; ++i) {
                this.hotspots[i].layout ();
            }
            
            this.endRender (cause, data);
        } else {
            this.render (cause, data);
        }
    },
    
    /**
     * The current drag mode.
     * 
     * @private
     */
    dragMode : bigshot.VRPanorama.DRAG_GRAB,
    
    /**
     * Sets the mouse dragging mode.
     *
     * @param mode one of {@link bigshot.VRPanorama.DRAG_PAN} or {@link bigshot.VRPanorama.DRAG_GRAB}.
     */
    setDragMode : function (mode) {
        this.dragMode = mode;
    },
    
    addEventListeners : function () {
        for (var k in this.allListeners) {
            this.browser.registerListener (this.container, k, this.allListeners[k], false);
        }
    },
    
    removeEventListeners : function () {
        for (var k in this.allListeners) {
            this.browser.unregisterListener (this.container, k, this.allListeners[k], false);
        }
    },
    
    dragMouseDown : function (e) {
        this.dragStart = {
            clientX : e.clientX,
            clientY : e.clientY
        };
        this.dragLast = {
            clientX : e.clientX,
            clientY : e.clientY,
            dx : 0,
            dy : 0,
            dt : 1000000,
            time : new Date ().getTime ()
        };
        this.dragDistance = 0;
    },
    
    dragMouseUp : function (e) {
        // In case we got a mouse up with out a previous mouse down,
        // for example, double-click on title bar to maximize the 
        // window
        if (this.dragStart == null || this.dragLast == null) {
            this.dragStart = null;
            this.dragLast = null;
            return;
        }
        
        this.dragStart = null;
        var dx = this.dragLast.dx;
        var dy = this.dragLast.dy;
        var ds = Math.sqrt (dx * dx + dy * dy);
        var dt = this.dragLast.dt;
        var dtb = new Date ().getTime () - this.dragLast.time;
        this.dragLast = null;
        
        var v = dt > 0 ? (ds / dt) : 0;
        if (v > 0.05 && dtb < 250 && dt > 20 && this.parameters.fling) {
            var scale = this.state.fov / this.renderer.getViewportHeight ();
            
            var t0 = new Date ().getTime ();
            
            var flingScale = this.parameters.flingScale;
            
            dx /= dt;
            dy /= dt;
            
            this.smoothRotate (function (dat) {
                    var dt = new Date ().getTime () - t0;
                    var fact = Math.pow (2, -dt * flingScale);
                    var d = (dx * dat * scale) * fact;
                    return fact > 0.01 ? d : null;
                }, function (dat) {
                    var dt = new Date ().getTime () - t0;
                    var fact = Math.pow (2, -dt * flingScale);
                    var d = (dy * dat * scale) * fact;
                    return fact > 0.01 ? d : null;
                }, function () {
                    return null;
                });
            return true;
        } else {
            this.smoothRotate ();
            return false;
        }
    },
    
    dragMouseMove : function (e) {
        if (this.dragStart != null && this.currentGesture == null) {
            if (this.dragMode == bigshot.VRPanorama.DRAG_GRAB) {
                this.smoothRotate ();
                var scale = this.state.fov / this.renderer.getViewportHeight ();
                var dx = e.clientX - this.dragStart.clientX;
                var dy = e.clientY - this.dragStart.clientY;
                this.dragDistance += dx + dy;
                this.setYaw (this.getYaw () - dx * scale);
                this.setPitch (this.getPitch () - dy * scale);
                this.renderAsap ();
                this.dragStart = e;
                var dt = new Date ().getTime () - this.dragLast.time;
                if (dt > 20) {
                    this.dragLast = {
                        dx : this.dragLast.clientX - e.clientX,
                        dy : this.dragLast.clientY - e.clientY,
                        dt : dt,
                        clientX : e.clientX,
                        clientY : e.clientY,
                        time : new Date ().getTime ()
                    };
                }
            } else {
                var scale = 0.1 * this.state.fov / this.renderer.getViewportHeight ();
                var dx = e.clientX - this.dragStart.clientX;
                var dy = e.clientY - this.dragStart.clientY;
                this.dragDistance = dx + dy;
                this.smoothRotate (
                    function () {
                        return dx * scale;
                    },
                    function () {
                        return dy * scale;
                    });
            }
        }
    },
    
    onMouseDoubleClick : function (e, x, y) {
        var eventData = this.createVREventData ({
                type : "dblclick",
                clientX : e.clientX,
                clientY : e.clientY
            });
        this.fireEvent ("dblclick", eventData);
        if (!eventData.defaultPrevented) {
            this.smoothRotateToXY (x, y);
        }
    },
    
    mouseDoubleClick : function (e) {
        var pos = this.browser.getElementPosition (this.container);
        this.onMouseDoubleClick (e, e.clientX - pos.x, e.clientY - pos.y);
    },
    
    /**
     * Begins a potential drag event.
     *
     * @private
     */
    gestureStart : function (event) {
        this.currentGesture = {
            startFov : this.getFov (),
            scale : event.scale
        };            
    },
    
    /**
     * Begins a potential drag event.
     *
     * @private
     */
    gestureEnd : function (event) {
        this.currentGesture = null;
    },
    
    /**
     * Begins a potential drag event.
     *
     * @private
     */
    gestureChange : function (event) {
        if (this.currentGesture) {
            var newFov = this.currentGesture.startFov / event.scale;
            this.setFov (newFov);
            this.renderAsap ();
        }
    },
    
    /**
     * Sets the maximum texture magnification.
     *
     * @param {number} v the maximum texture magnification
     * @see bigshot.VRPanoramaParameters#maxTextureMagnification
     */
    setMaxTextureMagnification : function (v) {
        this.maxTextureMagnification = v;
    },
    
    /**
     * Gets the current maximum texture magnification.
     *
     * @type number
     * @see bigshot.VRPanoramaParameters#maxTextureMagnification
     */
    getMaxTextureMagnification : function () {
        return this.maxTextureMagnification;
    },
    
    /**
     * Computes the minimum field of view where the resulting image will not
     * have to stretch the textures more than given by the
     * {@link bigshot.VRPanoramaParameters#maxTextureMagnification} parameter.
     *
     * @type number
     * @return the minimum FOV, below which it is necessary to stretch the 
     * vr cube texture more than the given {@link bigshot.VRPanoramaParameters#maxTextureMagnification}
     */
    getMinFovFromViewportAndImage : function () {
        var halfHeight = this.renderer.getViewportHeight () / 2;
        
        var minFaceHeight = this.vrFaces[0].parameters.height;
        for (var i in this.vrFaces) {
            minFaceHeight = Math.min (minFaceHeight, this.vrFaces[i].parameters.height);
        }
        
        var edgeSizeY = this.maxTextureMagnification * minFaceHeight / 2;
        
        var wy = halfHeight / edgeSizeY;
        
        var mz = Math.atan (wy) * 180 / Math.PI;
        
        return mz * 2;
    },
    
    /**
     * Transforms screen coordinates to a world-coordinate ray.
     * @private
     */
    screenToRay : function (x, y) {
        var dray = this.screenToRayDelta (x, y);
        var ray = this.renderer.transformToWorld (dray);
        ray = Matrix.RotationY (-this.transformOffsets.y * Math.PI / 180.0).ensure4x4 ().xPoint3Dhom1 (ray);
        ray = Matrix.RotationX (-this.transformOffsets.p * Math.PI / 180.0).ensure4x4 ().xPoint3Dhom1 (ray);
        ray = Matrix.RotationZ (-this.transformOffsets.r * Math.PI / 180.0).ensure4x4 ().xPoint3Dhom1 (ray);
        return ray;
    },
    
    /**
     * @private
     */
    screenToRayDelta : function (x, y) {
        var halfHeight = this.renderer.getViewportHeight () / 2;
        var halfWidth = this.renderer.getViewportWidth () / 2;
        var x = (x - halfWidth);
        var y = (y - halfHeight);
        
        var edgeSizeY = Math.tan ((this.state.fov / 2) * Math.PI / 180);
        var edgeSizeX = edgeSizeY * this.renderer.getViewportWidth () / this.renderer.getViewportHeight ();
        
        var wx = x * edgeSizeX / halfWidth;
        var wy = y * edgeSizeY / halfHeight;
        var wz = -1.0;
        
        return {
            x : wx,
            y : wy,
            z : wz
        };
    },
    
    /**
     * Smoothly rotates the panorama so that the 
     * point given by x and y, in pixels relative to the top left corner
     * of the panorama, ends up in the center of the viewport.
     *
     * @param {int} x the x-coordinate, in pixels from the left edge
     * @param {int} y the y-coordinate, in pixels from the top edge
     */
    smoothRotateToXY : function (x, y) {
        var polar = this.screenToPolar (x, y);
        
        this.smoothRotateTo (this.snapYaw (polar.yaw), this.snapPitch (polar.pitch), this.getFov (), this.state.fov / 200);
    },
    
    /**
     * Gives the step to take to slowly approach the 
     * target value.
     *
     * @example
     * current = current + this.ease (current, target, 1.0);
     * @private
     */
    ease : function (current, target, speed, snapFrom) {
        var easingFrom = speed * 40;
        if (!snapFrom) {
            snapFrom = speed / 5;
        }
        var ignoreFrom = speed / 1000;
        
        var distance = current - target;
        if (distance > easingFrom) {
            distance = -speed;
        } else if (distance < -easingFrom) {
            distance = speed;
        } else if (Math.abs (distance) < snapFrom) {
            distance = -distance;
        } else if (Math.abs (distance) < ignoreFrom) {
            distance = 0;
        } else {
            distance = - (speed * distance) / (easingFrom);
        }
        return distance;
    },
    
    /**
     * Resets the "idle" clock.
     * @private
     */
    resetIdle : function () {
        this.idleCounter = 0;
    },
    
    /**
     * Idle clock.
     * @private
     */
    idleTick : function () {
        if (this.maxIdleCounter < 0) {
            return;
        }
        ++this.idleCounter;
        if (this.idleCounter == this.maxIdleCounter) {
            this.autoRotate ();
        }
        var that = this;
        setTimeout (function () {
                that.idleTick ();
            }, 1000);
    },
    
    /**
     * Sets the panorama to auto-rotate after a certain time has
     * elapsed with no user interaction. Default is disabled.
     * 
     * @param {int} delay the delay in seconds. Set to < 0 to disable
     * auto-rotation when idle
     */
    autoRotateWhenIdle : function (delay) {
        this.maxIdleCounter = delay;
        this.idleCounter = 0;
        if (delay < 0) {
            return;
        } else if (this.maxIdleCounter > 0) {            
            var that = this;
            setTimeout (function () {
                    that.idleTick ();
                }, 1000);
        }
    },
    
    /**
     * Starts auto-rotation of the camera. If the yaw is constrained,
     * will pan back and forth between the yaw endpoints. Call
     * {@link #smoothRotate}() to stop the rotation.
     */
    autoRotate : function () {
        var that = this;
        var scale = this.state.fov / 400;
        
        var speed = scale;
        var dy = speed;
        this.smoothRotate (
            function () {
                var nextPos = that.getYaw () + dy;
                if (that.parameters.minYaw < that.parameters.maxYaw) {
                    if (nextPos > that.parameters.maxYaw || nextPos < that.parameters.minYaw) {
                        dy = -dy;
                    }
                } else {
                    // The only time when minYaw > maxYaw is when the interval
                    // contains the 0 angle.
                    if (nextPos > that.parameters.minYaw) {
                        // ok, we're somewhere between minYaw and 0.0
                    } else if (nextPos > that.parameters.maxYaw) {
                        dy = -dy;
                    } else {
                        // ok, we're somewhere between 0.0 and maxYaw
                    }
                }
                return dy;
            }, function () {
                return that.ease (that.getPitch (), 0.0, speed);
            }, function () {
                return that.ease (that.getFov (), 45.0, 0.1);
            });
    },
    
    /**
     * Smoothly rotates the panorama to the given state.
     *
     * @param {number} yaw the target yaw
     * @param {number} pitch the target pitch
     * @param {number} fov the target vertical field of view
     * @param {number} the speed to rotate with
     */
    smoothRotateTo : function (yaw, pitch, fov, speed) {
        var that = this;
        this.smoothRotate (
            function () {
                var distance = that.circleDistance (yaw, that.getYaw ());
                var d = -that.ease (0, distance, speed);
                return Math.abs (d) > 0.01 ? d : null;
            }, function () {
                var d = that.ease (that.getPitch (), pitch, speed);
                return Math.abs (d) > 0.01 ? d : null;
            }, function () {
                var d = that.ease (that.getFov (), fov, speed);
                return Math.abs (d) > 0.01 ? d : null;
            }
        );
    },
    
    
    /**
     * Smoothly rotates the camera. If all of the dp, dy and df functions are null, stops
     * any smooth rotation.
     *
     * @param {function()} [dy] function giving the yaw increment for the next frame 
     * or null if no further yaw movement is required
     * @param {function()} [dp] function giving the pitch increment for the next frame 
     * or null if no further pitch movement is required
     * @param {function()} [df] function giving the field of view (degrees) increment 
     * for the next frame or null if no further fov adjustment is required
     */
    smoothRotate : function (dy, dp, df) {
        ++this.smoothrotatePermit;
        var savedPermit = this.smoothrotatePermit;
        if (!dp && !dy && !df) {
            return;
        }
        
        var that = this;
        var fs = {
            dy : dy,
            dp : dp,
            df : df,
            t : new Date ().getTime ()
        };
        var stepper = function () {
            if (that.smoothrotatePermit == savedPermit) {
                var now = new Date ().getTime ();
                var dat = now - fs.t;
                fs.t = now;
                
                var anyFunc = false;
                if (fs.dy) {
                    var d = fs.dy(dat);
                    if (d != null) {
                        anyFunc = true;
                        that.setYaw (that.getYaw () + d);
                    } else {
                        fs.dy = null;
                    }
                }
                
                if (fs.dp) {
                    var d = fs.dp(dat);
                    if (d != null) {
                        anyFunc = true;
                        that.setPitch (that.getPitch () + d);
                    } else {
                        fs.dp = null;
                    }
                }
                
                if (fs.df) {
                    var d = fs.df(dat);
                    if (d != null) {
                        anyFunc = true;
                        that.setFov (that.getFov () + d);
                    } else {
                        fs.df = null;
                    }
                }
                that.render ();
                if (anyFunc) {
                    that.browser.requestAnimationFrame (stepper, that.renderer.getElement ());
                }
            }
        };
        stepper ();
    },
    
    /**
     * Translates mouse wheel events.
     * @private
     */
    mouseWheel : function (event){
        var delta = 0;
        if (!event) /* For IE. */
            event = window.event;
        if (event.wheelDelta) { /* IE/Opera. */
            delta = event.wheelDelta / 120;
            /*
             * In Opera 9, delta differs in sign as compared to IE.
             */
            if (window.opera)
                delta = -delta;
        } else if (event.detail) { /* Mozilla case. */
            /*
             * In Mozilla, sign of delta is different than in IE.
             * Also, delta is multiple of 3.
             */
            delta = -event.detail;
        }
        
        /*
         * If delta is nonzero, handle it.
         * Basically, delta is now positive if wheel was scrolled up,
         * and negative, if wheel was scrolled down.
         */
        if (delta) {
            this.mouseWheelHandler (delta);
        }
        
        /*
         * Prevent default actions caused by mouse wheel.
         * That might be ugly, but we handle scrolls somehow
         * anyway, so don't bother here..
         */
        if (event.preventDefault) {
            event.preventDefault ();
        }
        event.returnValue = false;
    },
    
    /**
     * Utility function to interpret mouse wheel events.
     * @private
     */
    mouseWheelHandler : function (delta) {
        var that = this;
        var target = null;
        if (delta > 0) {
            if (this.getFov () > this.parameters.minFov) {
                target = this.getFov () * 0.9;
            }
        }
        if (delta < 0) {
            if (this.getFov () < this.parameters.maxFov) {
                target = this.getFov () / 0.9;
            }
        }
        if (target != null) {
            this.smoothRotate (null, null, function () {
                    var df = (target - that.getFov ()) / 1.5;
                    return Math.abs (df) > 0.01 ? df : null;
                });        
        }
    },
    
    /**
     * Maximizes the image to cover the browser viewport.
     * The container div is removed from its parent node upon entering 
     * full screen mode. When leaving full screen mode, the container
     * is appended to its old parent node. To avoid rearranging the
     * nodes, wrap the container in an extra div.
     *
     * <p>For unknown reasons (probably security), browsers will
     * not let you open a window that covers the entire screen.
     * Even when specifying "fullscreen=yes", all you get is a window
     * that has a title bar and only covers the desktop (not any task
     * bars or the like). For now, this is the best that I can do,
     * but should the situation change I'll update this to be
     * full-screen<i>-ier</i>.
     *
     * @param {function()} [onClose] function that is called when the user 
     * exits full-screen mode
     * @public
     */
    fullScreen : function (onClose) {
        if (this.fullScreenHandler) {
            return;
        }
        
        var message = document.createElement ("div");
        message.style.position = "absolute";
        message.style.fontSize = "16pt";
        message.style.top = "128px";
        message.style.width = "100%";
        message.style.color = "white";
        message.style.padding = "16px";
        message.style.zIndex = "9999";
        message.style.textAlign = "center";
        message.style.opacity = "0.75";
        message.innerHTML = "<span style='border-radius: 16px; -moz-border-radius: 16px; padding: 16px; padding-left: 32px; padding-right: 32px; background:black'>Press Esc to exit full screen mode.</span>";
        
        var that = this;
        
        this.fullScreenHandler = new bigshot.FullScreen (this.container);
        this.fullScreenHandler.restoreSize = this.sizeContainer == null;
        
        this.fullScreenHandler.addOnResize (function () {
                that.onresize ();
            });
        
        this.fullScreenHandler.addOnClose (function () {
                if (message.parentNode) {
                    try {
                        div.removeChild (message);
                    } catch (x) {
                    }
                }
                that.fullScreenHandler = null;
            });
        
        if (onClose) {
            this.fullScreenHandler.addOnClose (function () {
                    onClose ();
                });
        }
        
        this.removeEventListeners ();
        this.fullScreenHandler.open ();
        this.addEventListeners ();
        // Safari compatibility - must update after entering fullscreen.
        // 1s should be enough so we enter FS, but not enough for the
        // user to wonder if something is wrong.
        var r = function () {
            that.render ();
        };
        setTimeout (r, 1000);
        setTimeout (r, 2000);
        setTimeout (r, 3000);
        
        if (this.fullScreenHandler.getRootElement ()) {
            this.fullScreenHandler.getRootElement ().appendChild (message);
            
            setTimeout (function () {
                    var opacity = 0.75;
                    var iter = function () {
                        opacity -= 0.02;
                        if (message.parentNode) {
                            if (opacity <= 0) {
                                message.style.display = "none";
                                try {
                                    div.removeChild (message);
                                } catch (x) {}
                            } else {
                                message.style.opacity = opacity;
                                setTimeout (iter, 20);
                            }
                        }
                    };
                    setTimeout (iter, 20);
                }, 3500);
        }
        
        return function () {
            that.removeEventListeners ();
            that.fullScreenHandler.close ();
            that.addEventListeners ();
        };
    },
    
    /**
     * Right-sizes the canvas container.
     * @private
     */
    onresize : function () {
        if (this.fullScreenHandler == null || !this.fullScreenHandler.isFullScreen) {
            if (this.sizeContainer) {
                var s = this.browser.getElementSize (this.sizeContainer);
                this.renderer.resize (s.w, s.h);
            }
        } else {
            this.container.style.width = window.innerWidth + "px";
            this.container.style.height = window.innerHeight + "px";            
            var s = this.browser.getElementSize (this.container);
            this.renderer.resize (s.w, s.h);
        }
        this.renderer.onresize ();
        this.renderAsap ();            
    },
    
    /**
     * Posts a render() call via a timeout or the requestAnimationFrame API.
     * Use when the render call must be done as soon as possible, but 
     * can't be done in the current call context.
     */
    renderAsap : function () {
        if (!this.renderAsapPermitTaken && !this.disposed) {
            this.renderAsapPermitTaken = true;
            var that = this;
            this.browser.requestAnimationFrame (function () {
                    that.renderAsapPermitTaken = false;
                    that.render ();                    
                }, this.renderer.getElement ());
        }
    },
    
    
    /**
     * Automatically resizes the canvas element to the size of the 
     * given element on resize.
     *
     * @param {HTMLElement} sizeContainer the element to use. Set to <code>null</code>
     * to disable.
     */
    autoResizeContainer : function (sizeContainer) {
        this.sizeContainer = sizeContainer;
    }
}

/**
 * Fired when the user double-clicks on the panorama.
 *
 * @name bigshot.VRPanorama#dblclick
 * @event
 * @param {bigshot.VREvent} event the event object
 */

bigshot.Object.extend (bigshot.VRPanorama, bigshot.EventDispatcher);
