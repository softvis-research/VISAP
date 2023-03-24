package org.visap.generator.configuration;

import org.aeonbits.owner.Config;
import org.aeonbits.owner.Config.LoadPolicy;

@LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
    "file:${user.dir}/user-properties/Setup.properties",
    "file:${user.dir}/properties/Setup.properties",
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
