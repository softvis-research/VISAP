package org.visap.generator.steps;

import org.visap.generator.configuration.Config;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.abap.enums.SAPNodeTypes;
import org.visap.generator.abap.enums.SAPRelationLabels;
import org.visap.generator.metaphors.metropolis.layouts.road.network.Road;
import org.visap.generator.metaphors.metropolis.steps.*;
import org.visap.generator.repository.CityRepository;
import org.visap.generator.repository.SourceNodeRepository;
import org.visap.generator.database.DatabaseConnector;
import org.visap.generator.export.core.AFrameExporter;
import org.visap.generator.export.core.MetaDataOutput;
import org.visap.generator.export.features.roads.RoadAssembler;
import org.visap.generator.export.features.roads.RoadExporter;

import java.util.List;
import java.util.Scanner;

public class AFrameExporterStep {
    private static DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());
    private static SourceNodeRepository nodeRepository;
    private static CityRepository cityRepository;
    private static MetaDataOutput metaDataOutput;
    private static MetaDataOutput aFrameOutput;

    public static void main(String[] args) {
        boolean isSilentMode = Config.setup.silentMode();

        nodeRepository = new SourceNodeRepository();
        
        List<String> whitelist = Config.setup.packageWhitelist();
        nodeRepository.applyPackageWhitelist(whitelist);
        nodeRepository.loadNodesByPropertyValue(SAPNodeProperties.type_name, SAPNodeTypes.Namespace.name());
        nodeRepository.loadNodesByRelation(SAPRelationLabels.CONTAINS, true);
        nodeRepository.loadNodesByRelation(SAPRelationLabels.TYPEOF, true);
        nodeRepository.loadNodesByRelation(SAPRelationLabels.CONTAINS, true);
        nodeRepository.loadNodesByRelation(SAPRelationLabels.REFERENCES, true);
        nodeRepository.loadNodesByRelation(SAPRelationLabels.USES, true);
        
        cityRepository = new CityRepository();

        Scanner userInput = new Scanner(System.in);
        if (!isSilentMode) {
            System.out.print("Creator step to be processed. Press any key to continue...");
            userInput.nextLine();
        }
        MetropolisCreator creator = new MetropolisCreator(cityRepository, nodeRepository);
        creator.createRepositoryFromNodeRepository();

        if (!isSilentMode) {
            System.out.print("Layouter step to be processed. Press any key to continue...");
            userInput.nextLine();
        }
        MetropolisLayouter layouter = new MetropolisLayouter(cityRepository, nodeRepository);
        layouter.layoutRepository();

        if (Config.features.roads()) {
            if (!isSilentMode) {
                System.out.print("RoadNetworkLayouter step to be processed. Press any key to continue...");
                userInput.nextLine();
            }
            MetropolisRoadNetworkLayouter roadNetworkLayouter = new MetropolisRoadNetworkLayouter(cityRepository, nodeRepository);
            roadNetworkLayouter.createRoadNetworks();

            RoadAssembler assembler = new RoadAssembler(roadNetworkLayouter.getMainRoads(), roadNetworkLayouter.getSubRoads());
            List<Road> assembledRoads = assembler.assembleRoads();

            RoadExporter roadExporter = new RoadExporter(assembledRoads);
            roadExporter.exportRoads();
        }

        if (!isSilentMode) {
            System.out.print("\nDesigner step to be processed. Press any key to continue...");
            userInput.nextLine();
        }
        MetropolisDesigner designer = new MetropolisDesigner(cityRepository, nodeRepository);
        designer.designRepository();

        // Create metaData.json
        if (!isSilentMode) {
            System.out.println("Writing MetaData. Press any key to continue...");
            userInput.nextLine();
        }
        MetaDataExporter metaDataExporter = new MetaDataExporter(cityRepository, nodeRepository);
        metaDataOutput = Config.output.metaData();
        // Depending on setting, create file or write metaData as Node's property, or
        // both actions
        if (metaDataOutput == MetaDataOutput.FILE || metaDataOutput == MetaDataOutput.BOTH) {
            metaDataExporter.exportMetaDataFile();
        }

        if (metaDataOutput == MetaDataOutput.NODEPROP || metaDataOutput == MetaDataOutput.BOTH) {
            metaDataExporter.setMetaDataPropToCityElements();
        }

        // Create A-Frame model
        if (!isSilentMode) {
            System.out.println("Writing A-Frame. Press any key to continue...");
            userInput.nextLine();
        }

        AFrameExporter aframeExporter = new AFrameExporter(cityRepository, "metropolis_AFrame_UI");
        aFrameOutput = Config.output.metaData();
        if (aFrameOutput == MetaDataOutput.FILE || aFrameOutput == MetaDataOutput.BOTH) {
            aframeExporter.exportAFrame();
        }

        if (aFrameOutput == MetaDataOutput.NODEPROP || aFrameOutput == MetaDataOutput.BOTH) {
            aframeExporter.setAframePropToCityElements();
        }

        if (Config.output.writeRepToDb()) {
            connector.executeWrite("MATCH (n:ACityRep) DETACH DELETE n;");
            cityRepository.writeRepositoryToNeo4j();
        }

        System.out.println("\nA-Frame Exporter step was completed");
        System.out.println("Model files were written to " + Config.output.mapPath());
        userInput.close();
        connector.close();
    }
}
