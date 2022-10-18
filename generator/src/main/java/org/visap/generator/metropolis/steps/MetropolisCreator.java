package org.visap.generator.metropolis.steps;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.abap.enums.SAPNodeTypes;
import org.visap.generator.abap.enums.SAPRelationLabels;
import org.visap.generator.configuration.Config;
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


    public void createRepositoryFromNodeRepository(){

        log.info("Create City Elements");
        createAllMetropolisElements(nodeRepository);

        log.info("Create City Relations");
        createAllMetropolisRelations(nodeRepository);

        log.info("Create ReferenceBuildings");
        createReferenceBuildingRelations();

        log.info("Delete empty Districts");
        deleteEmptyDistricts();

    }

    private Collection<CityElement> getUsesElementsBySourceNode(SourceNodeRepository nodeRepository, Node node) {
        Collection<Node> usesNodes = nodeRepository.getRelatedNodes(node, SAPRelationLabels.USES, true);
        if( usesNodes.isEmpty()){
            return new TreeSet<>();
        }

        List<CityElement> usesElements = new ArrayList<>();
        for (Node usesNode: usesNodes ) {
            Long usesNodeID = usesNode.id();
            CityElement usesElement = repository.getElementBySourceID(usesNodeID);
            if(usesElement == null){
                continue;
            }
            usesElements.add(usesElement);
        }
        return usesElements;

    }

    private void createAllMetropolisElements(SourceNodeRepository nodeRepository) {
        createACityElementsFromSourceNodes(nodeRepository, CityElement.CityType.District, SAPNodeProperties.type_name, SAPNodeTypes.Namespace);

        createACityElementsFromSourceNodes(nodeRepository, CityElement.CityType.District, SAPNodeProperties.type_name, SAPNodeTypes.FunctionGroup);
        createACityElementsFromSourceNodes(nodeRepository, CityElement.CityType.Building, SAPNodeProperties.type_name, SAPNodeTypes.FunctionModule);

        createACityElementsFromSourceNodes(nodeRepository, CityElement.CityType.District, SAPNodeProperties.type_name, SAPNodeTypes.Report);
        createACityElementsFromSourceNodes(nodeRepository, CityElement.CityType.Building, SAPNodeProperties.type_name, SAPNodeTypes.Report);
        createACityElementsFromSourceNodes(nodeRepository, CityElement.CityType.Building, SAPNodeProperties.type_name, SAPNodeTypes.FormRoutine);

        createACityElementsFromSourceNodes(nodeRepository, CityElement.CityType.District, SAPNodeProperties.type_name, SAPNodeTypes.Class);

        createACityElementsFromSourceNodes(nodeRepository, CityElement.CityType.District, SAPNodeProperties.type_name, SAPNodeTypes.Interface);

        createACityElementsFromSourceNodes(nodeRepository, CityElement.CityType.Building, SAPNodeProperties.type_name, SAPNodeTypes.Method);
        createACityElementsFromSourceNodes(nodeRepository, CityElement.CityType.Building, SAPNodeProperties.type_name, SAPNodeTypes.Attribute);
    }

    private void createReferenceBuildingRelations() {

        Collection<CityElement> packageDistricts = repository.getElementsByTypeAndSourceProperty(CityElement.CityType.District, SAPNodeProperties.type_name, SAPNodeTypes.Namespace.toString());
        log.info(packageDistricts.size() + "  districts loaded");

        long mountainCounter = 0;
        long seaCounter = 0;
        long cloudCounter = 0;

        for (CityElement packageDistrict: packageDistricts){

            // nur für Hauptpaket (Iteration 0)
            String iterationString = packageDistrict.getSourceNodeProperty(SAPNodeProperties.iteration);
            int iterationInt = Integer.parseInt(iterationString);

            Collection<CityElement> subElements = packageDistrict.getSubElements();

            if(iterationInt == 0) {

                if (!subElements.isEmpty()) {

                    if (Config.Visualization.Metropolis.ReferenceBuilding.show.mountain()) {
                        createRefBuilding(packageDistrict, CityElement.CitySubType.Mountain);
                        mountainCounter++;
                    }

                    if (Config.Visualization.Metropolis.ReferenceBuilding.show.sea()) {
                        createRefBuilding(packageDistrict, CityElement.CitySubType.Sea);
                        seaCounter++;
                    }
                }
            }

            if (Config.Visualization.Metropolis.ReferenceBuilding.show.cloud()) {
                for (CityElement subElement : subElements) { //SubElements = Class/Repo/FuGr-District

                    if (subElement.getType().equals(CityElement.CityType.District)) {
                        String migrationFindingsString = subElement.getSourceNodeProperty(SAPNodeProperties.migration_findings);
                        if (migrationFindingsString.equals("true")) {
                            createRefBuilding(subElement, CityElement.CitySubType.Cloud);
                            cloudCounter++;

                        }
                    }
                }
            }
        }

        log.info(mountainCounter + " refBuildings of type mountain created");
        log.info(seaCounter + " refBuildings of type sea created");
        log.info(cloudCounter + " refBuildings of type cloud created");
    }


    private CityElement createRefBuilding(CityElement packageDistrict, CityElement.CitySubType refBuildingType) {
        CityElement refBuilding = new CityElement(CityElement.CityType.Reference);
        refBuilding.setSubType(refBuildingType);

        repository.addElement(refBuilding);

        packageDistrict.addSubElement(refBuilding);
        refBuilding.setParentElement(packageDistrict);

        return refBuilding;
    }

    private void createAllMetropolisRelations(SourceNodeRepository nodeRepository) {
        createMetropolisRelations(nodeRepository, CityElement.CityType.District);
        createMetropolisRelations(nodeRepository, CityElement.CityType.Building);
    }

    private void createMetropolisRelations(SourceNodeRepository nodeRepository, CityElement.CityType cityType){
        Collection<CityElement> cityElements = repository.getElementsByType(cityType);
        log.info(cityElements.size() + " CityElement with type \"" + cityType.name() + "\" loaded");

        long relationCounter = 0;
        long relationCounterUsesRelation = 0;
        for (CityElement element: cityElements){

            Node sourceNode = element.getSourceNode();

            if(element.getSourceNodeType() == SAPNodeTypes.Report) {
                if(element.getType() == CityElement.CityType.Building){
                    continue;
                }

                createMetropolisRelationsForIdenticalNodes(nodeRepository, sourceNode, element);
                relationCounter++;
            }

            Collection<CityElement> childElements = getChildElementsBySourceNode(nodeRepository, sourceNode);

            for (CityElement childElement: childElements) {

                //No nesting of packages
                if (childElement.getType() == CityElement.CityType.District && childElement.getSourceNodeType() == SAPNodeTypes.Namespace ) {
                    continue;
                }

                if (childElement.getType() == CityElement.CityType.Building && childElement.getSourceNodeType() == SAPNodeTypes.Report) {
                    continue;
                }

                if (childElement.getType() == CityElement.CityType.Building && childElement.getSourceNodeType() == SAPNodeTypes.Interface) {
                    continue;
                }

                element.addSubElement(childElement);
                childElement.setParentElement(element);
                relationCounter++;
            }

            // for uses-relation
            Node sourceNodeDistrict = element.getSourceNode();
            Collection<CityElement> usesElements = getUsesElementsBySourceNode(nodeRepository, sourceNodeDistrict);

            for(CityElement usesElement: usesElements) {

                if (usesElement.getSourceNodeProperty(SAPNodeProperties.local_class).equals("true")) {

                    String elementID = element.getSourceNodeProperty(SAPNodeProperties.element_id);
                    String usesID = usesElement.getSourceNodeProperty(SAPNodeProperties.uses_id);

                    if (elementID.equals(usesID)) {
                        element.addSubElement(usesElement);
                        usesElement.setParentElement(element);
                        relationCounterUsesRelation++;
                    }
                } else if (usesElement.getSourceNodeType() == SAPNodeTypes.Attribute){

                    String elementID = element.getSourceNodeProperty(SAPNodeProperties.element_id);
                    String usesID = usesElement.getSourceNodeProperty(SAPNodeProperties.uses_id);

                    if(element.getSourceNodeType() == SAPNodeTypes.Report){

                        if (elementID.equals(usesID)) {
                            element.addSubElement(usesElement);
                            usesElement.setParentElement(element);
                            relationCounterUsesRelation++;
                        }
                    }
                } else {
                    repository.deleteElement(usesElement); //atm only for local classes, attributes are deleted
                }
            }
        }

        log.info(relationCounter + " childRelations for relation \"CONTAINS\" created");
        log.info(relationCounterUsesRelation + " usesRelations for relation \"USES\" created");

    }

    private void createMetropolisRelationsForIdenticalNodes(SourceNodeRepository nodeRepository, Node sourceNode, CityElement element) {

        CityElement buildingParentElements = getParentElementBySourceNode(nodeRepository, sourceNode);

        element.setParentElement(buildingParentElements);
        buildingParentElements.addSubElement(element);

        String buildingElementTypeName = element.getSourceNodeType().name();

        Collection<CityElement> BuildingElements = repository.getElementsByTypeAndSourceProperty(CityElement.CityType.Building, SAPNodeProperties.type_name, buildingElementTypeName);
        for (CityElement buildingElement: BuildingElements) {

            String districtTypename = element.getSourceNodeProperty(SAPNodeProperties.element_id);
            String buildingTypeName = buildingElement.getSourceNodeProperty(SAPNodeProperties.element_id);

            if(buildingTypeName.equals(districtTypename)){

                element.addSubElement(buildingElement);
                buildingElement.setParentElement(element);

            }
        }
    }

    private void deleteEmptyDistricts() {

        Collection<CityElement> districtsWithoutParents = repository.getElementsByTypeAndSourceProperty(CityElement.CityType.District, SAPNodeProperties.type_name, "Namespace");

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

    private void removeSubElementsFromDistrict(CityElement district, Collection<CityElement> subElements) {
        for (CityElement subElement: subElements){
            if(subElement.getType() == CityElement.CityType.District){
                continue;
            }
            district.removeSubElement(subElement);
        }
    }

    private Collection<CityElement> getChildElementsBySourceNode(SourceNodeRepository nodeRepository, Node node) {

        Collection<Node> childNodes = nodeRepository.getRelatedNodes(node, SAPRelationLabels.CONTAINS, true);
        if( childNodes.isEmpty()){
            return new TreeSet<>();
        }

        List<CityElement> childElements = new ArrayList<>();
        for (Node childNode: childNodes ) {
            Long childNodeID = childNode.id();
            CityElement childElement = repository.getElementBySourceID(childNodeID);
            if(childElement == null){
                continue;
            }
            childElements.add(childElement);
        }
        return childElements;
    }

    private CityElement getParentElementBySourceNode(SourceNodeRepository nodeRepository, Node node) {
        Collection<Node> parentNodes = nodeRepository.getRelatedNodes(node, SAPRelationLabels.CONTAINS, false);
        if(parentNodes.isEmpty()) {
            return null;
        }

        Node parentNode = parentNodes.iterator().next();
        Long parentNodeId = parentNode.id();

        CityElement parentElement = repository.getElementBySourceID(parentNodeId);
        return parentElement;
    }

    private void createACityElementsFromSourceNodes(SourceNodeRepository nodeRepository, CityElement.CityType cityType, SAPNodeProperties property, SAPNodeTypes nodeType) {
        Collection<Node> sourceNodes = nodeRepository.getNodesByProperty(property, nodeType.name());

        log.info(sourceNodes.size() + " SourceNodes with property \"" + property + "\" and value \"" + nodeType.name() + "\" loaded");
        List<CityElement> cityElements = createACityElements(sourceNodes, cityType);
        repository.addElements(cityElements);

        log.info(cityElements.size() + " ACityElements of type \"" + cityType + "\" created");
    }

    private List<CityElement> createACityElements(Collection<Node> sourceNodes, CityElement.CityType cityType) {
        List<CityElement> cityElements = new ArrayList<>();

        for( Node sourceNode: sourceNodes ) {
            CityElement cityElement = new CityElement(cityType);
            cityElement.setSourceNode(sourceNode);
            cityElements.add(cityElement);
        }

        return cityElements;
    }
}
