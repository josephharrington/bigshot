package bigshot.tools;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.PrintStream;
import java.io.FileOutputStream;
import java.io.File;

public class ParamGen {
    
    private static String className;
    
    private static String toKey (String name) {
        StringBuilder sb = new StringBuilder ();
        for (int i = 0; i < name.length (); ++i) {
            char ch = name.charAt (i);
            if (Character.isUpperCase (ch)) {
                sb.append ('-');
                sb.append (Character.toLowerCase (ch));
            } else {
                sb.append (ch);
            }
        }
        String result = sb.toString ();
        if (result.startsWith ("-")) {
            result = result.substring (1);
        }
        return result;
    }
    
    private static String toStaticMember (String name) {
        return toKey (name).toUpperCase ().replace ('-', '_');
    }
    
    private static String toMethod (String name) {
        return name.substring (0, 1).toLowerCase () + name.substring (1);
    }
    
    public static void main (String[] args) throws Exception {
        BufferedReader in = new BufferedReader (new FileReader (new File (args[0])));
        PrintStream out = new PrintStream (new FileOutputStream (new File (args[1])));
        try {
            while (true) {
                String line = in.readLine ();
                if (line == null) {
                    break;
                }
                
                line = line.trim ();
                if (line.startsWith ("@CLASSNAME")) {
                    className = in.readLine ().trim ();
                    in.readLine ();
                } else if (line.startsWith ("@STRINGENUM")) {
                    String name = in.readLine ().trim ();
                    String key = toKey (name);
                    String staticMember = toStaticMember (name);
                    String method = toMethod (name);
                    String comment = in.readLine ();
                    out.println ("     /** Lookup key for the {@code " + key + "} parameter. */");
                    out.println ("     public static final String " + staticMember + " = \"" + key + "\";");
                    out.println ("     /** " + comment + " */");
                    out.println ("     public static enum " + name + " {");
                    
                    boolean first = true;
                    while (true) {
                        key = in.readLine ().trim ();
                        if (key.equals (";")) {
                            out.println (";");
                            break;
                        }
                        comment = in.readLine ().trim ();
                        if (!first) {
                            out.println (",");
                        }
                        out.println ("     /**");
                        out.println ("      * " + comment);
                        out.println ("      */");
                        out.print   ("     " + toStaticMember (key) + "(\"" + key + "\")");
                        first = false;
                    }
                    
                    out.println ("     private final String stringified;");
                    out.println ("     " + name + " (String stringified) { this.stringified = stringified; }");
                    out.println ("     public String toString () { return stringified; }");
                    out.println ("     public static " + name + " valueOfKey (String key) { for (" + name + " n : values()) { if (n.toString ().equals (key)) { return n; } } throw new IllegalArgumentException (key); }");
                    
                    out.println ("     }");
                    
                    out.println ("    /** " + comment + " */");
                    out.println ("    public ImagePyramidParameters " + toMethod (name) + " (" + name + " " + toMethod (name) + ") {");
                    out.println ("        if (" + toMethod (name) + " != null) {");
                    out.println ("            put (" + staticMember + ", " + toMethod (name) + ".toString());");
                    out.println ("        } else {");    
                    out.println ("            remove (" + staticMember + ");");
                    out.println ("        }");    
                    out.println ("        return this;");    
                    out.println ("    }");
                    
                    out.println ("    /** " + comment);
                    out.println ("     * @param defaultValue the value to return if the parameter is not defined.");
                    out.println ("     */");
                    out.println ("    public " + name + " opt" + name + " (" + name + " defaultValue) {");
                    out.println ("        if (containsKey (" + staticMember + ")) {");
                    out.println ("            return " + name + ".valueOfKey (get (" + staticMember + "));");
                    out.println ("        } else {");    
                    out.println ("            return defaultValue;");
                    out.println ("        }");
                    out.println ("    }");
                    
                    out.println ("    /** " + comment + " */");
                    out.println ("    public " + name + " " + toMethod (name) + " () {");
                    out.println ("        if (containsKey (" + staticMember + ")) {");
                    out.println ("            return " + name + ".valueOfKey (get (" + staticMember + "));");
                    out.println ("        } else {");    
                    out.println ("            return null;");
                    out.println ("        }");
                    out.println ("    }");
                } else if (line.startsWith ("@INTEGER")) {
                    generateBuiltin (in, out, "int", "Integer", "parseInt");
                } else if (line.startsWith ("@DOUBLE")) {
                    generateBuiltin (in, out, "double", "Double", "parseDouble");
                } else if (line.startsWith ("@BOOLEAN")) {
                    generateBuiltin (in, out, "boolean", "Boolean", "valueOf");
                } else if (line.startsWith ("@FLOAT")) {
                    generateBuiltin (in, out, "float", "Float", "parseFloat");
                } else if (line.startsWith ("@STRING")) {
                    generateBuiltin (in, out, "String", "String", "valueOf");
                } else {
                    out.println (line);
                }
            }
        } finally {
            in.close ();
            out.close ();
        }
    }
    
    public static void generateBuiltin (BufferedReader in, PrintStream out, String unboxedType, String boxedType, String parseMethod) throws Exception {
        String name = in.readLine ().trim ();
        String key = toKey (name);
        String staticMember = toStaticMember (name);
        String method = toMethod (name);
        String comment = in.readLine ();
        in.readLine (); // End semi
        out.println ("    /** Lookup key for the {@code " + key + "} parameter. */");
        out.println ("    public static final String " + staticMember + " = \"" + key + "\";");
        
        out.println ("    /** " + comment + " */");
        out.println ("    public " + className + " " + toMethod (name) + " (" + boxedType + " " + toMethod (name) + ") {");
        out.println ("        if (" + toMethod (name) + " != null) {");
        out.println ("            put (" + staticMember + ", " + toMethod (name) + ".toString ());");
        out.println ("        } else {");    
        out.println ("            remove (" + staticMember + ");");
        out.println ("        }");    
        out.println ("        return this;");    
        out.println ("    }");
        
        if (!boxedType.equals (unboxedType)) {
            out.println ("    /** " + comment + " */");
            out.println ("    public " + className + " " + toMethod (name) + " (" + unboxedType + " " + toMethod (name) + ") {");
            out.println ("        put (" + staticMember + ", String.valueOf (" + toMethod (name) + "));");
            out.println ("        return this;");    
            out.println ("    }");
        }
        
        
        out.println ("    /** " + comment + " */");
        out.println ("    public " + unboxedType + " opt" + name.substring (0,1).toUpperCase () + name.substring (1) + " (" + unboxedType + " defaultValue) {");
        out.println ("        if (containsKey (" + staticMember + ")) {");
        out.println ("            return " + boxedType + "." + parseMethod + " (get (" + staticMember + "));");
        out.println ("        } else {");    
        out.println ("            return defaultValue;");
        out.println ("        }");
        out.println ("    }");
        
        out.println ("    /** " + comment + " */");
        out.println ("    public " + boxedType + " " + toMethod (name) + " () {");
        out.println ("        if (containsKey (" + staticMember + ")) {");
        out.println ("            return " + boxedType + ".valueOf (get (" + staticMember + "));");
        out.println ("        } else {");    
        out.println ("            return null;");
        out.println ("        }");
        out.println ("    }");
    }
    
}