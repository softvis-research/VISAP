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
        List<Road> assembledRoads = new ArrayList<Road>();
        for (Road road : this.subRoads) {
            CityElement startParent = road.getStartElement().getParentElement();
            CityElement destinationParent = road.getDestinationElement().getParentElement();
            if (Objects.equals(startParent, destinationParent)) assembledRoads.add(road);
            if (!Objects.equals(startParent, destinationParent)) {
                Optional<Road> connectingRoad = this.mainRoads
                    .stream()
                    .filter(
                        mainRoad
                            -> (mainRoad.getStartElement().equals(startParent)
                                || mainRoad.getStartElement().equals(destinationParent))
                            && (mainRoad.getDestinationElement().equals(startParent)
                                || mainRoad.getDestinationElement().equals(destinationParent))
                    )
                    .findAny();

                connectingRoad.ifPresentOrElse(
                    connector -> {
                        assembledRoads.add(road);
                        road.addRoadSectionIds(connector.getRoadSectionIds());
                        Optional<Road> endOfRoad = this.subRoads
                            .stream()
                            .filter(
                                subMainRoadConnector
                                    -> subMainRoadConnector.getStartElement().getParentElement() == null
                                    && subMainRoadConnector.getDestinationElement().equals(road.getDestinationElement())
                            )
                            .findAny();
                        endOfRoad.ifPresentOrElse(
                            end -> road.addRoadSectionIds(end.getRoadSectionIds().reversed()),
                            () -> {
                                System.out.println("The road between " + road.getStartElement().getSourceNodeProperty(SAPNodeProperties.object_name) + " and " + road.getDestinationElement().getSourceNodeProperty(SAPNodeProperties.object_name) + " has no end.");
                            }
                        );
                    },
                    () -> {
                        System.out.println("There is no mainRoad connecting the subRoad from start district " + startParent + " to destination district " + destinationParent);
                    }
                );
            }
        }

        return assembledRoads;
    }
}
