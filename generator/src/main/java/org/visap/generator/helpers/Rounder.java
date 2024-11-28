package org.visap.generator.helpers;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class Rounder {
    public static double roundDoubleNumber(double value) {
        if (Double.isNaN(value) || Double.isInfinite(value)) {
            return value;
        }
        BigDecimal bd = BigDecimal.valueOf(value);
        bd = bd.setScale(4, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }
}
