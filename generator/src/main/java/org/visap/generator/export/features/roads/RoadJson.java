package org.visap.generator.export.features.roads;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.visap.generator.metaphors.metropolis.layouts.road.network.RoadNode;

public class RoadJson {
    private static final AtomicInteger idGenerator = new AtomicInteger(1000);
    private String id;
    private String startElement;
    private String destinationElement;
    private List<RoadNode> path;

    RoadJson(String startElement, String destinationElement, List<RoadNode> path) {
        this.id = "road_" + idGenerator.getAndIncrement();
        this.startElement = startElement;
        this.destinationElement = destinationElement;
        this.path = path;
    }

    public String getId() {
        return this.id;
    }

    public String getStartElement() {
        return this.startElement;
    }

    public String getDestinationElement() {
        return this.destinationElement;
    }

    public List<RoadNode> getPath() {
        return this.path;
    }
}
