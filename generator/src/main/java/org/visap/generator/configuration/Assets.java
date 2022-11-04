package org.visap.generator.configuration;

import org.aeonbits.owner.Config;

@Config.Sources("file:${user.dir}/src/main/java/properties/metropolis/exporter/Assets.properties")
public interface Assets extends Config {
    @DefaultValue("assets/sky_pano.jpg")
    String sky();
    @DefaultValue("assets/ground.jpg")
    String ground();
    @DefaultValue("assets/polyMountain_new_Color.glb")
    String mountain();
    @DefaultValue("assets/pool-water.jpg")
    String sea();
    @DefaultValue("assets/cloud_black.glb")
    String cloud();
}