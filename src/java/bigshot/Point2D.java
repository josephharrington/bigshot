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
 * A mutable 2D point
 */
public class Point2D {
    
    /**
     * The x-coordinate.
     */
    public double x;
    
    /**
     * The y-coordinate.
     */
    public double y;
    
    /**
     * Creates a new 2d point with coordinates (0, 0).
     */
    public Point2D () {
        this (0, 0);
    }
    
    /**
     * Creates a new 2d point with the given coordinates.
     * 
     * @param x the x-coordinate
     * @param y the y-coordinate
     */
    public Point2D (double x, double y) {
        this.x = x;
        this.y = y;
    }
    
    /**
     * Rotates the point around the origin.
     *
     * @param angle the angle in radians
     */
    public void rotate (double angle) {
        double nx = x * Math.cos (angle) - y * Math.sin (angle);
        double ny = x * Math.sin (angle) + y * Math.cos (angle);
        this.x = nx;
        this.y = ny;
    }
    
    /**
     * Scales the point relative to the origin.
     *
     * @param s the scale factor
     */
    public void scale (double s) {
        this.x *= s;
        this.y *= s;
    }
    
    /**
     * Translates the point.
     *
     * @param dx the amount to move the point along the x-axis
     * @param dy the amount to move the point along the y-axis
     */
    public void translate2D (double dx, double dy) {
        this.x += dx;
        this.y += dy;
    }
    
    /**
     * The euclidean distance of the point to the origin.
     */
    public double norm () {
        return Math.sqrt (x * x + y * y);
    }
    
    /**
     * Formats the point on the form <code>[<i>x</i>, <i>y</i>]</code>.
     */
    public String toString () {
        return "[" + x + ", " + y + "]";
    }
}
