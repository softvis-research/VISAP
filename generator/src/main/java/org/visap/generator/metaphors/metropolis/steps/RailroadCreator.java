package org.visap.generator.metaphors.metropolis.steps;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.configuration.Config;
import org.visap.generator.repository.CityElement;
import org.visap.generator.repository.CityRepository;
import org.visap.generator.repository.SourceNodeRepository;

public class RailroadCreator {
    private Log log = LogFactory.getLog(this.getClass());
    private CityRepository cityRepository;

    public RailroadCreator(CityRepository cityRepository, SourceNodeRepository nodeRepository) {
        this.cityRepository = cityRepository;

        log.info("created...");
    }

    public void createRailroad(){
        //creating a new element railroad
        CityElement railroad = new CityElement(CityElement.CityType.Railroad);

        //assigning some properties to the element
        railroad.setXPosition(Config.Visualization.Metropolis.railroad.railroadXPosition());
        railroad.setYPosition(Config.Visualization.Metropolis.railroad.railroadYPosition());
        railroad.setZPosition(Config.Visualization.Metropolis.railroad.railroadZPosition());

        //assigning a subType to railroad
        railroad.setSubType(CityElement.CitySubType.RailroadLane);

        //adding the element to the CityRepository
        cityRepository.addElement(railroad);

        log.info("Railroad element created and added to the CityRepository ");
    }
}
