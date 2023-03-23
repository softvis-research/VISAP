package org.visap.generator.helper;

public class NumericChecker {
    // Check if attribute is Numeric
    public static boolean isNumeric(String str) {
        try {
            Double.parseDouble(str);
            return true;
        } catch(NumberFormatException e){
            return false;
        }
    }
}
