package org.visap.generator.metropolis.steps;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.configuration.Config;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.layouts.ABuildingLayout;
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

        // layout cloud elements
        layoutCloudModel();
    }

    private void layoutBuildings(Collection<ACityElement> buildings) {
        for (ACityElement building: buildings) {
            layoutBuilding(building);
        }
    }

    private void layoutBuilding(ACityElement building) {
        ABuildingLayout buildingLayout = new ABuildingLayout(building);
        buildingLayout.calculate();
    }

    private void layoutReferenceElements(Collection<ACityElement> referenceElements) {
        for (ACityElement referenceElement: referenceElements) {
            layoutReference(referenceElement);
        }
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
}
