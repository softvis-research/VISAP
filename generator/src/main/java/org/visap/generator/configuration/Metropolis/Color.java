package org.visap.generator.configuration.Metropolis;

import org.aeonbits.owner.Config;

@Config.Sources("file:${user.dir}/src/main/java/properties/metropolis/designer/Color.properties")
public interface Color extends Config {
     @DefaultValue("#FF8C00")
     String migrationElement();
     @DefaultValue("#95A5A6")
     String packageDistrict();
     @DefaultValue("#C5CEA9")
     String classDistrict();
     @DefaultValue("#C5CEA9")
     String localClassDistrict();
     @DefaultValue("#C5CEA9")
     String interfaceDistrict();
     @DefaultValue("#C5CEA9")
     String localInterfaceDistrict();
     @DefaultValue("#C5CEA9")
     String reportDistrict();
     @DefaultValue("#C5CEA9")
     String functionGroupDistrict();
     @DefaultValue("#C5CEA9")
     String tableDistrict();
     @DefaultValue("#C5CEA9")
     String structureDistrict();
     @DefaultValue("#C5CEA9")
     String dataElementDistrict();
     @DefaultValue("#FFFFFF")
     String defaultDistrictValue();

     @DefaultValue("#C5CEA9")
     String attributeBuilding();
     @DefaultValue("#C5CEA9")
     String interfaceBuilding();
     @DefaultValue("#C5CEA9")
     String methodBuilding();
     @DefaultValue("#C5CEA9")
     String reportBuilding();
     @DefaultValue("#C5CEA9")
     String formRoutineBuilding();
     @DefaultValue("#3FF493")
     String functionModuleBuilding();
     @DefaultValue("#C5CEA9")
     String tableBuilding();
     @DefaultValue("#C5CEA9")
     String dataElementBuilding();
     @DefaultValue("#C5CEA9")
     String domainBuilding();
     @DefaultValue("#C5CEA9")
     String structureBuilding();
     @DefaultValue("#C5CEA9")
     String tableTypeBuilding();

     @DefaultValue("#C5CEA9")
     String seaReferenceBuilding();
     @DefaultValue("#C5CEA9")
     String mountainReferenceBuilding();

     @DefaultValue("#FFFFFF")
     String defaultBuildingValue();
}
