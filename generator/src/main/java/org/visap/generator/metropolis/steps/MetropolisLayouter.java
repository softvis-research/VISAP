package org.visap.generator.metropolis.steps;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.configuration.Config;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.layouts.ADistrictLightMapLayout;
import org.visap.generator.layouts.ABuildingLayout;
import org.visap.generator.layouts.ADistrictCircularLayout;
import org.visap.generator.layouts.AStackLayout;
import org.visap.generator.repository.ACityElement;
import org.visap.generator.repository.ACityRepository;
import org.visap.generator.repository.SourceNodeRepository;

import java.util.*;

public class MetropolisLayouter {

    private Log log = LogFactory.getLog(this.getClass());

    private SourceNodeRepository nodeRepository;
    private ACityRepository repository;

    public MetropolisLayouter(ACityRepository aCityRepository, SourceNodeRepository sourceNodeRepository) {
        repository = aCityRepository;
        nodeRepository = sourceNodeRepository;

        log.info("*****************************************************************************************************************************************");
        log.info("created");

    }


    public void layoutRepository(){

        //layout buildings
        Collection<ACityElement> buildings = repository.getElementsByType(ACityElement.ACityType.Building);
        log.info(buildings.size() + " buildings loaded");
        layoutBuildings(buildings);

        //layout reference elements
        Collection<ACityElement> referenceElements = repository.getElementsByType(ACityElement.ACityType.Reference);
        log.info(referenceElements.size() + " reference elements loaded");
        layoutReferenceElements(referenceElements);


        //layout districts
        Collection<ACityElement> packageDistricts = repository.getElementsByTypeAndSourceProperty(ACityElement.ACityType.District, SAPNodeProperties.type_name, "Namespace");
        layoutDistrics(packageDistricts);


        //layout cloud elements
        layoutCloudModel();

    }

    private void layoutReferenceElements(Collection<ACityElement> referenceElements) {
        for (ACityElement referenceElement: referenceElements) {
            layoutReference(referenceElement);
        }
    }

    private void layoutBuildings(Collection<ACityElement> buildings) {
        for (ACityElement building: buildings) {
            layoutBuilding(building);
        }
    }

    private void layoutEmptyDistrict( ACityElement district) {
        district.setHeight(config.getMetropolisEmptyDistrictHeight());
        district.setLength(config.getMetropolisEmptyDistrictLength());
        district.setWidth(config.getMetropolisEmptyDistrictWidth());
    }

    private void layoutDistrics(Collection<ACityElement> districtElements) {
        log.info(districtElements.size() + " districts loaded");

        for (ACityElement districtElement : districtElements) {
            layoutDistrict(districtElement);
        }

        layoutVirtualRootDistrict(districtElements);
    }

    private void layoutVirtualRootDistrict(Collection<ACityElement> districts){
        log.info(districts.size() + " districts for virtual root district loaded");

        ACityElement virtualRootDistrict = new ACityElement(ACityElement.ACityType.District);

        if (config.getAbapNotInOrigin_layout() == SettingsConfiguration.NotInOriginLayout.DEFAULT) {

            ADistrictLightMapLayout aDistrictLightMapLayout = new ADistrictLightMapLayout(virtualRootDistrict, districts);
            aDistrictLightMapLayout.calculate();

        } else if (config.getAbapNotInOrigin_layout() == SettingsConfiguration.NotInOriginLayout.CIRCULAR) {

            ADistrictCircluarLayout aDistrictLayout = new ADistrictCircluarLayout(virtualRootDistrict, districts);
            aDistrictLayout.calculate();
        }

    }


    private void layoutBuilding(ACityElement building) {

        Collection<ACityElement> floors = building.getSubElementsOfType(ACityElement.ACityType.Floor);
        Collection<ACityElement> chimneys = building.getSubElementsOfType(ACityElement.ACityType.Chimney);

        ABuildingLayout buildingLayout = new ABuildingLayout(building, floors, chimneys, config);
        buildingLayout.calculate();

        if (floors.size() != 0) {
            log.info(building.getSourceNodeType() + " " + "\"" + building.getSourceNodeProperty(SAPNodeProperties.object_name) + "\"" + " with " + floors.size() + " floors");
        }
        if (chimneys.size() != 0) {
            log.info(building.getSourceNodeType() + " " + "\"" + building.getSourceNodeProperty(SAPNodeProperties.object_name) + "\"" + " with " + chimneys.size() + " chimneys");
        }
    }

