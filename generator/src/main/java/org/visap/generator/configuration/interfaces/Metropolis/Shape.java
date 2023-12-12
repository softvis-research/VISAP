package org.visap.generator.configuration.interfaces.Metropolis;

import org.visap.generator.configuration.Sources;
import org.visap.generator.repository.CityElement;

import org.aeonbits.owner.Config;
import org.aeonbits.owner.Config.LoadPolicy;

@LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
    Sources.CONFIG_LOCAL_PATH + "Shape.properties",
    Sources.CONFIG_PATH + "Shape.properties",
})
public interface Shape extends Config {

    @DefaultValue("Cylinder")
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

    CityElement.CityShape defaultBuildingValue();


    // Test
    @DefaultValue("Cylinder")
    CityElement.CityShape tableBuilding();

    @DefaultValue("Cone")
    CityElement.CityShape viewBuilding();

    @DefaultValue("Cylinder")
    CityElement.CityShape structBuilding();

    @DefaultValue("Box")
    CityElement.CityShape dataelementBuilding();

    @DefaultValue("Sphere")
    CityElement.CityShape domainBuilding();

    @DefaultValue("Box")
    CityElement.CityShape road();
}
