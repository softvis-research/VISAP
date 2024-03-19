package org.visap.generator.steps.loader;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.configuration.Config;
import org.visap.generator.database.DatabaseConnector;
import java.lang.reflect.InvocationTargetException;
import java.nio.file.Path;
import java.util.*;

public class MetricsLoaderStep {

    private static final DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());
    private static final Log log = LogFactory.getLog(MetricsLoaderStep.class);
    private static final String FolderName = "Metrics";
    private static final String FileSuffix = "Metrics.csv";
    private static final String[] Metrics = {"number_of_statements","number_of_object_references","number_of_exec_statements","maximum_nesting_depth","cyclomatic_complexity","keyword_named_variables","number_of_comments","halstead_difficulty","halstead_volume","halstead_effort","number_of_methods","number_of_interfaces","number_of_attributes","number_of_events","number_of_redefined_methods","number_of_protected_methods","number_of_public_methods","number_of_private_attributes","number_of_protected_attributes","number_of_public_attributes","amount_of_slin_findings"};
    private static final String labelName = "Metrics";
    public static void main(String[] args) throws Exception {

        boolean isSilentMode = Config.setup.silentMode();
        Scanner userInput = new Scanner(System.in);

        List<Path> files = new CsvFilesInputFilter(FolderName, FileSuffix).getFiles();
        if (files.isEmpty()){
            throw new InvocationTargetException(new Exception(),"Metrics CSV file wasn't found");
        }

        if (!isSilentMode) {
            log.info("Adding 'Metrics' to nodes. Press any key to continue...");
            userInput.nextLine();
        }

        for (Path p : files) {
            log.info("Path to Metrics CSV: "+p);
            log.info("creating Metrics nodes...");
            createMetaNodes(p);
            log.info("Adding properties...");
            setAttributes();
            log.info("delete unnecessary Metrics nodes...");
            connector.executeWrite("MATCH (n:"+labelName+") DETACH DELETE n");
        }
        userInput.close();
        //connector.close();
        log.info("MetricsLoader step was completed");
    }

    private static void createMetaNodes(Path p) {
        String pathToMetricsCsv = p.toString().replace("\\", "/");
        pathToMetricsCsv = pathToMetricsCsv.replace(" ", "%20");
        connector.executeImplicit(
                "LOAD CSV WITH HEADERS FROM \"file:///" + pathToMetricsCsv + "\"\n" +
                        "AS row FIELDTERMINATOR ';' WITH row WHERE row.MAIN_OBJ_NAME IS NOT NULL\n" +
                        "CALL { WITH row \n"+
                        "CREATE (n:"+labelName+")\n" +
                        "SET n = row," +
                        "n.combinedKey = row.MAIN_OBJ_NAME + row.MAIN_OBJ_TYPE + COALESCE(row.SUB_OBJ_NAME, 'NONE') + COALESCE(row.SUB_OBJ_TYPE, 'NONE') + COALESCE(row.SUB_SUB_OBJ_NAME, 'NONE')  + COALESCE(row.SUB_SUB_OBJ_TYPE, 'NONE')" +
                        "} IN TRANSACTIONS OF 10000 ROWS"
        );
    }

    private static void setAttributes() {
        connector.executeWrite(
                "MATCH (n:Elements), (m:"+labelName+")\n"+
                        "WHERE n.combinedKey = m.combinedKey\n"+
                        formatAttributes("n","m")
        );
    }

    private static String formatAttributes(String node, String metricsNode) {
        StringBuilder resultAttributes = new StringBuilder("SET ");
        for (String metric : Metrics){
            String metricLine = node + "." + metric + " = " + metricsNode + "." + metric + " , ";
            resultAttributes.append(metricLine);
        }
        resultAttributes.delete(resultAttributes.length() - 2 , resultAttributes.length());
        return resultAttributes.toString();
    }
}
