package org.visap.generator.configuration.Metropolis;

import org.aeonbits.owner.Config;
import org.visap.generator.repository.CityElement;

@Config.Sources("file:${user.dir}/src/main/java/properties/metropolis/designer/Shape.properties")
public interface Shape extends Config {
    CityElement.CityShape attributeBuilding();
    CityElement.CityShape interfaceBuilding();
    CityElement.CityShape methodBuilding();
    CityElement.CityShape reportBuilding();
    CityElement.CityShape formRoutineBuilding();
    CityElement.CityShape functionModuleBuilding();
    CityElement.CityShape defaultBuildingValue();
}
