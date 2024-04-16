package org.visap.generator.configuration.interfaces.Metropolis;

import org.visap.generator.configuration.Sources;
import org.visap.generator.metaphors.metropolis.layouts.enums.LayoutType;
import org.visap.generator.metaphors.metropolis.layouts.enums.LayoutVersion;
import org.visap.generator.repository.CityElement;

import org.aeonbits.owner.Config;
import org.aeonbits.owner.Config.LoadPolicy;

@LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
    Sources.CONFIG_LOCAL_PATH + "metropolis/District.properties",
    Sources.CONFIG_PATH + "metropolis/District.properties",
})
public interface District extends Config {
    @DefaultValue("3.0")
    double horizontalBuildingGap();

    @DefaultValue("0.0")
    double horizontalDistrictMargin();

    @DefaultValue("3.0")
    double horizontalDistrictGap();

    @DefaultValue("0.2")
    double districtHeight();

    @DefaultValue("0.2")
    double emptyDistrictHeight();

    @DefaultValue("3.0")
    double emptyDistrictLength();

    @DefaultValue("3.0")
    double emptyDistrictWidth();

    @DefaultValue("CIRCULAR")
    LayoutType layoutType();

    @DefaultValue("MINIMAL_DISTANCE")
    LayoutVersion layoutVersion();

    @DefaultValue("Box")
    CityElement.CityShape shape();
}
