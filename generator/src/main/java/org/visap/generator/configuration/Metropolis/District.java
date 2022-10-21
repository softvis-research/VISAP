package org.visap.generator.configuration.Metropolis;

import org.aeonbits.owner.Config;
import org.visap.generator.layouts.enums.LayoutType;
import org.visap.generator.layouts.enums.LayoutVersion;
import org.visap.generator.repository.CityElement;

@Config.LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({ "file:${user.dir}/src/main/java/properties/metropolis/layouter/District.properties",
                  "file:${user.dir}/src/main/java/properties/metropolis/designer/District.properties" })
public interface District extends Config {
    double horizontalBuildingGap();
    double horizontalBuildingMargin();
    double horizontalDistrictGap();
    double districtHeight();

    double emptyDistrictHeight();
    double emptyDistrictLength();
    double emptyDistrictWidth();

    @DefaultValue("DEFAULT")
    LayoutType layoutType();
    LayoutVersion layoutVersion();

    CityElement.CityShape shape();
}
