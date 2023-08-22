package org.visap.generator.repository;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.abap.enums.SAPNodeTypes;
import org.visap.generator.configuration.Config;
import org.visap.generator.database.DatabaseConnector;
import org.neo4j.driver.Value;
import org.neo4j.driver.types.Node;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

public class CityRepository {

    private Log log = LogFactory.getLog(this.getClass());

    private static final DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());

    private Map<Long, CityElement> elementsBySourceID;

    private Map<String, CityElement> elementsByHash;

    private Map<CityElement.CityType, Map<String, CityElement>> elementsByType;

    public CityRepository() {
        elementsBySourceID = new TreeMap<>();
        elementsByHash = new TreeMap<>();
        elementsByType = new TreeMap<>();

        log.info("created");
    }

    public Collection<CityElement> getAllElements() {
        // return new ArrayList(elementsBySourceID.values());
        return new ArrayList<CityElement>(elementsByHash.values());
    }

    public Collection<CityElement> getAllElementsByHash() {
        return new ArrayList<CityElement>(elementsByHash.values());
    }

    public CityElement getElementBySourceID(Long sourceID) {
        return elementsBySourceID.get(sourceID);
    }

    public CityElement getElementByHash(String hash) {
        return elementsByHash.get(hash);
    }

    public Collection<CityElement> getElementsByType(CityElement.CityType type) {
        if (!elementsByType.containsKey(type)) {
            return new ArrayList<>();
        }

        Map<String, CityElement> elementsByTypeMap = elementsByType.get(type);
        return new ArrayList<CityElement>(elementsByTypeMap.values());
    }

    public Collection<CityElement> getElementsByTypeAndSourceProperty(CityElement.CityType type,
            SAPNodeProperties sourceProperty, String sourcePropertyValue) {
        Collection<CityElement> elementsByType = getElementsByType(type);
        List<CityElement> elementsByTypeAndSourceProperty = new ArrayList<>();

        for (CityElement element : elementsByType) {

            Node sourceNode = element.getSourceNode();

            if (sourceNode == null) {
                CityElement.CitySubType subType = element.getSubType();
                String subTypeString = subType.toString();
                if (!subTypeString.equals(sourcePropertyValue)) {
                    continue;
                }
                elementsByTypeAndSourceProperty.add(element);

                continue;
            }

            Value propertyValue = sourceNode.get(sourceProperty.toString());
            if (propertyValue == null) {
                continue;
            }

            String propertyValueString = propertyValue.asString();
            if (!propertyValueString.equals(sourcePropertyValue)) {
                continue;
            }

            elementsByTypeAndSourceProperty.add(element);
        }

        return elementsByTypeAndSourceProperty;
    }

    public Collection<CityElement> getElementsBySourceProperty(SAPNodeProperties sourceProperty,
            String sourcePropertyValue) {
        Collection<CityElement> elementsByType = getAllElements();
        List<CityElement> elementsBySourceProperty = new ArrayList<>();

        for (CityElement element : elementsByType) {

            Node sourceNode = element.getSourceNode();

            if (sourceNode == null) {
                CityElement.CitySubType subType = element.getSubType();
                String subTypeString = subType.toString();
                if (!subTypeString.equals(sourcePropertyValue)) {
                    continue;
                }
                elementsBySourceProperty.add(element);

                continue;
            }

            Value propertyValue = sourceNode.get(sourceProperty.toString());
            if (propertyValue == null) {
                continue;
            }

            String propertyValueString = propertyValue.asString();
            if (!propertyValueString.equals(sourcePropertyValue)) {
                continue;
            }

            elementsBySourceProperty.add(element);
        }

        return elementsBySourceProperty;
    }

    public Collection<CityElement> getNamespaceDistrictsOfOriginSet() {
        List<CityElement> namespaceDistrictsOfOriginSet = new ArrayList<>();
        Collection<CityElement> namespaceDistricts = getElementsByTypeAndSourceProperty(CityElement.CityType.District, SAPNodeProperties.type_name, SAPNodeTypes.Namespace.toString());

        for (CityElement namespaceDistrict : namespaceDistricts) {
            String creator = namespaceDistrict.getSourceNodeProperty(SAPNodeProperties.creator);
            int iteration = Integer.parseInt(namespaceDistrict.getSourceNodeProperty(SAPNodeProperties.iteration));

            // iteration == 0 && creator <> SAP => origin set (to be analyzed custom code)
            // iteration > 0 					=> further referenced custom code
            // creator == SAP 					=> coding of SAP standard
            if (iteration == 0 && !creator.equals("SAP")) {
                namespaceDistrictsOfOriginSet.add(namespaceDistrict);
            }
        }

        return namespaceDistrictsOfOriginSet;
    }

    // Schreiben der ACityElemente in die Neo4j-Datenbank
    public void writeRepositoryToNeo4j() {

        log.info(
                "*****************************************************************************************************************************************");

        AtomicInteger cityBuildingCounter = new AtomicInteger(0);
        AtomicInteger cityDistrictCounter = new AtomicInteger(0);

        elementsByHash.forEach((id, element) -> {
            Long aCityNodeID = connector
                    .addNode("CREATE ( n:Elements:ACityRep { " + getACityProperties(element) + "})", "n").id();

            element.setNodeID(aCityNodeID);

            switch (element.getType()) {
                case Building:
                    cityBuildingCounter.getAndAdd(1);
                    break;
                case District:
                    cityDistrictCounter.getAndAdd(1);
                    break;
            }
        });

        log.info(cityBuildingCounter + " new Buildings added to Neo4j");
        log.info(cityDistrictCounter + " new Districts added to Neo4j");

        AtomicInteger sourceRelationCounter = new AtomicInteger(0);
        AtomicInteger childRelationCounter = new AtomicInteger(0);
        elementsByHash.forEach((id, element) -> {
            Node elementsBySourceNode = element.getSourceNode();
            if (elementsBySourceNode != null) {

                String statement = "MATCH (sourceNode:Elements), (acityNode:Elements)" +
                        "WHERE ID(sourceNode) = " + elementsBySourceNode.id() +
                        "  AND ID(acityNode) =  " + element.getNodeID() +
                        "  CREATE (sourceNode)<-[r:SOURCE]-(acityNode)";

                connector.executeWrite(statement);
                sourceRelationCounter.addAndGet(1);
            }

            CityElement parentElement = element.getParentElement();

            if (parentElement != null) {
                String statement = "MATCH (acityNode:Elements), (acityParentNode:Elements)" +
                        "WHERE ID(acityNode) =  " + element.getNodeID() +
                        "  AND ID(acityParentNode) =  " + parentElement.getNodeID() +
                        "  CREATE (acityParentNode)-[r:CHILD]->(acityNode)";

                connector.executeWrite(statement);

                childRelationCounter.addAndGet(1);
            }
        });

        log.info(sourceRelationCounter.get() + " source relations created");
        log.info(childRelationCounter.get() + " child relations created");
    }

    public void writeACityElementsToNeo4j(CityElement.CityType aCityElementType) {

        elementsByHash.forEach((id, element) -> {
            if (element.getType() == aCityElementType) {
                connector.executeWrite("CREATE ( :Elements { " + getACityProperties(element) + "})");

                Long aCityNodeID = connector.addNode("CREATE ( n:Elements { " + getACityProperties(element) + "})", "n")
                        .id();

                element.setNodeID(aCityNodeID);
            }
        });

        elementsByHash.forEach((id, element) -> {
            Node elementsBySourceNode = element.getSourceNode();
            if (elementsBySourceNode != null) {

                String statement = "MATCH (sourceNode:Elements), (acityNode:Elements)" +
                        "WHERE ID(sourceNode) = " + elementsBySourceNode.id() +
                        "  AND ID(acityNode) =  " + element.getNodeID() +
                        "  CREATE (sourceNode)<-[r:SOURCE]-(acityNode)";

                connector.executeWrite(statement);
            }
        });
    }

    private String getACityProperties(CityElement element) {
        StringBuilder propertyBuilder = new StringBuilder();

        propertyBuilder.append(" cityType : '" + element.getType().toString() + "',");
        propertyBuilder.append(" hash :  '" + element.getHash() + "',");
        propertyBuilder.append(" subType :  '" + element.getSubType() + "',");
        propertyBuilder.append(" color :  '" + element.getColor() + "',");
        propertyBuilder.append(" shape :  '" + element.getShape() + "',");
        propertyBuilder.append(" height :  " + element.getHeight() + ",");
        propertyBuilder.append(" width :  " + element.getWidth() + ",");
        propertyBuilder.append(" length :  " + element.getLength() + ",");
        propertyBuilder.append(" xPosition :  " + element.getXPosition() + ",");
        propertyBuilder.append(" yPosition :  " + element.getYPosition() + ",");
        propertyBuilder.append(" zPosition :  " + element.getZPosition() + ",");
        propertyBuilder.append(" metaData : '" + element.getMetaData() + "',");
        propertyBuilder.append(" aframeProperty : '" + element.getAframeProperty() + "'");

        return propertyBuilder.toString();
    }

    public void addElement(CityElement element) {
        elementsByHash.put(element.getHash(), element);

        // add to type map
        CityElement.CityType elementType = element.getType();
        if (!elementsByType.containsKey(elementType)) {
            elementsByType.put(elementType, new TreeMap<>());
        }
        Map<String, CityElement> elementsByTypeMap = elementsByType.get(elementType);
        elementsByTypeMap.put(element.getHash(), element);

        // add to source node id map
        if (element.getSourceNode() != null) {
            elementsBySourceID.put(element.getSourceNodeID(), element);
        }
    }

    public void addElements(List<CityElement> elements) {
        for (CityElement element : elements) {
            addElement(element);
        }
    }

    public void deleteElement(CityElement element) {
        elementsByHash.remove(element.getHash(), element);

        // delete from type map
        CityElement.CityType elementType = element.getType();
        if (!elementsByType.containsKey(elementType)) {
            elementsByType.remove(elementType, new TreeMap<>());
        }
        Map<String, CityElement> elementsByTypeMap = elementsByType.get(elementType);
        elementsByTypeMap.remove(element.getHash(), element);

        // delete from source node id map
        if (element.getSourceNode() != null) {
            elementsBySourceID.remove(element.getSourceNodeID(), element);
        }
    }

    public void deleteElements(Collection<CityElement> elements) {
        for (CityElement element : elements) {
            deleteElement(element);
        }
    }
}
