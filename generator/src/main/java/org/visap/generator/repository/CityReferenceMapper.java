package org.visap.generator.repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;

import org.visap.generator.abap.enums.SAPNodeTypes;
import org.visap.generator.abap.enums.SAPRelationLabels;
import org.visap.generator.repository.CityElement.CityType;
import org.neo4j.driver.types.Node;

public class CityReferenceMapper implements ICityRelationMapper {

    private SourceNodeRepository nodeRepository;
    private CityRepository repository;

    public CityReferenceMapper(SourceNodeRepository nodeRepository, CityRepository repository) {
        this.nodeRepository = nodeRepository;
        this.repository = repository;
    }

    private List<CityElement> getReferencedACityElements(CityElement building, boolean reverse) {
        if (building.getSourceNode() == null) {
            return null;
        }

        List<CityElement> referencedElements = new ArrayList<CityElement>();

        Collection<Node> referencedNodes = this.nodeRepository.getRelatedNodes(building.getSourceNode(), SAPRelationLabels.REFERENCES, !reverse);

        // map source nodes to concrete acity elements
        for (Node referencedNode : referencedNodes) {
            CityElement correspondingElement = this.repository.getElementBySourceID(referencedNode.id());
            referencedElements.add(correspondingElement);
        }

        return referencedElements;
    }

    @Override
    public Collection<CityElement> getRelatedACityElements(CityElement element, boolean reverse) {

        // eliminate duplicates
        return new HashSet<CityElement>(getRelatedACityElementsWithDuplicates(element, reverse));
    }

    private List<CityElement> getRelatedACityElementsWithDuplicates(CityElement element, boolean reverse) {
        if (element.getSourceNode() == null) {
            return null;
        }

        List<CityElement> referencedElements = new ArrayList<CityElement>();

        if (element.getSourceNodeType() == SAPNodeTypes.Namespace) {
            for (CityElement packageChild : element.getSubElements()) {
                if (packageChild.getType() == CityType.Reference) {
                    continue;
                }

                referencedElements.addAll(getRelatedACityElementsWithDuplicates(packageChild, reverse));
            }
            return referencedElements;
        }

        switch (element.getSourceNodeType()) {
            case Report:

                referencedElements.addAll(getReferencedACityElements(element, reverse));

                // special case: only get relations of report itself, not of his sub objects
                if (element.getType() == CityType.Building) {
                    return referencedElements;
                }

            case FunctionGroup:
            case Class:

                // get related entities for local classes
                for (CityElement localClass : element.getSubElementsOfSourceNodeType(SAPNodeTypes.Class)) {
                    referencedElements.addAll(getRelatedACityElementsWithDuplicates(localClass, reverse));
                }

            case Interface:

                switch (element.getSourceNodeType()) {
                    case Class:
                    case Interface:
                        for (CityElement method : element.getSubElementsOfSourceNodeType(SAPNodeTypes.Method)) {
                            referencedElements.addAll(getRelatedACityElementsWithDuplicates(method, reverse));
                        }
                        break;

                    case FunctionGroup:
                        for (CityElement functionModule : element.getSubElementsOfSourceNodeType(SAPNodeTypes.FunctionModule)) {
                            referencedElements.addAll(getRelatedACityElementsWithDuplicates(functionModule, reverse));
                        }
                        // no break because both function groups and reports may contain formroutines
                    case Report:
                        for (CityElement formRoutine : element.getSubElementsOfSourceNodeType(SAPNodeTypes.FormRoutine)) {
                            referencedElements.addAll(getRelatedACityElementsWithDuplicates(formRoutine, reverse));
                        }

                    default:
                        break;
                }

                break;


            case Method:
            case FunctionModule:
            case FormRoutine:

                // they don't contain any further sub elements
                return this.getReferencedACityElements(element, reverse);

            default:
                break;
        }

        return referencedElements;
    }

    @Override
    public Collection<CityElement> getAggregatedRelatedACityElements(CityElement element, RelationAggregationLevel aggregationLevel, boolean reverse) {
        Collection<CityElement> aggregatedReferencedACityElements = new HashSet<CityElement>();

        for (CityElement referencedElement : getRelatedACityElementsWithDuplicates(element, reverse)) {
            aggregatedReferencedACityElements.add(this.getAggregatedObject(referencedElement, aggregationLevel));
        }

        return aggregatedReferencedACityElements;
    }

    @Override
    public int getAmountOfRelatedACityElements(CityElement element, boolean reverse) {
        return getRelatedACityElements(element, reverse).size();
    }

    @Override
    public int getAmountOfRelationsToACityElement(CityElement source, CityElement target, boolean reverse) {

        int amountOfRelations = 0;
        RelationAggregationLevel targetAggregationLevel = this.mapToAggregationLevel(target);

        List<CityElement> referencedElements = getRelatedACityElementsWithDuplicates(source, reverse);

        for (CityElement referencedElement : referencedElements) {
            if (target == this.getAggregatedObject(referencedElement, targetAggregationLevel)) {
                amountOfRelations++;
            }
        }

        return amountOfRelations;
    }

    public RelationAggregationLevel mapToAggregationLevel(CityElement element) {
        switch (element.getType()) {
            case Building:
            case Reference:
                return RelationAggregationLevel.BUILDING;

            case District:

                switch (element.getSourceNodeType()) {
                    case Namespace:
                        return RelationAggregationLevel.PACKAGE_DISTRICT;

                    case FunctionGroup:
                    case Report:
                        return RelationAggregationLevel.SOURCE_CODE_DISTRICT;

                    case Class:
                    case Interface:
                        // treat local classes and local interfaces as buildings
                        if (element.getParentElement().getSourceNodeType() == SAPNodeTypes.Class
                                || element.getParentElement().getSourceNodeType() == SAPNodeTypes.FunctionGroup
                                || element.getParentElement().getSourceNodeType() == SAPNodeTypes.Report) {
                            return RelationAggregationLevel.BUILDING;
                        } else {
                            return RelationAggregationLevel.SOURCE_CODE_DISTRICT;
                        }

                    default:
                        return null;
                }

            default:
                return null;
        }
    }

    private CityElement getAggregatedObject(CityElement element, RelationAggregationLevel aggregationLevel) {
        if (element == null) {
            return null;
        }
        
        if (this.mapToAggregationLevel(element) == aggregationLevel) {
            return element;
        }

        if (element.getParentElement() == null) {
            return null;
        }

        return getAggregatedObject(element.getParentElement(), aggregationLevel);
    }

}