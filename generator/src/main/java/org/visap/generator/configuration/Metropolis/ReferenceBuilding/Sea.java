package org.visap.generator.configuration.Metropolis.ReferenceBuilding;

import org.aeonbits.owner.Config;

@Config.Sources("file:${user.dir}/src/main/java/properties/Metropolis.ReferenceBuilding.Sea.properties")
public interface Sea extends Config {
    double height();
    double width();
    double length();
    boolean show();
}
