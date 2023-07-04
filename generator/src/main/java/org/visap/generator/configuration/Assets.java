package org.visap.generator.configuration;

import org.aeonbits.owner.Config;
import org.aeonbits.owner.Config.LoadPolicy;

@LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
    "file:${user.dir}/properties/local/Assets.properties",
    "file:${user.dir}/properties/Assets.properties",
})
public interface Assets extends Config {
    @DefaultValue("assets/sky_pano.jpg")
    String sky();

    @DefaultValue("assets/ground.jpg")
    String ground();

}