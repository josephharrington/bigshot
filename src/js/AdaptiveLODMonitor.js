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
 * Creates a new adaptive level-of-detail monitor.
 *
 * @class An adaptive LOD monitor that adjusts the level of detail of a VR panorama
 * to achieve a desired frame rate. To connect it to a VR panorama, use the 
 * {@link bigshot.AdaptiveLODMonitor#getListener} method to get a render listener 
 * that can be passed to {@link bigshot.VRPanorama#addRenderListener}.
 *
 * <p>The monitor maintains two render modes - a high quality one with a fixed
 * level of detail, and a low(er) quality one with variable level of detail.
 * If the panorama is idle for more than a set interval, a high-quality render is
 * performed.
 * 
 * @param {bigshot.AdaptiveLODMonitorParameters} parameters parameters for the LOD monitor.
 *
 * @see bigshot.AdaptiveLODMonitorParameters for a list of parameters
 *
 * @example
 * var bvr = new bigshot.VRPanorama ( ... );
 * var lodMonitor = new bigshot.AdaptiveLODMonitor (
 *     new bigshot.AdaptiveLODMonitorParameters ({
 *         vrPanorama : bvr,
 *         targetFps : 30,
 *         tolerance : 0.3,
 *         rate : 0.1,
 *         minMag : 1.5,
 *         maxMag : 16
 *     }));
 * bvr.addRenderListener (lodMonitor.getListener ());
 */
bigshot.AdaptiveLODMonitor = function (parameters) {
    this.setParameters (parameters);
    
    /**
     * The current adaptive detail level.
     * @type float
     * @private
     */
    this.currentAdaptiveMagnification = parameters.vrPanorama.getMaxTextureMagnification ();
    
    /**
     * The number of frames that have been rendered.
     * @type int
     * @private
     */
    this.frames = 0;
    
    /**
     * The total number of times we have sampled the render time.
     * @type int
     * @private
     */
    this.samples = 0;
    
    /**
     * The sum of sample times from all samples of render time in milliseconds.
     * @type int
     * @private
     */
    this.renderTimeTotal = 0;
    
    /**
     * The sum of sample times from the recent sample pass in milliseconds.
     * @type int
     * @private
     */
    this.renderTimeLast = 0;
    
    /**
     * The number of samples currently done in the recent sample pass.
     * @type int
     * @private
     */
    this.samplesLast = 0;
    
    /**
     * The start time, in milliseconds, of the last sample.
     * @type int
     * @private
     */
    this.startTime = 0;
    
    /**
     * The time, in milliseconds, when the panorama was last rendered.
     * @type int
     * @private
     */
    this.lastRender = 0;
    
    this.hqRender = false;
    this.hqMode = false;
    this.hqRenderWaiting = false;
    
    /**
     * Flag to enable / disable the monitor.
     * @type boolean
     * @private
     */
    this.enabled = true;
    
    var that = this;
    this.listenerFunction = function (state, cause, data) {
        that.listener (state, cause, data);
    };         
};

bigshot.AdaptiveLODMonitor.prototype = {
    averageRenderTime : function () {
        if (this.samples > 0) {
            return this.renderTimeTotal / this.samples;
        } else {
            return -1;
        }
    },
    
    /**
     * @param {bigshot.AdaptiveLODMonitorParameters} parameters
     */
    setParameters : function (parameters) {
        this.parameters = parameters;
        this.targetTime = 1000 / this.parameters.targetFps;
        
        this.lowerTime = this.targetTime / (1.0 + this.parameters.tolerance);
        this.upperTime = this.targetTime * (1.0 + this.parameters.tolerance);
    },
    
    setEnabled : function (enabled) {
        this.enabled = enabled;
    },
    
    averageRenderTimeLast : function () {
        if (this.samples > 0) {
            return this.renderTimeLast / this.samplesLast;
        } else {
            return -1;
        }
    },
    
    getListener : function () {
        return this.listenerFunction;
    },
    
    increaseDetail : function () {
        this.currentAdaptiveMagnification = Math.max (this.parameters.minMag, this.currentAdaptiveMagnification / (1.0 + this.parameters.rate));
    },
    
    decreaseDetail : function () {
        this.currentAdaptiveMagnification = Math.min (this.parameters.maxMag, this.currentAdaptiveMagnification * (1.0 + this.parameters.rate));
    },
    
    sample : function () {
        var deltat = new Date ().getTime () - this.startTime;
        this.samples++;
        this.renderTimeTotal += deltat;
        
        this.samplesLast++;
        this.renderTimeLast += deltat;
        
        if (this.samplesLast > 4) {
            var averageLast = this.renderTimeLast / this.samplesLast;                        
            
            if (averageLast < this.lowerTime) {
                this.increaseDetail ();
            } else if (averageLast > this.upperTime) {
                this.decreaseDetail ();
            }
            
            this.samplesLast = 0;
            this.renderTimeLast = 0;
        }
    },
    
    hqRenderTick : function () {
        if (this.lastRender < new Date ().getTime () - this.parameters.hqRenderDelay) {
            this.hqRender = true;
            this.hqMode = true;
            if (this.enabled) {
                this.parameters.vrPanorama.setMaxTextureMagnification (this.parameters.hqRenderMag);
                this.parameters.vrPanorama.render ();
            }
            
            this.hqRender = false;
            this.hqRenderWaiting = false;
        } else {
            var that = this;
            setTimeout (function () {
                    that.hqRenderTick ();
                }, this.parameters.hqRenderInterval);
        }
    },
    
    listener : function (state, cause, data) {
        if (!this.enabled) {
            return;
        }
        
        if (this.hqRender) {
            return;
        }
        
        if (this.hqMode && cause == bigshot.VRPanorama.ONRENDER_TEXTURE_UPDATE) {
            this.parameters.vrPanorama.setMaxTextureMagnification (this.parameters.minMag);
            return;
        } else {
            this.hqMode = false;
        }
        
        this.parameters.vrPanorama.setMaxTextureMagnification (this.currentAdaptiveMagnification);
        
        this.frames++;
        if ((this.frames < 20 || this.frames % 5 == 0) && state == bigshot.VRPanorama.ONRENDER_BEGIN) {
            this.startTime = new Date ().getTime ();
            this.lastRender = this.startTime;
            var that = this;
            setTimeout (function () {
                    that.sample ();
                }, 1);
            if (!this.hqRenderWaiting) {
                this.hqRenderWaiting = true;
                setTimeout (function () {
                        that.hqRenderTick ();
                    }, this.parameters.hqRenderInterval);
            }
        }
    }
};
