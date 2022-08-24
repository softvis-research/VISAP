package org.visap.generator.configuration;

import org.aeonbits.owner.Config;

@Config.LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
        "file:${user.dir}/src/main/java/properties/SetupConfig.properties",
        "file:${user.dir}/src/main/java/properties/VisualizationConfig.properties"
})
public interface SettingsConfig extends Config {
    @Key("setup.boltAddress")
    String boltAddress();
    @Key("setup.inputCSVFilePath")
    String inputCSVFilePath();
    @Key("setup.silentMode")
    @DefaultValue("true")
    boolean silentMode();
    @Key("visualization.showMountainReferenceBuilding")
    @DefaultValue("false")
    boolean showMountainReferenceBuilding();
    @Key("visualization.showSeaReferenceBuilding")
    @DefaultValue("false")
    boolean showSeaReferenceBuilding();
    @Key("visualization.showCloudReferenceBuilding")
    @DefaultValue("false")
    boolean showCloudReferenceBuilding();
    @Key("metropolis.referenceBuilding.sea.length")
    @DefaultValue("0.1")
    double metropolisReferenceBuildingSeaLength();
    @Key("metropolis.referenceBuilding.sea.width")
    @DefaultValue("0.1")
    double metropolisReferenceBuildingSeaWidth();
    @Key("metropolis.referenceBuilding.sea.height")
    @DefaultValue("0.1")
    double metropolisReferenceBuildingSeaHeight();

    @Key("metropolis.referenceBuilding.mountain.length")
    @DefaultValue("0.1")
    double metropolisReferenceBuildingMountainLength();
    @Key("metropolis.referenceBuilding.mountain.width")
    @DefaultValue("0.1")
    double metropolisReferenceBuildingMountainWidth();
    @Key("metropolis.referenceBuilding.mountain.height")
    @DefaultValue("0.1")
    double metropolisReferenceBuildingMountainHeight();

    @Key("metropolis.referenceBuilding.cloud.length")
    @DefaultValue("0.1")
    double metropolisReferenceBuildingCloudLength();
    @Key("metropolis.referenceBuilding.cloud.width")
    @DefaultValue("0.1")
    double metropolisReferenceBuildingCloudWidth();
    @Key("metropolis.referenceBuilding.cloud.height")
    @DefaultValue("0.1")
    double metropolisReferenceBuildingCloudHeight();

    @Key("city.abap.floorHeightSum")
    @DefaultValue("1.0")
    double abapFloorHeightSum();
    @Key("city.abap.standardCodeHeight")
    @DefaultValue("4.0")
    double abapStandardCodeHeight();
    @Key("city.abap.sco.min.height")
    @DefaultValue("1.0")
    double abapScoMinHeight();
    @Key("city.abap.sco.max.height")
    @DefaultValue("30.0")
    double abapScoMaxHeight();
    @Key("city.abap.sco.factor.max.height")
    @DefaultValue("2.0")
    double abapScoFactorMaxHeight();
    @Key("city.abap.groundAreaByChimney")
    @DefaultValue("2.0")
    double abapGroundAreaByChimney();
}
