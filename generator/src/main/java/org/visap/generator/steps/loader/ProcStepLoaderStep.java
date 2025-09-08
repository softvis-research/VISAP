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

        // Verarbeitung der Daten

        userInput.close();
        log.info("ProcStepLoader step was completed");
    }
}
