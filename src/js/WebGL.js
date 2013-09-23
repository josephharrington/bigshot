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
 * Creates a new WebGL wrapper instance.
 *
 * @class WebGL wrapper for common {@link bigshot.VRPanorama} uses.
 * @param {HTMLCanvasElement} canvas_ the canvas
 * @see #onresize()
 */
bigshot.WebGL = function (canvas_) {
    /**
     * The html canvas element we'll be rendering in.
     *
     * @type HTMLCanvasElement
     */
    this.canvas = canvas_;
    
    /**
     * Our WebGL context.
     *
     * @type WebGLRenderingContext
     */
    this.gl = bigshot.WebGLUtil.createContext (this.canvas); 
            
    /**
     * The current object-to-world transform matrix.
     *
     * @type bigshot.TransformStack
     */
    this.mvMatrix = new bigshot.TransformStack ();
    
    /**
     * The current perspective transform matrix.
     *
     * @type bigshot.TransformStack
     */
    this.pMatrix = new bigshot.TransformStack ();
    
    /**
     * The current shader program.
     */
    this.shaderProgram = null;
    
    this.onresize ();
}

bigshot.WebGL.prototype = {
    /**
     * Must be called when the canvas element is resized.
     *
     * @public
     */
    onresize : function () {
        this.gl.viewportWidth = this.canvas.width;
        this.gl.viewportHeight = this.canvas.height;
    },
    
    /**
     * Fragment shader. Taken from the "Learning WebGL" lessons:
     *     http://learningwebgl.com/blog/?p=571
     */
    fragmentShader : 
        "#ifdef GL_ES\n" + 
        "    precision highp float;\n" + 
        "#endif\n" + 
        "\n" + 
        "varying vec2 vTextureCoord;\n" + 
        "\n" + 
        "uniform sampler2D uSampler;\n" + 
        "\n" + 
        "void main(void) {\n" + 
        "    gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));\n" + 
        "}\n",
    
    /**
     * Vertex shader. Taken from the "Learning WebGL" lessons:
     *     http://learningwebgl.com/blog/?p=571
     */
    vertexShader : 
        "attribute vec3 aVertexPosition;\n" +
        "attribute vec2 aTextureCoord;\n" +
        "\n" +
        "uniform mat4 uMVMatrix;\n" +
        "uniform mat4 uPMatrix;\n" +
        "\n" +
        "varying vec2 vTextureCoord;\n" +
        "\n" +
        "void main(void) {\n" +
        "    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n" +
        "    vTextureCoord = aTextureCoord;\n" +
        "}",
    
    /**
     * Creates a new shader.
     *
     * @type WebGLShader
     * @param {String} source the source code
     * @param {int} type the shader type, one of WebGLRenderingContext.FRAGMENT_SHADER or 
     * WebGLRenderingContext.VERTEX_SHADER
     */
    createShader : function (source, type) {
        var shader = this.gl.createShader (type);
        this.gl.shaderSource (shader, source);
        this.gl.compileShader (shader);
        
        if (!this.gl.getShaderParameter (shader, this.gl.COMPILE_STATUS)) {
            alert (this.gl.getShaderInfoLog (shader));
            return null;
        }
        
        return shader;
    },
    
    /**
     * Creates a new fragment shader.
     *
     * @type WebGLShader
     * @param {String} source the source code
     */
    createFragmentShader : function (source) {
        return this.createShader (source, this.gl.FRAGMENT_SHADER);
    },
    
    /**
     * Creates a new vertex shader.
     *
     * @type WebGLShader
     * @param {String} source the source code
     */
    createVertexShader : function (source) {
        return this.createShader (source, this.gl.VERTEX_SHADER);
    },
    
    /**
     * Initializes the shaders.
     */
    initShaders : function () {
        this.shaderProgram = this.gl.createProgram ();
        this.gl.attachShader (this.shaderProgram, this.createVertexShader (this.vertexShader));
        this.gl.attachShader (this.shaderProgram, this.createFragmentShader (this.fragmentShader));
        this.gl.linkProgram (this.shaderProgram);
        
        if (!this.gl.getProgramParameter (this.shaderProgram, this.gl.LINK_STATUS)) {
            throw new Error ("Could not initialise shaders");
            return;
        }
        
        this.gl.useProgram (this.shaderProgram);
        
        this.shaderProgram.vertexPositionAttribute = this.gl.getAttribLocation (this.shaderProgram, "aVertexPosition");
        this.gl.enableVertexAttribArray (this.shaderProgram.vertexPositionAttribute);
        
        this.shaderProgram.textureCoordAttribute = this.gl.getAttribLocation (this.shaderProgram, "aTextureCoord");
        this.gl.enableVertexAttribArray (this.shaderProgram.textureCoordAttribute);
        
        this.shaderProgram.pMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
        this.shaderProgram.mvMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
        this.shaderProgram.samplerUniform = this.gl.getUniformLocation(this.shaderProgram, "uSampler");
    },

    
    /**
     * Sets the matrix parameters ("uniforms", since the variables are declared as uniform) in the shaders.
     */
    setMatrixUniforms : function () {
        this.gl.uniformMatrix4fv (this.shaderProgram.pMatrixUniform, false, new Float32Array(this.pMatrix.matrix().flatten()));
        this.gl.uniformMatrix4fv (this.shaderProgram.mvMatrixUniform, false, new Float32Array(this.mvMatrix.matrix().flatten()));
    },
    
    /**
     * Creates a texture from an image.
     *
     * @param {HTMLImageElement or HTMLCanvasElement} image the image
     * @type WebGLTexture
     * @return An initialized texture
     */
    createImageTextureFromImage : function (image, minFilter, magFilter) {
        var texture = this.gl.createTexture();
        this.handleImageTextureLoaded (this, texture, image, minFilter, magFilter);
        return texture;
    },
    
    /**
     * Creates a texture from a source url.
     *
     * @param {String} source the URL of the image
     * @return WebGLTexture
     */
    createImageTextureFromSource : function (source, minFilter, magFilter) {
        var image = new Image();
        var texture = this.gl.createTexture();
        
        var that = this;
        image.onload = function () {
            that.handleImageTextureLoaded (that, texture, image, minFilter, magFilter);
        }
        
        image.src = source;
        
        return texture;
    },
    
    /**
     * Uploads the image data to the texture memory. Called when the texture image
     * has finished loading.
     *
     * @private
     */
    handleImageTextureLoaded : function (that, texture, image, minFilter, magFilter) {
        that.gl.bindTexture (that.gl.TEXTURE_2D, texture);        
        that.gl.texImage2D (that.gl.TEXTURE_2D, 0, that.gl.RGBA, that.gl.RGBA, that.gl.UNSIGNED_BYTE, image);
        that.gl.texParameteri (that.gl.TEXTURE_2D, that.gl.TEXTURE_MAG_FILTER, magFilter ? magFilter : that.gl.NEAREST);
        that.gl.texParameteri (that.gl.TEXTURE_2D, that.gl.TEXTURE_MIN_FILTER, minFilter ? minFilter : that.gl.NEAREST);
        that.gl.texParameteri (that.gl.TEXTURE_2D, that.gl.TEXTURE_WRAP_S, that.gl.CLAMP_TO_EDGE);
        that.gl.texParameteri (that.gl.TEXTURE_2D, that.gl.TEXTURE_WRAP_T, that.gl.CLAMP_TO_EDGE);
        if (minFilter == that.gl.NEAREST_MIPMAP_NEAREST
                || minFilter == that.gl.LINEAR_MIPMAP_NEAREST
                    || minFilter == that.gl.NEAREST_MIPMAP_LINEAR
                    || minFilter == that.gl.LINEAR_MIPMAP_LINEAR) {
                        that.gl.generateMipmap(that.gl.TEXTURE_2D);
                    }
        
        that.gl.bindTexture (that.gl.TEXTURE_2D, null);
    },
    
    deleteTexture : function (texture) {
        this.gl.deleteTexture (texture);
    },
    
    dispose : function () {
        delete this.canvas;
        delete this.gl;
    }
};
