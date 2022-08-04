package org.visap.generator.configuration;

import org.aeonbits.owner.Config;

@Config.Sources(value = "file:${user.dir}/src/main/java/org/visap/generator/configuration/SettingsConfig.properties")
public interface SettingsConfig extends Config {
    String boltAddress();
    @DefaultValue("5")
    int maxThreads();
    boolean silentMode();
}
