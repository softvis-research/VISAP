package org.visap.generator.layouts;

import org.visap.generator.layouts.kdtree.CityKDTree;
import org.visap.generator.layouts.kdtree.CityKDTreeNode;
import org.visap.generator.layouts.kdtree.CityRectangle;
import org.visap.generator.repository.CityElement;

import org.visap.generator.configuration.Config;

import java.math.BigDecimal;
import java.util.*;

public class DistrictLightMapLayout {
    // Old coding -> Refactor, generalize and maybe reimplement

    private CityElement district;
    private Collection<CityElement> subElements;

    private Map<CityRectangle, CityElement> rectangleElementsMap;

    public DistrictLightMapLayout(CityElement district, Collection<CityElement> subElements) {
        this.district = district;
        this.subElements = subElements;

        rectangleElementsMap = new HashMap<>();
    }

    public void calculate(){
        CityRectangle coveringCityRectangle = arrangeSubElements(subElements);

        setSizeOfDistrict(coveringCityRectangle);

        setPositionOfDistrict(coveringCityRectangle);
    }


    private void setSizeOfDistrict(CityRectangle coveringCityRectangle) {
        district.setWidth(coveringCityRectangle.getWidth());
        district.setLength(coveringCityRectangle.getLength());
        district.setHeight(Config.Visualization.Metropolis.district.districtHeight());
    }

    private void setPositionOfDistrict(CityRectangle coveringCityRectangle) {
        district.setXPosition(coveringCityRectangle.getCenterX());
        district.setYPosition(district.getHeight() / 2);
        district.setZPosition(coveringCityRectangle.getCenterY());
    }

    private void setNewPositionFromNode(CityRectangle rectangle, CityKDTreeNode fitNode) {
        CityElement element = rectangleElementsMap.get(rectangle);

        double xPosition = fitNode.getCityRectangle().getCenterX();
        double xPositionDelta = xPosition - element.getXPosition();
        element.setXPosition(xPosition);

        double zPosition = fitNode.getCityRectangle().getCenterY();
        double zPositionDelta = zPosition - element.getZPosition();
        element.setZPosition(zPosition);

        Collection<CityElement> subElements = element.getSubElements();
        if(!subElements.isEmpty()){
            adjustPositionsOfSubSubElements(subElements, xPositionDelta, zPositionDelta);
        }
    }

    private void adjustPositionsOfSubSubElements(Collection<CityElement> elements, double parentX, double parentZ) {
        for (CityElement element : elements) {

            double centerX = element.getXPosition();
            double newXPosition = centerX + parentX + Config.Visualization.Metropolis.district.horizontalDistrictMargin();
            element.setXPosition(newXPosition);

            double centerZ = element.getZPosition();
            double newZPosition = centerZ + parentZ + Config.Visualization.Metropolis.district.horizontalDistrictMargin();
            element.setZPosition(newZPosition);

            Collection<CityElement> subElements = element.getSubElements();
            if(!subElements.isEmpty()){
                adjustPositionsOfSubSubElements(subElements, parentX,  parentZ);
            }
        }
    }

    /*
        Copied from CityLayout
     */

    private CityRectangle arrangeSubElements(Collection<CityElement> subElements){

        CityRectangle docCityRectangle = calculateMaxAreaRoot(subElements);
        CityKDTree ptree = new CityKDTree(docCityRectangle);

        CityRectangle covrec = new CityRectangle();

        List<CityRectangle> elements = createACityRectanglesOfElements(subElements);
        Collections.sort(elements);
        Collections.reverse(elements);

        // algorithm
        for (CityRectangle el : elements) {

            Map<CityKDTreeNode, Double> preservers = new LinkedHashMap<>();
            Map<CityKDTreeNode, Double> expanders = new LinkedHashMap<>();
            CityKDTreeNode targetNode = new CityKDTreeNode();
            CityKDTreeNode fitNode = new CityKDTreeNode();

            List<CityKDTreeNode> pnodes = ptree.getFittingNodes(el);

            // check all empty leaves: either they extend COVREC (->expanders) or it doesn't
            // change (->preservers)
            for (CityKDTreeNode pnode : pnodes) {
                sortEmptyLeaf(pnode, el, covrec, preservers, expanders);
            }

            // choose best-fitting pnode
            if (!preservers.isEmpty()) {
                targetNode = bestFitIsPreserver(preservers.entrySet());
            } else {
                targetNode = bestFitIsExpander(expanders.entrySet());
            }

            // modify targetNode if necessary
            if (targetNode.getCityRectangle().getWidth() == el.getWidth()
                    && targetNode.getCityRectangle().getLength() == el.getLength()) { // this if could probably be skipped,
                // trimmingNode() always returns
                // fittingNode
                fitNode = targetNode;
            } else {
                fitNode = trimmingNode(targetNode, el);
            }

            // set fitNode as occupied
            fitNode.setOccupied();

            // give Entity it's Position
            setNewPositionFromNode(el, fitNode);

            // if fitNode expands covrec, update covrec
            if (fitNode.getCityRectangle().getBottomRightX() > covrec.getBottomRightX()
                    || fitNode.getCityRectangle().getBottomRightY() > covrec.getBottomRightY()) {
                updateCovrec(fitNode, covrec);
            }
        }

        return covrec;
    }

    private List<CityRectangle> createACityRectanglesOfElements(Collection<CityElement> elements) {
        List<CityRectangle> rectangles = new ArrayList<>();

        for (CityElement element : elements) {

            double width = element.getWidth();
            double length = element.getLength();

            CityRectangle rectangle = new CityRectangle(0, 0, width + Config.Visualization.Metropolis.district.horizontalBuildingGap(),
                    length + Config.Visualization.Metropolis.district.horizontalBuildingGap(), 1);
            rectangles.add(rectangle);
            rectangleElementsMap.put(rectangle, element);
        }
        return rectangles;
    }


