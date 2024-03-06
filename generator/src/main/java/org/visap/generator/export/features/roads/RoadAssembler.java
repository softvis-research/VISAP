package org.visap.generator.export.features.roads;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.metaphors.metropolis.layouts.road.network.Road;
import org.visap.generator.repository.CityElement;

public class RoadAssembler {
    private List<Road> mainRoads;
    private List<Road> subRoads;

    public RoadAssembler(List<Road> mainRoads, List<Road> subRoads) {
        this.mainRoads = mainRoads;
        this.subRoads = subRoads;
    }

    public List<Road> assembleRoads() {
        List<Road> assembledRoads = new ArrayList<>();
        for (Road road : subRoads) {
            if (isSameDistrict(road)) {
                assembledRoads.add(road);
            } else {
                connectRoads(road).ifPresent(assembledRoads::add);
            }
        }
        return assembledRoads;
    }

    private boolean isSameDistrict(Road road) {
        CityElement startParent = road.getStartElement().getParentElement();
        CityElement destinationParent = road.getDestinationElement().getParentElement();
        return Objects.equals(startParent, destinationParent);
    }

    private Optional<Road> connectRoads(Road road) {
        CityElement startParent = road.getStartElement().getParentElement();
        CityElement destinationParent = road.getDestinationElement().getParentElement();
        Optional<Road> connectingRoad = findConnectingRoad(startParent, destinationParent);

        connectingRoad.ifPresentOrElse(
                connector -> processConnectingRoad(road, connector),
                () -> logNoConnectingMainRoad(startParent, destinationParent)
        );

        return connectingRoad.map(connector -> road);
    }

    private Optional<Road> findConnectingRoad(CityElement startParent, CityElement destinationParent) {
        return mainRoads.stream()
                .filter(mainRoad
                        -> mainRoad.getStartElement().equals(startParent)
                        && mainRoad.getDestinationElement().equals(destinationParent)
                )
                .findAny();
    }

    private void processConnectingRoad(Road road, Road connector) {
        road.addRoadSectionIds(connector.getRoadSectionIds());
        findEndOfRoad(road).ifPresentOrElse(
                end -> road.addRoadSectionIds(end.getRoadSectionIds().reversed()),
                () -> logNoEndOfRoad(road));
    }

    private Optional<Road> findEndOfRoad(Road road) {
        return subRoads.stream().filter(subRoad -> subRoad.getStartElement().getParentElement() == null
                && subRoad.getDestinationElement().equals(road.getDestinationElement())).findFirst();
    }

    private void logNoConnectingMainRoad(CityElement startParent, CityElement destinationParent) {
        System.out.println("There is no mainRoad connecting the subRoad from start district " + startParent
                + " to destination district " + destinationParent);
    }

    private void logNoEndOfRoad(Road road) {
        System.out.println("The road between "
                + road.getStartElement().getSourceNodeProperty(SAPNodeProperties.object_name) + " and "
                + road.getDestinationElement().getSourceNodeProperty(SAPNodeProperties.object_name) + " has no end.");
    }
}
