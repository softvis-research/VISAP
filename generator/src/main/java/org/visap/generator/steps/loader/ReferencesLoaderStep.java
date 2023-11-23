package org.visap.generator.steps.loader;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.abap.enums.SAPRelationLabels;
import org.visap.generator.configuration.Config;
import org.visap.generator.database.DatabaseConnector;
import java.nio.file.Path;
import java.util.List;
import java.util.Scanner;

public class ReferencesLoaderStep {

    private static final DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());
    private static final Log log = LogFactory.getLog(ReferencesLoaderStep.class);
    private static final String folderName = "References";
    private static final String fileSuffix = "Reference.csv";

    public static void main(String[] args) {

        boolean isSilentMode = Config.setup.silentMode();
        Scanner userInput = new Scanner(System.in);

        List<Path> files = new CsvFilesInputFilter(folderName, fileSuffix).getFiles();
        if (files.isEmpty()){
            log.info("Reference CSV file wasn't found");
            System.exit(0);
        }

        if (!isSilentMode) {
            log.info("Creating 'REFERENCE' relationships. Press any key to continue...");
            userInput.nextLine();
        }

        for (Path p : files) {
            log.info("Path to Reference CSV: "+p);
            createReferenceRelations(p);
        }
        userInput.close();
        log.info("ReferencesLoader step was completed");
    }

    private static void createReferenceRelations(Path p) {
        String pathToReferenceCsv;
        pathToReferenceCsv = p.toString().replace("\\", "/");
        pathToReferenceCsv = pathToReferenceCsv.replace(" ", "%20");

        connector.executeWrite( //bessere bezeichner md-> , Query in strings splitten..
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
                        "CREATE (src)-[:"+ SAPRelationLabels.REFERENCES +"]->(dst) )\n"
        );
    }
}
