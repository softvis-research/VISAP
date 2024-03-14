package org.visap.generator.configuration.interfaces.Metropolis;

import org.visap.generator.configuration.Sources;
import org.aeonbits.owner.Config;

@Config.LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
    Sources.CONFIG_LOCAL_PATH + "metropolis/RoadNetwork.properties",
    Sources.CONFIG_PATH + "metropolis/RoadNetwork.properties",
})
public interface RoadNetwork extends Config {
    @DefaultValue("0.4")
    double roadHeight();

    @DefaultValue("3.0")
    double roadWidthFreeway();

    @DefaultValue("2.0")
    double roadWidthStreet();

    @DefaultValue("1.0")
    double roadWidthLane();
}