    private void layoutCloudModel() {

        Collection<ACityElement> districtsWithFindings = repository.getElementsByTypeAndSourceProperty(ACityElement.ACityType.District, SAPNodeProperties.migration_findings, "true");
        //Collection<ACityElement> buildingsWithFindings = repository.getElementsByTypeAndSourceProperty(ACityElement.ACityType.Building, SAPNodeProperties.migration_findings, "true");

        /*for (ACityElement buildingsWithFinding: buildingsWithFindings) {

            Collection<ACityElement> cloudSubElements = buildingsWithFinding.getSubElements();

            for (ACityElement cloudSubElement : cloudSubElements) {

                if (cloudSubElement.getType().equals(ACityElement.ACityType.Reference) &&
                        cloudSubElement.getSubType().equals(ACityElement.ACitySubType.Cloud)) {

                    cloudSubElement.setWidth(0);
                    cloudSubElement.setLength(0);
                    cloudSubElement.setYPosition(55);

                    ACityElement parent = cloudSubElement.getParentElement();

                    double parentDistrictXPosition = parent.getParentElement().getXPosition();
                    double parentDistrictZPosition = parent.getParentElement().getZPosition();

                    cloudSubElement.setXPosition(parentDistrictXPosition);
                    cloudSubElement.setZPosition(parentDistrictZPosition);

                    cloudSubElement.setWidth(0);
                    cloudSubElement.setLength(0);
                }
            }
        }*/

        for (ACityElement districtWithFinding: districtsWithFindings) {

            Collection<ACityElement> cloudSubElements = districtWithFinding.getSubElements();

            for (ACityElement cloudSubElement : cloudSubElements) {

                if (cloudSubElement.getType().equals(ACityElement.ACityType.Reference) &&
                        cloudSubElement.getSubType().equals(ACityElement.ACitySubType.Cloud)) {

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

    private void layoutDistrict(ACityElement district) {

        if(isDistrictEmpty(district)){
            layoutEmptyDistrict(district);

            log.info("Empty district \"" + district.getSourceNodeProperty(SAPNodeProperties.object_name) + "\" layouted");
        } else {

            Collection<ACityElement> subElements = district.getSubElements();

            //layout sub districts
            for(ACityElement subElement : subElements){
                if (subElement.getType() == ACityElement.ACityType.District) {
                    layoutDistrict(subElement);
                }
            }

            //layout district
            ADistrictLightMapLayout aBAPDistrictLightMapLayout = new ADistrictLightMapLayout(district, subElements);
            aBAPDistrictLightMapLayout.calculate();

            //stack district sub elements
            AStackLayout stackLayout = new AStackLayout(district, subElements);
            stackLayout.calculate();

            log.info("\"" + district.getSourceNodeProperty(SAPNodeProperties.object_name) + "\"" + "-District with " + subElements.size() + " subElements layouted");
        }

    }

    private void layoutReference(ACityElement referenceElement) {
        ACityElement.ACitySubType referenceBuildingType = referenceElement.getSubType();

        switch (referenceBuildingType) {
            case Sea:
                referenceElement.setHeight(Config.Visualization.Metropolis.ReferenceBuilding.sea.height());
                referenceElement.setWidth(Config.Visualization.Metropolis.ReferenceBuilding.sea.width());
                referenceElement.setLength(Config.Visualization.Metropolis.ReferenceBuilding.sea.length());
                referenceElement.setYPosition(referenceElement.getHeight() / 2);
                break;

            case Mountain:
                referenceElement.setHeight(Config.Visualization.Metropolis.ReferenceBuilding.mountain.height());
                referenceElement.setWidth(Config.Visualization.Metropolis.ReferenceBuilding.mountain.length());
                referenceElement.setLength(Config.Visualization.Metropolis.ReferenceBuilding.mountain.width());
                break;

            case Cloud:
                referenceElement.setHeight(Config.Visualization.Metropolis.ReferenceBuilding.cloud.height());
                referenceElement.setWidth(Config.Visualization.Metropolis.ReferenceBuilding.cloud.width());
                referenceElement.setLength(Config.Visualization.Metropolis.ReferenceBuilding.cloud.length());
                break;
        }
    }


    private boolean isDistrictEmpty(ACityElement district){
        Collection<ACityElement> subElements = district.getSubElements();

        boolean isEmpty = true;

        for (ACityElement subElement: subElements) {
            if(!subElement.getType().equals(ACityElement.ACityType.Reference)){
                isEmpty = false;
                break;
            }
        }

        return isEmpty;
    }

}
