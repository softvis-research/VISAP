package org.visap.generator.steps.loader;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.abap.enums.SAPRelationLabels;
import org.visap.generator.configuration.Config;
import org.visap.generator.database.DatabaseConnector;

import java.nio.file.Path;
import java.util.List;
import java.util.Scanner;

public class NoesLoaderStep {

    private static final DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());
    private static final Log log = LogFactory.getLog(NoesLoaderStep.class);
    private static final String FolderName = "Noes";
    private static final String FileSuffix = "Noes.csv";

    public static void main(String[] args) {

        boolean isSilentMode = Config.setup.silentMode();
        Scanner userInput = new Scanner(System.in);

        List<Path> files = new CsvFilesInputFilter(FolderName, FileSuffix).getFiles();
        if (files.isEmpty()){
            log.info("Noes CSV file wasn't found");
            System.exit(0);
        }

        if (!isSilentMode) {
            log.info("Adding 'Noes' to nodes. Press any key to continue...");
            userInput.nextLine();
        }

        for (Path p : files) {
            log.info("Path to Noes CSV: "+p);
            addNoesAttributeToNodes(p);
        }

        userInput.close();
        connector.close();
        log.info("NoesLoader step was completed");
    }

    private static void addNoesAttributeToNodes(Path p) {
        String pathToNoesCsv = p.toString().replace("\\", "/");
        pathToNoesCsv = pathToNoesCsv.replace(" ", "%20");

        connector.executeWrite(
                "LOAD CSV WITH HEADERS FROM \"file:///" + pathToNoesCsv + "\"\n" +
                        "AS row FIELDTERMINATOR ',' WITH row WHERE row.Objekttyp IS NOT NULL\n" +
                        "OPTIONAL MATCH (m:Elements {object_name : row.MainObjektname, PACKAGE : row.Paket})-[:" + SAPRelationLabels.CONTAINS + "]->(n:Elements {progname : row.Objektname, PACKAGE : row.Paket})\n"+
                        "WHERE row.MainObjektname <> row.Objektname AND row.Meldungscode = 'K_NOES'\n" +
                        "OPTIONAL MATCH (s:Elements {object_name : row.MainObjektname, PACKAGE : row.Paket})\n" +
                        "WHERE row.MainObjektname = row.Objektname AND row.Meldungscode = 'K_NOES'\n"+
                        "SET n.number_of_statements = row.Noes\n" +
                        "SET s.number_of_statements = row.Noes"
        );
    }
}
