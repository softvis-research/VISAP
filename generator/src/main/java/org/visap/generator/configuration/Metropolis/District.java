package org.visap.generator.configuration.Metropolis;

import org.aeonbits.owner.Config;
import org.visap.generator.layouts.enums.LayoutType;
import org.visap.generator.layouts.enums.LayoutVersion;

@Config.Sources("file:${user.dir}/src/main/java/properties/metropolis/layouter/District.properties")
public interface District extends Config {
    double horizontalBuildingMargin();
    double horizontalBuildingGap();
    double horizontalDistrictGap();
    double districtHeight();

    double emptyDistrictHeight();
    double emptyDistrictLength();
    double emptyDistrictWidth();

    @DefaultValue("DEFAULT")
    LayoutType layoutType();
    LayoutVersion layoutVersion();
}
