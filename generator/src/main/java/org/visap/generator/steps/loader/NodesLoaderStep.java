package org.visap.generator.steps.loader;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.abap.enums.SAPRelationLabels;
import org.visap.generator.configuration.Config;
import org.visap.generator.database.DatabaseConnector;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Scanner;

import static java.util.Map.entry;

public class NodesLoaderStep {
    private static final DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());
    private static final Log log = LogFactory.getLog(NodesLoaderStep.class);
    private static final String folderName = "Nodes";
    private static final String fileSuffix = "Nodes.csv";
    private static final Map<String, String> indexes= Map.ofEntries(
            entry("Element_mainobj", "MAIN_OBJ_NAME"),
            entry("Element_maintype", "MAIN_OBJ_TYPE"),
            entry("Element_subobj","SUB_OBJ_NAME"),
            entry("Element_subtype", "SUB_OBJ_TYPE"),
            entry("Element_subsubobj", "SUB_SUB_OBJ_NAME"),
            entry("Element_subsubtype", "SUB_SUB_OBJ_TYPE"),
            entry("ElementCombinedKey","combinedKey")
    );
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
        //delete indexes if exists
        dropIndexes();

        if (!isSilentMode) {
            log.info("Loading nodes in Neo4j. Press any key to continue...");
            userInput.nextLine();
        }

        for (Path p : files) {
            log.info("Path to Meta CSV: "+p);
            log.info("creating Elements Nodes...");
            createNodes(p);
            // add attributes to all nodes
            log.info("update Nodes Attributes...");
            createNameAndTypeAttributes();
            log.info("1. Object_name and type attribute created...");
            //add type_name attribute
            addTypeNameAttributes();
            log.info("2. type_name attribute created...");
            //add local_class attribute
            createLocalClassAttribute();
            log.info("3. local_class attribute created...");
            log.info("Nodes Attributes updated");
        }

        // 2. Apply contains relations
        if (!isSilentMode) {
            log.info("Creating 'CONTAINS' relationships. Press any key to continue...");
            userInput.nextLine();
        }
        log.info("creating Indexes...");
        createIndexes();
        log.info("creating CONTAINS relations...");
        createContainsRelations();

        userInput.close();
        log.info("NodesLoader step was completed");
    }

    private static void dropIndexes() {
        StringBuilder dropIndexesQuery = new StringBuilder();
        for (Map.Entry<String, String> entry : indexes.entrySet()) {
            dropIndexesQuery.append("DROP INDEX ")
                    .append(entry.getKey())
                    .append(" IF EXISTS;");
            connector.executeWrite(dropIndexesQuery.toString());
            dropIndexesQuery.setLength(0);
        }
    }

    private static void createIndexes() {
        StringBuilder createIndexesQuery = new StringBuilder();
        for (Map.Entry<String, String> entry : indexes.entrySet()) {
            createIndexesQuery.append("CREATE INDEX ")
                    .append(entry.getKey())
                    .append(" FOR (n:Elements) ON (n.")
                    .append(entry.getValue())
                    .append(");");
            connector.executeWrite(createIndexesQuery.toString());
            createIndexesQuery.setLength(0);
        }
    }

    private static void createContainsRelations() {
        //2.1 Between main elements and sub elements
        connector.executeWrite("MATCH (n:Elements) WHERE n.SUB_OBJ_NAME IS NOT NULL AND n.SUB_SUB_OBJ_NAME IS NULL\n" +
                "MATCH (p:Elements {MAIN_OBJ_NAME: n.MAIN_OBJ_NAME, MAIN_OBJ_TYPE: n.MAIN_OBJ_TYPE }) WHERE p.SUB_OBJ_NAME IS NULL AND p.SUB_SUB_OBJ_NAME IS NULL\n"+
                "CREATE (p)-[r:" + SAPRelationLabels.CONTAINS + "]->(n)");

        //2.2 Between sub elements ans sub sub elements
        connector.executeWrite("MATCH (n:Elements) WHERE n.SUB_SUB_OBJ_NAME IS NOT NULL\n" +
                "MATCH (p:Elements {MAIN_OBJ_NAME: n.MAIN_OBJ_NAME, MAIN_OBJ_TYPE: n.MAIN_OBJ_TYPE ,SUB_OBJ_NAME: n.SUB_OBJ_NAME, SUB_OBJ_TYPE: n.SUB_OBJ_TYPE}) WHERE p.SUB_SUB_OBJ_NAME IS NULL\n"+
                "CREATE (p)-[r:" + SAPRelationLabels.CONTAINS + "]->(n)");

        //2.3 Between main elements and Packages
        connector.executeWrite("MATCH (n:Elements) WHERE n.SUB_SUB_OBJ_NAME IS NULL AND n.SUB_OBJ_NAME IS NULL AND n.MAIN_OBJ_TYPE <>'DEVC'\n" +
                "MATCH (p:Elements {MAIN_OBJ_NAME: n.PACKAGE, MAIN_OBJ_TYPE: 'DEVC'}) \n"+
                "CREATE (p)-[r:" + SAPRelationLabels.CONTAINS + "]->(n)");
    }

    private static void createNodes(Path p) {
        String pathToNodesCsv;
        pathToNodesCsv = p.toString().replace("\\", "/");
        pathToNodesCsv = pathToNodesCsv.replace(" ", "%20");


        connector.executeImplicit(
                "LOAD CSV WITH HEADERS FROM \"file:///" + pathToNodesCsv + "\"\n" +
                        "AS row FIELDTERMINATOR ';' WITH row WHERE row.MAIN_OBJ_NAME IS NOT NULL\n"+
                        "CALL { WITH row \n" +
                        "CREATE (n:Elements)\n" +
                        "SET n = row, n.combinedKey = row.MAIN_OBJ_NAME + row.MAIN_OBJ_TYPE + COALESCE(row.SUB_OBJ_NAME, 'NONE') + COALESCE(row.SUB_OBJ_TYPE, 'NONE') + COALESCE(row.SUB_SUB_OBJ_NAME, 'NONE')  + COALESCE(row.SUB_SUB_OBJ_TYPE, 'NONE') } IN TRANSACTIONS OF 10000 ROWS");
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

