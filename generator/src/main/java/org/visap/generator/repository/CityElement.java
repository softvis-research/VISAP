package org.visap.generator.repository;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.abap.enums.SAPNodeTypes;
import org.neo4j.driver.Value;
import org.neo4j.driver.types.Node;
import java.util.*;

public class CityElement {

    private Log log = LogFactory.getLog(this.getClass());

    public CityShape getShape() {
        return shape;
    }

    public void setShape(CityShape shape) {
        this.shape = shape;
    }

    public CitySubType getSubType() {
        return subType;
    }

    public void setSubType(CitySubType subType) {
        this.subType = subType;
    }

    public void setRCData(CityElement refBuilding) {
        this.refBuilding = refBuilding;
    }


    public enum CityType {
        District, Building, Floor, Chimney

    }

    public enum CitySubType {
        Class, Report, FunctionGroup

        // additional subTypes for metropolis
        , Interface
    }


    public enum CityShape {
        Box, Cylinder, Cone

        // alternative shapes
        , Sphere, Ring, Plane, Circle, Tetrahedron, Entity
    }

    private String hash;



    private Long nodeID;

    private Node sourceNode;

    private List<CityElement> subElements;
    private CityElement parentElement;
    private CityElement refBuilding;

    private CityType type;
    private CitySubType subType;

    private String color;
    private CityShape shape;
    private String source;
    private String model;
    private String modelScale;

    private double height;
    private double width;
    private double length;

    private double xPosition;
    private double yPosition;
    private double zPosition;

    private String rotation;

    private String metaData;
    private String aframeProperty;

    public CityElement(CityType type) {
        this.type = type;
        subElements = new ArrayList<>();

        UUID uuid = UUID.randomUUID();
        hash = "ID_" + uuid.toString();
    }

    public Long getSourceNodeID() {
        return sourceNode.id();
    }


    public Node getSourceNode() {
        return sourceNode;
    }

    public void setSourceNode(Node sourceNode) {
        this.sourceNode = sourceNode;
    }

    public SAPNodeTypes getSourceNodeType(){
        Node sourceNode = getSourceNode();
        if( sourceNode == null){
            return null;
        }
        return SAPNodeTypes.valueOf(sourceNode.get(SAPNodeProperties.type_name.name()).asString());
    }


    public double getHeight() {
        return height;
    }

    public void setHeight(double height) {
        this.height = height;
    }

    public double getWidth() {
        return width;
    }

    public void setWidth(double width) {
        this.width = width;
    }

    public double getLength() {
        return length;
    }

    public void setLength(double length) {
        this.length = length;
    }

    public double getXPosition() {
        return xPosition;
    }

    public void setXPosition(double xPosition) {
        this.xPosition = xPosition;
    }

    public double getYPosition() {
        return yPosition;
    }

    public void setYPosition(double yPosition) {
        this.yPosition = yPosition;
    }

    public double getZPosition() {
        return zPosition;
    }

    public void setZPosition(double zPosition) {
        this.zPosition = zPosition;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getTextureSource() {
        return source;
    }

    public void setTextureSource(String src) {
        this.source = src;
    }

    public String getRotation() {
        return rotation;
    }

    public void setRotation(String rotation) {
        this.rotation = rotation;
    }

    public String getModelScale() {
        return modelScale;
    }

    public void setModelScale(String scale) {
        this.modelScale = scale;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String gltfModel) {
        this.model = gltfModel;
    }


    public CityElement getParentElement() {
        return parentElement;
    }

    public CityElement getRefBuildingData() {
        return refBuilding;
    }


    public void setParentElement(CityElement parentElement) {
        this.parentElement = parentElement;
    }

    public Collection<CityElement> getSubElements() {
        return new ArrayList<CityElement>(subElements);
    }

    public Collection<CityElement> getSubElementsOfType(CityType elementType) {
        List<CityElement> subElementsOfType = new ArrayList<>();

        Collection<CityElement> subElements = getSubElements();
        for(CityElement element : subElements){

            if( element.getType() == elementType){
                subElementsOfType.add(element);
            }
        }
        return subElementsOfType;
    }

    public String getSourceNodeProperty(SAPNodeProperties sapNodeProperties) {

        Node sourceNode = getSourceNode();

        try{
            if(sourceNode == null){
                throw new Exception("sourceNode is equal null");
            }
        } catch (Exception e) {
            log.error(e.getMessage());
        }

        Value propertyValue = sourceNode.get(sapNodeProperties.name());
        try {
            if (propertyValue == null) {
                //throw new Exception("propertyValue is equal null");
            }
        } catch (Exception e) {
            //log.error(e.getMessage());
            log.error(e + "propertyValue is equal null"); // Fehler führt schon in viel eherer Verarbeitung zum Abbruch
        }

        String sourceNodeProperty = propertyValue.asString();

        return sourceNodeProperty;
    }

    public void addSubElement(CityElement subElement) {
        this.subElements.add(subElement);
    }

    public void removeSubElement(CityElement subElement) {
        this.subElements.remove(subElement);
    }

    public String getHash() {
        return hash;
    }

    public CityType getType() {
        return type;
    }

    public Long getNodeID() {
        return nodeID;
    }

    public void setNodeID(Long nodeID) {
        this.nodeID = nodeID;
    }

    public void setMetaData(String metaData) { this.metaData = metaData; }

    public String getMetaData() {
        return metaData;
    }

    public void setAframeProperty(String aframeProperty) { this.aframeProperty = aframeProperty; }

    public String getAframeProperty() { return aframeProperty; }

}