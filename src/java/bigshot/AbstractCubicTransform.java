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
package bigshot;

import java.io.File;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.FileReader;
import java.io.PrintStream;
import java.io.FileOutputStream;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.ImageReader;
import java.util.concurrent.Executors;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

import java.util.StringTokenizer;
import java.util.Iterator;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;

/**
 * Transforms an image map to a set of rectilinear images. Used to create a cube map
 * for <a href="../../js/symbols/bigshot.VRPanorama.html">bigshot.VRPanorama</a>.
 *
 * @param <Derived> for subclasses, the most derived class name. Used to implement the
 * method chaining for builder methods.
 */
public abstract class AbstractCubicTransform<Derived extends AbstractCubicTransform> {
    
    /**
     * The input image map.
     */
    protected Image input;
    
    /**
     * Vertical field of view of the output image, in radians.
     */
    protected double vfov;
    
    /**
     * Vertical field of view of the image map, in radians.
     */
    protected double inputVfov = -1;
    
    /**
     * Horizontal field of view of the image map, in radians.
     */
    protected double inputHfov = -1;
    
    /**
     * True iff the image map wraps horizontally. Should only be true if {@link #inputHfov}
     * is {@code Math.PI * 2}.
     */
    protected boolean horizontalWrap = true;
    
    /**
     * The pixel row that is at the horizon.
     */
    protected int inputHorizon = -1;
    
    /**
     * Yaw offset of the bubble in degrees. Used to level the bubble before rotating it
     * and producing the rectilinear image in the direction given by {@link #yaw}, {@link #pitch}
     * and {@link #roll}.
     */
    protected double oy;
    
    /**
     * Pitch offset of the bubble in degrees. Used to level the bubble before rotating it
     * and producing the rectilinear image in the direction given by {@link #yaw}, {@link #pitch}
     * and {@link #roll}.
     */
    protected double op;
    
    /**
     * Roll offset of the bubble in degrees. Used to level the bubble before rotating it
     * and producing the rectilinear image in the direction given by {@link #yaw}, {@link #pitch}
     * and {@link #roll}.
     */
    protected double or;
    
    /**
     * Yaw of the center point of the output image, in degrees.
     */
    protected double yaw;
    
    /**
     * Pitch of the center point of the output image, in degrees.
     */
    protected double pitch;
    
    /**
     * Roll of the output image, in degrees.
     */
    protected double roll;
    
    /**
     * Width in pixels of the output image.
     */
    protected int width;
    
    /**
     * Width in pixels of the output image.
     */
    protected int height;
    
    /**
     * The amount of oversampling done. 1 means no oversampling.
     */
    protected int oversampling = 1;
    
    /**
     * Amount of jitter in the oversampling. Defaults to 0.
     */
    protected double jitter = 0.0;
    
    /**
     * Set to true to attempt to fill in any missing bottom-section.
     */
    protected boolean bottomCap = false;
    
    /**
     * Set to true to attempt to fill in any missing top-section.
     */
    protected boolean topCap = false;
    
    /**
     * Creates a new transform instance.
     */
    public AbstractCubicTransform () {
    }
    
    /**
     * Sets the image map. Once set, the {@link #transform()}
     * method can be called several times with other parameters being adjusted
     * between calls.
     */
    public Derived input (Image input) {
        this.input = input;
        if (this.inputHorizon < 0) {
            this.inputHorizon = input.height () / 2;
        }
        if (this.inputVfov < 0) {
            this.inputVfov (90);
        }
        if (this.inputHfov < 0) {
            this.inputHfov (360);
            this.horizontalWrap (true);
        }
        
        @SuppressWarnings("unchecked") 
            Derived dthis = (Derived) this;
        return dthis;
    }
    
    /**
     * Loads the image map from a file. Once set, the {@link #transform()}
     * method can be called several times with other parameters being adjusted
     * between calls.
     */
    public Derived input (File input) throws Exception {
        return this.input (Image.read (input));
    }
    
