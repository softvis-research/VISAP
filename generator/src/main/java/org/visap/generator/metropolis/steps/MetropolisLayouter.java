package org.visap.generator.metropolis.steps;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.configuration.Config;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.layouts.ABuildingLayout;
import org.visap.generator.layouts.DistrictLightMapLayout;
import org.visap.generator.layouts.StackLayout;
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
        // layout buildings
        Collection<ACityElement> buildings = repository.getElementsByType(ACityElement.ACityType.Building);
        log.info(buildings.size() + " buildings loaded");
        layoutBuildings(buildings);

        // layout reference elements
        Collection<ACityElement> referenceElements = repository.getElementsByType(ACityElement.ACityType.Reference);
        log.info(referenceElements.size() + " reference elements loaded");
        layoutReferenceElements(referenceElements);

        // layout districts
        Collection<ACityElement> packageDistricts = repository.getElementsByTypeAndSourceProperty(ACityElement.ACityType.District, SAPNodeProperties.type_name, "Namespace");
        layoutDistricts(packageDistricts);

        // layout cloud elements
        layoutCloudModel();
    }

    private void layoutBuildings(Collection<ACityElement> buildings) {
        for (ACityElement building: buildings) {
            layoutBuilding(building);
        }
    }

    private void layoutReferenceElements(Collection<ACityElement> referenceElements) {
        for (ACityElement referenceElement: referenceElements) {
            layoutReference(referenceElement);
        }
    }

    private void layoutDistricts(Collection<ACityElement> districtElements) {
        log.info(districtElements.size() + " districts loaded");

        for (ACityElement districtElement : districtElements) {
            layoutDistrict(districtElement);
        }

        layoutVirtualRootDistrict(districtElements);
    }

    private void layoutCloudModel() {

        Collection<ACityElement> districtsWithFindings = repository.getElementsByTypeAndSourceProperty(
                ACityElement.ACityType.District, SAPNodeProperties.migration_findings, "true"
        );

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

    private void layoutBuilding(ACityElement building) {
        ABuildingLayout buildingLayout = new ABuildingLayout(building);
        buildingLayout.calculate();
    }

    private void layoutReference(ACityElement referenceElement) {
        ACityElement.ACitySubType referenceBuildingType = referenceElement.getSubType();

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

    private void layoutVirtualRootDistrict(Collection<ACityElement> districts){
        log.info(districts.size() + " districts for virtual root district loaded");

        ACityElement virtualRootDistrict = new ACityElement(ACityElement.ACityType.District);

        DistrictLightMapLayout aDistrictLightMapLayout = new DistrictLightMapLayout(virtualRootDistrict, districts);
        aDistrictLightMapLayout.calculate();
    }

    private void layoutDistrict(ACityElement district) {
        if(isDistrictEmpty(district)){
            layoutEmptyDistrict(district);

            log.info("Empty district \"" + district.getSourceNodeProperty(SAPNodeProperties.object_name) + "\" layouted");
        } else {

            Collection<ACityElement> subElements = district.getSubElements();

            // layout sub districts
            for(ACityElement subElement : subElements){
                if (subElement.getType() == ACityElement.ACityType.District) {
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

    private void layoutEmptyDistrict( ACityElement district) {
        district.setHeight(Config.Visualization.Metropolis.district.emptyDistrictHeight());
        district.setLength(Config.Visualization.Metropolis.district.emptyDistrictLength());
        district.setWidth(Config.Visualization.Metropolis.district.emptyDistrictWidth());
    }
}
