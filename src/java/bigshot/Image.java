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

/**
 * A 30-bit (10 per channel) RGB image.
 */
public class Image {
    
    /**
     * Number of bits allocated to each channel.
     */
    private final static int COMPONENT_SIZE = 10;
    
    /**
     * Bitmask to extract the rightmost component from a 32-bit int.
     */
    private final static int COMPONENT_MASK = ((1 << COMPONENT_SIZE) - 1);
    
    /**
     * Bitshift for the blue channel.
     */
    private final static int BLUE = 0;
    
    /**
     * Bitshift for the green channel.
     */
    private final static int GREEN = COMPONENT_SIZE;
    
    /**
     * Bitshift for the red channel.
     */
    private final static int RED = COMPONENT_SIZE * 2;
    
    /**
     * Width of image, in pixels.
     */
    private int width;
    
    /**
     * Height of image, in pixels.
     */
    private int height;
    
    /**
     * Image data.
     */
    private int[] data;
    
    /**
     * The name of the image, which can be the file name or other
     * identifying key.
     */
    private String name;
    
    /**
     * Creates an empty (all-black) image with the given width and height.
     */
    public Image (int width, int height) {
        this.width = width;
        this.height = height;
        this.data = new int[width * height];
    }
    
    /**
     * Creates an image with the given data.
     */
    public Image (int width, int height, int[] data) {
        this.width = width;
        this.height = height;
        this.data = data;
    }
    
    /**
     * Sets the name of the image, which can be the file name or other
     * identifying key.
     */
    public void setName (String name) {
        this.name = name;
    }
    
    /**
     * Gets the name of the image, which can be the file name or other
     * identifying key.
     */
    public String getName () {
        return this.name;
    }
    
    /**
     * Gets the red, green and blue values for a given pixel.
     *
     * @param x the x-coordinate of the pixel
     * @param y the y-coordinate of the pixel
     * @param result the array to put the result in. result[0] = red, result[1] = green, result[2] = blue
     */
    public void componentValue (int x, int y, int[] result) {
        int v = value(x, y);
        result[0] = (v >> RED) & COMPONENT_MASK;
        result[1] = (v >> GREEN) & COMPONENT_MASK;
        result[2] = (v >> BLUE) & COMPONENT_MASK;
    }
    
    /**
     * Sets the red, green and blue values for a given pixel.
     *
     * @param x the x-coordinate of the pixel
     * @param y the y-coordinate of the pixel
     * @param r the red value
     * @param g the green value
     * @param b the blue value
     */
    public void componentValue (int x, int y, int r, int g, int b) {
        data[y * width + x] = (r << RED) | (g << GREEN) | (b << BLUE);
    }
    
    /**
     * Gets the packed pixel color value for a given pixel.
     *
     * @param x the x-coordinate of the pixel
     * @param y the y-coordinate of the pixel
     * @return the packed, 30-bit-total, 10-bit-per-color, value
     */
    public int value (int x, int y) {
        x %= width;
        if (x < 0) {
            x += width;
        }
        if (y >= height) {
            y = height - 1;
        }
        if (y < 0) {
            y = 0;
        }
        return data[y * width + x];
    }
    
    /**
     * Helper function to get the component with a given bitshift
     * from a pixel.
     *
     * @param x the x-coordinate of the pixel
     * @param y the y-coordinate of the pixel
     * @param shift the bitshift of the component to return
     */
    protected int componentValue (int x, int y, int shift) {
        return (int) ((value (x, y) >> shift) & COMPONENT_MASK);
    }
    
    /**
     * Helper function to linerarly interpolate between two values over
     * the interval [0, 1].
     *
     * @param a the value at 0
     * @param b the value at 1
     * @param x the point in the interval [0, 1] that we want the value for
     * @return the value at {@code x}
     */
    protected double lerp (double a, double b, double x) {
        return (1 - x) * a + (x) * b;
    }
    
    /**
     * Samples a linearly interpolated channel value.
     *
     * @param x the x-coordinate to sample
     * @param y the y-coordinate to sample
     * @param shift the bitshift of the component
     * @return the component value at {@code x, y}
     */
    protected int sample (double x, double y, int shift) {
        int x0 = (int) x;
        int y0 = (int) y;
        double xf = x - x0;
        double yf = y - y0;
        
        double out = lerp (
            lerp (componentValue (x0, y0, shift),     componentValue (x0 + 1, y0, shift), xf),
            lerp (componentValue (x0, y0 + 1, shift), componentValue (x0 + 1, y0 + 1, shift), xf),
            yf);
        
        return (int) out;
    }
    
