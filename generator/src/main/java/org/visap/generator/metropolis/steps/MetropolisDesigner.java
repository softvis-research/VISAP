package org.visap.generator.metropolis.steps;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.configuration.Config;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.abap.enums.SAPNodeTypes;
import org.visap.generator.repository.CityElement;
import org.visap.generator.repository.CityRepository;
import org.visap.generator.repository.SourceNodeRepository;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

public class MetropolisDesigner {

    private Log log = LogFactory.getLog(this.getClass());

    private SourceNodeRepository nodeRepository;
    private CityRepository repository;

    public MetropolisDesigner(CityRepository cityRepository, SourceNodeRepository sourceNodeRepository) {
        repository = cityRepository;
        nodeRepository = sourceNodeRepository;

        log.info("*****************************************************************************************************************************************");
        log.info("created");
    }


    public void designRepository(){

        designMetropolisElementsByType(CityElement.CityType.District);

        designMetropolisElementsByType(CityElement.CityType.Building);

        designMetropolisElementsByType(CityElement.CityType.Reference);

        designMetropolisElementsByType(CityElement.CityType.Floor);

    }

    private void designMetropolisElementsByMigrationFindings() {

        Collection<CityElement> migrationElements = repository.getElementsBySourceProperty(SAPNodeProperties.migration_findings, "true");

        for ( CityElement migrationElement: migrationElements) {

            if (!migrationElement.getSourceNodeType().equals(SAPNodeTypes.Namespace.name())) {
                migrationElement.setColor(Config.Visualization.Metropolis.color.migrationElement());

                String typeParent = String.valueOf(migrationElement.getParentElement().getSourceNodeType());
                if(typeParent.equals(SAPNodeTypes.Report.name())){
                    migrationElement.getParentElement().setColor("#FF8C00");
                }
            }
        }
    }

    private void designMetropolisElementsByType(CityElement.CityType cityType){
        log.info("Design " + cityType.name());

        Map<String, AtomicInteger> counterMap = new HashMap<>();

        Collection<CityElement> cityElements = repository.getElementsByType(cityType);
        log.info(cityElements.size() + " " + cityType.name() + " loaded");

        for (CityElement cityElement: cityElements) {

            switch (cityType) {
                case District: designDistrict(cityElement); break;
                case Building: designBuilding(cityElement); break;
                case Reference: designReference(cityElement); break;
                default:
                    designBuilding(cityElement);
                    log.error(cityType.name() + "is not a valid cityType");
                    break;
            }
            countCityElementByType(counterMap, cityElement);
        }

        counterMap.forEach( (propertyTypeName, counter) -> {
            log.info(counter + " " + cityType.name() + "s of type " + propertyTypeName + " designed" );
        });
    }



    private void countCityElementByType(Map<String, AtomicInteger> counterMap, CityElement cityElement){

        String propertyTypeName = getPropertyTypeName(cityElement);

        if(!counterMap.containsKey(propertyTypeName)){
            counterMap.put(propertyTypeName, new AtomicInteger(0));
        }
        AtomicInteger counterValue = counterMap.get(propertyTypeName);
        counterValue.addAndGet(1);
    }

    private String getPropertyTypeName(CityElement cityElement){
        if(cityElement.getSubType() != null){
            return cityElement.getSubType().name() + "-ReferenceBuilding";
        }
        return cityElement.getSourceNodeProperty(SAPNodeProperties.type_name);
    }


    private void designDistrict(CityElement district) {

        district.setShape(Config.Visualization.Metropolis.district.shape());

        String propertyTypeName = district.getSourceNodeProperty(SAPNodeProperties.type_name);

        switch (SAPNodeTypes.valueOf(propertyTypeName)) {
            case Namespace:     district.setColor(Config.Visualization.Metropolis.color.packageDistrict());
                break;
            case Class:
                if(district.getSourceNodeProperty(SAPNodeProperties.local_class).equals("true")) {
                    district.setColor(Config.Visualization.Metropolis.color.localClassDistrict()); break;
                } else
                    district.setColor(Config.Visualization.Metropolis.color.classDistrict()); break;
            case Interface:
                if(district.getSourceNodeProperty(SAPNodeProperties.local_class).equals("true")) {
                    district.setColor(Config.Visualization.Metropolis.color.localInterfaceDistrict()); break;
                } else
                    district.setColor(Config.Visualization.Metropolis.color.interfaceDistrict()); break;
            case Report:        district.setColor(Config.Visualization.Metropolis.color.reportDistrict());
                break;
            case FunctionGroup: district.setColor(Config.Visualization.Metropolis.color.functionGroupDistrict());
                break;
            case Table:
            case TableType:     district.setColor(Config.Visualization.Metropolis.color.tableDistrict());
                district.setHeight(Config.Visualization.Metropolis.district.districtHeight()); break;
            case Structure:     district.setColor(Config.Visualization.Metropolis.color.structureDistrict());
                district.setHeight(Config.Visualization.Metropolis.district.districtHeight()); break;
            case DataElement:   district.setColor(Config.Visualization.Metropolis.color.dataElementDistrict());
                district.setHeight(Config.Visualization.Metropolis.district.districtHeight()); break;
            default:            district.setColor(Config.Visualization.Metropolis.color.defaultDistrictValue());
                log.error(district.getSubType().name() + " is not a valid type for \"district\"");
                district.setHeight(Config.Visualization.Metropolis.district.districtHeight()); break;
        }
    }

