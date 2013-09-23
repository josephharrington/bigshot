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

import java.util.Arrays;

/**
 * Fast inverse trigonometric functions based on lookup tables and
 * linear interpolation between lookup table values.
 */
public class FastTrigInverse {
    
    /**
     * The lookup table.
     */
    protected final double[] lookup;
    
    /**
     * The interval between two input values in the lookup table.
     */
    protected final double step;
    
    /**
     * Creates a new function object.
     *
     * @param resolution the resolution of the lookup table
     */
    public FastTrigInverse (int resolution) {
        lookup = new double[resolution + 1];
        step = Math.PI / resolution;
    }
    
    /**
     * Apply the function.
     *
     * @param v the value
     * @return the value of the inverse trigonometric function
     */
    public double f (double v) {
        int index = Arrays.binarySearch (lookup, v);
        if (index >= 0) {
            return index * step;
        } else {
            int insertionPoint = - index - 1;
            if (insertionPoint == 0) {
                return 0;
            }
            if (insertionPoint == lookup.length) {
                return lookup.length * step;
            }
            double a = lookup[insertionPoint - 1];
            double b = lookup[insertionPoint];
            double n = (v - a) / (b - a);
            return (insertionPoint - 1 + n) * step;
        }
    }
    
    /**
     * Fast inverse-cosine.
     */
    public static class FastAcos extends FastTrigInverse {
        
        /**
         * Creates a new fast arccos object.
         *
         * @param resolution the resolution of the lookup table
         */
        public FastAcos (int resolution) {
            super (resolution);
            for (int i = 0; i < resolution; ++i) {
                double a = step * i;
                lookup[i] = -Math.cos (a);
            }
            lookup[resolution] = 1;
        }
        
        /**
         * Computes an approximation to arccos(v)
         *
         * @param v the value
         * @return arccos(v)
         */
        public double f (double v) {
            return super.f (-v);
        }
    }
    
    /**
     * Fast inverse-cosine.
     */
    public static class FastAtan extends FastTrigInverse {
        
        /**
         * Creates a new fast arccos object.
         *
         * @param resolution the resolution of the lookup table
         */
        public FastAtan (int resolution) {
            super (resolution);
            for (int i = 1; i < resolution; ++i) {
                double a = - (Math.PI / 2) + step * i;
                lookup[i] = Math.tan (a);
            }
            lookup[0] = Math.tan (step / 2 - Math.PI / 2);
            lookup[resolution] = Math.tan (-step / 2 + Math.PI / 2);
        }
        
        /**
         * Computes an approximation to arctan(v)
         *
         * @param v the value
         * @return arctan(v)
         */
        public double f (double v) {
            return super.f (v) - (Math.PI / 2);
        }
    }
}


