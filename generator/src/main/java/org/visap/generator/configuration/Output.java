package org.visap.generator.configuration;

import org.aeonbits.owner.Config;
import org.visap.generator.output.MetaDataOutput;

@Config.Sources("file:${user.dir}/src/main/java/properties/metropolis/exporter/Output.properties")
public interface Output extends Config {
    @DefaultValue("BOTH")
    MetaDataOutput metaData();
    @DefaultValue("src/neo4jexport")
    String mapPath();
    @DefaultValue("true")
    boolean writeRepToDb();
}
