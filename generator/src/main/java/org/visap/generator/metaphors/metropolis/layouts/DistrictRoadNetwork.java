package org.visap.generator.metaphors.metropolis.layouts;

import java.util.*;
import java.util.Map.Entry;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.abap.enums.SAPNodeTypes;
import org.visap.generator.configuration.Config;
import org.visap.generator.metaphors.metropolis.layouts.road.network.Road;
import org.visap.generator.metaphors.metropolis.layouts.road.network.RoadGraph;
import org.visap.generator.metaphors.metropolis.layouts.road.network.RoadGraphDijkstraAlgorithm;
import org.visap.generator.metaphors.metropolis.layouts.road.network.RoadNode;
import org.visap.generator.metaphors.metropolis.layouts.road.network.RoadNodeBuilder;
import org.visap.generator.repository.CityElement;
import org.visap.generator.repository.CityElement.CityType;
import org.visap.generator.repository.CityReferenceMapper;

public class DistrictRoadNetwork {
    private RoadGraph roadGraph;

    private CityElement district;
    private Map<CityElement, RoadNode> mainElementConnectors;

    private Set<CityElement> subElements;
    private Map<CityElement, HashMap<CityElement, RoadNode>> subElementConnectors;

    private CityReferenceMapper referenceMapper;

    private static final double horizontalDistrictGap = Config.Visualization.Metropolis.district.horizontalDistrictGap();

    public DistrictRoadNetwork(CityElement mainElement, HashMap<CityElement, RoadNode> mainElementConnectors, CityReferenceMapper referenceMapper) {
        this.roadGraph = new RoadGraph();

        this.district = mainElement;
        this.mainElementConnectors = mainElementConnectors;

        this.subElements = new HashSet<>(district.getSubElements());
        this.subElementConnectors = new HashMap<>();

        for (CityElement subElement : this.subElements) {
            this.subElementConnectors.put(subElement, new HashMap<>());
        }

        this.referenceMapper = referenceMapper;
    }

    public HashMap<CityElement, RoadNode> getSubElementConnectors(CityElement subElement) {
        return subElementConnectors.get(subElement);
    }