    private void designBuilding(CityElement building) {
        CityElement.CitySubType refBuildingType = building.getSubType();

        if (building.getSourceNode() == null && refBuildingType == null) {
            return;
        } else if ( refBuildingType != null) {
            switch (refBuildingType) {
                case Sea:
                    building.setColor(Config.Visualization.Metropolis.color.seaReferenceBuilding());
                    building.setShape(CityElement.CityShape.Circle);
                    building.setTextureSource("#sea");
                    building.setRotation(Config.Visualization.Metropolis.building.rotation());
                    building.setWidth(building.getWidth() - Config.Visualization.Metropolis.building.adjustWidth());
                    building.setLength(building.getLength() - Config.Visualization.Metropolis.building.adjustLength());
                    break;
                case Mountain:
                    building.setColor(Config.Visualization.Metropolis.color.mountainReferenceBuilding());
                    building.setShape(CityElement.CityShape.Entity);
                    building.setModel(Config.Visualization.Metropolis.model.mountainModel());
                    building.setModelScale(Config.Visualization.Metropolis.model.mountainScale());
                    building.setWidth(building.getWidth() - Config.Visualization.Metropolis.building.adjustWidth());
                    building.setLength(building.getLength() - Config.Visualization.Metropolis.building.adjustLength());
                    break;
                case Cloud:
                    building.setShape(CityElement.CityShape.Entity);
                    building.setModel(Config.Visualization.Metropolis.model.cloudModel());
                    building.setModelScale(Config.Visualization.Metropolis.model.cloudScale());
                    building.setYPosition(55);
                    break;
            }
        } else {

            String propertyTypeName = building.getSourceNodeProperty(SAPNodeProperties.type_name);

            switch (SAPNodeTypes.valueOf(propertyTypeName)) {

                case Interface:
                    building.setColor(Config.Visualization.Metropolis.color.interfaceBuilding());
                    building.setShape(Config.Visualization.Metropolis.shape.interfaceBuilding());
                    building.setWidth(building.getWidth() - Config.Visualization.Metropolis.building.adjustWidth());
                    building.setLength(building.getLength() - Config.Visualization.Metropolis.building.adjustLength());
                    break;
                case Method:
                    building.setColor(Config.Visualization.Metropolis.color.methodBuilding());
                    building.setShape(Config.Visualization.Metropolis.shape.methodBuilding());
                    building.setWidth(building.getWidth() - Config.Visualization.Metropolis.building.adjustWidth());
                    building.setLength(building.getLength() - Config.Visualization.Metropolis.building.adjustLength());
                    break;
                case Report:
                    building.setColor(Config.Visualization.Metropolis.color.reportBuilding());
                    building.setShape(Config.Visualization.Metropolis.shape.reportBuilding());
                    building.setWidth(building.getWidth() - Config.Visualization.Metropolis.building.adjustWidth());
                    building.setLength(building.getLength() - Config.Visualization.Metropolis.building.adjustLength());
                    break;
                case FormRoutine:
                    building.setColor(Config.Visualization.Metropolis.color.formRoutineBuilding());
                    building.setShape(Config.Visualization.Metropolis.shape.formRoutineBuilding());
                    building.setWidth(building.getWidth() - Config.Visualization.Metropolis.building.adjustWidth());
                    building.setLength(building.getLength() - Config.Visualization.Metropolis.building.adjustLength());
                    break;
                case Attribute:
                    building.setColor(Config.Visualization.Metropolis.color.attributeBuilding());
                    building.setShape(Config.Visualization.Metropolis.shape.attributeBuilding());
                    building.setWidth(building.getWidth() - Config.Visualization.Metropolis.building.adjustWidth());
                    building.setLength(building.getLength() - Config.Visualization.Metropolis.building.adjustLength());
                    break;
                case FunctionModule:
                    building.setColor(Config.Visualization.Metropolis.color.functionModuleBuilding());
                    building.setShape(Config.Visualization.Metropolis.shape.functionModuleBuilding());
                    building.setWidth(building.getWidth() - Config.Visualization.Metropolis.building.adjustWidth());
                    building.setLength(building.getLength() - Config.Visualization.Metropolis.building.adjustLength());
                    break;
                case Table:
                    building.setColor(Config.Visualization.Metropolis.color.tableBuilding());
                    building.setShape(Config.Visualization.Metropolis.shape.tableBuilding());
                    building.setWidth(building.getWidth() - Config.Visualization.Metropolis.building.adjustWidth());
                    building.setLength(building.getLength() - Config.Visualization.Metropolis.building.adjustLength());
                    break;
                case DataElement:
                    building.setColor(Config.Visualization.Metropolis.color.dataElementBuilding());
                    building.setShape(Config.Visualization.Metropolis.shape.dataElementBuilding());
                    building.setWidth(building.getWidth() - Config.Visualization.Metropolis.building.adjustWidth());
                    building.setLength(building.getLength() - Config.Visualization.Metropolis.building.adjustLength());
                    break;
                case Domain:
                    building.setColor(Config.Visualization.Metropolis.color.domainBuilding());
                    building.setShape(Config.Visualization.Metropolis.shape.domainBuilding());
                    building.setWidth(building.getWidth() - Config.Visualization.Metropolis.building.adjustWidth());
                    building.setLength(building.getLength() - Config.Visualization.Metropolis.building.adjustLength());
                    break;
                case StructureElement:
                    building.setColor(Config.Visualization.Metropolis.color.structureBuilding());
                    building.setShape(Config.Visualization.Metropolis.shape.structureBuilding());
                    building.setWidth(Config.Visualization.Metropolis.building.structureBuildingWidth());
                    building.setLength(Config.Visualization.Metropolis.building.structureBuildingLength());
                    break;
                case TableType:
                    building.setColor(Config.Visualization.Metropolis.color.tableTypeBuilding());
                    building.setShape(Config.Visualization.Metropolis.shape.tableTypeBuilding());
                    building.setWidth(Config.Visualization.Metropolis.building.tableTypeBuildingWidth());
                    building.setLength(Config.Visualization.Metropolis.building.tableTypeBuildingLength());
                    break;
                default:
                    building.setColor(Config.Visualization.Metropolis.color.defaultBuildingValue());
                    building.setShape(Config.Visualization.Metropolis.shape.defaultBuildingValue());
                    building.setWidth(Config.Visualization.Metropolis.building.defaultBuildingWidth());
                    building.setLength(Config.Visualization.Metropolis.building.defaultBuildingLength());
                    log.error(propertyTypeName + " is not a valid type for \"building\"");
                    break;
            }
        }
    }

