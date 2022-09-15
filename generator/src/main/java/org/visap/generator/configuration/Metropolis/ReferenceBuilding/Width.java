package org.visap.generator.configuration.Metropolis.ReferenceBuilding;

import org.aeonbits.owner.Config;

@Config.Sources("file:${user.dir}/src/main/java/properties/metropolis/creator/referencebuilding/Width.properties")
public interface Width extends Config {
    double cloud();
    double mountain();
    double sea();
}
