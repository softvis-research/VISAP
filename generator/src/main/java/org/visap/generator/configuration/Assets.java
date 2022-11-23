package org.visap.generator.configuration;

import org.aeonbits.owner.Config;

@Config.Sources("file:${user.dir}/src/main/java/properties/metropolis/exporter/Assets.properties")
public interface Assets extends Config {
    String sky();

    String ground();

}