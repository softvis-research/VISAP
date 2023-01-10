package org.visap.generator.configuration;

import org.aeonbits.owner.Config;

@Config.Sources("file:${user.dir}/properties/Assets.properties")
public interface Assets extends Config {
    @DefaultValue("assets/sky_pano.jpg")
    String sky();
    @DefaultValue("assets/ground.jpg")
    String ground();

}