    /**
     * Computes a linearly interpolated value for all channels at a given point
     *
     * @param x the x-coordinate to sample
     * @param y the y-coordinate to sample
     * @param result the result of the interpolated sampling. result[0] = red, result[1] = green, result[2] = blue
     */
    public void sampleComponents (double x, double y, int[] result) {
        result[0] = sample (x, y, RED);
        result[1] = sample (x, y, GREEN);
        result[2] = sample (x, y, BLUE);
    }
    
    /**
     * Computes a packed 30-bit interpolated value for all channels at a given point
     *
     * @param x the x-coordinate to sample
     * @param y the y-coordinate to sample
     * @return the 30-bit interpolated sample at the given point
     */
    public int sample (double x, double y) {
        int r = sample (x, y, RED);
        int g = sample (x, y, GREEN);
        int b = sample (x, y, BLUE);
        return (r << RED) | (g << GREEN) | (b << BLUE);
    }
    
    /**
     * Sets the packed 30-bit value at a given point
     *
     * @param x the x-coordinate of the pixel
     * @param y the y-coordinate of the pixel
     * @param v the 30-bit packed value to set the pixel to
     */
    public void value (int x, int y, int v) {
        data[y * width + x] = v;
    }
    
    /**
     * Image width in pixels.
     */
    public int width () {
        return width;
    }
    
    /**
     * Image height in pixels.
     */
    public int height () {
        return height;
    }
    
    /**
     * Writes the image to a PNG file.
     */
    public void write (File file) throws Exception {
        BufferedImage output = toBuffered ();
        
        OutputStream os = new BufferedOutputStream (new FileOutputStream (file), 2048*1024);
        try {
            ImageIO.write (output, "png", os);
        } finally {
            os.close ();
        }
    }
    
    /**
     * Scales all channels by {@code num / denom}.
     *
     * @param y0 the first line to apply the scaling to
     * @param y1 one-past the last line to apply the scaling to
     */
    public void multiply (int y0, int y1, int num, int denom) {
        int i = y0 * width;
        for (int y = y0; y < y1; ++y) {
            for (int x = 0; x < width; ++x) {
                int r = sample (x, y, RED) * num / denom;
                int g = sample (x, y, GREEN) * num / denom;
                int b = sample (x, y, BLUE) * num / denom;
                data[i] = (r << RED) | (g << GREEN) | (b << BLUE);
                ++i;
            }
        }
    }
    
    /**
     * Packs a 30-bit value to a 24-bit value.
     *
     * @param in the 30-bit pixel color value to compress to 24 bits
     * @return the resulting 24 bit value
     */
    private final static int pack (int in) {
        return (int) ((
            (((in >> RED  ) & 0xff) << 16) |
            (((in >> GREEN) & 0xff) <<  8) |
            (((in >> BLUE ) & 0xff)      )
            ) & 0xffffff);
    }
    
    /**
     * Unpacks a 30-bit value from a 24-bit value.
     *
     * @param in the 24-bit pixel color value to expand to 30 bits
     * @return the resulting 30 bit value
     */
    private final static int unpack (int in) {
        return (int) (
            (((in >> 16) & 0xff) << RED  ) |
            (((in >>  8) & 0xff) << GREEN) |
            (((in      ) & 0xff) << BLUE )
            );
    }
    
    /**
     * Converts this image to a 24-bit per pixel {@link BufferedImage} with type 
     * {@link BufferedImage#TYPE_INT_RGB}.
     */
    public BufferedImage toBuffered () throws Exception {
        BufferedImage output = new BufferedImage (width, height, BufferedImage.TYPE_INT_RGB);
        final int[] line = new int[width];
        for (int y = 0; y < height; ++y) {
            int rp = y * width;
            for (int x = 0; x < width; ++x) {
                line[x] = pack (data[rp]);
                ++rp;
            }
            output.setRGB (0, y, width, 1, line, 0, width);
        }
        return output;
    }
    
    /**
     * Reads an image from a file using java ImageIO.
     */
    public static Image read (File file) throws Exception {
        BufferedImage input = null;
        InputStream is = new BufferedInputStream (new FileInputStream (file), 2048*1024);
        try {
            input = ImageIO.read (is);
        } finally {
            is.close ();
        }
        return fromBuffered (input);
    }
        
    /**
     * Creates an image from a {@link BufferedImage}, which is assumed to be
     * of type {@link BufferedImage#TYPE_INT_RGB} or {@link BufferedImage#TYPE_INT_ARGB}.
     */
    public static Image fromBuffered (BufferedImage input) throws Exception {        
        int width = input.getWidth ();
        int height = input.getHeight ();
        
        int[] data = new int[width * height];
        final int[] line = new int[width];
        for (int y = 0; y < height; ++y) {
            input.getRGB (0, y, width, 1, line, 0, width);
            int wp = y * width;
            for (int x = 0; x < width; ++x) {
                data[wp] = unpack (line[x]);
                ++wp;
            }
        }
        return new Image (width, height, data);
    }
}
