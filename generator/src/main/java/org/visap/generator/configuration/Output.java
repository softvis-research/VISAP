package org.visap.generator.configuration;

import org.aeonbits.owner.Config;
import org.aeonbits.owner.Config.LoadPolicy;
import org.visap.generator.export.core.MetaDataOutput;

@LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
    "file:${user.dir}/properties/local/Output.properties",
    "file:${user.dir}/properties/Output.properties",
})
public interface Output extends Config {
    @DefaultValue("BOTH")
    MetaDataOutput metaData();

    @DefaultValue("../ui/model/yourOutput/")
    String mapPath();

    @DefaultValue("false")
    boolean writeRepToDb();
}
