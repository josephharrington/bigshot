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

/**
 * A 3D point
 */
public class Point3D extends Point2D {

    /**
     * The z-coordinate.
     */
    public double z;
    
    /**
     * Creates a new 3d point with coordinates (0, 0, 0).
     */
    public Point3D () {
        this (0, 0, 0);
    }
    
    /**
     * Creates a new 3d point with the given coordinates.
     * 
     * @param x the x-coordinate
     * @param y the y-coordinate
     * @param z the z-coordinate
     */
    public Point3D (double x, double y, double z) {
        super (x, y);
        this.z = z;
    }
    
    /**
     * Rotates the point around the X-axis.
     *
     * @param angle the angle in radians
     */
    public void rotateX (double angle) {
        double nx = x;
        double ny = y * Math.cos (angle) - z * Math.sin (angle);
        double nz = y * Math.sin (angle) + z * Math.cos (angle);
        this.x = nx;
        this.y = ny;
        this.z = nz;
    }
    
    /**
     * Rotates the point around the Y-axis.
     *
     * @param angle the angle in radians
     */
    public void rotateY (double angle) {
        double nx = x * Math.cos (angle) + z * Math.sin (angle);
        double ny = y;
        double nz = - x * Math.sin (angle) + z * Math.cos (angle);
        this.x = nx;
        this.y = ny;
        this.z = nz;
    }
    
    /**
     * Rotates the point around the Z-axis.
     *
     * @param angle the angle in radians
     */
    public void rotateZ (double angle) {
        rotate (angle);
    }
    
    /**
     * Scales the point relative to the origin.
     *
     * @param s the scale factor
     */
    public void scale (double s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
    }
    
    /**
     * Translates the point.
     *
     * @param dx the amount to move the point along the x-axis
     * @param dy the amount to move the point along the y-axis
     * @param dz the amount to move the point along the z-axis
     */
    public void translate3D (double dx, double dy, double dz) {
        this.x += dx;
        this.y += dy;
        this.z += dz;
    }
    
    /**
     * Translates the point along the z axis.
     *
     * @param d the amount to translate
     */
    public void translateZ (double d) {
        this.z += d;
    }
    
    /**
     * Projects the point by dividing the x and y coordinates by {@code z / f}.
     *
     * @param f the "focal length" of the lens
     */
    public void project (double f) {
        x /= (z / f);
        y /= (z / f);
    }
    
    /**
     * The euclidean distance of the point to the origin.
     */
    public double norm () {
        return Math.sqrt (x * x + y * y + z * z);
    }
    
    /**
     * Formats the point on the form <code>[<i>x</i>, <i>y</i>, <i>z</i>]</code>.
     */
    public String toString () {
        return "[" + x + ", " + y + ", " + z + "]";
    }
}