    public List<Road> calculate() {
        initializeRoadGraph();

        RoadNodeBuilder nodeBuilder = new RoadNodeBuilder();

        List<Road> roads = new ArrayList<Road>();

        for (CityElement subelement : subElements) {
            if (subelement.getType() != CityType.District) {
                continue;
            }

            List<RoadNode> slipRoadNodesSource = nodeBuilder.calculateSlipRoadNodes(subelement);
            Collection<CityElement> referencedElements = referenceMapper.getAggregatedRelatedACityElements(subelement, referenceMapper.mapToAggregationLevel(subelement), false);

            for (CityElement referencedElement : referencedElements) {
                if (referencedElement == null || subelement == referencedElement) {
                    continue;
                }

                if (!checkIfElementBelongsToOriginSet(referencedElement)) {
                    continue;
                }

                List<RoadNode> slipRoadNodesTarget;

                if (subElements.contains(referencedElement)) {
                    // von den Distrikten die Auffahrtspunkte bestimmen
                    slipRoadNodesTarget = nodeBuilder.calculateSlipRoadNodes(referencedElement);
                } else {
                    slipRoadNodesTarget = new ArrayList<>();
                    slipRoadNodesTarget.add(mainElementConnectors.get(referencedElement.getParentElement()));
                }

                double shortestPathLength = Double.MAX_VALUE;
                List<RoadNode> shortestPathAbsolut = null;

                // kürzesten Pfad aller (4 * 4 =) 16 Kombinationen berechnen
                // Aufruf von dijkstra
                for (RoadNode slipRoadNodeSource : slipRoadNodesSource) {
                    for (RoadNode slipRoadNodeTarget : slipRoadNodesTarget) {
                        List<List<RoadNode>> shortestPath = getAllShortestPaths(slipRoadNodeSource, slipRoadNodeTarget);

                        double pathLength = roadGraph.calculatePathLength(shortestPath.get(0));
                        if (pathLength < shortestPathLength) {
                            shortestPathAbsolut = shortestPath.get(0);
                            shortestPathLength = pathLength;
                        }
                    }
                }

                // passenden Pfad bestimmen und merken
                // erstmal: kürzesten Pfad wählen
                if (shortestPathAbsolut != null) {
                    // Auffahrt auf containingSourceDistrict
                    shortestPathAbsolut.add(0, nodeBuilder.calculateDistrictSlipRoadNode(subelement, shortestPathAbsolut.get(0)));

                    if (subElements.contains(referencedElement)) {
                        // Auffahrt auf containingTargetDistrict
                        shortestPathAbsolut.add(nodeBuilder.calculateDistrictSlipRoadNode(referencedElement, shortestPathAbsolut.get(shortestPathAbsolut.size() - 1)));

                        subElementConnectors.get(subelement).put(referencedElement, nodeBuilder.calculateDistrictMarginRoadNode(subelement, shortestPathAbsolut.get(0)));
                        subElementConnectors.get(referencedElement).put(subelement, nodeBuilder.calculateDistrictMarginRoadNode(referencedElement, shortestPathAbsolut.get(shortestPathAbsolut.size() - 1)));
                    } else {
                        shortestPathAbsolut.add(nodeBuilder.calculateDistrictSlipRoadNode(district, shortestPathAbsolut.get(shortestPathAbsolut.size() - 1)));
                    }
                    roads.add(new Road(subelement, referencedElement, shortestPathAbsolut));
                }
            }

            Collection<CityElement> reverseReferencedElements = referenceMapper.getAggregatedRelatedACityElements(subelement, referenceMapper.mapToAggregationLevel(subelement), true);

            // Wir müssen jetzt nur Beziehungen berücksichtigen, die von "draußen" kommen
            // Die anderen haben wir ja schon behandelt
            for (CityElement referencedElement : reverseReferencedElements) {
                if (referencedElement == null || subelement == referencedElement || subElements.contains(referencedElement)) {
                    continue;
                }

                if (!checkIfElementBelongsToOriginSet(referencedElement)) {
                    continue;
                }

                double shortestPathLength = Double.MAX_VALUE;
                List<RoadNode> shortestPathAbsolut = null;

                // kürzesten Pfad aller (4 * 4 =) 16 Kombinationen berechnen
                // Aufruf von Dijkstra
                for (RoadNode slipRoadNodeSource : slipRoadNodesSource) {
                    List<List<RoadNode>> shortestPath = getAllShortestPaths(slipRoadNodeSource, mainElementConnectors.get(referencedElement.getParentElement()));

                    double pathLength = roadGraph.calculatePathLength(shortestPath.get(0));
                    if (pathLength < shortestPathLength) {
                        shortestPathAbsolut = shortestPath.get(0);
                        shortestPathLength = pathLength;
                    }
                }

                // passenden Pfad bestimmen und merken
                // erstmal: kürzesten Pfad wählen
                if (shortestPathAbsolut != null) {
                    // Auffahrt auf containingSourceDistrict
                    shortestPathAbsolut.add(0, nodeBuilder.calculateDistrictSlipRoadNode(subelement, shortestPathAbsolut.get(0)));
                    shortestPathAbsolut.add(nodeBuilder.calculateDistrictSlipRoadNode(district, shortestPathAbsolut.get(shortestPathAbsolut.size() - 1)));

                    roads.add(new Road(referencedElement.getParentElement(), subelement, shortestPathAbsolut));
                }
            }
        }

        return roads;
    }

