package org.visap.generator.configuration.Metropolis;

import org.aeonbits.owner.Config;
import org.visap.generator.layouts.enums.LayoutType;
import org.visap.generator.layouts.enums.LayoutVersion;
import org.visap.generator.repository.CityElement;

@Config.LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({ "file:${user.dir}/src/main/java/properties/metropolis/layouter/District.properties",
                  "file:${user.dir}/src/main/java/properties/metropolis/designer/District.properties" })
public interface District extends Config {
    @DefaultValue("3.0")
    double horizontalBuildingGap();
    @DefaultValue("0.0")
    double horizontalBuildingMargin();
    @DefaultValue("0.0")
    double horizontalDistrictGap();

    @DefaultValue("0.2")
    double districtHeight();

    @DefaultValue("0.2")
    double emptyDistrictHeight();
    @DefaultValue("0.2")
    double emptyDistrictLength();
    @DefaultValue("0.2")
    double emptyDistrictWidth();

    @DefaultValue("CIRCULAR")
    LayoutType layoutType();
    @DefaultValue("MINIMAL_DISTANCE")
    LayoutVersion layoutVersion();

    @DefaultValue("Box")
    CityElement.CityShape shape();
}
