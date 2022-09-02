package org.visap.generator.configuration.Metropolis.ReferenceBuilding;

import org.aeonbits.owner.Config;

@Config.Sources("file:${user.dir}/src/main/java/properties/Metropolis.ReferenceBuilding.Cloud.properties")
public interface Cloud extends Config {
    double width();
    double height();
    double length();
}
