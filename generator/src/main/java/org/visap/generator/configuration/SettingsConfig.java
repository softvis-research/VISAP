package org.visap.generator.configuration;

import org.aeonbits.owner.Config;

@Config.Sources(value = "file:${user.dir}/src/main/java/properties/SettingsConfig.properties")
public interface SettingsConfig extends Config {
    @Key("setup.boltAddress")
    String boltAddress();
    @Key("setup.inputCSVFilePath")
    String inputCSVFilePath();
    @Key("setup.silentMode")
    @DefaultValue("true")
    boolean silentMode();
    @DefaultValue("false")
    boolean showMountainReferenceBuilding();
    @DefaultValue("false")
    boolean showSeaReferenceBuilding();
    @DefaultValue("false")
    boolean showCloudReferenceBuilding();
}
