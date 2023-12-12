package org.visap.generator.configuration.interfaces.Metropolis;

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

    @DefaultValue("3.0")
    double roadWidthFreeway();

    @DefaultValue("2.0")
    double roadWidthStreet();

    @DefaultValue("1.0")
    double roadWidthLane();
}
