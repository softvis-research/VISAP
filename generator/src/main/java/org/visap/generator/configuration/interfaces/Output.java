package org.visap.generator.configuration.interfaces;

import org.visap.generator.configuration.Sources;
import org.visap.generator.export.core.MetaDataOutput;
import org.aeonbits.owner.Config;
import org.aeonbits.owner.Config.LoadPolicy;

@LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
    Sources.CONFIG_LOCAL_PATH + "Output.properties",
    Sources.CONFIG_PATH + "Output.properties",
})
public interface Output extends Config {
    @DefaultValue("BOTH")
    MetaDataOutput metaData();

    @DefaultValue("../ui/model/yourOutput/")
    String mapPath();

    @DefaultValue("false")
    boolean writeRepToDb();
}
