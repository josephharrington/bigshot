package bigshot.tools.minihttpd;

import java.io.*;
import java.util.*;

/**
 * Processes source code with embedded <code>#include</code> and <code>#ifdef</code>/<code>#endif</code>
 * directives. Used to load <code>bigshot.js</code> when developing.
 */
public class IncludeProcessor {
    
    private Map<String,String> defines = new HashMap<String,String> ();
    
    public void define (String key, String value) {
        defines.put (key, value);
    }
    
    public void process (File root, File[] includePaths, OutputStream os) throws Exception {
        readFile (new HashSet<String> (), root, includePaths, os);
    }
    
    protected void readFile (Set<String> alreadyIncluded, File current, File[] includePaths, OutputStream os) throws Exception {
        if (alreadyIncluded.add (current.getPath ())) {
            BufferedReader br = new BufferedReader (new FileReader (current));
            try {
                String line = null;
                while ((line = br.readLine ()) != null) {
                    if (line.trim ().startsWith ("#include ")) {
                        String ref = line.trim ().substring (9);
                        boolean found = false;
                        for (int i = 0; i < includePaths.length; i++) {
                            File candidate = new File (includePaths[i], ref);
                            if (candidate.exists ()) {
                                readFile (alreadyIncluded, candidate, includePaths, os);
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            throw new FileNotFoundException (ref + " referenced from " + current.getPath ());
                        }
                    } else if (line.trim ().startsWith ("#ifdef ")) {
                        String key = line.trim ().substring (7).trim ();
                        if (!defines.containsKey (key)) {
                            while ((line = br.readLine ()) != null) {
                                if (line.trim ().startsWith ("#endif")) {
                                    break;
                                }
                            }
                        }
                    } else if (line.trim ().startsWith ("#endif")) {
                        // Always ignore
                    } else {
                        os.write (line.getBytes ());
                        os.write ('\n');
                    }
                }
            } finally {
                br.close ();
            }
        }
    }
    
    public static void main (String[] args) throws Exception {
        new IncludeProcessor ().run (args);
    }
    
    public void run (String[] args) throws Exception {
        OutputStream os = new BufferedOutputStream (new FileOutputStream (new File (args[0])));
        File input = new File (args[1]);
        File[] includes = new File[args.length - 2];
        for (int i = 0; i < includes.length; ++i) {
            includes[i] = new File (args[i + 2]);
        }
        process (input, includes, os);
        os.close ();
    }
}
