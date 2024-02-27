package org.visap.generator.metaphors.metropolis.steps;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.configuration.Config;
import org.visap.generator.metaphors.metropolis.layouts.DistrictRoadNetwork;
import org.visap.generator.metaphors.metropolis.layouts.road.network.Road;
import org.visap.generator.metaphors.metropolis.layouts.road.network.RoadNode;
import org.visap.generator.repository.CityElement;
import org.visap.generator.repository.CityElement.CitySubType;
import org.visap.generator.repository.CityElement.CityType;
import org.visap.generator.repository.CityReferenceMapper;
import org.visap.generator.repository.CityRepository;
import org.visap.generator.repository.SourceNodeRepository;

public class MetropolisRoadNetworkLayouter {
    private Log log = LogFactory.getLog(this.getClass());

    private SourceNodeRepository nodeRepository;
    private CityRepository repository;
    private CityReferenceMapper referenceMapper;

    public List<Road> mainRoads = new ArrayList<Road>();
    public List<Road> subRoads = new ArrayList<Road>();

    private static final double districtHeight = Config.Visualization.Metropolis.district.districtHeight();
    private static final double roadHeight = Config.Visualization.Metropolis.roadNetwork.roadHeight();

    public MetropolisRoadNetworkLayouter(CityRepository aCityRepository, SourceNodeRepository sourceNodeRepository) {
        this.repository = aCityRepository;
        this.nodeRepository = sourceNodeRepository;

        log.info("*****************************************************************************************************************************************");
        log.info("created");
    }

    public void createRoadNetworks() {
        this.referenceMapper = new CityReferenceMapper(nodeRepository, repository);

        CityElement virtualRootDistrict = createVirtualRootDistrict();
        DistrictRoadNetwork rootRoadNetwork = new DistrictRoadNetwork(virtualRootDistrict, new HashMap<>(), this.referenceMapper);
        this.mainRoads.addAll(rootRoadNetwork.calculate());

        for (CityElement roadSection : extractRoadSections(mainRoads, virtualRootDistrict)) {
            repository.addElement(roadSection);
        }

        for (CityElement namespaceDistrict : repository.getNamespaceDistrictsOfOriginSet()) {
            DistrictRoadNetwork roadNetwork = new DistrictRoadNetwork(namespaceDistrict, rootRoadNetwork.getSubElementConnectors(namespaceDistrict), this.referenceMapper);
            List<Road> roadsOnDistrict = roadNetwork.calculate();
            this.subRoads.addAll(roadsOnDistrict);

            for (CityElement roadSection : extractRoadSections(roadsOnDistrict, virtualRootDistrict)) {
                repository.addElement(roadSection);
            }
        }
    }

    public List<Road> getMainRoads() {
        return this.mainRoads;
    }

    public List<Road> getSubRoads() {
        return this.subRoads;
    }

    private CityElement createVirtualRootDistrict() {
        // virtual root district comprises all namespace districts of the origin set
        CityElement virtualRootDistrict = new CityElement(CityType.District);

        for (CityElement namespaceDistrict : repository.getNamespaceDistrictsOfOriginSet()) {
            virtualRootDistrict.addSubElement(namespaceDistrict);
        }

        double minX = Double.POSITIVE_INFINITY, maxX = Double.NEGATIVE_INFINITY, minY = Double.POSITIVE_INFINITY, maxY = Double.NEGATIVE_INFINITY;

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

        virtualRootDistrict.setWidth(maxX + minX + Config.Visualization.Metropolis.district.horizontalDistrictGap() + 2 * Config.Visualization.Metropolis.district.horizontalDistrictMargin());
        virtualRootDistrict.setLength(maxY + minY + Config.Visualization.Metropolis.district.horizontalDistrictGap() + 2 * Config.Visualization.Metropolis.district.horizontalDistrictMargin());
        virtualRootDistrict.setHeight(0.0);

        return virtualRootDistrict;
    }

    private List<CityElement> extractRoadSections(List<Road> roads, CityElement district) {
        List<CityElement> roadElementsUnfiltered = new ArrayList<CityElement>();
        List<CityElement> roadElements = new ArrayList<CityElement>();

        for (Road road : roads) {
            int amountOfRelations = this.referenceMapper.getAmountOfRelationsToACityElement(road.getStartElement(), road.getDestinationElement(), false);
            for (int i = 0; i < road.getPath().size() - 1; i++) {
                CityElement roadSection = createRoadSectionACityElement(road.getPath().get(i), road.getPath().get(i + 1), district, amountOfRelations);
                roadElementsUnfiltered.add(roadSection);
                road.addRoadSectionId(roadSection.getHash());
            }
        }

        Collections.sort(roadElementsUnfiltered, (elem1, elem2) -> {
            if (elem1.getXPosition() == elem2.getXPosition()) {
                if (elem1.getZPosition() == elem2.getZPosition()) {
                    if (elem1.getWidth() == elem2.getWidth()) {
                        return Double.compare(elem1.getLength(), elem2.getLength());
                    } else {
                        return Double.compare(elem1.getWidth(), elem2.getWidth());
                    }
                } else {
                    return Double.compare(elem1.getZPosition(), elem2.getZPosition());
                }
            } else {
                return Double.compare(elem1.getXPosition(), elem2.getXPosition());
            }
        });

        for (int i = 0; i < roadElementsUnfiltered.size() - 1; i++) {
            if (roadElementsUnfiltered.get(i).getXPosition() != roadElementsUnfiltered.get(i + 1).getXPosition() || roadElementsUnfiltered.get(i).getZPosition() != roadElementsUnfiltered.get(i + 1).getZPosition()) {
                roadElements.add(roadElementsUnfiltered.get(i));
            } else {
                // This is a duplicate of the next road section. Find the road it belongs to and substitute the ID of the road section it will be filtered in favor of.
                for (Road road : roads) {
                    if (road.getRoadSectionIds().contains(roadElementsUnfiltered.get(i).getHash())) {
                        road.substituteRoadSectionId(roadElementsUnfiltered.get(i).getHash(), roadElementsUnfiltered.get(i + 1).getHash());
                    }
                }
            }

            if (i == roadElementsUnfiltered.size() - 2) {
                roadElements.add(roadElementsUnfiltered.get(i + 1));
            }
        }

        return roadElements;
    }

    private CityElement createRoadSectionACityElement(RoadNode start, RoadNode end, CityElement district, int amountOfRelations) {
        CityElement roadSection = new CityElement(CityType.Road);
        double roadWidth;

        if (amountOfRelations < 5) {
            roadSection.setSubType(CitySubType.Lane);
            roadWidth = Config.Visualization.Metropolis.roadNetwork.roadWidthLane();
        } else if (amountOfRelations < 10) {
            roadSection.setSubType(CitySubType.Street);
            roadWidth = Config.Visualization.Metropolis.roadNetwork.roadWidthStreet();
        } else {
            roadSection.setSubType(CitySubType.Freeway);
            roadWidth = Config.Visualization.Metropolis.roadNetwork.roadWidthFreeway();
        }

        roadSection.setXPosition((start.getX() + end.getX()) / 2.0);
        roadSection.setYPosition(district.getYPosition() + districtHeight / 2.0 + roadHeight / 2.0);
        roadSection.setZPosition((start.getY() + end.getY()) / 2.0);

        roadSection.setWidth(Math.abs(start.getX() - end.getX()) + roadWidth);
        roadSection.setLength(Math.abs(start.getY() - end.getY()) + roadWidth);
        roadSection.setHeight(roadHeight);

        return roadSection;
    }
}
