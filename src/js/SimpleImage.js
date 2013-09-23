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
 * Creates a new image viewer. (Note: See {@link bigshot.SimpleImage#dispose} for important information.)
 *
 * @example
 * var bsi = new bigshot.SimpleImage (
 *     new bigshot.ImageParameters ({
 *         basePath : "myimage.jpg",
 *         width : 681,
 *         height : 1024,
 *         container : document.getElementById ("bigshot_div")
 *     }));
 *
 * @param {bigshot.ImageParameters} parameters the image parameters. Required fields are: <code>container</code>. 
 * If the <code>imgElement</code> parameter is not given, then <code>basePath</code>, <code>width</code> and <code>height</code> are also required. The
 * following parameters are not supported and should be left as defaults: <code>fileSystem</code>, <code>fileSystemType</code>, 
 * <code>maxTextureMagnification</code> and <code>tileSize</code>. <code>wrapX</code> and <code>wrapY</code> may only be used if the imgElement is <b>not</b>
 * set.
 * 
 * @param {HTMLImageElement} [imgElement] an img element to use. The element should have <code>style.position = "absolute"</code>.
 * @see bigshot.ImageBase#dispose
 * @class A zoomable image viewer.
 * @augments bigshot.ImageBase
 */     
bigshot.SimpleImage = function (parameters, imgElement) {
    parameters.merge ({
            fileSystem : null,
            fileSystemType : "simple",
            maxTextureMagnification : 1.0,
            tileSize : 1024
        }, true);
    
    if (imgElement) {
        parameters.merge ({
                width : imgElement.width,
                height : imgElement.height
            });
        this.imgElement = imgElement;
    } else {
        if (parameters.width == 0 || parameters.height == 0) {
            throw new Error ("No imgElement and missing width or height in ImageParameters");
        }
    }
    bigshot.setupFileSystem (parameters);
    
    bigshot.ImageBase.call (this, parameters);
}    

bigshot.SimpleImage.prototype = {
    setupLayers : function () {
        if (!this.imgElement) {
            /*
            this.imgElement = document.createElement ("img");
            this.imgElement.src = this.parameters.basePath;
            this.imgElement.style.position = "absolute";
            */
            this.imgElement = document.createElement ("div");
            this.imgElement.style.backgroundImage = "url('" + this.parameters.basePath + "')";
            this.imgElement.style.position = "absolute";
            if (!this.parameters.wrapX && !this.parameters.wrapY) {
                this.imgElement.style.backgroundRepeat = "no-repeat";
            } else if (this.parameters.wrapX && !this.parameters.wrapY) {
                this.imgElement.style.backgroundRepeat = "repeat-x";
            } else if (!this.parameters.wrapX && this.parameters.wrapY) {
                this.imgElement.style.backgroundRepeat = "repeat-y";
            } else if (this.parameters.wrapX && this.parameters.wrapY) {
                this.imgElement.style.backgroundRepeat = "repeat";
            }
        }
        
        this.addLayer (
            new bigshot.HTMLDivElementLayer (this, this.imgElement, this.parameters.width, this.parameters.height, this.parameters.wrapX, this.parameters.wrapY)
        );
    }
};

bigshot.Object.extend (bigshot.SimpleImage, bigshot.ImageBase);