    /**
     * Loads projection parameters from a Hugin {@code .pto} file.
     * Subclasses should override the {@link #fromHuginPtoParameters} method
     * to actually set the projection parameters.
     *
     * @param ptoFile the Hugin {@code .pto} file to read transformation parameters from
     */
    public Derived fromHuginPto (File ptoFile) throws IOException {
        String projectionParams = null;
        BufferedReader br = new BufferedReader (new FileReader (ptoFile));
        try {
            while (true) {
                String line = br.readLine ();
                if (line == null) {
                    throw new IllegalArgumentException ("No projetion parameters found. (Was looking for a line in " + ptoFile.getPath () + " starting with \"p \".)");
                }
                if (line.startsWith ("p ")) {
                    projectionParams = line;
                    break;
                }
            }
        } finally {
            br.close ();
        }
        
        int w = -1;
        int h = -1;
        double v = -1;
        int cropLeft = -1;
        int cropRight = -1;
        int cropTop = -1;
        int cropBottom = -1;
        
        // p f1 w8477 h3453 v360  E13 R0 S0,8477,267,2941 n"TIFF_m c:LZW r:CROP"
        StringTokenizer tok = new StringTokenizer (projectionParams, " ");
        while (tok.hasMoreTokens ()) {
            String token = tok.nextToken ();
            if (token.startsWith ("w")) {
                w = Integer.parseInt (token.substring (1));
                if (cropLeft < 0) {
                    cropLeft = 0;
                    cropRight = w;
                }
            } else if (token.startsWith ("h")) {
                h = Integer.parseInt (token.substring (1));
                if (cropTop < 0) {
                    cropTop = 0;
                    cropBottom = h;
                }
            } else if (token.startsWith ("v")) {
                v = Double.parseDouble (token.substring (1));
            } else if (token.startsWith ("S")) {
                String[] crops = token.substring (1).split (",");
                cropLeft   = Integer.parseInt (crops[0]);
                cropRight  = Integer.parseInt (crops[1]);
                cropTop    = Integer.parseInt (crops[2]);
                cropBottom = Integer.parseInt (crops[3]);
            }
        }
        if (w < 0 || h < 0 || v < 0) {
            throw new IllegalArgumentException ("Missing projection parameters - must at minimum have w, h, and v.");
        }
        
        fromHuginPtoParameters (w, h, v, cropLeft, cropRight, cropTop, cropBottom);
        
        @SuppressWarnings("unchecked") 
            Derived dthis = (Derived) this;
        return dthis;
    }
    
    /**
     * Sets the required projection parameters from the Hugin {@code .pto} parameters.
     * The Hugin pto describes an image that is {@code w} pixels wide and {@code h} pixels tall.
     * It has a horizontal field of view of {@code v} degrees. From that image, a sub-rectangle
     * with top-left coordinates ({@code cropLeft}, {@code cropTop}) and bottom-right coordinates
     * ({@code cropRight}, {@code cropBottom}) has been rendered and is the actual input image
     * to the projection.
     *
     * @param w the width of the map image, in pixels
     * @param h the height of the map image, in pixels
     * @param v the horizontal field of view, in degrees
     * @param cropLeft the first used column of the image
     * @param cropRight one past the rightmost used column of the image
     * @param cropTop the first used row in the image
     * @param cropBottom one past the bottom-most used row of the image
     */
    public abstract Derived fromHuginPtoParameters (int w, int h, double v, int cropLeft, int cropRight, int cropTop, int cropBottom);
    
    /**
     * Sets the vertical field of view.
     *
     * @param vfov the field of view in degrees
     */ 
    public Derived vfov (double vfov) {
        this.vfov = MathUtil.toRad (vfov);
        @SuppressWarnings("unchecked") 
            Derived dthis = (Derived) this;
        return dthis;
    }
    
    public Derived topCap (boolean topCap) {
        this.topCap = topCap;
        @SuppressWarnings("unchecked") 
            Derived dthis = (Derived) this;
        return dthis;
    }
    
    public Derived bottomCap (boolean bottomCap) {
        this.bottomCap = bottomCap;
        @SuppressWarnings("unchecked") 
            Derived dthis = (Derived) this;
        return dthis;
    }
    
