package org.visap.generator.configuration;

import org.aeonbits.owner.Config;

@Config.Sources("file:${user.dir}/src/main/java/properties/metropolis/creator/Setup.properties")
public interface Setup extends Config {
    String boltAddress();
    String inputCSVFilePath();
    @Config.DefaultValue("true")
    boolean silentMode();
}
