package org.visap.generator.steps.loader;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.configuration.Config;
import org.visap.generator.database.DatabaseConnector;

import java.lang.reflect.InvocationTargetException;
import java.nio.file.Path;
import java.util.List;
import java.util.Scanner;

public class MetaDataLoaderStep {

    private static final DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());
    private static final Log log = LogFactory.getLog(ReferencesLoaderStep.class);
    private static final String folderName = "MetaData";
    private static final String fileSuffix = "Meta.csv";

    public static void main(String[] args) throws Exception {

        boolean isSilentMode = Config.setup.silentMode();
        Scanner userInput = new Scanner(System.in);

        List<Path> files = new CsvFilesInputFilter(folderName, fileSuffix).getFiles();
        if (files.isEmpty()){
            throw new InvocationTargetException(new Exception(),"Meta CSV file wasn't found");
        }

        if (!isSilentMode) {
            log.info("Adding 'Meta' to nodes. Press any key to continue...");
            userInput.nextLine();
        }

        for (Path p : files) {
            log.info("Path to Meta CSV: "+p);
            log.info("creating Meta Nodes...");
            createMetaDataNodes(p);

            log.info("creating Meta Attributes...");
            mappingMetaDataToAttributes();

            //Meta Nodes for this file no more needed
            log.info("delete unnecessary meta nodes...");
            connector.executeWrite("MATCH (n:Meta) DETACH DELETE n");
        }

        userInput.close();
        log.info("MetaDataLoader step was completed");
    }

    private static void mappingMetaDataToAttributes() {

        //1. main elements
        connector.executeWrite(
                "match (m:Meta), (n:Elements)\n" +
                        "WHERE n.SUB_OBJ_NAME IS NULL AND m.SUB_OBJ_NAME IS NULL AND  n.MAIN_OBJ_NAME = m.MAIN_OBJ_NAME AND n.MAIN_OBJ_TYPE = m.MAIN_OBJ_TYPE \n" +
                        "SET n.creator = m.CREATOR , n.created = m.CREATED , n.progname = m.PROGNAME, n.changed_by = m.CHANGED_BY, n.changed = m.CHANGED"
        );

        //2. sub elements
        connector.executeWrite(
                "match (m:Meta), (n:Elements)\n" +
                        "WHERE n.SUB_SUB_OBJ_NAME IS NULL AND m.SUB_SUB_OBJ_NAME IS NULL AND n.SUB_OBJ_NAME = m.SUB_OBJ_NAME AND  n.MAIN_OBJ_NAME = m.MAIN_OBJ_NAME AND n.MAIN_OBJ_TYPE = m.MAIN_OBJ_TYPE \n" +
                        "SET n.creator = m.CREATOR , n.created = m.CREATED , n.progname = m.PROGNAME, n.changed_by = m.CHANGED_BY, n.changed = m.CHANGED"
        );

        //3. sub sub elements
        connector.executeWrite(
                "match (m:Meta), (n:Elements)\n" +
                        "WHERE n.SUB_SUB_OBJ_NAME = m.SUB_SUB_OBJ_NAME  AND n.SUB_OBJ_NAME = m.SUB_OBJ_NAME AND  n.MAIN_OBJ_NAME = m.MAIN_OBJ_NAME AND n.MAIN_OBJ_TYPE = m.MAIN_OBJ_TYPE \n" +
                        "SET n.creator = m.CREATOR , n.created = m.CREATED , n.progname = m.PROGNAME, n.changed_by = m.CHANGED_BY, n.changed = m.CHANGED"
        );
    }

    private static void createMetaDataNodes(Path p) {
        String pathToMetasCsv = p.toString().replace("\\", "/");
        pathToMetasCsv = pathToMetasCsv.replace(" ", "%20");

        connector.executeImplicit(
                "LOAD CSV WITH HEADERS FROM \"file:///" + pathToMetasCsv + "\"\n" +
                        "AS row FIELDTERMINATOR ';' WITH row WHERE row.MAIN_OBJ_NAME IS NOT NULL\n" +
                        "CALL { WITH row \n"+
                        "CREATE (n:Meta)\n" +
                        "SET n = row } IN TRANSACTIONS OF 10000 ROWS"
        );
    }
}
