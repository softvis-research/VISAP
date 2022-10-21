package org.visap.generator.configuration.Metropolis;

import org.aeonbits.owner.Config;

@Config.LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({ "file:${user.dir}/src/main/java/properties/metropolis/layouter/Building.properties",
                  "file:${user.dir}/src/main/java/properties/metropolis/designer/Building.properties" })
public interface Building extends Config {
    double defaultHeight();
    double defaultLength();
    double defaultWidth();
    double maxHeightFactor();
    double minHeight();
    double maxHeight();

    String rotation();
    double adjustWidth();
    double adjustLength();
    double adjustReferenceYPosition();

    double tableTypeBuildingWidth();
    double tableTypeBuildingLength();
    double structureBuildingWidth();
    double structureBuildingLength();
    double defaultBuildingWidth();
    double defaultBuildingLength();
}
