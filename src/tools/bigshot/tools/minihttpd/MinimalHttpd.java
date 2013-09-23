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
package bigshot.tools.minihttpd;

import java.net.ServerSocket;
import java.net.Socket;
import java.io.File;
import java.io.InputStream;
import java.io.FileInputStream;
import java.io.BufferedInputStream;
import java.io.OutputStream;
import java.io.ByteArrayOutputStream;
import java.io.RandomAccessFile;

/**
 * Minimal implementation of a HTTP server. Used to test Bigshot.
 */
public class MinimalHttpd {
    
    private static String readLine (InputStream is) throws Exception {
        StringBuilder sb = new StringBuilder ();
        while (true) {
            int read = is.read ();
            if (read == -1) {
                return sb.toString ();
            } else if (read == '\r') {
            } else if (read == '\n') {
                return sb.toString ();
            } else {
                sb.append ((char) read);
            }
        }
    }
    
    public static String getParameter (String[] params, String name, String defaultValue) throws Exception {
        for (String s : params) {
            if (s.startsWith (name + "=")) {
                return s.substring (s.indexOf ("=") + 1);
            }
        }
        return defaultValue;
    }
    
    public static int getParameter (String[] params, String name, int defaultValue) throws Exception {
        return Integer.parseInt (getParameter (params, name, String.valueOf (defaultValue)));
    }
    
    public static int[] getExtents (File f, String entry) throws Exception {
        RandomAccessFile raf = new RandomAccessFile (f, "r");
        try {
            byte[] header = new byte[24];
            raf.readFully (header);
            int indexSize = Integer.parseInt (new String (header).substring (7).trim (), 16);
            byte[] index = new byte[indexSize];
            raf.readFully (index);
            
            int offset = indexSize + 24;
            
            String[] substrings = new String (index).split (":");
            for (int i = 0; i < substrings.length; i += 3) {
                if (substrings[i].equals (entry)) {
                    return new int[]{
                        Integer.parseInt (substrings[i + 1]) + offset,
                        Integer.parseInt (substrings[i + 2])
                        };
                }                    
            }
            
            return null;
        } finally {
            raf.close ();
        }
    }
    
    protected static String mimeType (String filename) {
        if (filename.endsWith ("rss.xml")) {
            return "application/rss+xml";
        } else if (filename.endsWith (".html")) {
            return "text/html";
        } else if (filename.endsWith (".jpg")) {
            return "image/jpeg";
        } else if (filename.endsWith (".png")) {
            return "image/png";
        } else if (filename.endsWith (".xml")) {
            return "text/xml";
        } else if (filename.endsWith (".swf")) {
            return "application/x-shockwave-flash";
        } else if (filename.endsWith (".mp3")) {
            return "audio/mpeg";
        } else if (filename.endsWith (".js")) {
            return "application/javascript";
        } else {
            return null;
        }
    }
    
    public static void main (String[] args) throws Exception {
        final File root = new File (args[0]);
        ServerSocket serverSocket = new ServerSocket (80);
        System.out.println ("Server started on port 80. Root: " + root.getPath ());
        
        int _throttle = args.length > 1 ? Integer.parseInt (args[1]) : Integer.MAX_VALUE;
        if (_throttle < 0) {
            _throttle = Integer.MAX_VALUE;
        }
        final int throttle = _throttle;
        System.out.println ("Throttled to " + throttle + " B/s");
        
        final String indexFile = args.length > 2 ? args[2] : "/index.html";
        System.out.println ("Index file is " + indexFile);
                
        while (true) {
            final Socket sock = serverSocket.accept ();
            new Thread () {
                public void run () {
                    try {
                        InputStream is = sock.getInputStream ();
                        String request = readLine (is);
                        while (readLine (is).length () > 0) {
                        }
                        
                        String[] path = request.split (" ");
                        if (path[1].equals ("/")) {
                            OutputStream os = sock.getOutputStream ();
                            os.write ("HTTP/1.0 302 Moved Temporarily\r\n".getBytes ());
                            os.write (("Location: " + indexFile + "\r\n").getBytes ());
                            os.write ("\r\n".getBytes ());
                            os.flush ();
                            return;
                        }
                        String file = path[1];
                        
                        String[] parameters = file.split ("\\?|&");
                        String filename = getParameter (parameters, "file", parameters[0]);
                        String type = getParameter (parameters, "type", mimeType (filename));
                        String entry = getParameter (parameters, "entry", null);
                        boolean includeProcessor = getParameter (parameters, "preprocessor", "false").equals ("true");
                        int startRange = getParameter (parameters, "start", 0);
                        
                        if (filename.startsWith ("/")) {
                            filename = filename.substring (1);
                        }
                        
                        File f = new File (root, filename);
                        
                        int lengthRange = getParameter (parameters, "length", (int) f.length ());
                        
                        if (entry != null) {
                            type = mimeType (entry);                            
                            int[] extents = getExtents (f, entry);
                            if (extents == null) {
                                System.err.println (entry + " not found in " + f.getPath ());
                                return;
                            } else {
                                startRange = extents[0];
                                lengthRange = extents[1];
                            }
                        }
                        
                        OutputStream os = sock.getOutputStream ();
                        if (includeProcessor) {
                            os.write ("HTTP/1.0 200 OK\r\n".getBytes ());
                            if (type != null) {                                
                                os.write (("Content-Type: " + type + "\r\n").getBytes ());
                            }
                            
                            os.write ("\r\n".getBytes ());
                            
                            IncludeProcessor ip = new IncludeProcessor ();
                            ip.define ("DEBUG", "true");
                            ip.process (f, new File[]{ f.getParentFile () }, os);
                        } else if (f.exists () && !f.isDirectory ()) {
                            FileInputStream fis = new FileInputStream (f);
                            try {
                                os.write ("HTTP/1.0 200 OK\r\n".getBytes ());
                                if (type != null) {                                
                                    os.write (("Content-Type: " + type + "\r\n").getBytes ());
                                }
                                os.write (("Content-Length: " + lengthRange + "\r\n").getBytes ());
                                
                                os.write ("\r\n".getBytes ());
                                byte[] buffer = new byte[32768];
                                while (startRange > 0) {
                                    startRange -= fis.skip (startRange);
                                }
                                while (true) {
                                    int numRead = fis.read (buffer);
                                    if (numRead <= 0) {
                                        break;
                                    }
                                    long delay = 1000L * numRead / throttle;
                                    Thread.sleep ((int) delay);
                                    numRead = Math.min (lengthRange, numRead);
                                    lengthRange -= numRead;
                                    os.write (buffer, 0, numRead);                                
                                    if (lengthRange <= 0) {
                                        break;
                                    }
                                }
                            } finally {
                                fis.close ();
                            }                            
                        } else {
                            os.write ("HTTP/1.0 404 Not found\r\n\r\n".getBytes ());
                        }
                        os.flush ();
                        os.close ();
                    } catch (Throwable t) {
                        t.printStackTrace ();
                    } finally {
                        try {                            
                            sock.close ();
                        } catch (Exception e) {
                            e.printStackTrace ();
                        }
                    }
                }
            }.start ();
        }
    }
    
}