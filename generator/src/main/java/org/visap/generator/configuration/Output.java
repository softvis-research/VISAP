package org.visap.generator.configuration;

import org.aeonbits.owner.Config;
import org.visap.generator.model.MetaDataOutput;

@Config.Sources("file:${user.dir}/properties/Output.properties")
public interface Output extends Config {
    @DefaultValue("BOTH")
    MetaDataOutput metaData();

    @DefaultValue("output/Example/")
    String mapPath();

    @DefaultValue("false")
    boolean writeRepToDb();
}
