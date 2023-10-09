package org.visap.generator.configuration.interfaces;

import org.aeonbits.owner.Config;
import org.aeonbits.owner.Config.LoadPolicy;
import org.visap.generator.configuration.Sources;

@LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
    Sources.CONFIG_LOCAL_PATH + "Features.properties",
    Sources.CONFIG_PATH + "Features.properties",
})
public interface Features extends Config {
    @DefaultValue("false")
    Boolean outline();

    @DefaultValue("false")
    Boolean inputUsesCSV();

    @DefaultValue("false")
    Boolean showDDIC();
}