    /**
     * Sets y-coordinate of the horizon for the input image.
     *
     * @param inputHorizon y-coordinate of the horizon
     */ 
    public Derived inputHorizon (int inputHorizon) {
        this.inputHorizon = inputHorizon;
        @SuppressWarnings("unchecked") 
            Derived dthis = (Derived) this;
        return dthis;
    } 
    
    /**
     * Sets the vertical field of view of the input image.
     *
     * @param inputVfov the field of view in degrees
     */ 
    public Derived inputVfov (double inputVfov) {
        this.inputVfov = MathUtil.toRad (inputVfov);
        @SuppressWarnings("unchecked") 
            Derived dthis = (Derived) this;
        return dthis;
    } 
    
    /**
     * Return the input vertical field of view, in degrees.
     * The result may suffer from rounding errors, as it is stored
     * as radians internally.
     */
    public double inputVfov () {
        return MathUtil.toDeg (inputVfov);
    }
    
    /**
     * Sets the horizontal field of view of the input image.
     * Also sets the horizontalWrap flag if the input
     * FOV is 360.
     *
     * @param inputHfov the field of view in degrees
     */ 
    public Derived inputHfov (double inputHfov) {
        if (inputHfov >= 360.0) {
            this.horizontalWrap (true);
        }
        this.inputHfov = MathUtil.toRad (inputHfov);
        @SuppressWarnings("unchecked") 
            Derived dthis = (Derived) this;
        return dthis;
    } 
    
    /**
     * Return the input horizontal field of view, in degrees.
     * The result may suffer from rounding errors, as it is stored
     * as radians internally.
     */
    public double inputHfov () {
        return MathUtil.toDeg (inputHfov);
    }
    
    /**
     * Sets whether the input image wraps around horizontally.
     * This is automatically set to true of the horizontal field of view
     * is set to 360.
     *
     * @param horizontalWrap if set to true, indicates that the input image wraps around horizontally
     */ 
    public Derived horizontalWrap (boolean horizontalWrap) {
        this.horizontalWrap = horizontalWrap;
        @SuppressWarnings("unchecked") 
            Derived dthis = (Derived) this;
        return dthis;
    }    
    
    /**
     * Sets the initial transform offsets (used to level a bubble).
     *
     * @param oy the yaw angle in degrees
     * @param op the pitch angle in degrees
     * @param or the roll angle in degrees
     */
    public Derived offset (double oy, double op, double or) {
        this.oy = oy;
        this.op = op;
        this.or = or;
        @SuppressWarnings("unchecked") 
            Derived dthis = (Derived) this;
        return dthis;
    }
    
    /**
     * Sets the view direction.
     *
     * @param yaw the yaw angle in degrees
     * @param pitch the pitch angle in degrees
     * @param roll the roll angle in degrees
     */
    public Derived view (double yaw, double pitch, double roll) {
        this.yaw = yaw;
        this.pitch = pitch;
        this.roll = roll;
        @SuppressWarnings("unchecked") 
            Derived dthis = (Derived) this;
        return dthis;
    }
    
    /**
     * Sets the output image size in pixels.
     */
    public Derived size (int width, int height) {
        this.width = width;
        this.height = height;
        @SuppressWarnings("unchecked") 
            Derived dthis = (Derived) this;
        return dthis;
    }
    
    /**
     * If greater than one, oversamples each output pixel using a 
     * grid of <code>oversampling * oversampling</code> samples.
     * Use together with {@link #jitter(double)} to avoid moire
     * and aliasing.
     *
     * @param oversampling the amount of oversampling along each axis
     * of the output image. Must be <code>&gt;= 1</code>.
     */
    public Derived oversampling (int oversampling) {
        if (oversampling < 1) {
            throw new IllegalArgumentException ("oversampling < 1 : " + oversampling);
        }
        this.oversampling = oversampling;
        
        @SuppressWarnings("unchecked") 
            Derived dthis = (Derived) this;
        return dthis;
    }
    
