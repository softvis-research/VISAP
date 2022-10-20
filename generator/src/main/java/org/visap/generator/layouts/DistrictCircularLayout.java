package org.visap.generator.layouts;

import org.visap.generator.abap.AElementArranger;
import org.visap.generator.configuration.Config;
import org.visap.generator.layouts.enums.LayoutVersion;
import org.visap.generator.layouts.kdtree.CityKDTree;
import org.visap.generator.layouts.kdtree.CityKDTreeNode;
import org.visap.generator.layouts.kdtree.CityRectangle;
import org.visap.generator.repository.CityElement;

import java.util.*;

public class DistrictCircularLayout {
    //Old coding -> Refactor, generalize and maybe reimplement
    private final CityElement district;
    private final Collection<CityElement> subElements;

    private final Map<CityRectangle, CityElement> rectangleElementsMap;

    public DistrictCircularLayout(CityElement district, Collection<CityElement> subElements) {
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

        double xPosition = fitNode.getCityRectangle().getCenterX();// - config.getBuildingHorizontalGap() / 2;
        double xPositionDelta = xPosition - element.getXPosition();
        element.setXPosition(xPosition);

        double zPosition = fitNode.getCityRectangle().getCenterY();//- config.getBuildingHorizontalGap() / 2;
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
            double centerY = element.getYPosition();
            double centerZ = element.getZPosition();

            double newXPosition = centerX + parentX + Config.Visualization.Metropolis.district.horizontalBuildingMargin();
            double newZPosition = centerZ + parentZ + Config.Visualization.Metropolis.district.horizontalBuildingGap();

            element.setXPosition(newXPosition);
            element.setZPosition(newZPosition);

            Collection<CityElement> subElements = element.getSubElements();
            if(!subElements.isEmpty()){
                adjustPositionsOfSubSubElements(subElements, parentX, parentZ);
            }
        }
    }


    /*
        Copied from CityLayout
     */

    private CityRectangle arrangeSubElements(Collection<CityElement> subElements) {
        // get maxArea (worst case) for root of KDTree
        CityRectangle docCityRectangle = calculateMaxAreaRoot(subElements);
        CityKDTree ptree = new CityKDTree(docCityRectangle);

        CityRectangle covrec = new CityRectangle();

        List<CityRectangle> elements = createCityRectanglesOfElements(subElements);
        Collections.sort(elements);
        Collections.reverse(elements);

        // TODO: Review
        List<CityRectangle> originSet;
        List<CityRectangle> customCode;
        List<CityRectangle> standardCode;

        AElementArranger arranger = new AElementArranger();
        List<List<CityRectangle>> listOfSets = arranger.constructElementSets(elements, rectangleElementsMap);
        originSet = listOfSets.get(0);
        customCode = listOfSets.get(1);
        standardCode = listOfSets.get(2);

        // Light Map algorithm for the origin set
        for (CityRectangle el : originSet) {
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


        arrangeDistrictsCircular(customCode, covrec);
        arrangeDistrictsCircular(standardCode, covrec);

        return covrec; // used to adjust viewpoint in x3d
    }

    private void arrangeDistrictsCircular(List<CityRectangle> elements, CityRectangle covrec) {
        double covrecRadius = covrec.getPerimeterRadius() + Config.Visualization.Metropolis.district.horizontalDistrictGap();
        LayoutVersion version = Config.Visualization.Metropolis.district.layoutVersion();

        if (elements.size() == 0)
            return;
        else {

            CityRectangle biggestRec = elements.get(0);
            double maxOuterRadius = biggestRec.getPerimeterRadius();
            double sumOfPerimeterRadius = 0;

            for (CityRectangle element : elements) {
                sumOfPerimeterRadius += element.getPerimeterRadius() + Config.Visualization.Metropolis.district.horizontalDistrictGap();

                if(element.getPerimeterRadius() > maxOuterRadius) {
                    maxOuterRadius = element.getPerimeterRadius();
                    biggestRec = element;
                    elements.remove(element);
                    elements.add(0, biggestRec);
                }

            }

            double minRadius = maxOuterRadius
                    + covrecRadius
                    + Config.Visualization.Metropolis.district.horizontalDistrictGap();

            double maxRadius = 0;

            // new estimation of the radius
            if (elements.size() > 1)
                maxRadius = (sumOfPerimeterRadius / elements.size()) / Math.sin(Math.PI / elements.size())
                        + Config.Visualization.Metropolis.district.horizontalDistrictGap();

            double radius = Math.max(minRadius, maxRadius);


            CityElement biggestRectangle = rectangleElementsMap.get(biggestRec);

            double xPosition = covrec.getCenterX() + radius;
            double xPositionDelta = xPosition - biggestRectangle.getXPosition();
            biggestRectangle.setXPosition(xPosition);

            double zPosition = covrec.getCenterY();
            double zPositionDelta = zPosition - biggestRectangle.getZPosition();
            biggestRectangle.setZPosition(zPosition);

            Collection<CityElement> subElements = biggestRectangle.getSubElements();
            if(!subElements.isEmpty()){
                adjustPositionsOfSubSubElements(subElements, xPositionDelta, zPositionDelta);
            }

            if (elements.size() > 1) {

                double cacheRotationAngle = 0;

                for (int i = 1; i < elements.size(); ++i) {

                    CityRectangle previousRec = elements.get(i - 1);
                    CityRectangle currentRec = elements.get(i);

                    double previousRadius = previousRec.getPerimeterRadius();
                    //+ config.getBuildingHorizontalGap();

                    double currentRadius = currentRec.getPerimeterRadius();
                    //+ config.getBuildingHorizontalGap();

                    double rotationAngle = 0;

                    switch (version) {
                        case MINIMAL_DISTANCE ->
//							rotationAngle = Math.acos(1 - (Math.pow(previousRadius + currentRadius, 2) / (2 * Math.pow(radius, 2))));
                                rotationAngle = 2 * Math.asin((previousRadius + currentRadius) / (2 * radius));
                        case FULL_CIRCLE -> {
                            double idealRotationAngle = 2 * Math.PI / elements.size() - cacheRotationAngle;
                            double leastRotationAngle = 2 * Math.asin((previousRadius + currentRadius) / (2 * radius));
                            if (idealRotationAngle >= leastRotationAngle) {
                                rotationAngle = idealRotationAngle;
                                cacheRotationAngle = 0;
                            } else {
                                rotationAngle = leastRotationAngle;
                                cacheRotationAngle = leastRotationAngle - idealRotationAngle;
                            }
                        }
                        default ->
//							rotationAngle = Math.acos(1 - (Math.pow(previousRadius + currentRadius, 2) / (2 * Math.pow(radius, 2))));
                                rotationAngle = 2 * Math.asin((previousRadius + currentRadius) / (2 * radius));
                    }

                    CityElement previousRectangle = rectangleElementsMap.get(previousRec);
                    CityElement currentRectangle = rectangleElementsMap.get(currentRec);

                    double newX = (previousRectangle.getXPosition() - covrec.getCenterX()) * Math.cos(rotationAngle)
                            - (previousRectangle.getZPosition() - covrec.getCenterY()) * Math.sin(rotationAngle)
                            + covrec.getCenterX();

                    double xPositionDeltaManyDistricts = newX - currentRectangle.getXPosition();
                    currentRectangle.setXPosition(newX);



                    double newZ = (previousRectangle.getXPosition() - covrec.getCenterX()) * Math.sin(rotationAngle)
                            + (previousRectangle.getZPosition() - covrec.getCenterY()) * Math.cos(rotationAngle)
                            + covrec.getCenterY();

                    double zPositionDeltaManyDistricts = newZ - currentRectangle.getZPosition();
                    currentRectangle.setZPosition(newZ);


                    Collection<CityElement> subElementsManyDistricts = currentRectangle.getSubElements();
                    if(!subElementsManyDistricts.isEmpty()){
                        adjustPositionsOfSubSubElements(subElementsManyDistricts, xPositionDeltaManyDistricts, zPositionDeltaManyDistricts);
                    }

                }
            }

            double newCovrecWidth = 2 * radius + (Math.max(biggestRec.getWidth(), biggestRec.getLength()));
            covrec.changeRectangle(covrec.getCenterX(), covrec.getCenterY(), newCovrecWidth, newCovrecWidth, 0);
        }
    }

    private List<CityRectangle> createCityRectanglesOfElements(Collection<CityElement> elements) {
        List<CityRectangle> rectangles = new ArrayList<>();

        for (CityElement element : elements) {
            double width = element.getWidth();
            double length = element.getLength();

            CityRectangle rectangle = new CityRectangle(0, 0, width + Config.Visualization.Metropolis.district.horizontalDistrictGap(),
                    length + Config.Visualization.Metropolis.district.horizontalDistrictGap(), 1);
            rectangles.add(rectangle);
            rectangleElementsMap.put(rectangle, element);
        }
        return rectangles;
    }


    private CityRectangle calculateMaxAreaRoot(Collection<CityElement> elements) {
        double sum_width = 0;
        double sum_length = 0;
        for (CityElement element : elements) {
            sum_width += element.getWidth() + Config.Visualization.Metropolis.district.horizontalDistrictGap();
            sum_length += element.getLength() + Config.Visualization.Metropolis.district.horizontalDistrictGap();
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
        covrec.changeRectangle(0, 0, newX, newY);
    }
}
