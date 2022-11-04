package org.visap.generator.configuration.Metropolis;

import org.aeonbits.owner.Config;
import org.visap.generator.repository.CityElement;

@Config.Sources("file:${user.dir}/src/main/java/properties/metropolis/designer/Shape.properties")
public interface Shape extends Config {
    @DefaultValue("Box")
    CityElement.CityShape attributeBuilding();
    @DefaultValue("Box")
    CityElement.CityShape interfaceBuilding();
    @DefaultValue("Box")
    CityElement.CityShape methodBuilding();
    @DefaultValue("Box")
    CityElement.CityShape reportBuilding();
    @DefaultValue("Box")
    CityElement.CityShape formRoutineBuilding();
    @DefaultValue("Box")
    CityElement.CityShape functionModuleBuilding();
    @DefaultValue("Box")
    CityElement.CityShape tableBuilding();
    @DefaultValue("Box")
    CityElement.CityShape dataElementBuilding();
    @DefaultValue("Box")
    CityElement.CityShape domainBuilding();
    @DefaultValue("Box")
    CityElement.CityShape structureBuilding();
    @DefaultValue("Box")
    CityElement.CityShape tableTypeBuilding();
    @DefaultValue("Box")
    CityElement.CityShape defaultBuildingValue();
}
