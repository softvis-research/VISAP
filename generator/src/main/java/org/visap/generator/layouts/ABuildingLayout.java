package org.visap.generator.layouts;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.configuration.Config;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.abap.enums.SAPNodeTypes;
import org.visap.generator.layouts.ABuildingSegmentLayout;
import org.visap.generator.repository.ACityElement;

import java.util.Collection;

public class ABuildingLayout {

    private Log log = LogFactory.getLog(this.getClass());
    private ACityElement building;
    private Collection<ACityElement> floors;
    private Collection<ACityElement> chimneys;

    public ABuildingLayout(ACityElement building, Collection<ACityElement> floors, Collection<ACityElement> chimneys) {

        this.building = building;
        this.floors = floors;
        this.chimneys = chimneys;
    }

    public void calculate(){

        ABuildingSegmentLayout buildingSegmentLayout = new ABuildingSegmentLayout(building, floors, chimneys);
        buildingSegmentLayout.calculate();

        setSizeOfBuilding();
        setPositionOfBuilding();
    }

    private void setPositionOfBuilding() {

        building.setXPosition(0.0);
        building.setYPosition(building.getHeight() / 2);
        building.setZPosition(0.0);

    }
    private void setSizeOfBuilding() {
        ACityElement.ACitySubType referenceBuildingType = building.getSubType();

        if(referenceBuildingType != null) {
            switch (referenceBuildingType) {
                case Sea:
                    building.setHeight(Config.Visualization.Metropolis.ReferenceBuilding.sea.height());
                    building.setWidth(Config.Visualization.Metropolis.ReferenceBuilding.sea.width());
                    building.setLength(Config.Visualization.Metropolis.ReferenceBuilding.sea.length());
                    break;

                case Mountain:
                    building.setHeight(Config.Visualization.Metropolis.ReferenceBuilding.mountain.height());
                    building.setWidth(Config.Visualization.Metropolis.ReferenceBuilding.mountain.width());
                    building.setLength(Config.Visualization.Metropolis.ReferenceBuilding.mountain.length());
                    break;

                case Cloud:
                    building.setHeight(Config.Visualization.Metropolis.ReferenceBuilding.cloud.height());
                    building.setWidth(Config.Visualization.Metropolis.ReferenceBuilding.cloud.height());
                    building.setLength(Config.Visualization.Metropolis.ReferenceBuilding.cloud.height());
                    break;
            }
        } else {
            Double floorHeightSum = calculateFloorHeightSum();
            Double biggestChimneyHeight = getBiggestChimneyHeight();
            Double groundAreaLength = calculateGroundAreaByChimneyAmount();

            building.setWidth(groundAreaLength);
            building.setLength(groundAreaLength);
            building.setHeight(floorHeightSum);
        }
    }

    private Double getBiggestChimneyHeight() {
        double biggestChimneyHeight = 0.0;
        for(ACityElement chimney : chimneys){
            double chimneyHeight = chimney.getHeight();
            if(chimneyHeight > biggestChimneyHeight){
                biggestChimneyHeight = chimneyHeight;
            }
        }
        return biggestChimneyHeight;
    }

    private Double calculateFloorHeightSum() {
        // no floors & no numberOfStatements => default
        double floorHeightSum = config.abapFloorHeightSum();

        //no floors, but numberOfStatements
        if (floors.isEmpty()){
            if(building.getSourceNode() == null){
                return floorHeightSum;
            }
            String NOS = building.getSourceNodeProperty(SAPNodeProperties.number_of_statements);

            if(NOS != "null") {
                Double nos = Double.valueOf(NOS);

                //numberOfStatements = 0 --> concerns SAP Standard objects
                if (nos == 0){
                    String iterationString = building.getSourceNodeProperty(SAPNodeProperties.iteration);
                    int iteration = Integer.parseInt(iterationString);
                    String type_name = building.getSourceNodeProperty(SAPNodeProperties.type_name);

                    if(iteration >= 0) {
                        if (building.getSourceNodeProperty(SAPNodeProperties.creator).equals("SAP")) {
                            if (!type_name.equals(SAPNodeTypes.Attribute)) {
                                floorHeightSum = config.abapStandardCodeHeight();
                            }
                        }
                    }
                } else {
                    floorHeightSum = getScaledHeightNew(nos);
                }
            }
        }

        //floors, but no numberOfStatements
        for (ACityElement floor : floors) {
            double floorTopEdge = floor.getYPosition() + (floor.getHeight() / 2);
            if (floorTopEdge > floorHeightSum) {
                floorHeightSum = floorTopEdge;
            }
        }

        return floorHeightSum;
    }

    private double getScaledHeight(double unscaledHeight) {
        if (unscaledHeight < config.abapScoMinHeight()) {
            return config.abapScoMinHeight();
        } else if (unscaledHeight > config.abapScoMaxHeight()) {
            return config.abapScoMaxHeight();
        } else {
            return unscaledHeight;
        }
    }

    private double getScaledHeightNew(double unscaledHeight) {

        unscaledHeight = unscaledHeight / config.abapScoFactorMaxHeight();

        if (unscaledHeight < config.abapScoMinHeight()) {
            return config.abapScoMinHeight();
        } else if (unscaledHeight > config.abapScoMaxHeight()) {
            return config.abapScoMaxHeight();
        } else {
            return unscaledHeight;
        }
    }

    private double calculateGroundAreaByChimneyAmount() {
        if (chimneys.size() < 2){
            return config.abapGroundAreaByChimney();
        }

        int chimneyAmount = chimneys.size();
        double chimneySurface = Math.sqrt(chimneyAmount);

        return Math.ceil(chimneySurface);
    }




}

