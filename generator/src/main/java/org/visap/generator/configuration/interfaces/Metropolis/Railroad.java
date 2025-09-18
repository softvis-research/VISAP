package org.visap.generator.configuration.interfaces.Metropolis;

import org.visap.generator.configuration.Sources;
import org.aeonbits.owner.Config;

@Config.LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
        Sources.CONFIG_LOCAL_PATH + "metropolis/Railroad.properties",
        Sources.CONFIG_PATH + "metropolis/Railroad.properties",
})
public interface Railroad extends Config{
    @DefaultValue("10.0")
    double railroadXPosition();

    @DefaultValue("10.0")
    double railroadYPosition();

    @DefaultValue("10.0")
    double railroadZPosition();

    @DefaultValue("1.0")
    double railroadHeight();

    @DefaultValue("5.0")
    double railroadWidth();

    @DefaultValue("100.0")
    double railroadLength();
}
