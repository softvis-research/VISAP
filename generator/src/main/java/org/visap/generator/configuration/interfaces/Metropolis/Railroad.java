package org.visap.generator.configuration.interfaces.Metropolis;

import org.visap.generator.configuration.Sources;
import org.aeonbits.owner.Config;

@Config.LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
        Sources.CONFIG_LOCAL_PATH + "metropolis/Railroad.properties",
        Sources.CONFIG_PATH + "metropolis/Railroad.properties",
})
public interface Railroad extends Config{
    //properties for the lanes
    // x - up/down in the (2D) room
    @DefaultValue("0.5")
    double railroadLaneXPosition();
    // y - height in the room (3D)
    @DefaultValue("0.1")
    double railroadLaneYPosition();
    // z - left/right in the (2D) room
    @DefaultValue("0.5")
    double railroadLaneZPosition();
    @DefaultValue("0.2")
    double railroadLaneHeight();
    @DefaultValue("0.5")
    double railroadLaneWidth();
    @DefaultValue("20.0")
    double railroadLaneLength();
    @DefaultValue("2.0")
    double railroadLaneGap();

    //properties for the sleeper
    @DefaultValue("1.0")
    double railroadSleeperGap();
    @DefaultValue("1.0")
    double railroadSleeperOverhang();
    @DefaultValue("-1.75")
    double railroadSleeperXPosition();
    @DefaultValue("0.1")
    double railroadSleeperYPosition();
    @DefaultValue("0.0")
    double railroadSleeperZPosition();
    @DefaultValue("0.1")
    double railroadSleeperHeight();
    @DefaultValue("3.5")
    double railroadSleeperWidth();
    @DefaultValue("0.5")
    double railroadSleeperLength();

    //properties for the stations
    @DefaultValue("0.0")
    double railroadStationXPosition();
    @DefaultValue("0.5")
    double railroadStationYPosition();
    @DefaultValue("0.0")
    double railroadStationZPosition();
    @DefaultValue("1.0")
    double railroadStationHeight();
    @DefaultValue("1.0")
    double railroadStationWidth();
    @DefaultValue("1.0")
    double railroadStationLength();
}
