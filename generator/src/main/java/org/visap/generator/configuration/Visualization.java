package org.visap.generator.configuration;

import org.aeonbits.owner.Config;

@Config.Sources("file:${user.dir}/src/main/java/properties/Visualization.properties")
public interface Visualization extends Config {
    @DefaultValue("false")
    boolean showMountainReferenceBuilding();
    @DefaultValue("false")
    boolean showSeaReferenceBuilding();
    @DefaultValue("false")
    boolean showCloudReferenceBuilding();
    @DefaultValue("0.1")
    double metropolisReferenceBuildingSeaLength();
    @DefaultValue("0.1")
    double metropolisReferenceBuildingSeaWidth();
    @DefaultValue("0.1")
    double metropolisReferenceBuildingSeaHeight();

    @DefaultValue("0.1")
    double metropolisReferenceBuildingMountainLength();
    @DefaultValue("0.1")
    double metropolisReferenceBuildingMountainWidth();
    @DefaultValue("0.1")
    double metropolisReferenceBuildingMountainHeight();

    @DefaultValue("0.1")
    double metropolisReferenceBuildingCloudLength();
    @DefaultValue("0.1")
    double metropolisReferenceBuildingCloudWidth();
    @DefaultValue("0.1")
    double metropolisReferenceBuildingCloudHeight();

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
