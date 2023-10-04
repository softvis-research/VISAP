package org.visap.generator.metaphors.metropolis.steps;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.abap.enums.SAPNodeTypes;
import org.visap.generator.abap.enums.SAPRelationLabels;
import org.visap.generator.repository.CityElement;
import org.visap.generator.repository.CityRepository;
import org.visap.generator.repository.SourceNodeRepository;
import org.neo4j.driver.types.Node;

import java.util.*;

public class MetropolisCreator {

    private Log log = LogFactory.getLog(this.getClass());
    private SourceNodeRepository nodeRepository;
    private CityRepository repository;

    public MetropolisCreator(CityRepository cityRepository, SourceNodeRepository sourceNodeRepository) {
        repository = cityRepository;
        nodeRepository = sourceNodeRepository;

        log.info("*****************************************************************************************************************************************");
        log.info("created");
    }

    public void createRepositoryFromNodeRepository() {
        log.info("Create City Elements");
        createAllMetropolisElements(nodeRepository);

        log.info("Create City Relations");
        createAllMetropolisRelations(nodeRepository);

        log.info("Delete empty Districts");
        deleteEmptyDistricts();
    }

    private void createAllMetropolisElements(SourceNodeRepository nodeRepository) {
        Map<SAPNodeTypes, List<CityElement.CityType>> typeMapping = new HashMap<>();
        typeMapping.put(SAPNodeTypes.Namespace, List.of(CityElement.CityType.District));
        typeMapping.put(SAPNodeTypes.FunctionGroup, List.of(CityElement.CityType.District));
        typeMapping.put(SAPNodeTypes.FunctionModule, List.of(CityElement.CityType.Building));
        typeMapping.put(SAPNodeTypes.Report, List.of(CityElement.CityType.District, CityElement.CityType.Building));
        typeMapping.put(SAPNodeTypes.FormRoutine, List.of(CityElement.CityType.Building));
        typeMapping.put(SAPNodeTypes.Class, List.of(CityElement.CityType.District));
        typeMapping.put(SAPNodeTypes.Interface, List.of(CityElement.CityType.District));
        typeMapping.put(SAPNodeTypes.Method, List.of(CityElement.CityType.Building));
        typeMapping.put(SAPNodeTypes.Attribute, List.of(CityElement.CityType.Building));
        typeMapping.put(SAPNodeTypes.Tablebuilding, List.of(CityElement.CityType.Building));
        typeMapping.put(SAPNodeTypes.View, List.of(CityElement.CityType.Building));
        typeMapping.put(SAPNodeTypes.Struct, List.of(CityElement.CityType.Building));
        typeMapping.put(SAPNodeTypes.Domain, List.of(CityElement.CityType.Building));
        typeMapping.put(SAPNodeTypes.Dataelement, List.of(CityElement.CityType.Building));
        typeMapping.put(SAPNodeTypes.DDIC, List.of(CityElement.CityType.District));
        typeMapping.put(SAPNodeTypes.Table, List.of(CityElement.CityType.District));

        for (Map.Entry<SAPNodeTypes, List<CityElement.CityType>> entry : typeMapping.entrySet()) {
            for (CityElement.CityType cityType : entry.getValue()) {
                createACityElementsFromSourceNodes(nodeRepository, cityType, SAPNodeProperties.type_name, entry.getKey());
            }
        }
    }

    private void createAllMetropolisRelations(SourceNodeRepository nodeRepository) {
        createMetropolisRelations(nodeRepository, CityElement.CityType.District);
        createMetropolisRelations(nodeRepository, CityElement.CityType.Building);
    }

    private void createMetropolisRelations(SourceNodeRepository nodeRepository, CityElement.CityType cityType) {
        Collection<CityElement> cityElements = repository.getElementsByType(cityType);
        log.info(cityElements.size() + " CityElement with type \"" + cityType.name() + "\" loaded");

        long relationCounter = 0;

        for (CityElement element : cityElements) {
            Node sourceNode = element.getSourceNode();

            if (element.getSourceNodeType() == SAPNodeTypes.Report) {
                if (element.getType() == CityElement.CityType.Building) {
                    continue;
                }

                createMetropolisRelationsForIdenticalNodes(nodeRepository, sourceNode, element);
                relationCounter++;
            }

            Collection<CityElement> childElements = getChildElementsBySourceNode(nodeRepository, sourceNode);

            for (CityElement childElement : childElements) {
                // No nesting of packages
                if (childElement.getType() == CityElement.CityType.District
                        && childElement.getSourceNodeType() == SAPNodeTypes.Namespace) {
                    continue;
                }

                if (childElement.getType() == CityElement.CityType.Building
                        && childElement.getSourceNodeType() == SAPNodeTypes.Report) {
                    continue;
                }

                if (childElement.getType() == CityElement.CityType.Building
                        && childElement.getSourceNodeType() == SAPNodeTypes.Interface) {
                    continue;
                }

                element.addSubElement(childElement);
                childElement.setParentElement(element);
                relationCounter++;
            }
        }

        log.info(relationCounter + " childRelations for relation \"CONTAINS\" created");
    }

