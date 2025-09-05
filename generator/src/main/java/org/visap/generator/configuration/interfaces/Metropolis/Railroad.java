package org.visap.generator.configuration.interfaces.Metropolis;

import org.visap.generator.configuration.Sources;
import org.aeonbits.owner.Config;

@Config.LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
        Sources.CONFIG_LOCAL_PATH + "metropolis/Railroad.properties",
        Sources.CONFIG_PATH + "metropolis/Railroad.properties",
})
public interface Railroad extends Config{
    /* zwei Beispiel-Methoden
    @DefaultValue("0.4")
    double railroadHeight();

    @DefaultValue("1.0")
    double railroadWidth();
    */
}
