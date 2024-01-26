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
            mappingMetaDataToAttributes(p);
        }

        userInput.close();
        log.info("MetaDataLoader step was completed");
    }

    private static void mappingMetaDataToAttributes(Path p) {
        String pathToMetasCsv = p.toString().replace("\\", "/");
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
    }
}
