package org.visap.generator.configuration;

import org.aeonbits.owner.Config;

@Config.Sources(value = "file:${user.dir}/src/main/java/org/visap/generator/configuration/SettingsConfig.properties")
public interface SettingsConfig extends Config {
    String boltAddress();
    String inputCSVFilePath();
    @DefaultValue("true")
    boolean silentMode();
    @DefaultValue("false")
    boolean showMountainReferenceBuilding();
    @DefaultValue("false")
    boolean showSeaReferenceBuilding();
    @DefaultValue("false")
    boolean showCloudReferenceBuilding();
}
