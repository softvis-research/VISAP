package org.visap.generator.configuration.Metropolis;

import org.aeonbits.owner.Config;

@Config.LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
        "file:${user.dir}/properties/local/RoadNetwork.properties",
        "file:${user.dir}/properties/RoadNetwork.properties",
})
public interface RoadNetwork extends Config {

    @DefaultValue("false")
    boolean completeRoadNetwork();

    @DefaultValue("0.4")
    double roadHeight();

    @DefaultValue("4.5")
    double roadWidthFreeway();

    @DefaultValue("3.0")
    double roadWidthStreet();

    @DefaultValue("1.5")
    double roadWidthLane();
}
