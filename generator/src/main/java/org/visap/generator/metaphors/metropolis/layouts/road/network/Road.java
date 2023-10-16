package org.visap.generator.metaphors.metropolis.layouts.road.network;

import java.util.ArrayList;
import java.util.List;

import org.visap.generator.repository.CityElement;

public class Road {

    private CityElement startElement;
    private CityElement destinationElement;
    private List<RoadNode> path;

    public Road(CityElement startElement, CityElement destinationElement) {
        this.startElement = startElement;
        this.destinationElement = destinationElement;

        this.path = new ArrayList<RoadNode>();
    }

    public Road(CityElement startElement, CityElement destinationElement, List<RoadNode> path) {
        this.startElement = startElement;
        this.destinationElement = destinationElement;

        this.path = path;
    }

    public void addRoadNodeToPath(RoadNode roadNode) {
        this.path.add(roadNode);
    }

    public void addRoadNodesToPath(List<RoadNode> roadNodes) {
        this.path.addAll(roadNodes);
    }

    public CityElement getStartElement() {
        return this.startElement;
    }

    public CityElement getDestinationElement() {
        return this.destinationElement;
    }

    public List<RoadNode> getPath() {
        return this.path;
    }

    public double calculateLength() {
        double pathLength = 0.0;

        for (int i = 0; i < this.path.size() - 1; i++) {
            pathLength += this.distance(this.path.get(i), this.path.get(i + 1));
        }

        return pathLength;
    }

    private double distance(RoadNode start, RoadNode destination) {

        // use Manhattan metric instead of Euclid metric due to performance
        return Math.abs(destination.getX() - start.getX() + destination.getY() - start.getY());
    }

}