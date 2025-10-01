package org.visap.generator.metaphors.metropolis.steps;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.configuration.Config;
import org.visap.generator.repository.CityElement;
import org.visap.generator.repository.CityRepository;
import org.visap.generator.repository.SourceNodeRepository;

import java.util.ArrayList;
import java.util.Collection;

public class RailroadBuilder {
    private Log log = LogFactory.getLog(this.getClass());
    private CityRepository cityRepository;
    private SourceNodeRepository nodeRepository;
    private CityElement namespaceDistrictOfOriginSet;
    private CityElement railroadLaneTop;
    private CityElement railroadLaneBottom;

    public RailroadBuilder(CityRepository cityRepository, SourceNodeRepository nodeRepository) {
        this.cityRepository = cityRepository;
        this.nodeRepository = nodeRepository;

        this.railroadLaneTop = new CityElement(CityElement.CityType.Railroad);
        this.railroadLaneBottom = new CityElement(CityElement.CityType.Railroad);

        log.info("start railroad builder...");
    }

    public void createRailroad(){
        setOriginNamespaceDistrict();

        buildRailroadLane();

        buildRailroadSleeper();

        buildRailroadStations();

        log.info("Railroad elements created and added to the CityRepository ");
    }

    private void setOriginNamespaceDistrict(){
        Collection<CityElement> districts = cityRepository.getNamespaceDistrictsOfOriginSet();
        for (CityElement district : districts) {
            this.namespaceDistrictOfOriginSet = district;
        }
    }

    private void buildRailroadLane(){
        //subType is necessary because there is no corresponding SAPNode
        railroadLaneTop.setSubType(CityElement.CitySubType.RailroadLane);
        railroadLaneBottom.setSubType(CityElement.CitySubType.RailroadLane);

        setRailroadLanePosition();

        cityRepository.addElement(railroadLaneTop);
        cityRepository.addElement(railroadLaneBottom);
    }

    private void setRailroadLanePosition(){
        //Z-position and length as in the namespace district
        railroadLaneTop.setZPosition(namespaceDistrictOfOriginSet.getZPosition());
        railroadLaneTop.setLength(namespaceDistrictOfOriginSet.getLength());
        railroadLaneBottom.setZPosition(namespaceDistrictOfOriginSet.getZPosition());
        railroadLaneBottom.setLength(namespaceDistrictOfOriginSet.getLength());

        //Y-position and height as in the namespace district
        railroadLaneTop.setYPosition(namespaceDistrictOfOriginSet.getYPosition());
        railroadLaneTop.setHeight(namespaceDistrictOfOriginSet.getHeight());
        railroadLaneBottom.setYPosition(namespaceDistrictOfOriginSet.getYPosition());
        railroadLaneBottom.setHeight(namespaceDistrictOfOriginSet.getHeight());

        //X-Position and width
        railroadLaneTop.setXPosition(namespaceDistrictOfOriginSet.getXPosition() - namespaceDistrictOfOriginSet.getWidth()/2 - railroadLaneTop.getWidth()/2 - Config.Visualization.Metropolis.railroad.railroadLaneGap());
        railroadLaneTop.setWidth(Config.Visualization.Metropolis.railroad.railroadLaneWidth());
        railroadLaneBottom.setXPosition(railroadLaneTop.getXPosition() - railroadLaneBottom.getWidth()/2 - Config.Visualization.Metropolis.railroad.railroadLaneGap());
        railroadLaneBottom.setWidth(Config.Visualization.Metropolis.railroad.railroadLaneWidth());
    }

    private void buildRailroadSleeper(){
        final double leftBorder = railroadLaneTop.getZPosition() - railroadLaneTop.getLength()/2;
        final double rightBorder = railroadLaneTop.getZPosition() + railroadLaneTop.getLength()/2;
        double zPosition = leftBorder + Config.Visualization.Metropolis.railroad.railroadSleeperGap();

        while (zPosition < rightBorder){
            CityElement sleeper = new CityElement(CityElement.CityType.Railroad);
            sleeper.setSubType(CityElement.CitySubType.RailroadSleeper);

            sleeper.setYPosition(railroadLaneTop.getYPosition()/2);
            sleeper.setHeight(railroadLaneTop.getHeight()/2);

            sleeper.setXPosition(railroadLaneTop.getXPosition()/2 + railroadLaneBottom.getXPosition()/2);
            double laneDistance = Math.abs(railroadLaneTop.getXPosition() + railroadLaneTop.getWidth()/2 + railroadLaneBottom.getXPosition() + railroadLaneBottom.getWidth()/2);
            sleeper.setWidth(laneDistance + Config.Visualization.Metropolis.railroad.railroadSleeperOverhang());

            sleeper.setZPosition(zPosition);
            sleeper.setLength(Config.Visualization.Metropolis.railroad.railroadSleeperLength());

            cityRepository.addElement(sleeper);

            zPosition = zPosition + sleeper.getLength() + Config.Visualization.Metropolis.railroad.railroadSleeperGap();
        }
    }

    private void buildRailroadStations(){
        ArrayList<CityElement> procStepCityElements = new ArrayList<>();
        //  --> Rücksprache halten für den Einstieg; Grund: Reports erhalten Gebäude und Distrikt aus dem Grund würden dann zwei Stationen erstellt werden
        //      --> wenn man die Einstiege genau setzt, also auf Methode oder Reports etc. könnte man direkt Building nehmen und würde der Dopplung aus dem Weg gehen

        for (CityElement cityElement : cityRepository.getElementsByType(CityElement.CityType.Building)) {
            if (cityElement.getSourceNodeProperty(SAPNodeProperties.proc_step).equalsIgnoreCase("null")) {
                continue;
            }
            procStepCityElements.add(cityElement);
        }

        for (CityElement procStepCityElement : procStepCityElements){
            CityElement railroadStation = new CityElement(CityElement.CityType.Railroad);
            railroadStation.setSubType(CityElement.CitySubType.RailroadStation);

            railroadStation.setYPosition(Config.Visualization.Metropolis.railroad.railroadStationYPosition());
            railroadStation.setHeight(Config.Visualization.Metropolis.railroad.railroadStationYPosition()*2);

            railroadStation.setXPosition(railroadLaneTop.getXPosition() + railroadLaneTop.getWidth()/2 + Config.Visualization.Metropolis.railroad.railroadStationWidth()/2);
            railroadStation.setWidth(Config.Visualization.Metropolis.railroad.railroadStationWidth());

            railroadStation.setZPosition(procStepCityElement.getZPosition());
            railroadStation.setLength(Config.Visualization.Metropolis.railroad.railroadStationLength());

            cityRepository.addElement(railroadStation);

            //
        }

        log.info(procStepCityElements.size() + " Stationen wurden gebaut");
    }
}
