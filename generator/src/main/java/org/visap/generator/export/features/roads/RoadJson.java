package org.visap.generator.export.features.roads;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class RoadJson {
    private static final AtomicInteger idGenerator = new AtomicInteger(1000);
    private String id;
    private String startElement;
    private String destinationElement;
    private List<String> roadSections;

    RoadJson(String startElement, String destinationElement, List<String> roadSectionIds) {
        this.id = "road_" + idGenerator.getAndIncrement();
        this.startElement = startElement;
        this.destinationElement = destinationElement;
        this.roadSections = roadSectionIds;
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

    public List<String> getRoadSections() {
        return this.roadSections;
    }
}
