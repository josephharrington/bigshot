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
 * Creates a new parameter block.
 *
 * @class Parameters for the adaptive LOD monitor.
 */
bigshot.AdaptiveLODMonitorParameters = function (values) {
    
    /**
     * The VR panorama to adjust.
     *
     * @type bigshot.VRPanorama
     */
    this.vrPanorama = null;
    
    /**
     * The target framerate in frames per second. 
     * The monitor will try to achieve an average frame render time
     * of <i>1 / targetFps</i> seconds.
     *
     * @default 30
     * @type float
     */
    this.targetFps = 30;
    
    /**
     * The tolerance for the rendering time. The monitor will adjust the
     * level of detail if the average frame render time rises above
     * <i>target frame render time * (1.0 + tolerance)</i> or falls below
     * <i>target frame render time / (1.0 + tolerance)</i>.
     *
     * @default 0.3
     * @type float
     */
    this.tolerance = 0.3;
    
    /**
     * The rate at which the level of detail is adjusted.
     * For detail increase, the detail is multiplied with (1.0 + rate),
     * for decrease divided.
     *
     * @default 0.1
     * @type float
     */
    this.rate = 0.1;
    
    /**
     * Minimum texture magnification.
     *
     * @default 1.5
     * @type float
     */
    this.minMag = 1.5;
    
    /**
     * Maximum texture magnification.
     *
     * @default 16
     * @type float     
     */
    this.maxMag = 16;
    
    /**
     * Texture magnification for HQ render passes.
     *
     * @default 1.5
     * @type float     
     */
    this.hqRenderMag = 1.5;
    
    /**
     * Delay in milliseconds before executing 
     * a HQ render pass.
     *
     * @default 2000
     * @type int
     */
    this.hqRenderDelay = 2000;
    
    /**
     * Interval in milliseconds for the 
     * HQ render pass timer.
     *
     * @default 1000
     * @type int
     */
    this.hqRenderInterval = 1000;
    
    if (values) {
        for (var k in values) {
            this[k] = values[k];
        }
    }
    
    this.merge = function (values, overwrite) {
        for (var k in values) {
            if (overwrite || !this[k]) {
                this[k] = values[k];
            }
        }
    }
    return this;        
};
