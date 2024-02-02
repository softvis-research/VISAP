package org.visap.generator.repository;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.abap.enums.SAPNodeLabels;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.abap.enums.SAPRelationLabels;
import org.visap.generator.configuration.Config;
import org.visap.generator.database.DatabaseConnector;
import org.visap.generator.database.NodeCell;
import org.neo4j.driver.Record;
import org.neo4j.driver.Value;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

public class SourceNodeRepository {

    private Log log = LogFactory.getLog(this.getClass());
    private DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());

    /*
     * Node not implements comparable interface to use Sets
     * -> use Maps with ID to Node
     */

    private Map<Long, NodeCell> nodeCellById;

    private Map<String, Map<Long, NodeCell>> nodeCellsByLabel;

    private Map<String, Map<Boolean, Map<Long, Map<Long, NodeCell>>>> nodeCellsByRelation;

    public SourceNodeRepository() {
        nodeCellById = new HashMap<>();
        nodeCellsByLabel = new HashMap<>();
        nodeCellsByRelation = new HashMap<>();

        log.info("Created");
    }

    public void loadNodesByPropertyValue(SAPNodeProperties property, String value) {

        AtomicInteger counter = new AtomicInteger(0);

        List<Record> records = connector.executeRead("MATCH (n:Elements {" + property + ": '" + value + "'}) RETURN n");
        for (Record result : records) {
            NodeCell sourceNode = new NodeCell(result.get("n").asNode());

            addNodeCellByID(sourceNode);
            addNodeCellsByProperty(sourceNode);

            counter.addAndGet(1);
        }
        ;

        log.info(counter.get() + " Nodes added with property \"" + property + "\" and value \"" + value + "\"");
    }

    public void loadNodesByRelation(SAPRelationLabels relationType) {
        loadNodesByRelation(relationType, false);
    }

    public void loadNodesByRelation(SAPRelationLabels relationType, boolean recursive) {
        loadNodesByRelation(relationType, recursive, true);
    }

    public void loadNodesByRelation(SAPRelationLabels relationType, boolean recursive, boolean forward) {

        Set<Long> nodeCellIds = this.nodeCellById.keySet();

        loadNodesByRelation(nodeCellIds, relationType, recursive, forward);
    }

    public void loadNodesByRelation(Set<Long> nodeIds, SAPRelationLabels relationType, boolean recursive,
            boolean forward) {

        String nodeIDString = computeNodeIDString(nodeIds);

        String relatedNodesStatement = "";
        if (forward) {
            relatedNodesStatement = "MATCH (m)-[:" + relationType.name() + "]->(n) WHERE ID(m) IN " + nodeIDString
                    + " RETURN m, n";
        } else {
            relatedNodesStatement = "MATCH (m)<-[:" + relationType.name() + "]-(n) WHERE ID(m) IN " + nodeIDString
                    + " RETURN m, n";
        }

        AtomicInteger nodeCellCounter = new AtomicInteger(0);
        AtomicInteger relationCounter = new AtomicInteger(0);

        Set<Long> newNodeCellIds = new TreeSet<>();

        int nodeCellsBefore = this.nodeCellById.size();

        List<Record> records = connector.executeRead(relatedNodesStatement);
        for (Record result : records) {
            NodeCell nNodeCell = new NodeCell(result.get("n").asNode());

            if (!nodeCellExists(nNodeCell)) {
                addNodeCellByID(nNodeCell);
                addNodeCellsByProperty(nNodeCell);

                newNodeCellIds.add(nNodeCell.id());
                nodeCellCounter.addAndGet(1);
            }

            NodeCell mNodeCell = new NodeCell(result.get("m").asNode());
            mNodeCell = nodeCellById.get(mNodeCell.id());

            addNodeCellsByRelation(mNodeCell, nNodeCell, relationType.name());
            relationCounter.addAndGet(1);
        }
        ;

        int nodeCellsAfter = nodeCellById.size();

        log.info(nodeCellCounter.get() + " nodes added with relation \"" + relationType + "\" loaded");
        log.info(relationCounter.get() + " relations of type \"" + relationType + "\" loaded");

        if (nodeCellsAfter - nodeCellsBefore != newNodeCellIds.size()) {
            log.warn(newNodeCellIds.size() - nodeCellsAfter - nodeCellsBefore + " nodes reloaded!");
        }

        if (recursive && !newNodeCellIds.isEmpty()) {
            loadNodesByRelation(newNodeCellIds, relationType, true, forward);
        }
    }

    private String computeNodeIDString(Set<Long> nodeIds) {

        String nodeIdString = "[";
        for (Long nodeId : nodeIds) {
            nodeIdString += nodeId + ", ";
        }
        nodeIdString = nodeIdString.substring(0, nodeIdString.length() - 2);
        nodeIdString += "]";

        return nodeIdString;
    }

    public void loadNodesWithRelation(SAPRelationLabels relationLabel) {

        List<Record> records = connector.executeRead(" MATCH (m)-[:" + relationLabel.name() + "]->(n) RETURN m, n");
        for (Record result : records) {
            NodeCell mNodeCell = new NodeCell(result.get("m").asNode());
            NodeCell nNodeCell = new NodeCell(result.get("n").asNode());

            addNodeCellByID(mNodeCell);
            addNodeCellByID(nNodeCell);

            addNodeCellsByProperty(mNodeCell);
            addNodeCellsByProperty(nNodeCell);

            addNodeCellsByRelation(mNodeCell, nNodeCell, relationLabel.name());
        }
    }

    public Collection<NodeCell> getNodes() {
        return nodeCellById.values();
    }

    public Collection<NodeCell> getRelatedNodeCells(NodeCell node, SAPRelationLabels relationLabel, Boolean direction) {
        if (!nodeCellsByRelation.containsKey(relationLabel.name())) {
            return new TreeSet<>();
        }

        Map<Boolean, Map<Long, Map<Long, NodeCell>>> relationMap = nodeCellsByRelation.get(relationLabel.name());

        Map<Long, Map<Long, NodeCell>> directedRelationMap = relationMap.get(direction);

        Long nodeID = node.id();
        if (!directedRelationMap.containsKey(nodeID)) {
            return new TreeSet<>();
        }

        return directedRelationMap.get(nodeID).values();
    }

    public Collection<NodeCell> getNodeCellsByLabel(SAPNodeLabels label) {
        if (!nodeCellsByLabel.containsKey(label.name())) {
            return new TreeSet<>();
        }
        return nodeCellsByLabel.get(label.name()).values();
    }

    public Collection<NodeCell> getNodeCellsByProperty(SAPNodeProperties property, String value) {
        Collection<NodeCell> nodeCellsByID = getNodes();
        List<NodeCell> nodeCellsByProperty = new ArrayList<>();

        for (NodeCell nodeCell : nodeCellsByID) {
            Value propertyValue = nodeCell.get(property.toString());
            if (propertyValue == null) {
                continue;
            }
            String propertyValueString = propertyValue.asString();
            if (!propertyValueString.equals(value)) {
                continue;
            }

            nodeCellsByProperty.add(nodeCell);
        }

        return nodeCellsByProperty;
    }

    // Laden Property
    public Collection<NodeCell> getNodesByIdenticalPropertyValuesNodes(SAPNodeProperties property, String value) {

        Collection<NodeCell> nodesByLabelAndProperty = new ArrayList<>();

        List<Record> records = connector.executeRead("MATCH (n:Elements {" + property + ": '" + value + "'}) RETURN n");
        for (Record r : records) {
            NodeCell propertyValue = new NodeCell(r.get("n").asNode());
            nodesByLabelAndProperty.add(propertyValue);
        }

        return nodesByLabelAndProperty;
    }

    public Collection<NodeCell> getNodesByLabelAndProperty(SAPNodeLabels label, String property, String value) {
        Collection<NodeCell> nodeCellsByLabel = getNodeCellsByLabel(label);
        List<NodeCell> nodeCellsByLabelAndProperty = new ArrayList<>();

        for (NodeCell nodeCell : nodeCellsByLabel) {
            Value propertyValue = nodeCell.get(property);
            if (propertyValue == null) {
                nodeCellsByLabel.remove(nodeCell);
            }

            if (propertyValue.asString() != value) {
                nodeCellsByLabel.remove(nodeCell);
            }

            nodeCellsByLabelAndProperty.add(nodeCell);
        }

        return nodeCellsByLabelAndProperty;
    }

    private boolean nodeCellExists(NodeCell nodeCell) {
        Long nodeID = nodeCell.id();
        if (nodeCellById.containsKey(nodeID)) {
            return true;
        }
        return false;
    }

    private void addNodeCellByID(NodeCell nodeCell) {
        if (!nodeCellExists(nodeCell)) {
            nodeCellById.put(nodeCell.id(), nodeCell);
        }
    }

    private void addNodeCellsByProperty(NodeCell nodeCell) {
        nodeCell.labels().forEach((label) -> {
            if (!nodeCellsByLabel.containsKey(label)) {
                Map<Long, NodeCell> nodeIDMap = new HashMap<>();
                nodeCellsByLabel.put(label, nodeIDMap);
            }
            Map<Long, NodeCell> nodeIDMap = nodeCellsByLabel.get(label);

            Long nodeID = nodeCell.id();
            nodeIDMap.putIfAbsent(nodeID, nodeCell);
        });
    }

    private void addNodeCellsByRelation(NodeCell mNodeCell, NodeCell nNodeCell, String relationName) {

        if (!nodeCellsByRelation.containsKey(relationName)) {
            createRelationMaps(relationName);
        }
        Map<Boolean, Map<Long, Map<Long, NodeCell>>> relationMap = nodeCellsByRelation.get(relationName);

        Map<Long, Map<Long, NodeCell>> forwardRelationMap = relationMap.get(true);
        addNodeCellToRelationMap(forwardRelationMap, mNodeCell, nNodeCell);

        Map<Long, Map<Long, NodeCell>> backwardRelationMap = relationMap.get(false);
        addNodeCellToRelationMap(backwardRelationMap, nNodeCell, mNodeCell);
    }

    private void createRelationMaps(String relationName) {
        Map<Boolean, Map<Long, Map<Long, NodeCell>>> relationMap = new HashMap<>();
        Map<Long, Map<Long, NodeCell>> forwardRelationMap = new HashMap<>();
        Map<Long, Map<Long, NodeCell>> backwardRelationMap = new HashMap<>();
        relationMap.put(true, forwardRelationMap);
        relationMap.put(false, backwardRelationMap);
        nodeCellsByRelation.put(relationName, relationMap);
    }

    private void addNodeCellToRelationMap(Map<Long, Map<Long, NodeCell>> relationMap, NodeCell mNodeCell, NodeCell nNodeCell) {
        Long mNodeID = mNodeCell.id();
        if (!relationMap.containsKey(mNodeID)) {
            Map<Long, NodeCell> nodeIDMap = new HashMap<>();
            relationMap.put(mNodeID, nodeIDMap);
        }
        Map<Long, NodeCell> nodeIDMap = relationMap.get(mNodeID);

        Long nNodeID = nNodeCell.id();
        if (!nodeIDMap.containsKey(nNodeID)) {
            nodeIDMap.put(nNodeID, nNodeCell);
        }
    }

}