    private void initializeRoadGraph() {
        Map<Double, ArrayList<RoadNode>> nodesPerRows = new HashMap<Double, ArrayList<RoadNode>>();
        Map<Double, ArrayList<RoadNode>> nodesPerColumns = new HashMap<Double, ArrayList<RoadNode>>();

        Map<Double, ArrayList<CityElement>> elementsPerRows = new HashMap<Double, ArrayList<CityElement>>();
        Map<Double, ArrayList<CityElement>> elementsPerColumns = new HashMap<Double, ArrayList<CityElement>>();

        RoadNodeBuilder nodeBuilder = new RoadNodeBuilder();

        // create surrounding nodes of main district
        for (RoadNode node : nodeBuilder.calculateMarginRoadNodes(district)) {
            if (!roadGraph.hasNode(node)) {
                roadGraph.insertNode(node);

                nodesPerColumns.putIfAbsent(node.getX(), new ArrayList<>());
                nodesPerColumns.get(node.getX()).add(node);

                nodesPerRows.putIfAbsent(node.getY(), new ArrayList<>());
                nodesPerRows.get(node.getY()).add(node);
            }
        }

        // create nodes per district subelement and group them by column and row
        for (CityElement districtSubElement : district.getSubElements()) {
            for (RoadNode node : nodeBuilder.calculateSurroundingRoadNodes(districtSubElement)) {
                if (!roadGraph.hasNode(node)) {
                    roadGraph.insertNode(node);

                    nodesPerColumns.putIfAbsent(node.getX(), new ArrayList<>());
                    nodesPerColumns.get(node.getX()).add(node);

                    nodesPerRows.putIfAbsent(node.getY(), new ArrayList<>());
                    nodesPerRows.get(node.getY()).add(node);
                }
            }
        }

        // group elements by column and row
        // to check if an element is between two nodes
        for (CityElement districtElement : district.getSubElements()) {
            double rightBound = districtElement.getXPosition() + districtElement.getWidth() / 2.0 + horizontalDistrictGap / 2.0; // + roadWidth / 2.0;

            double leftBound = districtElement.getXPosition() - districtElement.getWidth() / 2.0 - horizontalDistrictGap / 2.0; // - roadWidth / 2.0;

            double upperBound = districtElement.getZPosition() + districtElement.getLength() / 2.0 + horizontalDistrictGap / 2.0; // + roadWidth / 2.0;

            double lowerBound = districtElement.getZPosition() - districtElement.getLength() / 2.0 - horizontalDistrictGap / 2.0; // - roadWidth / 2.0;

            for (Double column : nodesPerColumns.keySet()) {
                if (leftBound < column && column < rightBound) {
                    elementsPerColumns.putIfAbsent(column, new ArrayList<>());
                    elementsPerColumns.get(column).add(districtElement);
                }
            }

            for (Double row : nodesPerRows.keySet()) {
                if (lowerBound < row && row < upperBound) {
                    elementsPerRows.putIfAbsent(row, new ArrayList<>());
                    elementsPerRows.get(row).add(districtElement);
                }
            }
        }

        // create edges in every column
        for (Entry<Double, ArrayList<RoadNode>> nodesPerColumn : nodesPerColumns.entrySet()) {
            ArrayList<RoadNode> nodesInColumn = nodesPerColumn.getValue();

            // sort nodes ascending to get nearby nodes alongside in array
            Collections.sort(nodesInColumn, Comparator.comparingDouble(RoadNode::getY));

            ArrayList<CityElement> elementsInSameColumn = elementsPerColumns.get(nodesPerColumn.getKey());

            for (int i = 0; i < nodesInColumn.size() - 1; i++) {
                RoadNode lowerNode = nodesInColumn.get(i);
                RoadNode upperNode = nodesInColumn.get(i + 1);

                if (elementsInSameColumn == null) {
                    // no elements in this columns -> create edge
                    roadGraph.insertEdge(lowerNode, upperNode);

                } else if (elementsInSameColumn.stream().noneMatch(element -> (lowerNode.getY() < element.getZPosition() && element.getZPosition() < upperNode.getY()))) {
                    // no elements between nearby nodes -> create edge
                    roadGraph.insertEdge(lowerNode, upperNode);
                }
            }
        }

        // create edges in every row
        for (Entry<Double, ArrayList<RoadNode>> nodesPerRow : nodesPerRows.entrySet()) {
            ArrayList<RoadNode> nodesInRow = nodesPerRow.getValue();

            // sort nodes ascending to get nearby nodes alongside in array
            Collections.sort(nodesInRow, Comparator.comparingDouble(RoadNode::getX));

            ArrayList<CityElement> elementsInSameRow = elementsPerRows.get(nodesPerRow.getKey());

            for (int i = 0; i < nodesInRow.size() - 1; i++) {
                RoadNode leftNode = nodesInRow.get(i);
                RoadNode rightNode = nodesInRow.get(i + 1);

                if (elementsInSameRow == null) {
                    // no elements in this row -> create edge
                    roadGraph.insertEdge(leftNode, rightNode);

                } else if (elementsInSameRow.stream().noneMatch(element -> (leftNode.getX() < element.getXPosition() && element.getXPosition() < rightNode.getX()))) {
                    // no elements between nearby nodes -> create edge
                    roadGraph.insertEdge(leftNode, rightNode);
                }
            }
        }
    }

    private boolean checkIfElementBelongsToOriginSet(CityElement element) {
        CityElement parentElement = element;

        while (true) {
            if (parentElement.getSourceNodeType() == SAPNodeTypes.Namespace) {
                String creator = parentElement.getSourceNodeProperty(SAPNodeProperties.creator);
                int iteration = Integer.parseInt(parentElement.getSourceNodeProperty(SAPNodeProperties.iteration));

                // iteration == 0 && creator != SAP => origin set (to be analyzed custom code)
                // iteration > 0 => further referenced custom code
                // creator == SAP => coding of SAP standard
                if (iteration == 0 && !creator.equals("SAP")) {
                    return true;
                } else {
                    return false;
                }
            }
            parentElement = parentElement.getParentElement();
        }
    }

    private List<List<RoadNode>> getAllShortestPaths(RoadNode startNode, RoadNode destinationNode) {
        RoadGraphDijkstraAlgorithm dijkstra = new RoadGraphDijkstraAlgorithm(roadGraph.getGraph());
        return dijkstra.calculateAllShortestPaths(startNode, destinationNode);
    }
}
