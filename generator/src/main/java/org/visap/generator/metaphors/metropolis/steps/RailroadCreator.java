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
    private CityElement railroad;

    public RailroadCreator(CityRepository cityRepository, SourceNodeRepository nodeRepository) {
        this.cityRepository = cityRepository;
        this.nodeRepository = nodeRepository;

        //creating a new element railroad
        this.railroad = new CityElement(CityElement.CityType.Railroad);

        log.info("created...");
    }

    public void createRailroad(){
        //assigning a subType to railroad
        railroad.setSubType(CityElement.CitySubType.RailroadLane);

        Collection<CityElement> namespaceDistricts = cityRepository.getNamespaceDistrictsOfOriginSet();
        calculateRailroadPosition(namespaceDistricts);



        //adding the element to the CityRepository
        cityRepository.addElement(railroad);

        log.info("Railroad element created and added to the CityRepository ");
    }

    public void calculateRailroadPosition(Collection<CityElement> districts){
        double namespaceDistrictXPosition = 0.0;

        if (districts.size() > 0) {
            for (CityElement district : districts) {
                namespaceDistrictXPosition = district.getXPosition();

                //Z-position and length as in the namespace district
                railroad.setZPosition(district.getZPosition());
                railroad.setLength(district.getLength());

                //Y-position and height as in the namespace district
                railroad.setHeight(district.getHeight());
                railroad.setYPosition(railroad.getHeight()/2);

                //  X-Position berechnen - ausgehend von der X-Position des namespace Distriktes
                //railroad.setXPosition();
                railroad.setWidth(Config.Visualization.Metropolis.railroad.railroadWidth());
            }
        } else {
            log.info("Position of the Railroad can not be calculated because there is no namespace district!");
            log.info("--> default position");
            //positioning of the railroad
            railroad.setXPosition(Config.Visualization.Metropolis.railroad.railroadXPosition());
            railroad.setYPosition(Config.Visualization.Metropolis.railroad.railroadYPosition());
            railroad.setZPosition(Config.Visualization.Metropolis.railroad.railroadZPosition());
            railroad.setLength(Config.Visualization.Metropolis.railroad.railroadLength());
            railroad.setHeight(Config.Visualization.Metropolis.railroad.railroadHeight());
            railroad.setWidth(Config.Visualization.Metropolis.railroad.railroadWidth());
            return;
        }
    }
}
