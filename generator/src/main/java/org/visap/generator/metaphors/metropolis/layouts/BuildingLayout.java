package org.visap.generator.metaphors.metropolis.layouts;

import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.configuration.Config;
import org.visap.generator.helper.NumericChecker;
import org.visap.generator.repository.CityElement;

public class BuildingLayout {
    private CityElement building;

    public BuildingLayout(CityElement building) {
        this.building = building;
    }

    public void calculate() {
        setSizeOfBuilding();
        setPositionOfBuilding();
    }

    private void setPositionOfBuilding() {
        building.setXPosition(0.0);
        building.setYPosition(building.getHeight() / 2);
        building.setZPosition(0.0);
    }

    private void setSizeOfBuilding() {
        building.setWidth(Config.Visualization.Metropolis.building.defaultWidth());
        building.setLength(Config.Visualization.Metropolis.building.defaultLength());

        Double nos = 0.0;
        Double nof = 0.0;

        if (NumericChecker.isNumeric(building.getSourceNodeProperty(SAPNodeProperties.number_of_statements))) {
            nos = Double.valueOf(building.getSourceNodeProperty(SAPNodeProperties.number_of_statements));
        }
        if (NumericChecker.isNumeric(building.getSourceNodeProperty(SAPNodeProperties.number_of_fields))) {
            nof = Double.valueOf(building.getSourceNodeProperty(SAPNodeProperties.number_of_fields));
        }

        if (nos < 0.0 || nof < 0.0) {
            System.out.println("Negative number of statements or fields is not allowed");
            System.exit(1);
        } else if (nos == 0.0 && nof == 0.0) {
            building.setHeight(Config.Visualization.Metropolis.building.defaultHeight());
        } else {
            building.setHeight(getScaledHeight(nos + nof));
        }
    }

    private double getScaledHeight(double unscaledHeight) {
        unscaledHeight = unscaledHeight / Config.Visualization.Metropolis.building.maxHeightFactor();

        if (unscaledHeight < Config.Visualization.Metropolis.building.minHeight()) {
            return Config.Visualization.Metropolis.building.minHeight();
        } else if (unscaledHeight > Config.Visualization.Metropolis.building.maxHeight()) {
            return Config.Visualization.Metropolis.building.maxHeight();
        } else {
            return unscaledHeight;
        }
    }
}
