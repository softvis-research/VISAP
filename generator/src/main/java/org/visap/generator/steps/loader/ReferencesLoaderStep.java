package org.visap.generator.steps.loader;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.abap.enums.SAPRelationLabels;
import org.visap.generator.configuration.Config;
import org.visap.generator.database.DatabaseConnector;

import java.lang.reflect.InvocationTargetException;
import java.nio.file.Path;
import java.util.List;
import java.util.Scanner;

public class ReferencesLoaderStep {

    private static final DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());
    private static final Log log = LogFactory.getLog(ReferencesLoaderStep.class);
    private static final String folderName = "References";
    private static final String fileSuffix = "Reference.csv";

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

        String  mainDst = "md" , subDst = "sd", subSubDst = "ssd",
                mainSrc = "ms" , subSrc = "ss", subSubSrc = "sss" , row= "row";
        String queryForAllMatches = getOptionalMainMatch(mainDst, row, ReferenceRelationType.DESTINATION) +
                getOptionalSubMatch(subDst, row, ReferenceRelationType.DESTINATION) +
                getOptionalSubSubMatch(subSubDst, row, ReferenceRelationType.DESTINATION) +
                getOptionalMainMatch(mainSrc, row, ReferenceRelationType.SOURCE) +
                getOptionalSubMatch(subSrc, row, ReferenceRelationType.SOURCE) +
                getOptionalSubSubMatch(subSubSrc, row, ReferenceRelationType.SOURCE);
        connector.executeWrite( //bessere bezeichner md-> , Query in strings splitten..
                "LOAD CSV WITH HEADERS FROM \"file:///" + pathToReferenceCsv + "\"\n" +
                        "AS row FIELDTERMINATOR ';' WITH row WHERE row.MAIN_OBJ_NAME_SRC IS NOT NULL\n" +
                        queryForAllMatches +
                        "UNWIND [" + mainSrc + "," + subSrc + "," + subSubSrc + "] as src\n" +
                        "UNWIND [" + mainDst + "," + subDst + "," + subSubDst + "] as dst\n" +
                        "FOREACH (i in CASE WHEN src IS NOT NULL and dst IS NOT NULL THEN [1] ELSE [] END |\n" +
                        "CREATE (src)-[:"+ SAPRelationLabels.REFERENCES +"]->(dst) )\n"
        );
    }

    private static String getOptionalMainMatch(String node, String csvEntry, ReferenceRelationType type) {

        return "OPTIONAL MATCH (" + node +
                ":Elements {MAIN_OBJ_NAME : " +
                csvEntry + ".MAIN_OBJ_NAME_" + type.getType() + ", " +
                "MAIN_OBJ_TYPE: " +
                csvEntry + ".MAIN_OBJ_TYPE_" + type.getType() +
                " })\n" +
                "WHERE " +
                node +
                ".SUB_OBJ_NAME IS NULL AND " +
                csvEntry +
                ".SUB_OBJ_NAME_" + type.getType() +
                " IS NULL\n";
    }

    private static String getOptionalSubMatch(String node, String csvEntry, ReferenceRelationType type) {
        return  new StringBuilder().append("OPTIONAL MATCH (")
                .append(node)
                .append(":Elements {MAIN_OBJ_NAME : ")
                .append(csvEntry).append(".MAIN_OBJ_NAME_").append(type.getType()).append(", ")
                .append("MAIN_OBJ_TYPE: ")
                .append(csvEntry).append(".MAIN_OBJ_TYPE_").append(type.getType()).append(", ")
                .append("SUB_OBJ_NAME: ")
                .append(csvEntry).append(".SUB_OBJ_NAME_").append(type.getType()).append(", ")
                .append("SUB_OBJ_TYPE: ")
                .append(csvEntry).append(".SUB_OBJ_TYPE_").append(type.getType())
                .append(" })\n")
                .append("WHERE ")
                .append(node).append(".SUB_SUB_OBJ_NAME IS NULL AND ")
                .append(csvEntry).append(".SUB_SUB_OBJ_NAME_").append(type.getType())
                .append(" IS NULL\n").toString();
    }

    private static String getOptionalSubSubMatch(String node, String csvEntry, ReferenceRelationType type) {
        StringBuilder query = new StringBuilder("OPTIONAL MATCH (");
        query.append(node)
                .append(":Elements {MAIN_OBJ_NAME : ").append(csvEntry).append(".MAIN_OBJ_NAME_").append(type.getType()).append(", ")
                .append("MAIN_OBJ_TYPE: ")
                .append(csvEntry + ".MAIN_OBJ_TYPE_" + type.getType() + ", ")
                .append("SUB_OBJ_NAME: ").append(csvEntry).append(".SUB_OBJ_NAME_").append(type.getType()).append(", ")
                .append("SUB_OBJ_TYPE: ").append(csvEntry).append(".SUB_OBJ_TYPE_").append(type.getType()).append(" ,")
                .append("SUB_SUB_OBJ_NAME: ").append(csvEntry).append(".SUB_SUB_OBJ_NAME_").append(type.getType()).append(", ")
                .append("SUB_SUB_OBJ_TYPE: ").append(csvEntry).append(".SUB_SUB_OBJ_TYPE_").append(type.getType())
                .append(" })\n");
        query.append("WHERE ")
                .append(csvEntry).append(".SUB_SUB_OBJ_NAME_").append(type.getType())
                .append(" IS NOT NULL AND  ")
                .append(csvEntry).append(".SUB_OBJ_NAME_").append(type.getType())
                .append(" IS NOT NULL\n");
        return query.toString();
    }
}
