package org.visap.generator.steps;

import org.aeonbits.owner.ConfigFactory;
import org.visap.generator.abap.enums.SAPRelationLabels;
import org.visap.generator.database.DatabaseConnector;
import org.visap.generator.configuration.SettingsConfig;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.stream.Collectors;

public class LoaderStep {
    static SettingsConfig config = ConfigFactory.create(SettingsConfig.class);
    private static final DatabaseConnector connector = DatabaseConnector.getInstance(config.boltAddress());
    public static void main(String[] args) {
        boolean isSilentMode = config.silentMode();
        String pathToNodesCsv = "";
        String pathToReferenceCsv = "";
        String pathToInheritanceCsv = "";

        Scanner userInput = new Scanner(System.in);

        // Get files for nodes and relations
        List<Path> files = CSVInput.getInputCSVFiles();
        for(Path p : files) {
            if (p.toString().endsWith("_Test.csv")) {
                pathToNodesCsv = p.toString();
            } else if (p.toString().endsWith("_Reference.csv")) {
                pathToReferenceCsv = p.toString();
            } else if (p.toString().endsWith("_Inheritance.csv")) {
                pathToInheritanceCsv = p.toString();
            }
        }

        if (pathToNodesCsv.isEmpty() || pathToInheritanceCsv.isEmpty() || pathToReferenceCsv.isEmpty())
        {
            System.out.println("Some input file wasn't found");
            System.exit(0);
        }

        // Make sure the graph is empty
        connector.executeWrite("MATCH (n) DETACH DELETE n;");

        // 1. Upload nodes
        System.out.println("SAPExportCreateNodes: " + pathToNodesCsv);
        if (!isSilentMode) {
            System.out.print("Loading nodes in Neo4j. Press any key to continue...");
            userInput.nextLine();
        }
        pathToNodesCsv = pathToNodesCsv.replace("\\", "/");
        connector.executeWrite(
                "LOAD CSV WITH HEADERS FROM \"file:///" + pathToNodesCsv + "\"\n" +
                        "AS row FIELDTERMINATOR ';'\n" +
                        "CREATE (n:Elements)\n" +
                        "SET n = row"
        );

        // 2. Upload contains relations
        if (!isSilentMode) {
            System.out.print("Creating 'CONTAINS' relationships. Press any key to continue...");
            userInput.nextLine();
        }
        connector.executeWrite("MATCH (a:Elements), (b:Elements) " +
                "WHERE a.element_id = b.container_id " +
                "CREATE (a)-[r:" + SAPRelationLabels.CONTAINS + "]->(b)"
        );

        // 3. Upload uses relations
        if (!isSilentMode) {
            System.out.print("Creating 'USES' relationships. Press any key to continue...");
            userInput.nextLine();
        }
        connector.executeWrite("MATCH (a:Elements), (b:Elements) " +
                "WHERE a.element_id = b.uses_id " +
                "CREATE (a)-[r:" + SAPRelationLabels.USES + "]->(b)"
        );

        // 4. Upload References
        System.out.println("Path to Reference CSV: " + pathToReferenceCsv);
        if (!isSilentMode) {
            System.out.print("Creating 'REFERENCE' relationships. Press any key to continue...");
            userInput.nextLine();
        }
        pathToReferenceCsv = pathToReferenceCsv.replace("\\", "/");
        connector.executeWrite(
                "LOAD CSV WITH HEADERS FROM \"file:///" + pathToReferenceCsv + "\"\n" +
                        "AS row FIELDTERMINATOR ';'\n" +
                        "MATCH (a:Elements {element_id: row.source_id}), (b:Elements {element_id: row.target_id})\n" +
                        "CREATE (a)-[r:"+ SAPRelationLabels.REFERENCES +"]->(b)"

        );

        // 5. Upload Inheritances
        System.out.println("Path to Inheritances CSV: " + pathToInheritanceCsv);
        if (!isSilentMode) {
            System.out.print("Creating 'INHERIT' relationships. Press any key to continue...");
            userInput.nextLine();
        }
        pathToInheritanceCsv = pathToInheritanceCsv.replace("\\", "/");
        connector.executeWrite(
                "LOAD CSV WITH HEADERS FROM \"file:///" + pathToInheritanceCsv + "\"\n" +
                        "AS row FIELDTERMINATOR ';'\n" +
                        "MATCH (a:Elements {element_id: row.subclass_id}), (b:Elements {element_id: row.superclass_id})\n" +
                        "CREATE (a)-[r:"+ SAPRelationLabels.INHERIT +"]->(b)"
        );

        connector.close();
        System.out.println("Loader step was completed");
    }

    private static class CSVInput {
        private static List<Path> getInputCSVFiles() {
            String path = config.inputCSVFilePath();
            File currentDir = new File(path);
            String helper = currentDir.getAbsolutePath();
            List<Path> files = new ArrayList<>();
            try {
                files = Files.walk(Paths.get(helper), 1)
                        .filter(Files::isRegularFile)
                        .collect(Collectors.toList());
            } catch (IOException e) {
                e.printStackTrace();
            }
            return files;
        }
    }


}