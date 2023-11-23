package org.visap.generator.steps.loader;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.configuration.Config;
import org.visap.generator.database.DatabaseConnector;
import java.nio.file.Path;
import java.util.List;
import java.util.Scanner;

public class MetaDataLoaderStep {

    private static final DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());
    private static final Log log = LogFactory.getLog(ReferencesLoaderStep.class);
    private static final String folderName = "MetaData";
    private static final String fileSuffix = "Meta.csv";

    public static void main(String[] args) {

        boolean isSilentMode = Config.setup.silentMode();
        Scanner userInput = new Scanner(System.in);

        List<Path> files = new CsvFilesInputFilter(folderName, fileSuffix).getFiles();
        if (files.isEmpty()){
            log.info("Meta CSV file wasn't found");
            System.exit(0);
        }

        if (!isSilentMode) {
            log.info("Adding 'Meta' to nodes. Press any key to continue...");
            userInput.nextLine();
        }

        for (Path p : files) {
            log.info("Path to Meta CSV: "+p);
            mappingMetaDataToAttributes(p);
        }

        // add attributes to all nodes
        createNameAndTypeAttributes();

        //add type_name attribute
        addTypeNameAttributes();

        //add local_class attribute
        createLocalClassAttribute();

        userInput.close();
        log.info("MetaDataLoader step was completed");
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
