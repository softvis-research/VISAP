package org.visap.generator.configuration;

import org.aeonbits.owner.Config;

@Config.Sources("file:${user.dir}/src/main/java/properties/Visualization.properties")
public interface Visualization extends Config {
    @DefaultValue("1.0")
    double abapFloorHeightSum();
    @DefaultValue("4.0")
    double abapStandardCodeHeight();
    @DefaultValue("1.0")
    double abapScoMinHeight();
    @DefaultValue("30.0")
    double abapScoMaxHeight();
    @DefaultValue("2.0")
    double abapScoFactorMaxHeight();
    @DefaultValue("2.0")
    double abapGroundAreaByChimney();
}
