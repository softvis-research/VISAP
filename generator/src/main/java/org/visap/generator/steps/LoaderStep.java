package org.visap.generator.steps;

import org.visap.generator.abap.enums.SAPRelationLabels;
import org.visap.generator.configuration.Config;
import org.visap.generator.database.DatabaseConnector;

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
    private static final DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());

    public static void main(String[] args) {
        boolean isSilentMode = Config.setup.silentMode();
        String pathToNodesCsv = "";
        String pathToReferenceCsv = "";
        String pathToUsesCsv = "";
        String pathToMetasCsv = "";

        Scanner userInput = new Scanner(System.in);

        // Get files for nodes and relations
        List<Path> files = CSVInput.getInputCSVFiles();
        for (Path p : files) {
            if (p.toString().endsWith("_Nodes.csv")) {
                pathToNodesCsv = p.toString();
            } else if (p.toString().endsWith("_Reference.csv")) {
                pathToReferenceCsv = p.toString();
            } else if (p.toString().endsWith("_Uses.csv")) {
                pathToUsesCsv = p.toString();
            }else if (p.toString().endsWith("_Meta.csv")) {
                pathToMetasCsv = p.toString();
            }
        }

        if (pathToNodesCsv.isEmpty() && pathToReferenceCsv.isEmpty() && pathToMetasCsv.isEmpty()) {
            System.out.println("Nodes, Meta and Reference CSV files weren't found. Please check the input folder and make sure that you are executing the program from the generator directory.");
            System.exit(0);
        } else if (pathToNodesCsv.isEmpty()) {
            System.out.println("Nodes CSV file wasn't found");
            System.exit(0);
        } else if (pathToReferenceCsv.isEmpty()) {
            System.out.println("Reference CSV file wasn't found");
            System.exit(0);
        }else if (pathToMetasCsv.isEmpty()) {
            System.out.println("Meta CSV file wasn't found");
            System.exit(0);
        }

        if (Config.features.inputUsesCSV() && pathToUsesCsv.isEmpty()) {
            System.out.println("Uses.csv file wasn't found");
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
        pathToNodesCsv = pathToNodesCsv.replace(" ", "%20");
        connector.executeWrite(
                "LOAD CSV WITH HEADERS FROM \"file:///" + pathToNodesCsv + "\"\n" +
                        "AS row FIELDTERMINATOR ';' WITH row WHERE row.MAIN_OBJ_NAME IS NOT NULL\n" +
                        "CREATE (n:Elements)\n" +
                        "SET n = row");

        // 2. Apply contains relations
        if (!isSilentMode) {
            System.out.print("Creating 'CONTAINS' relationships. Press any key to continue...");
            userInput.nextLine();
        }
        //2.1 Between main elements and sub elements
        connector.executeWrite("MATCH (n:Elements) WHERE n.SUB_OBJ_NAME IS NOT NULL AND n.SUB_SUB_OBJ_NAME IS NULL\n" +
                "UNWIND n AS sub_element\n" +
                "MATCH (p:Elements {MAIN_OBJ_NAME: sub_element.MAIN_OBJ_NAME, MAIN_OBJ_TYPE: sub_element.MAIN_OBJ_TYPE }) WHERE p.SUB_OBJ_NAME IS NULL AND p.SUB_SUB_OBJ_NAME IS NULL\n"+
                "CREATE (p)-[r:" + SAPRelationLabels.CONTAINS + "]->(sub_element)");

        //2.2 Between sub elements ans sub sub elements
        connector.executeWrite("MATCH (n:Elements) WHERE n.SUB_SUB_OBJ_NAME IS NOT NULL\n" +
                "UNWIND n AS sub_element\n" +
                "MATCH (p:Elements {MAIN_OBJ_NAME: sub_element.MAIN_OBJ_NAME, MAIN_OBJ_TYPE: sub_element.MAIN_OBJ_TYPE ,SUB_OBJ_NAME: sub_element.SUB_OBJ_NAME, SUB_OBJ_TYPE: sub_element.SUB_OBJ_TYPE}) WHERE p.SUB_SUB_OBJ_NAME IS NULL\n"+
                "CREATE (p)-[r:" + SAPRelationLabels.CONTAINS + "]->(sub_element)");

        //2.3 Between main elements and Packages
        connector.executeWrite("MATCH (n:Elements) WHERE n.SUB_SUB_OBJ_NAME IS NULL AND n.SUB_OBJ_NAME IS NULL\n" +
                "UNWIND n AS main_element\n" +
                "MATCH (p:Elements {MAIN_OBJ_NAME: main_element.PACKAGE, MAIN_OBJ_TYPE: 'DEVC'}) WHERE p.MAIN_OBJ_NAME <> main_element.MAIN_OBJ_NAME\n"+
                "CREATE (p)-[r:" + SAPRelationLabels.CONTAINS + "]->(main_element)");

        // 3. Upload Meta
        System.out.println("Path to Meta CSV: " + pathToMetasCsv);
        if (!isSilentMode) {
            System.out.print("Adding 'Meta' to nodes. Press any key to continue...");
            userInput.nextLine();
        }
        pathToMetasCsv = pathToMetasCsv.replace("\\", "/");
        pathToMetasCsv = pathToMetasCsv.replace(" ", "%20");
        connector.executeWrite(
                "LOAD CSV WITH HEADERS FROM \"file:///" + pathToMetasCsv + "\"\n" +
                        "AS row FIELDTERMINATOR ';' WITH row WHERE row.MAIN_OBJ_NAME IS NOT NULL\n" +
                        "OPTIONAL MATCH (m:Elements {MAIN_OBJ_NAME : row.MAIN_OBJ_NAME, MAIN_OBJ_TYPE : row.MAIN_OBJ_TYPE})\n" +
                        "WHERE m.SUB_OBJ_NAME IS NULL AND  row.SUB_OBJ_NAME IS NULL\n" +
                        "OPTIONAL MATCH (s:Elements {MAIN_OBJ_NAME : row.MAIN_OBJ_NAME, MAIN_OBJ_TYPE : row.MAIN_OBJ_TYPE, SUB_OBJ_NAME: row.SUB_OBJ_NAME, SUB_OBJ_TYPE: row.SUB_OBJ_TYPE})\n" +
                        "WHERE s.SUB_SUB_OBJ_NAME IS NULL AND row.SUB_SUB_OBJ_NAME IS NULL\n"+
                        "OPTIONAL MATCH (ss:Elements {MAIN_OBJ_NAME : row.MAIN_OBJ_NAME, MAIN_OBJ_TYPE : row.MAIN_OBJ_TYPE, SUB_OBJ_NAME: row.SUB_OBJ_NAME, SUB_OBJ_TYPE: row.SUB_OBJ_TYPE, SUB_SUB_OBJ_NAME: row.SUB_SUB_OBJ_NAME, SUB_SUB_OBJ_TYPE: row.SUB_SUB_OBJ_TYPE})\n" +
                        "WHERE row.SUB_SUB_OBJ_NAME IS NOT NULL AND row.SUB_OBJ_NAME IS NOT NULL\n"+
                        "SET m.creator = row.CREATOR , m.created = row.CREATED , m.progname = row.PROGNAME, m.changed_by = row.CHANGED_BY, m.changed = row.CHANGED\n" +
                        "SET s.creator = row.CREATOR , s.created = row.CREATED , s.progname = row.PROGNAME, s.changed_by = row.CHANGED_BY, s.changed = row.CHANGED\n" +
                        "SET ss.creator = row.CREATOR , ss.created = row.CREATED , ss.progname = row.PROGNAME, ss.changed_by = row.CHANGED_BY, ss.changed = row.CHANGED"
        );


        // 4. Upload References
        System.out.println("Path to Reference CSV: " + pathToReferenceCsv);
        if (!isSilentMode) {
            System.out.print("Creating 'REFERENCE' relationships. Press any key to continue...");
            userInput.nextLine();
        }
        pathToReferenceCsv = pathToReferenceCsv.replace("\\", "/");
        pathToReferenceCsv = pathToReferenceCsv.replace(" ", "%20");
        connector.executeWrite(
                "LOAD CSV WITH HEADERS FROM \"file:///" + pathToReferenceCsv + "\"\n" +
                        "AS row FIELDTERMINATOR ';' WITH row WHERE row.MAIN_OBJ_NAME_SRC IS NOT NULL\n" +

                        "OPTIONAL MATCH (md:Elements {MAIN_OBJ_NAME : row.MAIN_OBJ_NAME_DST, MAIN_OBJ_TYPE: row.MAIN_OBJ_TYPE_DST})\n" +
                        "WHERE md.SUB_OBJ_NAME IS NULL AND row.SUB_OBJ_NAME_DST IS NULL \n" +
                        "OPTIONAL MATCH (sd:Elements {MAIN_OBJ_NAME : row.MAIN_OBJ_NAME_DST, MAIN_OBJ_TYPE: row.MAIN_OBJ_TYPE_DST, SUB_OBJ_NAME: row.SUB_OBJ_NAME_DST, SUB_OBJ_TYPE: row.SUB_OBJ_TYPE_DST})\n" +
                        "WHERE sd.SUB_SUB_OBJ_NAME IS NULL AND  row.SUB_SUB_OBJ_NAME_DST IS NULL \n" +
                        "OPTIONAL MATCH (ssd:Elements {MAIN_OBJ_NAME : row.MAIN_OBJ_NAME_DST, MAIN_OBJ_TYPE: row.MAIN_OBJ_TYPE_DST, SUB_OBJ_NAME: row.SUB_OBJ_NAME_DST, SUB_OBJ_TYPE: row.SUB_OBJ_TYPE_DST, SUB_SUB_OBJ_NAME: row.SUB_SUB_OBJ_NAME_DST, SUB_SUB_OBJ_TYPE: row.SUB_SUB_OBJ_TYPE_DST})\n" +
                        "WHERE row.SUB_SUB_OBJ_NAME_DST  IS NOT NULL AND row.SUB_OBJ_NAME_DST IS NOT NULL\n" +

                        "OPTIONAL MATCH (ms:Elements {MAIN_OBJ_NAME : row.MAIN_OBJ_NAME_SRC, MAIN_OBJ_TYPE: row.MAIN_OBJ_TYPE_SRC})\n" +
                        "WHERE ms.SUB_OBJ_NAME IS NULL AND row.SUB_OBJ_NAME_SRC IS NULL\n" +
                        "OPTIONAL MATCH (ss:Elements {MAIN_OBJ_NAME : row.MAIN_OBJ_NAME_SRC, MAIN_OBJ_TYPE: row.MAIN_OBJ_TYPE_SRC, SUB_OBJ_NAME: row.SUB_OBJ_NAME_SRC, SUB_OBJ_TYPE: row.SUB_OBJ_TYPE_SRC})\n" +
                        "where ss.SUB_SUB_OBJ_NAME IS NULL AND row.SUB_SUB_OBJ_NAME_SRC IS NULL\n" +
                        "OPTIONAL MATCH (sss:Elements {MAIN_OBJ_NAME : row.MAIN_OBJ_NAME_SRC, MAIN_OBJ_TYPE: row.MAIN_OBJ_TYPE_SRC, SUB_OBJ_NAME: row.SUB_OBJ_NAME_SRC, SUB_OBJ_TYPE: row.SUB_OBJ_TYPE_SRC, SUB_SUB_OBJ_NAME: row.SUB_SUB_OBJ_NAME_SRC, SUB_SUB_OBJ_TYPE: row.SUB_SUB_OBJ_TYPE_SRC})\n" +
                        "WHERE row.SUB_SUB_OBJ_NAME_SRC IS NOT NULL AND row.SUB_OBJ_NAME_SRC IS NOT NULL\n"+

                        "UNWIND [ms,ss,sss] as src\n" +
                        "UNWIND [md,sd,ssd] as dst\n" +
                        "FOREACH (i in CASE WHEN src IS NOT NULL and dst IS NOT NULL THEN [1] ELSE [] END |\n" +
                        "CREATE (src)-[:"+SAPRelationLabels.REFERENCES +"]->(dst) )\n"
        );

        // 5. Upload Uses
        if (Config.features.inputUsesCSV()) {
            System.out.println("Path to Uses CSV: " + pathToUsesCsv);
            if (!isSilentMode) {
                System.out.print("Creating 'USES' relationships. Press any key to continue...");
                userInput.nextLine();
            }
            pathToUsesCsv = pathToUsesCsv.replace("\\", "/");
            pathToUsesCsv = pathToUsesCsv.replace(" ", "%20");
            connector.executeWrite(
                    "LOAD CSV WITH HEADERS FROM \"file:///" + pathToUsesCsv + "\"\n" +
                            "AS row FIELDTERMINATOR ';'\n" +
                            "MATCH (a:Elements {element_id: row.use_id}), (b:Elements {element_id: row.usedby_id})\n" +
                            "CREATE (a)-[r:" + SAPRelationLabels.USES + "]->(b)"

            );

            userInput.close();
            connector.close();
            System.out.println("Loader step was completed");
        }

        // add attributes to all nodes
        //1. main elements
        connector.executeWrite(
                "MATCH(n:Elements)\n" +
                        "WHERE n.SUB_OBJ_NAME IS NULL AND n.SUB_OBJ_TYPE IS NULL\n"+
                        "SET n.object_name = n.MAIN_OBJ_NAME, n.type = n.MAIN_OBJ_TYPE"
        );

        //2. sub elements
        connector.executeWrite(
                "MATCH(s:Elements)\n" +
                        "WHERE s.SUB_OBJ_NAME IS NOT NULL AND s.SUB_SUB_OBJ_NAME IS NULL\n" +
                        "SET s.object_name = s.SUB_OBJ_NAME , s.type = s.SUB_OBJ_TYPE"
        );

        //3. sub sub elements
        connector.executeWrite(
                "MATCH (ss)\n" +
                        "WHERE ss.SUB_SUB_OBJ_NAME IS NOT NULL AND ss.SUB_SUB_OBJ_TYPE IS NOT NULL \n" +
                        "SET ss.object_name = ss.SUB_SUB_OBJ_NAME , ss.type = ss.SUB_SUB_OBJ_TYPE\n"
        );

        //add type_name attribute
        connector.executeWrite(
                "MATCH(n:Elements)\n" +
                        "SET n.iteration = '0', n.type_name = CASE n.type\n" +
                        "                    WHEN 'DEVC' THEN 'Namespace'\n" +
                        "                    WHEN 'CLAS' THEN 'Class'\n" +
                        "                    WHEN 'PROG' THEN 'Report'\n" +
                        "                    WHEN 'INTF' THEN 'Interface'\n" +
                        "                    WHEN 'FUGR' THEN 'FunctionGroup'\n" +
                        "                    WHEN 'METH' THEN 'Method'\n" +
                        "                    WHEN 'ATTR' THEN 'Attribute'\n" +
                        "                    WHEN 'FUNC' THEN 'FunctionModule'\n" +
                        "                    WHEN 'FORM' THEN 'FormRoutine'\n" +
                        "                    WHEN 'VIEW' THEN 'View'\n" +
                        "                    WHEN 'TABL' THEN 'Table'\n" +
                        "                    WHEN 'STRU' THEN 'Struct'\n" +
                        "                    WHEN 'DOMA' THEN 'Domain'\n" +
                        "                    WHEN 'DTEL' THEN 'Dataelement'    \n" +
                        "                    ELSE n.type\n" +
                        "                    END"
        );

        //add local_class attribute
        connector.executeWrite(
                "MATCH (n {SUB_OBJ_TYPE: 'CLAS'})\n" +
                           "WHERE n.SUB_SUB_OBJ_NAME IS NULL\n" +
                           "SET n.local_class = 'true'"
        );
    }

    private static class CSVInput {
        private static List<Path> getInputCSVFiles() {
            String path = Config.setup.inputCSVFilePath();
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
