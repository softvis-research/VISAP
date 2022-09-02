package org.visap.generator.configuration.Metropolis.ReferenceBuilding;

import org.aeonbits.owner.Config;

@Config.Sources("file:${user.dir}/src/main/java/properties/Metropolis.ReferenceBuilding.Mountain.properties")
public interface Mountain extends Config {
    double height();
    double width();
    double length();
}