    /**
     * Adds a random jitter to the sampling.
     * Use together with {@link #oversampling(int)} to avoid moire
     * and aliasing.
     *
     * @param jitter the jitter, in units of one output pixel
     */
    public Derived jitter (double jitter) {
        this.jitter = jitter;
        
        @SuppressWarnings("unchecked") 
            Derived dthis = (Derived) this;
        return dthis;
    }
    
    /**
     * Performs the transformation.
     */
    public abstract Image transform () throws Exception;
    
    /**
     * A delayed-evaluated Image.
     */
    public static class TransformedFace implements Future<Image> {
        
        private final AbstractCubicTransform xform;
        private final String name;
        private final double y;
        private final double p;
        
        public TransformedFace (AbstractCubicTransform xform, String name, double y, double p) {
            this.name = name;
            this.y = y;
            this.p = p;
            this.xform = xform;
        }
        
        public boolean cancel (boolean mayInterruptIfRunning) {
            return false;
        }
        
        public boolean isCancelled () {
            return false;
        }
        
        public boolean isDone () {
            return false;
        }
        
        public Image get () throws ExecutionException {
            try {
                Image img = xform.view (y, p, 0).transform ();
                img.setName (name);
                return img;
            } catch (Exception e) {
                throw new ExecutionException (e);
            }
        }
        
        public Image get (long timeout, TimeUnit unit) {
            throw new UnsupportedOperationException ("DelayedImage.get(long,TimeUnit)");
        }
    }
    
    /**
     * Transforms an image map to six VR cube faces. This method modifies the view (yaw, pitch and roll) values for
     * this transform.
     *
     * @return a list of delayed-evaluation images
     */
    public List<Future<Image>> transformToFaces () throws Exception {
        List<Future<Image>> result = new ArrayList<Future<Image>> ();
        
        result.add (new TransformedFace (this, "face_f",   0,   0));
        result.add (new TransformedFace (this, "face_r",  90,   0));
        result.add (new TransformedFace (this, "face_b", 180,   0));
        result.add (new TransformedFace (this, "face_l", -90,   0));
        result.add (new TransformedFace (this, "face_u",   0,  90));
        result.add (new TransformedFace (this, "face_d",   0, -90));
        
        return result;
    }
    
    
    /**
     * Convenience function to load an image from a file.
     *
     * @param imageName the image to load
     * @return the image
     */
    public static Image readImage (File imageName) throws Exception {
        return Image.read (imageName);
    }
    
    /**
     * Executes a transformation six times to produce six VR cube faces.
     *
     * @param xform the transform to use. Its input must be set.
     * @param outputBase the base directory to output the cube faces to
     * @param outputSize the size (width and height), in pixels, of each face
     * @param oy the initial yaw offset
     * @param op the initial pitch offset
     * @param or the initial roll offset
     * @return the resulting faces as PNG files in the outputBase directory. They are named "face_f.png", "face_r.png", "face_b.png", "face_l.png",
     * "face_u.png" and "face_d.png", for "Front", "Right", "Back", "Left", "Up" and "Down" respectively.
     */
    public static File[] transformToFaces (AbstractCubicTransform xform, File outputBase, final int outputSize, double oy, double op, double or) throws Exception {
        final File[] files = new File[]{
            new File (outputBase, "face_f.png"),
            new File (outputBase, "face_r.png"),
            new File (outputBase, "face_b.png"),
            new File (outputBase, "face_l.png"),
            new File (outputBase, "face_u.png"),
            new File (outputBase, "face_d.png")
            };
        
        xform.vfov (90)
            .offset (oy, op, or)
            .size (outputSize, outputSize);
        
        xform.view (  0,   0, 0).transform ().write (files[0]);
        xform.view ( 90,   0, 0).transform ().write (files[1]);
        xform.view (180,   0, 0).transform ().write (files[2]);
        xform.view (-90,   0, 0).transform ().write (files[3]);
        xform.view (  0,  90, 0).transform ().write (files[4]);
        xform.view (  0, -90, 0).transform ().write (files[5]);
        
        return files;
    }
}