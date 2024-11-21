package org.visap.generator.export.features.roads;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.metaphors.metropolis.layouts.road.network.Road;
import org.visap.generator.repository.CityElement;

public class RoadAssembler {

    private Log log = LogFactory.getLog(this.getClass());

    // main roads are between districts
    private List<Road> mainRoads;
    // sub roads are the road parts that lie on a district; they may or may not go from one district to another
    // some sub roads start from a district instead of an object on it - those are the ends of the roads
    private List<Road> subRoads;

    public RoadAssembler(List<Road> mainRoads, List<Road> subRoads) {
        this.mainRoads = mainRoads;
        this.subRoads = subRoads;
        logRoads("Main Roads:", mainRoads);
        logRoads("Sub Roads:", subRoads);
    }

    public List<Road> assembleRoads() {
        List<Road> assembledRoads = new ArrayList<>();
        for (Road road : this.subRoads) {
            if (hasSameStartAndDestinationDistrict(road)) {
                assembledRoads.add(road);
            } else {
                findMiddleAndEnd(road).ifPresent(assembledRoads::add);
            }
        }
        return assembledRoads;
    }

    private boolean hasSameStartAndDestinationDistrict(Road road) {
        CityElement startParent = road.getStartElement().getParentElement();
        CityElement destinationParent = road
            .getDestinationElement()
            .getParentElement();
        return Objects.equals(startParent, destinationParent);
    }

    private Optional<Road> findMiddleAndEnd(Road road) {
        CityElement startParent = road.getStartElement().getParentElement();
        CityElement destinationParent = road
            .getDestinationElement()
            .getParentElement();
        // if the road does not start from a district, it is an end of a road
        if (startParent == null) return Optional.empty();
        Optional<Road> connectingMainRoad = findConnectingMainRoad(
            startParent,
            destinationParent
        );

        Optional<Road> middleAndEndOfRoad = connectingMainRoad
            .map(connector -> processConnectingRoad(road, connector))
            .or(() -> {
                logNoConnectingMainRoad(startParent, destinationParent);
                return Optional.empty();
            });
        return middleAndEndOfRoad;
    }

    private Optional<Road> findConnectingMainRoad(
        CityElement startParent,
        CityElement destinationParent
    ) {
        return this.mainRoads.stream()
            .filter(
                mainRoad ->
                    mainRoad.getStartElement().equals(startParent) &&
                    mainRoad.getDestinationElement().equals(destinationParent)
            )
            .findFirst();
    }

    private Road processConnectingRoad(Road road, Road connector) {
        road.addRoadSectionIds(connector.getRoadSectionIds());
        return findEndOfRoad(road)
            .map(end -> {
                List<String> endIds = new ArrayList<>(end.getRoadSectionIds());
                // need to reverse because the end road is in the opposite direction
                Collections.reverse(endIds);
                road.addRoadSectionIds(endIds);
                return road;
            })
            .orElseGet(() -> {
                logNoEndOfRoad(road);
                return road;
            });
    }

    private Optional<Road> findEndOfRoad(Road road) {
        return this.subRoads.stream()
            .filter(
                subRoad ->
                    subRoad.getStartElement().getParentElement() == null &&
                    subRoad
                        .getDestinationElement()
                        .equals(road.getDestinationElement())
            )
            .findFirst();
    }

    private void logNoConnectingMainRoad(
        CityElement startParent,
        CityElement destinationParent
    ) {
        String startParentName;
        String destinationParentName;
        if (startParent == null) {
            startParentName = "null";
        } else {
            startParentName = startParent.getSourceNodeProperty(
                SAPNodeProperties.object_name
            );
        }
        if (destinationParent == null) {
            destinationParentName = "null";
        } else {
            destinationParentName = destinationParent.getSourceNodeProperty(
                SAPNodeProperties.object_name
            );
        }
        log.warn(
            "There is no mainRoad connecting the subRoad from start district " +
            startParentName +
            " to destination district " +
            destinationParentName
        );
    }

    private void logNoEndOfRoad(Road road) {
        log.warn(
            "The road between " +
            road
                .getStartElement()
                .getSourceNodeProperty(SAPNodeProperties.object_name) +
            " and " +
            road
                .getDestinationElement()
                .getSourceNodeProperty(SAPNodeProperties.object_name) +
            " has no end."
        );
    }

    private void logRoads(String title, List<Road> roads) {
        log.info(title);
        for (Road road : roads) {
            log.info(
                String.format(
                    "\tfrom %s with parent %s to %s with parent %s",
                    road
                        .getStartElement()
                        .getSourceNodeProperty(SAPNodeProperties.object_name),
                    road.getStartElement().getParentName(),
                    road
                        .getDestinationElement()
                        .getSourceNodeProperty(SAPNodeProperties.object_name),
                    road.getDestinationElement().getParentName()
                )
            );
        }
    }
}