    private void designReference(CityElement building) {

        CityElement.CitySubType refBuildingType = building.getSubType();

        if (building.getSourceNode() == null && refBuildingType == null) {
            return;
        } else if ( refBuildingType != null) {
            switch (refBuildingType) {
                case Sea:
                    building.setColor(Config.Visualization.Metropolis.color.seaReferenceBuilding());
                    building.setShape(CityElement.CityShape.Circle);
                    building.setTextureSource("#sea");
                    building.setRotation(Config.Visualization.Metropolis.building.rotation());
                    building.setWidth(building.getWidth() - Config.Visualization.Metropolis.building.adjustWidth());
                    building.setLength(building.getLength() - Config.Visualization.Metropolis.building.adjustLength());
                    break;
                case Mountain:
                    building.setColor(Config.Visualization.Metropolis.color.mountainReferenceBuilding());
                    building.setShape(CityElement.CityShape.Entity);
                    building.setModel(Config.Visualization.Metropolis.model.mountainModel());
                    building.setModelScale(Config.Visualization.Metropolis.model.mountainScale());
                    building.setWidth(building.getWidth() - Config.Visualization.Metropolis.building.adjustWidth());
                    building.setLength(building.getLength() - Config.Visualization.Metropolis.building.adjustLength());
                    building.setYPosition(building.getYPosition() + Config.Visualization.Metropolis.building.adjustReferenceYPosition());
                    break;
                case Cloud:
                    building.setShape(CityElement.CityShape.Entity);
                    building.setModel(Config.Visualization.Metropolis.model.cloudModel());
                    building.setModelScale(Config.Visualization.Metropolis.model.cloudScale());
                    building.setYPosition(55);
                    break;
            }
        }
    }
}

