package org.visap.generator.configuration;

import org.aeonbits.owner.Config;
import org.visap.generator.output.MetaDataOutput;

@Config.Sources("file:${user.dir}/src/main/java/properties/metropolis/metaDataExporter/Output.properties")
public interface Output extends Config {
    MetaDataOutput metaData();
    String mapPath();
}
