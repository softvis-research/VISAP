package org.visap.generator.abap;

import org.visap.generator.abap.enums.SAPNodeProperties;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class AMetaDataMap {
    private static final Map<String, String> metaDataProperties;
    private static final List<String> nodesWithUsesRelationByType;
    private static final List<String> nodesWithInheritRelationByType;
    private static final List<String> nodesWithMigrationRelationByType;

    static{
        // Change property names for metaData-output
        metaDataProperties = new HashMap<>();
        metaDataProperties.put(SAPNodeProperties.element_id.name(), "id");
        metaDataProperties.put(SAPNodeProperties.object_name.name(), "name");
        metaDataProperties.put(SAPNodeProperties.type_name.name(), "type");
        metaDataProperties.put(SAPNodeProperties.type.name(), "abap_type");
        metaDataProperties.put(SAPNodeProperties.creator.name(), "creator");
        metaDataProperties.put(SAPNodeProperties.created.name(), "created");
        metaDataProperties.put(SAPNodeProperties.changed_by.name(), "changed_by");
        metaDataProperties.put(SAPNodeProperties.changed.name(), "changed");
        metaDataProperties.put(SAPNodeProperties.number_of_statements.name(), "number_of_statements");
        metaDataProperties.put(SAPNodeProperties.local_class.name(), "local_class");


        // Elements, for which we want to show USES relation
        nodesWithUsesRelationByType = Arrays.asList(
                "METH",
                "FUMO",
                "REPS",
                "FORM",
                "FUGR"
        );

        // Elements, for which we want to show INHERIT relation
        nodesWithInheritRelationByType = Arrays.asList(
                "CLAS",
                "INTF"
        );

        nodesWithMigrationRelationByType = Arrays.asList(
                "CLAS",
                "INTF"
        );
    }

    public static Map<String, String> getMetaDataProperties() {
        return metaDataProperties;
    }

    public static String getMetaDataProperty(String key) {
        String propertyName = metaDataProperties.get(key);
        if (propertyName == null) {
            propertyName = key;
        }
        return propertyName;
    }

    public static List<String> getNodesWithMigrationRelationByType() {
        return nodesWithMigrationRelationByType;
    }

    public static List<String> getNodesWithReferencesRelationByType() {
        return nodesWithUsesRelationByType;
    }

    public static List<String> getNodesWithInheritRelationByType() {
        return nodesWithInheritRelationByType;
    }
}

