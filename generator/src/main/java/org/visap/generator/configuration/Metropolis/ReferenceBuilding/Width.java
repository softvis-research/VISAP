package org.visap.generator.configuration.Metropolis.ReferenceBuilding;

import org.aeonbits.owner.Config;

@Config.Sources("file:${user.dir}/src/main/java/properties/metropolis/creator/referencebuilding/Width.properties")
public interface Width extends Config {
    @DefaultValue("0.2")
    double cloud();
    @DefaultValue("0.2")
    double mountain();
    @DefaultValue("0.2")
    double sea();
}
