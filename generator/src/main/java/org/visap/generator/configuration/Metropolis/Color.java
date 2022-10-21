package org.visap.generator.configuration.Metropolis;

import org.aeonbits.owner.Config;

@Config.Sources("file:${user.dir}/src/main/java/properties/metropolis/designer/Color.properties")
public interface Color extends Config {
     String migrationElement();
     String packageDistrict();
     String classDistrict();
     String localClassDistrict();
     String interfaceDistrict();
     String localInterfaceDistrict();
     String reportDistrict();
     String functionGroupDistrict();
     String tableDistrict();
     String structureDistrict();
     String dataElementDistrict();
     String defaultDistrictValue();

     String attributeBuilding();
     String interfaceBuilding();
     String methodBuilding();
     String reportBuilding();
     String formRoutineBuilding();
     String functionModuleBuilding();
     String tableBuilding();
     String dataElementBuilding();
     String domainBuilding();
     String structureBuilding();
     String tableTypeBuilding();

     String seaReferenceBuilding();
     String mountainReferenceBuilding();

     String defaultBuildingValue();
}
