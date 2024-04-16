package org.visap.generator.steps.loader;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.abap.enums.SAPRelationLabels;
import org.visap.generator.configuration.Config;
import org.visap.generator.database.DatabaseConnector;

import java.lang.reflect.InvocationTargetException;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Scanner;

import static java.util.Map.entry;

public class ReferencesLoaderStep {

    private static final DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());
    private static final Log log = LogFactory.getLog(ReferencesLoaderStep.class);
    private static final String folderName = "References";
    private static final String fileSuffix = "Reference.csv";
    private static final String labelName = "Refs";
    private static final Map<String, String> indexes= Map.ofEntries(
            entry("Refs_SRC", "combinedKeySrc"),
            entry("Refs_DST", "combinedKeyDst")
    );

    private enum ReferenceRelationType{
        SOURCE("SRC"),
        DESTINATION("DST");

        private final String type;
        ReferenceRelationType(String type) {
            this.type = type;
        }
        private String getType(){
            return type;
        }
    }

    public static void main(String[] args) throws Exception {

        boolean isSilentMode = Config.setup.silentMode();
        Scanner userInput = new Scanner(System.in);

        List<Path> files = new CsvFilesInputFilter(folderName, fileSuffix).getFiles();
        if (files.isEmpty()){
            throw new InvocationTargetException(new Exception(),"Reference CSV file wasn't found");
        }

        if (!isSilentMode) {
            log.info("Creating 'REFERENCE' relationships. Press any key to continue...");
            userInput.nextLine();
        }
        log.info("creating Indexes...");
        createIndexes();
        for (Path p : files) {
            log.info("Path to Reference CSV: "+p);
            log.info("creating Reference nodes...");
            createReferenceNodes(p);
            log.info("creating Reference relations...");
            createReferenceRelations(p);
            log.info("delete unnecessary reference nodes...");
            connector.executeWrite("MATCH (n:"+labelName+") DETACH DELETE n");
        }
        dropIndexes();
        userInput.close();
        log.info("ReferencesLoader step was completed");
    }
    private static void createReferenceNodes(Path p){
        String pathToReferenceCsv;
        pathToReferenceCsv = p.toString().replace("\\", "/")
                                         .replace(" ", "%20");
        connector.executeImplicit(
                "LOAD CSV WITH HEADERS FROM \"file:///" + pathToReferenceCsv + "\"\n" +
                        "AS row FIELDTERMINATOR ';' WITH row WHERE row.MAIN_OBJ_NAME_SRC IS NOT NULL AND row.MAIN_OBJ_NAME_DST IS NOT NULL\n" +
                        "CALL { WITH row \n"+
                        "CREATE (n:"+labelName+")\n" +
                        "SET n = row," +
                        "n.combinedKeySrc = row.MAIN_OBJ_NAME_SRC + row.MAIN_OBJ_TYPE_SRC + COALESCE(row.SUB_OBJ_NAME_SRC, 'NONE') + COALESCE(row.SUB_OBJ_TYPE_SRC, 'NONE') + COALESCE(row.SUB_SUB_OBJ_NAME_SRC, 'NONE')  + COALESCE(row.SUB_SUB_OBJ_TYPE_SRC, 'NONE')," +
                        "n.combinedKeyDst = row.MAIN_OBJ_NAME_DST + row.MAIN_OBJ_TYPE_DST + COALESCE(row.SUB_OBJ_NAME_DST, 'NONE') + COALESCE(row.SUB_OBJ_TYPE_DST, 'NONE') + COALESCE(row.SUB_SUB_OBJ_NAME_DST, 'NONE')  + COALESCE(row.SUB_SUB_OBJ_TYPE_DST, 'NONE') " +
                        "} IN TRANSACTIONS OF 10000 ROWS"
        );
    }
    private static void createReferenceRelations(Path p) {
        connector.executeWrite(
                "MATCH (n:Refs),(e1:Elements),(e2:Elements)\n" +
                        "WHERE n.combinedKeySrc = e1.combinedKey AND n.combinedKeyDst = e2.combinedKey\n" +
                        "MERGE (e1)-[:"+SAPRelationLabels.REFERENCES +"]->(e2)"
        );
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
                    .append(" FOR (n:")
                    .append(labelName)
                    .append(") ON (n.")
                    .append(entry.getValue())
                    .append(");");
            connector.executeWrite(createIndexesQuery.toString());
            createIndexesQuery.setLength(0);
        }
    }
}
