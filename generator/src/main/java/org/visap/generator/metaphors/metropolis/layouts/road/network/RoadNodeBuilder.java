package org.visap.generator.metaphors.metropolis.layouts.road.network;

import java.util.ArrayList;
import java.util.List;

import org.visap.generator.configuration.Config;
import org.visap.generator.repository.CityElement;

public class RoadNodeBuilder {

    public RoadNodeBuilder() { }

    private static final double horizontalDistrictMargin = Config.Visualization.Metropolis.district.horizontalDistrictMargin();
    private static final double horizontalDistrictGap = Config.Visualization.Metropolis.district.horizontalDistrictGap();

    public List<RoadNode> calculateMarginRoadNodes(CityElement district) {
        List<RoadNode> marginNodes = new ArrayList<RoadNode>();

        double rightX = district.getXPosition() + district.getWidth() / 2.0 - horizontalDistrictMargin;

        double leftX = district.getXPosition() - district.getWidth() / 2.0 + horizontalDistrictMargin;

        double upperY = district.getZPosition() + district.getLength() / 2.0 - horizontalDistrictMargin;

        double lowerY = district.getZPosition() - district.getLength() / 2.0 + horizontalDistrictMargin;

        RoadNode upperNode = new RoadNode(district.getXPosition(), upperY);
        RoadNode rightNode = new RoadNode(rightX, district.getZPosition());
        RoadNode lowerNode = new RoadNode(district.getXPosition(), lowerY);
        RoadNode leftNode = new RoadNode(leftX, district.getZPosition());

        RoadNode upperLeftNode = new RoadNode(leftX, upperY);
        RoadNode upperRightNode = new RoadNode(rightX, upperY);

        RoadNode lowerLeftNode = new RoadNode(leftX, lowerY);
        RoadNode lowerRightNode = new RoadNode(rightX, lowerY);

        marginNodes.add(upperNode);
        marginNodes.add(rightNode);
        marginNodes.add(lowerNode);
        marginNodes.add(leftNode);

        marginNodes.add(upperLeftNode);
        marginNodes.add(upperRightNode);
        marginNodes.add(lowerLeftNode);
        marginNodes.add(lowerRightNode);

        return marginNodes;
    }

    public List<RoadNode> calculateSurroundingRoadNodes(CityElement element) {
        List<RoadNode> surroundingNodes = new ArrayList<RoadNode>();

        surroundingNodes.addAll(this.calculateSlipRoadNodes(element));
        surroundingNodes.addAll(this.calculateCornerRoadNodes(element));

        return surroundingNodes;
    }

    public List<RoadNode> calculateSlipRoadNodes(CityElement element) {

        // 4 nodes, each per direction
        List<RoadNode> slipNodes = new ArrayList<RoadNode>(4);

        // TODO
        // In ADistrictLightMapLayout/ADistrictCircularLayout Breite der Strassen
        // einbeziehen, dann kann die Breite auch hier beruecksichtigt werden
        // Ist das perspektivisch sinnvoll?

        double rightX = element.getXPosition() + element.getWidth() / 2.0
                + horizontalDistrictGap / 2.0; // + roadWidth / 2.0;

        double leftX = element.getXPosition() - element.getWidth() / 2.0
                - horizontalDistrictGap / 2.0; // - roadWidth / 2.0;

        double upperY = element.getZPosition() + element.getLength() / 2.0
                + horizontalDistrictGap / 2.0; // + roadWidth / 2.0;

        double lowerY = element.getZPosition() - element.getLength() / 2.0
                - horizontalDistrictGap / 2.0; // - roadWidth / 2.0;

        RoadNode upperNode = new RoadNode(element.getXPosition(), upperY);
        RoadNode rightNode = new RoadNode(rightX, element.getZPosition());
        RoadNode lowerNode = new RoadNode(element.getXPosition(), lowerY);
        RoadNode leftNode = new RoadNode(leftX, element.getZPosition());

        slipNodes.add(upperNode);
        slipNodes.add(rightNode);
        slipNodes.add(lowerNode);
        slipNodes.add(leftNode);

        return slipNodes;
    }

    public List<RoadNode> calculateCornerRoadNodes(CityElement element) {

        // 4 nodes, each per corner of area
        List<RoadNode> cornerNodes = new ArrayList<RoadNode>(4);

        // TODO
        // In ADistrictLightMapLayout/ADistrictCircularLayout Breite der Strassen
        // einbeziehen, dann kann die Breite auch hier beruecksichtigt werden
        // Ist das perspektivisch sinnvoll?

        double rightX = element.getXPosition() + element.getWidth() / 2.0
                + horizontalDistrictGap / 2.0; // + roadWidth / 2.0;

        double leftX = element.getXPosition() - element.getWidth() / 2.0
                - horizontalDistrictGap / 2.0; // - roadWidth / 2.0;

        double upperY = element.getZPosition() + element.getLength() / 2.0
                + horizontalDistrictGap / 2.0; // + roadWidth / 2.0;

        double lowerY = element.getZPosition() - element.getLength() / 2.0
                - horizontalDistrictGap / 2.0; // - roadWidth / 2.0;

        RoadNode upperLeftNode = new RoadNode(leftX, upperY);
        RoadNode upperRightNode = new RoadNode(rightX, upperY);

        RoadNode lowerLeftNode = new RoadNode(leftX, lowerY);
        RoadNode lowerRightNode = new RoadNode(rightX, lowerY);

        cornerNodes.add(upperLeftNode);
        cornerNodes.add(upperRightNode);
        cornerNodes.add(lowerLeftNode);
        cornerNodes.add(lowerRightNode);

        return cornerNodes;
    }

    public RoadNode calculateDistrictSlipRoadNode(CityElement district, RoadNode slipNode) {
        double x, y;
        double roadWidth = Math.min(Config.Visualization.Metropolis.roadNetwork.roadWidth(), Config.Visualization.Metropolis.district.horizontalBuildingGap());

        if (district.getXPosition() == slipNode.getX()) {
            x = district.getXPosition();
            y = district.getZPosition()
                    + Math.signum(slipNode.getY() - district.getZPosition())
                        * (district.getLength() / 2.0 + roadWidth / 2.0);
        } else {
            x = district.getXPosition()
                    + Math.signum(slipNode.getX() - district.getXPosition())
                        * (district.getWidth() / 2.0 + roadWidth / 2.0);
            y = district.getZPosition();
        }

        return new RoadNode(x, y);
    }

    public RoadNode calculateDistrictMarginRoadNode(CityElement district, RoadNode slipNode) {
        double x, y;

        if (district.getXPosition() == slipNode.getX()) {
            x = district.getXPosition();
            y = district.getZPosition() + Math.signum(slipNode.getY() - district.getZPosition()) * (district.getLength() / 2.0 - horizontalDistrictMargin);
        } else {
            x = district.getXPosition() + Math.signum(slipNode.getX() - district.getXPosition()) * (district.getWidth() / 2.0 - horizontalDistrictMargin);
            y = district.getZPosition();
        }

        return new RoadNode(x, y);
    }

}