    private void createMetropolisRelationsForIdenticalNodes(SourceNodeRepository nodeRepository, Node sourceNode,
            CityElement element) {

        CityElement buildingParentElements = getParentElementBySourceNode(nodeRepository, sourceNode);

        element.setParentElement(buildingParentElements);
        buildingParentElements.addSubElement(element);

        String buildingElementTypeName = element.getSourceNodeType().name();

        Collection<CityElement> BuildingElements = repository.getElementsByTypeAndSourceProperty(
                CityElement.CityType.Building, SAPNodeProperties.type_name, buildingElementTypeName);

        for (CityElement buildingElement : BuildingElements) {
            String districtId = element.getSourceNodeID().toString();
            String buildingId = buildingElement.getSourceNodeID().toString();

            if (buildingId.equals(districtId)) {
                element.addSubElement(buildingElement);
                buildingElement.setParentElement(element);
            }
        }
    }

    private void deleteEmptyDistricts() {
        Collection<CityElement> districtsWithoutParents = repository.getElementsByTypeAndSourceProperty(
                CityElement.CityType.District, SAPNodeProperties.type_name, "Namespace");

        for (CityElement districtsWithoutParent : districtsWithoutParents) {
            if (districtsWithoutParent.getParentElement() == null) {
                Collection<CityElement> districtWithoutParentAndSubElements = districtsWithoutParent.getSubElements();
                if (districtWithoutParentAndSubElements.isEmpty()) {
                    repository.deleteElement(districtsWithoutParent);

                    String districtName = districtsWithoutParent.getSourceNodeProperty(SAPNodeProperties.object_name);
                    log.info("district \"" + districtName + "\" deleted");
                }
            }
        }
    }

    private Collection<CityElement> getChildElementsBySourceNode(SourceNodeRepository nodeRepository, Node node) {
        Collection<Node> childNodes = nodeRepository.getRelatedNodes(node, SAPRelationLabels.CONTAINS, true);
        if (childNodes.isEmpty()) {
            return new TreeSet<>();
        }

        List<CityElement> childElements = new ArrayList<>();
        for (Node childNode : childNodes) {
            Long childNodeID = childNode.id();
            CityElement childElement = repository.getElementBySourceID(childNodeID);
            if (childElement == null) {
                continue;
            }
            childElements.add(childElement);
        }
        return childElements;
    }

    private CityElement getParentElementBySourceNode(SourceNodeRepository nodeRepository, Node node) {
        Collection<Node> parentNodes = nodeRepository.getRelatedNodes(node, SAPRelationLabels.CONTAINS, false);
        if (parentNodes.isEmpty()) {
            return null;
        }

        Node parentNode = parentNodes.iterator().next();
        Long parentNodeId = parentNode.id();

        CityElement parentElement = repository.getElementBySourceID(parentNodeId);
        return parentElement;
    }

    private void createACityElementsFromSourceNodes(SourceNodeRepository nodeRepository, CityElement.CityType cityType,
            SAPNodeProperties property, SAPNodeTypes nodeType) {
        Collection<Node> sourceNodes = nodeRepository.getNodesByProperty(property, nodeType.name());

        log.info(sourceNodes.size() + " SourceNodes with property \"" + property + "\" and value \"" + nodeType.name()
                + "\" loaded");
        List<CityElement> cityElements = createACityElements(sourceNodes, cityType);
        repository.addElements(cityElements);

        log.info(cityElements.size() + " ACityElements of type \"" + cityType + "\" created");
    }

    private List<CityElement> createACityElements(Collection<Node> sourceNodes, CityElement.CityType cityType) {
        List<CityElement> cityElements = new ArrayList<>();

        for (Node sourceNode : sourceNodes) {
            CityElement cityElement = new CityElement(cityType);
            cityElement.setSourceNode(sourceNode);
            cityElements.add(cityElement);
        }

        return cityElements;
    }
}
