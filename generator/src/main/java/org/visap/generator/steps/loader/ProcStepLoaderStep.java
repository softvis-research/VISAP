package org.visap.generator.steps.loader;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.configuration.Config;
import org.visap.generator.database.DatabaseConnector;

import java.lang.reflect.InvocationTargetException;
import java.nio.file.Path;
import java.util.List;
import java.util.Scanner;

public class ProcStepLoaderStep {
    private static final DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());
    private static final Log log = LogFactory.getLog(ProcStepLoaderStep.class);
    private static final String folderName = "ProcStep";
    private static final String fileSuffix = "ProcStep.csv";
    private static final String labelName = "ProcStep";

    public static void main(String[] args) throws Exception {
        boolean isSilentMode = Config.setup.silentMode();
        Scanner userInput = new Scanner(System.in);

        List<Path> files = new CsvFilesInputFilter(folderName, fileSuffix).getFiles();
        if (files.isEmpty()){
            userInput.close();
            throw new InvocationTargetException(new Exception(),"Process Step CSV file wasn't found");
        }

        if (!isSilentMode) {
            log.info("Creating 'process steps'. Press any key to continue...");
            userInput.nextLine();
        }

        for (Path p : files){
            log.info("Path to process step CSV: " + p);
            log.info("creating process step nodes...");
            createProcStepNodes(p);

            log.info("assigning process step to element nodes...");
            assignProcStep();

            log.info("delete unnecessary process step nodes...");
            connector.executeWrite("MATCH (n:" + labelName + ") DETACH DELETE n");
        }

        userInput.close();
        log.info("ProcStepLoader step was completed");
    }

    private static void createProcStepNodes(Path p) {
        String pathToProcStepCsv = p.toUri().toString();

        connector.executeImplicit(
                "LOAD CSV WITH HEADERS FROM \"" + pathToProcStepCsv + "\"\n" +
                        "AS row FIELDTERMINATOR ';' WITH row WHERE row.MAIN_OBJ_NAME IS NOT NULL\n" +
                        "CALL { WITH row \n" +
                        "CREATE (n:" + labelName + ")\n" +
                        "SET n = row," +
                        "n.combinedKey = row.MAIN_OBJ_NAME + row.MAIN_OBJ_TYPE " +
                        "+ COALESCE(row.SUB_OBJ_NAME, 'NONE') + COALESCE(row.SUB_OBJ_TYPE, 'NONE') " +
                        "+ COALESCE(row.SUB_SUB_OBJ_NAME, 'NONE')  + COALESCE(row.SUB_SUB_OBJ_TYPE, 'NONE')" +
                        "} IN TRANSACTIONS OF 10000 ROWS"
        );
    }

    private static void assignProcStep(){
        connector.executeWrite(
                "MATCH (n:Elements), (m:" + labelName + ")\n"
                        + "WHERE n.combinedKey = m.combinedKey\n"
                        + "SET n.proc_step = m.PROC_STEP"
        );
    }
}
