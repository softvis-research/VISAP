package org.visap.generator.metropolis.steps;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.configuration.Config;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.layouts.BuildingLayout;
import org.visap.generator.layouts.DistrictCircularLayout;
import org.visap.generator.layouts.DistrictLightMapLayout;
import org.visap.generator.layouts.StackLayout;
import org.visap.generator.layouts.enums.LayoutType;
import org.visap.generator.repository.CityElement;
import org.visap.generator.repository.CityRepository;
import org.visap.generator.repository.SourceNodeRepository;

import java.util.*;

public class MetropolisLayouter {
    private Log log = LogFactory.getLog(this.getClass());

    private CityRepository repository;

    public MetropolisLayouter(CityRepository cityRepository, SourceNodeRepository sourceNodeRepository) {
        repository = cityRepository;

        log.info("*****************************************************************************************************************************************");
        log.info("created");
    }

    public void layoutRepository(){
        // layout buildings
        Collection<CityElement> buildings = repository.getElementsByType(CityElement.CityType.Building);
        log.info(buildings.size() + " buildings loaded");
        layoutBuildings(buildings);

        // layout districts
        Collection<CityElement> packageDistricts = repository.getElementsByTypeAndSourceProperty(CityElement.CityType.District, SAPNodeProperties.type_name, "Namespace");
        layoutDistricts(packageDistricts);

    }

    private void layoutBuildings(Collection<CityElement> buildings) {
        for (CityElement building: buildings) {
            layoutBuilding(building);
        }
    }

    private void layoutDistricts(Collection<CityElement> districtElements) {
        log.info(districtElements.size() + " districts loaded");

        for (CityElement districtElement : districtElements) {
            layoutDistrict(districtElement);
        }

        layoutVirtualRootDistrict(districtElements);
    }

    private void layoutBuilding(CityElement building) {
        BuildingLayout buildingLayout = new BuildingLayout(building);
        buildingLayout.calculate();
    }

    private void layoutVirtualRootDistrict(Collection<CityElement> districts){
        log.info(districts.size() + " districts for virtual root district loaded");

        CityElement virtualRootDistrict = new CityElement(CityElement.CityType.District);

        if (Config.Visualization.Metropolis.district.layoutType() == LayoutType.CIRCULAR) {
            DistrictCircularLayout districtCircularLayout = new DistrictCircularLayout(virtualRootDistrict, districts);
            districtCircularLayout.calculate();
        } else {
            DistrictLightMapLayout districtLightMapLayout = new DistrictLightMapLayout(virtualRootDistrict, districts);
            districtLightMapLayout.calculate();
        }
    }

    private void layoutDistrict(CityElement district) {
        if(isDistrictEmpty(district)){
            layoutEmptyDistrict(district);

            log.info("Empty district \"" + district.getSourceNodeProperty(SAPNodeProperties.object_name) + "\" layouted");
        } else {

            Collection<CityElement> subElements = district.getSubElements();

            // layout sub districts
            for(CityElement subElement : subElements){
                if (subElement.getType() == CityElement.CityType.District) {
                    layoutDistrict(subElement);
                }
            }

            // layout district
            DistrictLightMapLayout districtLightMapLayout = new DistrictLightMapLayout(district, subElements);
            districtLightMapLayout.calculate();

            // stack district sub elements
            StackLayout stackLayout = new StackLayout(district, subElements);
            stackLayout.calculate();

            log.info("\"" + district.getSourceNodeProperty(SAPNodeProperties.object_name) + "\"" + "-District with " + subElements.size() + " subElements layouted");
        }
    }

    private boolean isDistrictEmpty(CityElement district){
        Collection<CityElement> subElements = district.getSubElements();

        boolean isEmpty = true;

        for (CityElement subElement: subElements) {
                isEmpty = false;
                break;
        }

        return isEmpty;
    }

    private void layoutEmptyDistrict( CityElement district) {
        district.setHeight(Config.Visualization.Metropolis.district.emptyDistrictHeight());
        district.setLength(Config.Visualization.Metropolis.district.emptyDistrictLength());
        district.setWidth(Config.Visualization.Metropolis.district.emptyDistrictWidth());
    }
}
