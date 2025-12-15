package org.visap.generator.metaphors.metropolis.steps;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.abap.AMetaDataMap;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.configuration.Config;
import org.visap.generator.repository.CityElement;
import org.visap.generator.repository.CityRepository;

import java.util.ArrayList;
import java.util.Collection;

public class RailroadBuilder {
    private Log log = LogFactory.getLog(this.getClass());
    private CityRepository cityRepository;
    private CityElement namespaceDistrictOfOriginSet;
    private CityElement railroadLaneTop;
    private CityElement railroadLaneBottom;

    public RailroadBuilder(CityRepository cityRepository) {
        this.cityRepository = cityRepository;

        this.railroadLaneTop = new CityElement(CityElement.CityType.Railroad);
        this.railroadLaneBottom = new CityElement(CityElement.CityType.Railroad);

        log.info("Railroad builder started");
    }

    public void createRailroad(){
        setOriginNamespaceDistrict();
        buildRailroadLane();
        buildRailroadSleeper();
        buildRailroadStations();
        log.info("Railroad builder completed.");
    }

    private void setOriginNamespaceDistrict(){
        Collection<CityElement> districts = cityRepository.getNamespaceDistrictsOfOriginSet();
        for (CityElement district : districts) {
            this.namespaceDistrictOfOriginSet = district;
        }
    }

    private void buildRailroadLane(){
        log.info("Build the upper and lower lanes of the railroad.");
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
        railroadLaneTop.setLength(namespaceDistrictOfOriginSet.getLength() * 1.1);
        railroadLaneBottom.setZPosition(namespaceDistrictOfOriginSet.getZPosition());
        railroadLaneBottom.setLength(namespaceDistrictOfOriginSet.getLength() * 1.1);

        //Y-position and height as in the namespace district
        railroadLaneTop.setYPosition(namespaceDistrictOfOriginSet.getYPosition());
        railroadLaneTop.setHeight(namespaceDistrictOfOriginSet.getHeight());
        railroadLaneBottom.setYPosition(namespaceDistrictOfOriginSet.getYPosition());
        railroadLaneBottom.setHeight(namespaceDistrictOfOriginSet.getHeight());

        //X-Position and width
        railroadLaneTop.setXPosition(namespaceDistrictOfOriginSet.getXPosition()
                - namespaceDistrictOfOriginSet.getWidth()/2 - railroadLaneTop.getWidth()/2
                - Config.Visualization.Metropolis.railroad.railroadLaneGap());
        railroadLaneTop.setWidth(Config.Visualization.Metropolis.railroad.railroadLaneWidth());
        railroadLaneBottom.setXPosition(railroadLaneTop.getXPosition() - railroadLaneBottom.getWidth()/2
                - Config.Visualization.Metropolis.railroad.railroadLaneGap());
        railroadLaneBottom.setWidth(Config.Visualization.Metropolis.railroad.railroadLaneWidth());
    }

    private void buildRailroadSleeper(){
        log.info("Build the railroad sleepers.");
        final double leftBorder = railroadLaneTop.getZPosition() - railroadLaneTop.getLength()/2;
        final double rightBorder = railroadLaneTop.getZPosition() + railroadLaneTop.getLength()/2;
        double zPosition = leftBorder + Config.Visualization.Metropolis.railroad.railroadSleeperGap();
        final double laneCenterX = (railroadLaneTop.getXPosition() + railroadLaneBottom.getXPosition())/2;
        final double laneDistance = Math.abs(
                railroadLaneTop.getXPosition() + railroadLaneTop.getWidth()/2
                        + railroadLaneBottom.getXPosition() + railroadLaneBottom.getWidth()/2);

        while (zPosition < rightBorder){
            CityElement sleeper = new CityElement(CityElement.CityType.Railroad);
            sleeper.setSubType(CityElement.CitySubType.RailroadSleeper);

            sleeper.setYPosition(railroadLaneTop.getYPosition()/2);
            sleeper.setHeight(railroadLaneTop.getHeight()/2);

            sleeper.setXPosition(laneCenterX);
            sleeper.setWidth(laneDistance + Config.Visualization.Metropolis.railroad.railroadSleeperOverhang());

            sleeper.setZPosition(zPosition);
            sleeper.setLength(Config.Visualization.Metropolis.railroad.railroadSleeperLength());

            cityRepository.addElement(sleeper);

            zPosition = zPosition + sleeper.getLength()
                    + Config.Visualization.Metropolis.railroad.railroadSleeperGap();
        }
    }

    private CityElement setMetaDataToRailroadStation(CityElement railroadStation, int procStep, ArrayList<CityElement> procStepCityElements){
        StringBuilder builder = new StringBuilder();

        CityElement procStepCityElement = procStepCityElements.stream()
                .filter(cityElement -> cityElement.getSourceNodeProperty(SAPNodeProperties.proc_step)
                        .equalsIgnoreCase(String.valueOf(procStep)))
                .findFirst().orElse(null);

        builder.append("\"" + AMetaDataMap.getMetaDataProperty(SAPNodeProperties.element_id.name()).getName() + "\": \"" + railroadStation.getHash() + "\",\n");
        builder.append("\"qualifiedName\": \"Prozessschritt " + procStep + "\",\n");
        builder.append("\"" + AMetaDataMap.getMetaDataProperty(SAPNodeProperties.object_name.name()).getName() + "\": \"Prozessschritt " + procStep + "\",\n");
        builder.append("\"" + AMetaDataMap.getMetaDataProperty(SAPNodeProperties.type_name.name()).getName() + "\": \"" + railroadStation.getType() +"\",\n");
        builder.append("\"calls\": \"" + procStepCityElement.getHash() + "\"");

        railroadStation.setMetaData(builder.toString());
        return railroadStation;
    }

    private void buildRailroadStations(){
        log.info("Railroad stations are being built.");
        ArrayList<CityElement> procStepCityElements = new ArrayList<>();
        ArrayList<CityElement> placedStations = new ArrayList<>();

        for (CityElement cityElement : cityRepository.getElementsByType(CityElement.CityType.Building)) {
            if (cityElement.getSourceNodeProperty(SAPNodeProperties.proc_step).equalsIgnoreCase("null")) {
                continue;
            }
            procStepCityElements.add(cityElement);
        }

        final int numberOfStations = procStepCityElements.size();
        final double startOfLane = railroadLaneTop.getZPosition() - railroadLaneTop.getLength()/2;
        final double distance = railroadLaneTop.getLength() / (numberOfStations + 1);

        for (int i = 1; i <= numberOfStations; i++) {
            CityElement railroadStation = new CityElement(CityElement.CityType.Railroad);
            railroadStation.setSubType(CityElement.CitySubType.RailroadStation);

            railroadStation.setHeight(Config.Visualization.Metropolis.railroad.railroadStationHeight());
            railroadStation.setYPosition(railroadStation.getHeight()/2);

            railroadStation.setWidth(Config.Visualization.Metropolis.railroad.railroadStationWidth());
            railroadStation.setXPosition(railroadLaneTop.getXPosition() + railroadLaneTop.getWidth()/2 + railroadStation.getWidth()/2);

            railroadStation.setLength(Config.Visualization.Metropolis.railroad.railroadStationLength());
            railroadStation.setZPosition(startOfLane + (i * distance));

            placedStations.add(setMetaDataToRailroadStation(railroadStation, i, procStepCityElements));
            cityRepository.addElement(railroadStation);
        }
        log.info("Railroad stations were built.");
    }
}
