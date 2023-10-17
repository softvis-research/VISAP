package org.visap.generator.export.features.roads;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.visap.generator.metaphors.metropolis.layouts.road.network.Road;
import org.visap.generator.configuration.Config;


public class RoadExporter {
    private List<Road> roads = new ArrayList<Road>();

    public RoadExporter(List<Road> mainRoads, List<Road> subRoads) {
        this.roads.addAll(mainRoads);
        this.roads.addAll(subRoads);
    }

    private FileWriter constructFileWriter() throws IOException {
        Path outputDir = Files.createDirectories(Paths.get(Config.output.mapPath()));
        Path modelPath = outputDir.resolve("roads.json").toAbsolutePath();
        return new FileWriter(modelPath.toString());
    }

    public void exportRoads() {
        List<RoadJson> roadJsons = new ArrayList<RoadJson>();
        for (Road road : this.roads) {
            roadJsons.add(new RoadJson(road.getStartElement().getHash(), road.getDestinationElement().getHash(), road.getPath()));
        }

        ObjectMapper objectMapper = new ObjectMapper();
        try {
            FileWriter fileWriter = constructFileWriter();
            objectMapper.writeValue(fileWriter, roadJsons);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
