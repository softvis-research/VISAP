package org.visap.generator.configuration.Metropolis;

import org.aeonbits.owner.Config;

@Config.Sources("file:${user.dir}/src/main/java/properties/metropolis/layouter/District.properties")
public interface District extends Config {
    double horizontalMargin();
    double verticalMargin();
    double horizontalGap();
    double districtHeight();

    double emptyDistrictHeight();
    double emptyDistrictLength();
    double emptyDistrictWidth();
}
