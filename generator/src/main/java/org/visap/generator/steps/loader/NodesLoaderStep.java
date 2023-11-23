package org.visap.generator.steps.loader;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.abap.enums.SAPRelationLabels;
import org.visap.generator.configuration.Config;
import org.visap.generator.database.DatabaseConnector;
import java.nio.file.Path;
import java.util.List;
import java.util.Scanner;

public class NodesLoaderStep {
    private static final DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());
    private static final Log log = LogFactory.getLog(NodesLoaderStep.class);
    private static final String folderName = "Nodes";
    private static final String fileSuffix = "Nodes.csv";

    public static void main(String[] args) {

        boolean isSilentMode = Config.setup.silentMode();
        Scanner userInput = new Scanner(System.in);

        List<Path> files = new CsvFilesInputFilter(folderName, fileSuffix).getFiles();
        if (files.isEmpty()){
            log.info("Nodes CSV file wasn't found");
            System.exit(0);
        }

        // Make sure the graph is empty
        connector.executeWrite("MATCH (n) DETACH DELETE n;");

        if (!isSilentMode) {
            log.info("Loading nodes in Neo4j. Press any key to continue...");
            userInput.nextLine();
        }

        for (Path p : files) {
            log.info("SAPExportCreateNodes: "+p);
            createNodes(p);
        }

        // add attributes to all nodes
        createNameAndTypeAttributes();

        //add type_name attribute
        addTypeNameAttributes();

        //add local_class attribute
        createLocalClassAttribute();

        // 2. Apply contains relations
        if (!isSilentMode) {
            log.info("Creating 'CONTAINS' relationships. Press any key to continue...");
            userInput.nextLine();
        }
        createContainsRelations();

        userInput.close();
        log.info("NodesLoader step was completed");
    }

    private static void createContainsRelations() {
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
    }

    private static void createNodes(Path p) {
        String pathToNodesCsv;
        pathToNodesCsv = p.toString().replace("\\", "/");
        pathToNodesCsv = pathToNodesCsv.replace(" ", "%20");

        connector.executeWrite(
                "LOAD CSV WITH HEADERS FROM \"file:///" + pathToNodesCsv + "\"\n" +
                        "AS row FIELDTERMINATOR ';' WITH row WHERE row.MAIN_OBJ_NAME IS NOT NULL\n" +
                        "CREATE (n:Elements)\n" +
                        "SET n = row");
    }

    private static void createLocalClassAttribute() { //in LoaderStep ...
        connector.executeWrite(
                "MATCH (n:Elements)\n" +
                        "WHERE ( n.SUB_OBJ_TYPE = 'CLAS' OR n.SUB_OBJ_TYPE = 'INTF' ) AND n.SUB_SUB_OBJ_NAME IS NULL\n" +
                        "SET n.local_class = 'true'"
        );
    }

    private static void addTypeNameAttributes() {
        connector.executeWrite(
                "MATCH(n:Elements)\n" +
                        "SET n.iteration = '0', n.type_name = CASE n.type\n" +
                        "                    WHEN 'DEVC' THEN 'Namespace'\n" +
                        "                    WHEN 'CLAS' THEN 'Class'\n" +
                        "                    WHEN 'REPS' THEN 'Report'\n" +
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
    }

    private static void createNameAndTypeAttributes() {
        //1. main elements
        connector.executeWrite(
                "MATCH(n:Elements)\n" +
                        "WHERE n.SUB_OBJ_NAME IS NULL AND n.SUB_OBJ_TYPE IS NULL\n"+
                        "SET n.object_name = n.MAIN_OBJ_NAME, n.type = CASE n.MAIN_OBJ_TYPE\n" +
                        "WHEN 'PROG' THEN 'REPS'\n" +
                        "ELSE n.MAIN_OBJ_TYPE\n" +
                        "END"
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
    }
}

