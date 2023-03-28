package org.visap.generator.configuration;

import org.visap.generator.model.MetaDataOutput;
import org.aeonbits.owner.Config;
import org.aeonbits.owner.Config.LoadPolicy;

@LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
    "file:${user.dir}/user-properties/Output.properties",
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
