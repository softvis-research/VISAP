package org.visap.generator.steps.loader;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.neo4j.driver.Record;
import org.neo4j.driver.Value;
import org.neo4j.driver.types.Node;

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
            createMetricNodes(p);
        }
        List<Record> mainElementRecords = getMainElements();
        List<Record> subElementRecords = getSubElements();
        List<Record> subSubElementRecords = getSubSubElements();
        setAttributes(createHashMapFromRecordList(mainElementRecords));
        setAttributes(createHashMapFromRecordList(subElementRecords));
        setAttributes(createHashMapFromRecordList(subSubElementRecords));
        //clear Metric Nodes from Database
        connector.executeWrite("MATCH (n:Metrics) DETACH DELETE n;");
        userInput.close();
        //connector.close();
        log.info("MetricsLoader step was completed");
    }

    private static void createMetricNodes(Path p) {
        String pathToMetricsCsv = p.toString().replace("\\", "/");
        pathToMetricsCsv = pathToMetricsCsv.replace(" ", "%20");

        connector.executeWrite(
                "LOAD CSV WITH HEADERS FROM \"file:///" + pathToMetricsCsv + "\"\n" +
                        "AS row FIELDTERMINATOR ';' WITH row WHERE row.MAIN_OBJ_NAME IS NOT NULL\n" +
                        "CREATE (n:Metrics)\n" +
                        "SET n = row"
        );

    }

    private static List<Record> getMainElements(){
        return connector.executeRead("""
                MATCH (n:Elements), (m:Metrics )
                WHERE  n.MAIN_OBJ_NAME = m.MAIN_OBJ_NAME and n.SUB_OBJ_NAME is null and m.SUB_OBJ_NAME is null  and n.PACKAGE = m.PACKAGE
                RETURN n, collect(m) as nodes""");
    }

    private static List<Record> getSubElements(){
        return connector.executeRead("""
                MATCH (n:Elements), (m:Metrics )
                WHERE  n.MAIN_OBJ_NAME = m.MAIN_OBJ_NAME and n.SUB_OBJ_NAME = m.SUB_OBJ_NAME and n.SUB_SUB_OBJ_NAME is null and m.SUB_SUB_OBJ_NAME is null  and n.PACKAGE = m.PACKAGE
                RETURN n, collect(m) as nodes""");
    }

    private static List<Record> getSubSubElements(){
        return connector.executeRead("""
                MATCH (n:Elements), (m:Metrics )
                WHERE  n.MAIN_OBJ_NAME = m.MAIN_OBJ_NAME and n.SUB_OBJ_NAME = m.SUB_OBJ_NAME and n.SUB_SUB_OBJ_NAME = m.SUB_SUB_OBJ_NAME and n.PACKAGE = m.PACKAGE
                RETURN n, collect(m) as nodes""");
    }

    private static HashMap<Long,HashMap<String,String>> createHashMapFromRecordList(List<Record> records){
        HashMap<Long,HashMap<String,String>> resultElementWithAttributes = new HashMap<>();
        for (Record result : records) {
            Node targetNode = result.get("n").asNode();
            Value metricNodes = result.get("nodes");
            HashMap<String, String> metricsHashMap = getMetricsFromNodes(metricNodes);
            resultElementWithAttributes.put(targetNode.id(),metricsHashMap);
        }
        return resultElementWithAttributes;
    }

    private static HashMap<String, String> getMetricsFromNodes(Value metricNodes){
        HashMap<String, String> metrics = new HashMap<>();
        for (Value metricNode : metricNodes.values()){
            String key = metricNode.get("METRIC").toString();
            Value value = metricNode.get("METRIC_VALUE");
            if (!value.isNull()){
                metrics.put(key, value.toString());
            }
        }
        return metrics;
    }

    private static void setAttributes(HashMap<Long,HashMap<String,String>> nodesWithAttributes){
        for (Long id: nodesWithAttributes.keySet()){
            connector.executeWrite(
                    "MATCH (n:Elements)\n" +
                            "WHERE ID(n) = "+ id+ " \n" +
                            "WITH n, "+ createAttributesFromHash(nodesWithAttributes.get(id)) + " as metrics\n" +
                            "SET n += metrics"
            );
        }
    }

    private static String createAttributesFromHash(HashMap<String,String> attributesMap){
        StringBuilder resultStringBuilder = new StringBuilder("{ ");
        for (String metric : attributesMap.keySet() ){
            String metric_value = attributesMap.get(metric);
            resultStringBuilder.append(metric.replace("\"", "")
                                              .replace(" ", ""))
                                .append(" : ")
                                .append("'")
                                .append(metric_value.replace("\"", "")
                                                     .replace(" ", ""))
                                .append("'")
                                .append(" ,");
        }
        resultStringBuilder.delete(resultStringBuilder.length() - 1 , resultStringBuilder.length());
        resultStringBuilder.append(" }");
        return resultStringBuilder.toString();
    }
}
