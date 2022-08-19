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
}
