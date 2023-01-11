package org.visap.generator.metaphors.metropolis.steps;

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

    private CityRepository repository;

    public MetropolisDesigner(CityRepository cityRepository, SourceNodeRepository sourceNodeRepository) {
        repository = cityRepository;

        log.info(
                "*****************************************************************************************************************************************");
        log.info("created");
    }

    public void designRepository() {

        designMetropolisElementsByType(CityElement.CityType.District);

        designMetropolisElementsByType(CityElement.CityType.Building);

        designMetropolisElementsByType(CityElement.CityType.Floor);

    }

    private void designMetropolisElementsByType(CityElement.CityType cityType) {
        log.info("Design " + cityType.name());

        Map<String, AtomicInteger> counterMap = new HashMap<>();

        Collection<CityElement> cityElements = repository.getElementsByType(cityType);
        log.info(cityElements.size() + " " + cityType.name() + " loaded");

        for (CityElement cityElement : cityElements) {

            switch (cityType) {
                case District:
                    designDistrict(cityElement);
                    break;
                case Building:
                    designBuilding(cityElement);
                    break;
                default:
                    designBuilding(cityElement);
                    log.error(cityType.name() + "is not a valid cityType");
                    break;
            }
            countCityElementByType(counterMap, cityElement);
        }

        counterMap.forEach((propertyTypeName, counter) -> {
            log.info(counter + " " + cityType.name() + "s of type " + propertyTypeName + " designed");
        });
    }

    private void countCityElementByType(Map<String, AtomicInteger> counterMap, CityElement cityElement) {

        String propertyTypeName = getPropertyTypeName(cityElement);

        if (!counterMap.containsKey(propertyTypeName)) {
            counterMap.put(propertyTypeName, new AtomicInteger(0));
        }
        AtomicInteger counterValue = counterMap.get(propertyTypeName);
        counterValue.addAndGet(1);
    }

    private String getPropertyTypeName(CityElement cityElement) {
        if (cityElement.getSubType() != null) {
            return cityElement.getSubType().name() + "-ReferenceBuilding";
        }
        return cityElement.getSourceNodeProperty(SAPNodeProperties.type_name);
    }

    private void designDistrict(CityElement district) {

        district.setShape(Config.Visualization.Metropolis.district.shape());

        String propertyTypeName = district.getSourceNodeProperty(SAPNodeProperties.type_name);

        switch (SAPNodeTypes.valueOf(propertyTypeName)) {
            case Namespace:
                district.setColor(Config.Visualization.Metropolis.color.packageDistrict());
                break;
            case Class:
                if (district.getSourceNodeProperty(SAPNodeProperties.local_class).equals("true")) {
                    district.setColor(Config.Visualization.Metropolis.color.localClassDistrict());
                    break;
                } else
                    district.setColor(Config.Visualization.Metropolis.color.classDistrict());
                break;
            case Interface:
                if (district.getSourceNodeProperty(SAPNodeProperties.local_class).equals("true")) {
                    district.setColor(Config.Visualization.Metropolis.color.localInterfaceDistrict());
                    break;
                } else
                    district.setColor(Config.Visualization.Metropolis.color.interfaceDistrict());
                break;
            case Report:
                district.setColor(Config.Visualization.Metropolis.color.reportDistrict());
                break;
            case FunctionGroup:
                district.setColor(Config.Visualization.Metropolis.color.functionGroupDistrict());
                break;
            default:
                district.setColor(Config.Visualization.Metropolis.color.defaultDistrictValue());
                log.error(district.getSubType().name() + " is not a valid type for \"district\"");
                district.setHeight(Config.Visualization.Metropolis.district.districtHeight());
                break;
        }
    }

    private void designBuilding(CityElement building) {
        CityElement.CitySubType refBuildingType = building.getSubType();

        if (building.getSourceNode() == null && refBuildingType == null) {
            return;
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
}