    private CityRectangle calculateMaxAreaRoot(Collection<CityElement> elements) {
        double sum_width = 0;
        double sum_length = 0;
        for (CityElement element : elements) {
            sum_width += element.getWidth() + Config.Visualization.Metropolis.district.horizontalBuildingGap();
            sum_length += element.getLength() + Config.Visualization.Metropolis.district.horizontalBuildingGap();
        }
        return new CityRectangle(0, 0, sum_width, sum_length, 1);
    }

    private void sortEmptyLeaf(CityKDTreeNode pnode, CityRectangle el, CityRectangle covrec,
                               Map<CityKDTreeNode, Double> preservers, Map<CityKDTreeNode, Double> expanders) {
        // either element fits in current bounds (->preservers) or it doesn't
        // (->expanders)
        double nodeUpperLeftX = pnode.getCityRectangle().getUpperLeftX();
        double nodeUpperLeftY = pnode.getCityRectangle().getUpperLeftY();
        double nodeNewBottomRightX = nodeUpperLeftX + el.getWidth(); // expected BottomRightCorner, if el was insert
        // into pnode
        double nodeNewBottomRightY = nodeUpperLeftY + el.getLength(); // this new corner-point is compared with covrec

        if (nodeNewBottomRightX <= covrec.getBottomRightX() && nodeNewBottomRightY <= covrec.getBottomRightY()) {
            double waste = pnode.getCityRectangle().getArea() - el.getArea();
            preservers.put(pnode, waste);
        } else {
            double ratio = ((Math.max(nodeNewBottomRightX, covrec.getBottomRightX()))
                    / (Math.max(nodeNewBottomRightY, covrec.getBottomRightY())));
            expanders.put(pnode, ratio);
        }
    }

    private CityKDTreeNode bestFitIsPreserver(Set<Map.Entry<CityKDTreeNode, Double>> entrySet) {
        // determines which entry in Set has the lowest value of all
        double lowestValue = -1;
        CityKDTreeNode targetNode = new CityKDTreeNode();
        for (Map.Entry<CityKDTreeNode, Double> entry : entrySet) {
            if (entry.getValue() < lowestValue || lowestValue == -1) {
                lowestValue = entry.getValue();
                targetNode = entry.getKey();
            }
        }
        return targetNode;
    }

    private CityKDTreeNode bestFitIsExpander(Set<Map.Entry<CityKDTreeNode, Double>> entrySet) {
        double closestTo = 1;
        double lowestDistance = -1;
        CityKDTreeNode targetNode = new CityKDTreeNode();
        for (Map.Entry<CityKDTreeNode, Double> entry : entrySet) {
            double distance = Math.abs(entry.getValue() - closestTo);
            if (distance < lowestDistance || lowestDistance == -1) {
                lowestDistance = distance;
                targetNode = entry.getKey();
            }
        }
        return targetNode;
    }

    private CityKDTreeNode trimmingNode(CityKDTreeNode node, CityRectangle r) {

        double nodeUpperLeftX = node.getCityRectangle().getUpperLeftX();
        double nodeUpperLeftY = node.getCityRectangle().getUpperLeftY();
        double nodeBottomRightX = node.getCityRectangle().getBottomRightX();
        double nodeBottomRightY = node.getCityRectangle().getBottomRightY();

        // first split: horizontal cut, if necessary
        // Round to 3 digits to prevent infinity loop, because e.g. 12.34000000007 is
        // declared equal to 12.34
        if (Math.round(node.getCityRectangle().getLength() * 1000d) != Math.round(r.getLength() * 1000d)) {
            // new child-nodes
            node.setLeftChild(new CityKDTreeNode(
                    new CityRectangle(nodeUpperLeftX, nodeUpperLeftY, nodeBottomRightX, (nodeUpperLeftY + r.getLength()))));
            node.setRightChild(new CityKDTreeNode(new CityRectangle(nodeUpperLeftX, (nodeUpperLeftY + r.getLength()),
                    nodeBottomRightX, nodeBottomRightY)));
            // set node as occupied (only leaves can contain elements)
            node.setOccupied();



            return trimmingNode(node.getLeftChild(), r);
            // second split: vertical cut, if necessary
            // Round to 3 digits, because e.g. 12.34000000007 is declared equal to 12.34
        } else if (Math.round(node.getCityRectangle().getWidth() * 1000d) != Math.round(r.getWidth() * 1000d)) {
            // new child-nodes
            node.setLeftChild(new CityKDTreeNode(
                    new CityRectangle(nodeUpperLeftX, nodeUpperLeftY, (nodeUpperLeftX + r.getWidth()), nodeBottomRightY)));
            node.setRightChild(new CityKDTreeNode(new CityRectangle((nodeUpperLeftX + r.getWidth()), nodeUpperLeftY,
                    nodeBottomRightX, nodeBottomRightY)));
            // set node as occupied (only leaves can contain elements)
            node.setOccupied();


            return node.getLeftChild();
        } else {

            return node;
        }
    }

    private void updateCovrec(CityKDTreeNode fitNode, CityRectangle covrec) {
        double newX = (Math.max(fitNode.getCityRectangle().getBottomRightX(), covrec.getBottomRightX()));
        double newY = (Math.max(fitNode.getCityRectangle().getBottomRightY(), covrec.getBottomRightY()));
        BigDecimal newY_big = BigDecimal.valueOf(newY);
        covrec.changeRectangle(0, 0, newX, newY_big.doubleValue());
    }

}
