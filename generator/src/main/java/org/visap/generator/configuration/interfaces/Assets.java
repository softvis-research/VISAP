package org.visap.generator.configuration.interfaces;

import org.aeonbits.owner.Config;
import org.aeonbits.owner.Config.LoadPolicy;
import org.visap.generator.configuration.Sources;

@LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
    Sources.CONFIG_LOCAL_PATH + "Assets.properties",
    Sources.CONFIG_PATH + "Assets.properties",
})
public interface Assets extends Config {
    @DefaultValue("assets/sky_pano.jpg")
    String sky();

    @DefaultValue("assets/ground.jpg")
    String ground();

}