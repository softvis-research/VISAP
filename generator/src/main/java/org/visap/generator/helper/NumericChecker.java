package org.visap.generator.helper;

import org.visap.generator.metaphors.metropolis.layouts.BuildingLayout;
import org.visap.generator.metaphors.metropolis.steps.MetropolisDesigner;

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
