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
 * A 3x3 matrix transform.
 */
public class Point3DTransform {
    private final double[][] matrix = new double[3][3];
    
    /**
     * Creates a new transform and initializes it to the identity
     * transform.
     */
    public Point3DTransform () {
        matrix[0][0] = 1.0;
        matrix[1][1] = 1.0;
        matrix[2][2] = 1.0;
    }
    
    /**
     * Multiplies this transform from the left with another transform.
     * (<code>this = xform * this</code>).
     */
    public void prepend (double[][] xform) {
        double[][] result = new double[3][3];
        for (int i = 0; i < 3; ++i) {
            for (int j = 0; j < 3; ++j) {
                for (int k = 0; k < 3; ++k) {
                    result[i][j] += xform[i][k] * matrix[k][j];
                }
            }
        }
        
        for (int i = 0; i < 3; ++i) {
            for (int j = 0; j < 3; ++j) {
                matrix[i][j] = result[i][j];
            }
        }
    }
    
    /**
     * Prepends a rotation around the X axis.
     *
     * @param angle the angle in radians
     */
    public void rotateX (double angle) {
        prepend (new double[][]{
                new double[]{ 1, 0, 0 },
                new double[]{ 0, Math.cos (angle), -Math.sin (angle) },
                new double[]{ 0, Math.sin (angle),  Math.cos (angle) }
            });
    }
    
    /**
     * Prepends a rotation around the Y axis.
     *
     * @param angle the angle in radians
     */
    public void rotateY (double angle) {
        prepend (new double[][]{
                new double[]{ Math.cos (angle), 0, Math.sin (angle) },
                new double[]{ 0, 1, 0 },
                new double[]{ -Math.sin (angle), 0, Math.cos (angle) }
            });
    }
    
    /**
     * Prepends a rotation around the Z axis.
     *
     * @param angle the angle in radians
     */
    public void rotateZ (double angle) {
        prepend (new double[][]{
                new double[]{ Math.cos (angle), -Math.sin (angle), 0 },
                new double[]{ Math.sin (angle),  Math.cos (angle), 0 },
                new double[]{ 0, 0, 1 }
            });
    }
    
    /**
     * In-place transforms a 3d point.
     *
     * @param input the point to transform. This point will be mutated - no new Point3D object is created.
     * @return the input point after it has been transformed
     */
    public Point3D transform (Point3D input) {
        double nx = input.x * matrix[0][0] + input.y * matrix[0][1] + input.z * matrix[0][2];
        double ny = input.x * matrix[1][0] + input.y * matrix[1][1] + input.z * matrix[1][2];
        double nz = input.x * matrix[2][0] + input.y * matrix[2][1] + input.z * matrix[2][2];
        input.x = nx;
        input.y = ny;
        input.z = nz;
        return input;
    }
}
