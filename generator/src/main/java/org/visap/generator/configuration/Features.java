package org.visap.generator.configuration;

import org.aeonbits.owner.Config;
import org.aeonbits.owner.Config.LoadPolicy;

@LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
    "file:${user.dir}/properties/local/Features.properties",
    "file:${user.dir}/properties/Features.properties",
})
public interface Features extends Config {
    @DefaultValue("false")
    Boolean outline();
}