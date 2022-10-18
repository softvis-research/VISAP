package org.visap.generator.metropolis.steps;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.configuration.Config;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.layouts.BuildingLayout;
import org.visap.generator.layouts.DistrictLightMapLayout;
import org.visap.generator.layouts.StackLayout;
import org.visap.generator.repository.CityElement;
import org.visap.generator.repository.CityRepository;
import org.visap.generator.repository.SourceNodeRepository;

import java.util.*;

public class MetropolisLayouter {

    private Log log = LogFactory.getLog(this.getClass());

    private SourceNodeRepository nodeRepository;
    private CityRepository repository;

    public MetropolisLayouter(CityRepository cityRepository, SourceNodeRepository sourceNodeRepository) {
        repository = cityRepository;
        nodeRepository = sourceNodeRepository;

        log.info("*****************************************************************************************************************************************");
        log.info("created");
    }

    public void layoutRepository(){
        // layout buildings
        Collection<CityElement> buildings = repository.getElementsByType(CityElement.CityType.Building);
        log.info(buildings.size() + " buildings loaded");
        layoutBuildings(buildings);

        // layout reference elements
        Collection<CityElement> referenceElements = repository.getElementsByType(CityElement.CityType.Reference);
        log.info(referenceElements.size() + " reference elements loaded");
        layoutReferenceElements(referenceElements);

        // layout districts
        Collection<CityElement> packageDistricts = repository.getElementsByTypeAndSourceProperty(CityElement.CityType.District, SAPNodeProperties.type_name, "Namespace");
        layoutDistricts(packageDistricts);

        // layout cloud elements
        layoutCloudModel();
    }

    private void layoutBuildings(Collection<CityElement> buildings) {
        for (CityElement building: buildings) {
            layoutBuilding(building);
        }
    }

    private void layoutReferenceElements(Collection<CityElement> referenceElements) {
        for (CityElement referenceElement: referenceElements) {
            layoutReference(referenceElement);
        }
    }

    private void layoutDistricts(Collection<CityElement> districtElements) {
        log.info(districtElements.size() + " districts loaded");

        for (CityElement districtElement : districtElements) {
            layoutDistrict(districtElement);
        }

        layoutVirtualRootDistrict(districtElements);
    }

    private void layoutCloudModel() {

        Collection<CityElement> districtsWithFindings = repository.getElementsByTypeAndSourceProperty(
                CityElement.CityType.District, SAPNodeProperties.migration_findings, "true"
        );

        for (CityElement districtWithFinding: districtsWithFindings) {

            Collection<CityElement> cloudSubElements = districtWithFinding.getSubElements();

            for (CityElement cloudSubElement : cloudSubElements) {

                if (cloudSubElement.getType().equals(CityElement.CityType.Reference) &&
                        cloudSubElement.getSubType().equals(CityElement.CitySubType.Cloud)) {

                    cloudSubElement.setWidth(0);
                    cloudSubElement.setLength(0);
                    cloudSubElement.setYPosition(55);

                    double parentDistrictXPosition = cloudSubElement.getParentElement().getXPosition();
                    double parentDistrictZPosition = cloudSubElement.getParentElement().getZPosition();

                    cloudSubElement.setXPosition(parentDistrictXPosition);
                    cloudSubElement.setZPosition(parentDistrictZPosition);

                    cloudSubElement.setWidth(0);
                    cloudSubElement.setLength(0);
                }
            }
        }
    }

    private void layoutBuilding(CityElement building) {
        BuildingLayout buildingLayout = new BuildingLayout(building);
        buildingLayout.calculate();
    }

    private void layoutReference(CityElement referenceElement) {
        CityElement.CitySubType referenceBuildingType = referenceElement.getSubType();

        switch (referenceBuildingType) {
            case Sea:
                referenceElement.setHeight(Config.Visualization.Metropolis.ReferenceBuilding.height.sea());
                referenceElement.setWidth(Config.Visualization.Metropolis.ReferenceBuilding.width.sea());
                referenceElement.setLength(Config.Visualization.Metropolis.ReferenceBuilding.length.sea());
                referenceElement.setYPosition(referenceElement.getHeight() / 2);
                break;

            case Mountain:
                referenceElement.setHeight(Config.Visualization.Metropolis.ReferenceBuilding.height.mountain());
                referenceElement.setWidth(Config.Visualization.Metropolis.ReferenceBuilding.width.mountain());
                referenceElement.setLength(Config.Visualization.Metropolis.ReferenceBuilding.length.mountain());
                break;

            case Cloud:
                referenceElement.setHeight(Config.Visualization.Metropolis.ReferenceBuilding.height.cloud());
                referenceElement.setWidth(Config.Visualization.Metropolis.ReferenceBuilding.width.cloud());
                referenceElement.setLength(Config.Visualization.Metropolis.ReferenceBuilding.length.cloud());
                break;
        }
    }

    private void layoutVirtualRootDistrict(Collection<CityElement> districts){
        log.info(districts.size() + " districts for virtual root district loaded");

        CityElement virtualRootDistrict = new CityElement(CityElement.CityType.District);

        DistrictLightMapLayout aDistrictLightMapLayout = new DistrictLightMapLayout(virtualRootDistrict, districts);
        aDistrictLightMapLayout.calculate();
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
            if(!subElement.getType().equals(CityElement.CityType.Reference)){
                isEmpty = false;
                break;
            }
        }

        return isEmpty;
    }

    private void layoutEmptyDistrict( CityElement district) {
        district.setHeight(Config.Visualization.Metropolis.district.emptyDistrictHeight());
        district.setLength(Config.Visualization.Metropolis.district.emptyDistrictLength());
        district.setWidth(Config.Visualization.Metropolis.district.emptyDistrictWidth());
    }
}
