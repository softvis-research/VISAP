package org.visap.generator.export.features.roads;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import org.visap.generator.metaphors.metropolis.layouts.road.network.Road;
import org.visap.generator.configuration.Config;


public class RoadExporter {
    private List<Road> roads = new ArrayList<Road>();

    public RoadExporter(List<Road> roads) {
        this.roads = roads;
    }

    private FileWriter constructFileWriter() throws IOException {
        Path outputDir = Files.createDirectories(Paths.get(Config.output.mapPath()));
        Path modelPath = outputDir.resolve("roads.json").toAbsolutePath();
        return new FileWriter(modelPath.toString());
    }

    public void exportRoads() {
        List<RoadJson> roadJsons = new ArrayList<RoadJson>();
        for (Road road : this.roads) {
            roadJsons.add(new RoadJson(road.getStartElement().getHash(), road.getDestinationElement().getHash(), road.getRoadSectionIds()));
        }

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.setPropertyNamingStrategy(PropertyNamingStrategy.SNAKE_CASE);

        try {
            FileWriter fileWriter = constructFileWriter();
            objectMapper.writeValue(fileWriter, roadJsons);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
