package org.visap.generator.configuration.interfaces;

import org.aeonbits.owner.Config;
import org.aeonbits.owner.Config.LoadPolicy;
import org.visap.generator.configuration.Sources;

@LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
    Sources.CONFIG_LOCAL_PATH + "Setup.properties",
    Sources.CONFIG_PATH + "Setup.properties",
})
public interface Setup extends Config {
    @DefaultValue("bolt://localhost:7687")
    String boltAddress();

    @DefaultValue("neo4j")
    String username();

    @DefaultValue("123")
    String password();

    @DefaultValue("input/example/")
    String inputCSVFilePath();

    @Config.DefaultValue("true")
    boolean silentMode();
}