package org.visap.generator.configuration;

import org.aeonbits.owner.Config;

@Config.Sources("file:${user.dir}/src/main/java/properties/Setup.properties")
public interface Setup extends Config {
    @DefaultValue("bolt://localhost:7687")
    String boltAddress();
    @DefaultValue("neo4j")
    String username();
    @DefaultValue("123")
    String password();
    @DefaultValue("src/neo4jexport/")
    String inputCSVFilePath();
    @Config.DefaultValue("true")
    boolean silentMode();
}
