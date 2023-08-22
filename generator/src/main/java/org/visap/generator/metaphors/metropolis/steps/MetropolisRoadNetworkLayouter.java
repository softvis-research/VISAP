package org.visap.generator.metaphors.metropolis.steps;

import java.util.HashMap;
import java.util.List;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.configuration.Config;
import org.visap.generator.metaphors.metropolis.layouts.DistrictRoadNetwork;
import org.visap.generator.repository.CityReferenceMapper;
import org.visap.generator.repository.CityRepository;
import org.visap.generator.repository.CityElement;
import org.visap.generator.repository.CityElement.CityType;
import org.visap.generator.repository.SourceNodeRepository;

public class MetropolisRoadNetworkLayouter {

    private Log log = LogFactory.getLog(this.getClass());

    private SourceNodeRepository nodeRepository;
    private CityRepository repository;

    public MetropolisRoadNetworkLayouter(CityRepository aCityRepository, SourceNodeRepository sourceNodeRepository) {
        this.repository = aCityRepository;
        this.nodeRepository = sourceNodeRepository;

        log.info("*****************************************************************************************************************************************");
        log.info("created");
    }

    public void createRoadNetworks() {
        CityReferenceMapper referenceMapper = new CityReferenceMapper(nodeRepository, repository);

        CityElement virtualRootDistrict = createVirtualRootDistrict();
        DistrictRoadNetwork rootRoadNetwork = new DistrictRoadNetwork(virtualRootDistrict, new HashMap<>(), referenceMapper);
        List<CityElement> mainRoads = rootRoadNetwork.calculate2();

        for (CityElement mainRoad : mainRoads) {
            repository.addElement(mainRoad);
        }


        for (CityElement namespaceDistrict : repository.getNamespaceDistrictsOfOriginSet()) {
            DistrictRoadNetwork roadNetwork = new DistrictRoadNetwork(namespaceDistrict, rootRoadNetwork.getSubElementConnectors(namespaceDistrict), referenceMapper);
            List<CityElement> roads = roadNetwork.calculate2();

            for (CityElement road : roads) {
                repository.addElement(road);
            }
        }
    }

    private CityElement createVirtualRootDistrict() {
        // virtual root district comprises all namespace districts of the origin set
        CityElement virtualRootDistrict = new CityElement(CityType.District);

        for (CityElement namespaceDistrict : repository.getNamespaceDistrictsOfOriginSet()) {
            virtualRootDistrict.addSubElement(namespaceDistrict);
        }

        double minX = Double.POSITIVE_INFINITY,
                maxX = Double.NEGATIVE_INFINITY,
                minY = Double.POSITIVE_INFINITY,
                maxY = Double.NEGATIVE_INFINITY;

        var districts = repository.getNamespaceDistrictsOfOriginSet();

        // determine corner points of virtual root district
        for (CityElement namespaceDistrict : districts) {

            double rightX = namespaceDistrict.getXPosition() + namespaceDistrict.getWidth() / 2.0;
            double leftX = namespaceDistrict.getXPosition() - namespaceDistrict.getWidth() / 2.0;
            double upperY = namespaceDistrict.getZPosition() + namespaceDistrict.getLength() / 2.0;
            double lowerY = namespaceDistrict.getZPosition() - namespaceDistrict.getLength() / 2.0;

            if (leftX < minX) {
                minX = leftX;
            }

            if (lowerY < minY) {
                minY = lowerY;
            }

            if (maxX < rightX) {
                maxX = rightX;
            }

            if (maxY < upperY) {
                maxY = upperY;
            }

        }

        virtualRootDistrict.setXPosition((maxX + minX) / 2.0);
        virtualRootDistrict.setYPosition(0);
        virtualRootDistrict.setZPosition((maxY + minY) / 2.0);

        virtualRootDistrict.setWidth(maxX + minX
                                        + Config.Visualization.Metropolis.district.horizontalDistrictGap()
                                        + 2 * Config.Visualization.Metropolis.district.horizontalDistrictMargin());
        virtualRootDistrict.setLength(maxY + minY
                                        + Config.Visualization.Metropolis.district.horizontalDistrictGap()
                                        + 2 * Config.Visualization.Metropolis.district.horizontalDistrictMargin());
        virtualRootDistrict.setHeight(0.0);

        return virtualRootDistrict;
    }
}