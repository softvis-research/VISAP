package org.visap.generator.configuration.Metropolis;

import org.aeonbits.owner.Config;
import org.aeonbits.owner.Config.LoadPolicy;

@LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
    "file:${user.dir}/properties/local/Building.properties",
    "file:${user.dir}/properties/Building.properties",
})
public interface Building extends Config {
    @DefaultValue("2")
    double defaultHeight();

    @DefaultValue("2")
    double defaultLength();

    @DefaultValue("2")
    double defaultWidth();

    @DefaultValue("2")
    double maxHeightFactor();

    @DefaultValue("1")
    double minHeight();

    @DefaultValue("30")
    double maxHeight();

    @DefaultValue("0 0 0")
    String rotation();

    @DefaultValue("0.2")
    double adjustWidth();

    @DefaultValue("0.2")
    double adjustLength();

    @DefaultValue("0.1")
    double defaultBuildingWidth();

    @DefaultValue("0.1")
    double defaultBuildingLength();

    @DefaultValue("1.5")
    double defaultDDICLength();

    @DefaultValue("1.5")
    double defaultDDICWidth();

}
