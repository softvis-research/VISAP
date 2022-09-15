package org.visap.generator.configuration.Metropolis.ReferenceBuilding;
import org.aeonbits.owner.Config;

@Config.Sources("file:${user.dir}/src/main/java/properties/metropolis/creator/referencebuilding/Show.properties")
public interface Show extends Config {
    boolean cloud();
    boolean mountain();
    boolean sea();
}
