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
    double railroadXPosition();
    // y - height in the room (3D)
    @DefaultValue("0.1")
    double railroadYPosition();
    // z - left/right in the (2D) room
    @DefaultValue("0.5")
    double railroadZPosition();
    @DefaultValue("0.2")
    double railroadHeight();
    @DefaultValue("0.5")
    double railroadWidth();
    @DefaultValue("20.0")
    double railroadLength();
    @DefaultValue("2.0")
    double railroadLaneGap();

    //properties for the sleeper
    @DefaultValue("1.0")
    double sleeperGap();
    @DefaultValue("-1.75")
    double sleeperXPosition();
    @DefaultValue("0.1")
    double sleeperYPosition();
    @DefaultValue("0.0")
    double sleeperZPosition();
    @DefaultValue("0.1")
    double sleeperHeight();
    @DefaultValue("3.5")
    double sleeperWidth();
    @DefaultValue("0.5")
    double sleeperLength();

    //properties for the stations
    @DefaultValue("0.0")
    double stationXPosition();
    @DefaultValue("0.5")
    double stationYPosition();
    @DefaultValue("0.0")
    double stationZPosition();
    @DefaultValue("1.0")
    double stationHeight();
    @DefaultValue("1.0")
    double stationWidth();
    @DefaultValue("1.0")
    double stationLength();
}
