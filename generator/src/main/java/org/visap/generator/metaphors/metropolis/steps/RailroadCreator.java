package org.visap.generator.metaphors.metropolis.steps;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.configuration.Config;
import org.visap.generator.repository.CityElement;
import org.visap.generator.repository.CityRepository;
import org.visap.generator.repository.SourceNodeRepository;

import java.util.Collection;

public class RailroadCreator {
    private Log log = LogFactory.getLog(this.getClass());
    private CityRepository cityRepository;
    private SourceNodeRepository nodeRepository;
    private CityElement railroadLaneTop;
    private CityElement railroadLaneBottom;

    public RailroadCreator(CityRepository cityRepository, SourceNodeRepository nodeRepository) {
        this.cityRepository = cityRepository;
        this.nodeRepository = nodeRepository;

        this.railroadLaneTop = new CityElement(CityElement.CityType.Railroad);
        this.railroadLaneBottom = new CityElement(CityElement.CityType.Railroad);

        log.info("created...");
    }

    public void createRailroad(){
        //assigning a subType
        railroadLaneTop.setSubType(CityElement.CitySubType.RailroadLane);
        railroadLaneBottom.setSubType(CityElement.CitySubType.RailroadLane);

        calculateRailroadPosition(cityRepository.getNamespaceDistrictsOfOriginSet());

        cityRepository.addElement(railroadLaneTop);
        cityRepository.addElement(railroadLaneBottom);

        //Schwellen - railroad sleeper
        createRailroadSleeper();

        log.info("Railroad elements created and added to the CityRepository ");
    }

    public void calculateRailroadPosition(Collection<CityElement> districts){
        for (CityElement district : districts) {
            //Z-position and length as in the namespace district
            railroadLaneTop.setZPosition(district.getZPosition());
            railroadLaneTop.setLength(district.getLength());
            railroadLaneBottom.setZPosition(district.getZPosition());
            railroadLaneBottom.setLength(district.getLength());

            //Y-position and height as in the namespace district
            railroadLaneTop.setHeight(district.getHeight());
            railroadLaneTop.setYPosition(railroadLaneTop.getHeight()/2);
            railroadLaneBottom.setHeight(district.getHeight());
            railroadLaneBottom.setYPosition(railroadLaneBottom.getHeight()/2);

            //X-Position and width
            railroadLaneTop.setWidth(Config.Visualization.Metropolis.railroad.railroadWidth());
            railroadLaneTop.setXPosition(district.getXPosition() - district.getWidth()/2 - railroadLaneTop.getWidth()/2 - Config.Visualization.Metropolis.railroad.railroadLaneGap());
            railroadLaneBottom.setWidth(Config.Visualization.Metropolis.railroad.railroadWidth());
            railroadLaneBottom.setXPosition(railroadLaneTop.getXPosition() - railroadLaneBottom.getWidth()/2 - Config.Visualization.Metropolis.railroad.railroadLaneGap());
            }
    }
    public void createRailroadSleeper( ){
        final double leftBorder = railroadLaneTop.getZPosition() - railroadLaneTop.getLength()/2;
        final double rightBorder = railroadLaneTop.getZPosition() + railroadLaneTop.getLength()/2;
        double ZPosition = leftBorder + Config.Visualization.Metropolis.railroad.sleeperGap();

        while (ZPosition < rightBorder){
            CityElement sleeper = new CityElement(CityElement.CityType.Railroad);
            sleeper.setSubType(CityElement.CitySubType.RailroadSleeper);

            sleeper.setYPosition(railroadLaneTop.getYPosition()/2);
            sleeper.setHeight(Config.Visualization.Metropolis.railroad.sleeperHeight());

            sleeper.setXPosition(railroadLaneTop.getXPosition()/2 + railroadLaneBottom.getXPosition()/2);
            sleeper.setWidth(Config.Visualization.Metropolis.railroad.sleeperWidth());

            sleeper.setZPosition(ZPosition);
            sleeper.setLength(Config.Visualization.Metropolis.railroad.sleeperLength());

            cityRepository.addElement(sleeper);

            ZPosition = ZPosition + sleeper.getLength() + Config.Visualization.Metropolis.railroad.sleeperGap();
        }
    }
}
