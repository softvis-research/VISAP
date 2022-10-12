package org.visap.generator.configuration.Metropolis;

import org.aeonbits.owner.Config;

@Config.Sources("file:${user.dir}/src/main/java/properties/metropolis/layouter/Building.properties")
public interface Building extends Config {
    double defaultHeight();
    double defaultLength();
    double defaultWidth();
    double maxHeightFactor();
    double minHeight();
    double maxHeight();
}
