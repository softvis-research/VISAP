package org.visap.generator.configuration.Metropolis;

import org.aeonbits.owner.Config;
import org.aeonbits.owner.Config.LoadPolicy;

@LoadPolicy(Config.LoadType.MERGE)
@Config.Sources({
    "file:${user.dir}/properties/local/Color.properties",
    "file:${user.dir}/properties/Color.properties",
})
public interface Color extends Config {
     @DefaultValue("#FF8C00")
     String migrationElement();

     @DefaultValue("#95A5A6")
     String packageDistrict();

     @DefaultValue("#F4D93F")
     String classDistrict();

     @DefaultValue("#ffe7a3")
     String localClassDistrict();

     @DefaultValue("#B80437")
     String interfaceDistrict();

     @DefaultValue("#e79394")
     String localInterfaceDistrict();

     @DefaultValue("#85C1E9")
     String reportDistrict();

     @DefaultValue("#7D3C98")
     String functionGroupDistrict();

     @DefaultValue("#C5CEA9")
     String defaultDistrictValue();

     @DefaultValue("#000000")
     String attributeBuilding();

     @DefaultValue("#b80437")
     String interfaceBuilding();

     @DefaultValue("#FFFFFF")
     String methodBuilding();

     @DefaultValue("#335b9C")
     String reportBuilding();

     @DefaultValue("#FFFFFF")
     String formRoutineBuilding();

     @DefaultValue("#FFFFFF")
     String functionModuleBuilding();

     @DefaultValue("#FFFFFF")
     String defaultBuildingValue();


     // Test
     @DefaultValue("#229954")
     String ddicDistrict();
     @DefaultValue("#1A5276")
     String tableDistrict();
     @DefaultValue("#FCFAFA")
     String tableBuilding();
     @DefaultValue("#8AB8E6")
     String viewBuilding();
     @DefaultValue("#0E573B")
     String domainBuilding();
     @DefaultValue("#FCFAFA")
     String structBuilding();
     @DefaultValue("#1E8449")
     String dataelementBuilding();
     @DefaultValue("#000000")
     String road();

}
