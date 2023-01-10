package org.visap.generator.configuration.Metropolis;

import org.aeonbits.owner.Config;

@Config.Sources("file:${user.dir}/properties/metropolis/Color.properties")
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
     @DefaultValue("#FFFFFF")
     String defaultBuildingValue();
}
