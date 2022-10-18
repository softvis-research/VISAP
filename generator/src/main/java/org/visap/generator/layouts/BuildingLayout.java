package org.visap.generator.layouts;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.configuration.Config;
import org.visap.generator.repository.CityElement;

public class BuildingLayout {
    private Log log = LogFactory.getLog(this.getClass());

    private CityElement building;

    public BuildingLayout(CityElement building) {
        this.building = building;
    }

    public void calculate(){
        setSizeOfBuilding();
        setPositionOfBuilding();
    }

    private void setPositionOfBuilding() {
        building.setXPosition(0.0);
        building.setYPosition(building.getHeight() / 2);
        building.setZPosition(0.0);
    }

    private void setSizeOfBuilding() {
        CityElement.CitySubType referenceBuildingType = building.getSubType();

        if(referenceBuildingType != null) {
            switch (referenceBuildingType) {
                case Sea:
                    building.setHeight(Config.Visualization.Metropolis.ReferenceBuilding.height.sea());
                    building.setWidth(Config.Visualization.Metropolis.ReferenceBuilding.width.sea());
                    building.setLength(Config.Visualization.Metropolis.ReferenceBuilding.length.sea());
                    break;

                case Mountain:
                    building.setHeight(Config.Visualization.Metropolis.ReferenceBuilding.height.mountain());
                    building.setWidth(Config.Visualization.Metropolis.ReferenceBuilding.width.mountain());
                    building.setLength(Config.Visualization.Metropolis.ReferenceBuilding.length.mountain());
                    break;

                case Cloud:
                    building.setHeight(Config.Visualization.Metropolis.ReferenceBuilding.height.cloud());
                    building.setWidth(Config.Visualization.Metropolis.ReferenceBuilding.width.cloud());
                    building.setLength(Config.Visualization.Metropolis.ReferenceBuilding.length.cloud());
                    break;
            }
        } else {
            building.setWidth(Config.Visualization.Metropolis.building.defaultWidth());
            building.setLength(Config.Visualization.Metropolis.building.defaultLength());

            String nos = building.getSourceNodeProperty(SAPNodeProperties.number_of_statements);
            if ((nos == "null") || Double.valueOf(nos) == 0) {
                building.setHeight(Config.Visualization.Metropolis.building.defaultHeight());
            } else {
                building.setHeight(getScaledHeight(Double.valueOf(nos)));
            }
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

