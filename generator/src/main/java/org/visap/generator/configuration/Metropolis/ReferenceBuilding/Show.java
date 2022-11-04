package org.visap.generator.configuration.Metropolis.ReferenceBuilding;
import org.aeonbits.owner.Config;

@Config.Sources("file:${user.dir}/src/main/java/properties/metropolis/creator/referencebuilding/Show.properties")
public interface Show extends Config {
    @DefaultValue("true")
    boolean cloud();
    @DefaultValue("true")
    boolean mountain();
    @DefaultValue("true")
    boolean sea();
}
