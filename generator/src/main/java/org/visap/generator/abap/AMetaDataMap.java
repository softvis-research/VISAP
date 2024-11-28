package org.visap.generator.abap;

import org.visap.generator.abap.enums.SAPNodeProperties;

import java.util.*;

public class AMetaDataMap {
    private static final Map<String, PropertyMetadata> metaDataProperties;
    private static final List<String> nodesWithReferencesRelationByType;
    private static final List<String> nodesWithInheritRelationByType;
    private static final List<String> nodesWithMigrationRelationByType;
    private static final List<String> nodesWithUsesRelationByType;

    static {
        // Change property names for metaData-output
        metaDataProperties = new HashMap<>();
        metaDataProperties.put(SAPNodeProperties.element_id.name(), new PropertyMetadata("id", String.class));
        metaDataProperties.put(SAPNodeProperties.object_name.name(), new PropertyMetadata("name", String.class));
        metaDataProperties.put(SAPNodeProperties.type_name.name(), new PropertyMetadata("type", String.class));
        metaDataProperties.put(SAPNodeProperties.type.name(), new PropertyMetadata("abap_type", String.class));
        metaDataProperties.put(SAPNodeProperties.creator.name(), new PropertyMetadata("creator", String.class));
        metaDataProperties.put(SAPNodeProperties.created.name(), new PropertyMetadata("created", int.class));
        metaDataProperties.put(SAPNodeProperties.changed_by.name(), new PropertyMetadata("changed_by", String.class));
        metaDataProperties.put(SAPNodeProperties.changed.name(), new PropertyMetadata("changed", int.class));
        metaDataProperties.put(SAPNodeProperties.iteration.name(), new PropertyMetadata("iteration", int.class));
        metaDataProperties.put(SAPNodeProperties.number_of_statements.name(), new PropertyMetadata("number_of_statements", int.class));
        metaDataProperties.put(SAPNodeProperties.amount_of_slin_findings.name(), new PropertyMetadata("amount_of_slin", int.class));
        metaDataProperties.put(SAPNodeProperties.local_class.name(), new PropertyMetadata("local_class", String.class));
        /* metaDataProperties.put(SAPNodeProperties.amount_of_results.name(), new PropertyMetadata("amount_of_results", int.class));
        metaDataProperties.put(SAPNodeProperties.amount_of_namspa.name(), new PropertyMetadata("amount_of_namspa", int.class));
        metaDataProperties.put(SAPNodeProperties.amount_of_chnhis.name(), new PropertyMetadata("amount_of_chnhis", int.class));
        metaDataProperties.put(SAPNodeProperties.amount_of_codlen.name(), new PropertyMetadata("amount_of_codlen", int.class));
        metaDataProperties.put(SAPNodeProperties.amount_of_commam.name(), new PropertyMetadata("amount_of_commam", int.class));
        metaDataProperties.put(SAPNodeProperties.amount_of_dynsta.name(), new PropertyMetadata("amount_of_dynsta", int.class));
        metaDataProperties.put(SAPNodeProperties.amount_of_enhmod.name(), new PropertyMetadata("amount_of_enhmod", int.class));
        metaDataProperties.put(SAPNodeProperties.amount_of_formty.name(), new PropertyMetadata("amount_of_formty", int.class));
        metaDataProperties.put(SAPNodeProperties.amount_of_nomac.name(), new PropertyMetadata("amount_of_nomac", int.class));
        metaDataProperties.put(SAPNodeProperties.amount_of_objnam.name(), new PropertyMetadata("amount_of_objnam", int.class));
        metaDataProperties.put(SAPNodeProperties.amount_of_praefi.name(), new PropertyMetadata("amount_of_praefi", int.class));
        metaDataProperties.put(SAPNodeProperties.amount_of_sql.name(), new PropertyMetadata("amount_of_sql", int.class));
        metaDataProperties.put(SAPNodeProperties.amount_of_todo.name(), new PropertyMetadata("amount_of_todo", int.class));
        metaDataProperties.put(SAPNodeProperties.number_of_fields.name(), new PropertyMetadata("number_of_fields", int.class)); */

        //new Metrics Mapping...
        metaDataProperties.put(SAPNodeProperties.number_of_object_references.name(), new PropertyMetadata("number_of_object_references", int.class));
        metaDataProperties.put(SAPNodeProperties.number_of_exec_statements.name(), new PropertyMetadata("number_of_exec_statements", int.class));
        metaDataProperties.put(SAPNodeProperties.maximum_nesting_depth.name(), new PropertyMetadata("maximum_nesting_depth", int.class));
        metaDataProperties.put(SAPNodeProperties.cyclomatic_complexity.name(), new PropertyMetadata("cyclomatic_complexity", int.class));
        metaDataProperties.put(SAPNodeProperties.keyword_named_variables.name(), new PropertyMetadata("keyword_named_variables", int.class));
        metaDataProperties.put(SAPNodeProperties.number_of_comments.name(), new PropertyMetadata("number_of_comments", int.class));
        metaDataProperties.put(SAPNodeProperties.halstead_difficulty.name(), new PropertyMetadata("halstead_difficulty", int.class));
        metaDataProperties.put(SAPNodeProperties.halstead_volume.name(), new PropertyMetadata("halstead_volume", int.class));
        metaDataProperties.put(SAPNodeProperties.halstead_effort.name(), new PropertyMetadata("halstead_effort", int.class));
        metaDataProperties.put(SAPNodeProperties.number_of_methods.name(), new PropertyMetadata("number_of_methods", int.class));
        metaDataProperties.put(SAPNodeProperties.number_of_interfaces.name(), new PropertyMetadata("number_of_interfaces", int.class));
        metaDataProperties.put(SAPNodeProperties.number_of_attributes.name(), new PropertyMetadata("number_of_attributes", int.class));
        metaDataProperties.put(SAPNodeProperties.number_of_events.name(), new PropertyMetadata("number_of_events", int.class));
        metaDataProperties.put(SAPNodeProperties.number_of_redefined_methods.name(), new PropertyMetadata("number_of_redefined_methods", int.class));
        metaDataProperties.put(SAPNodeProperties.number_of_protected_methods.name(), new PropertyMetadata("number_of_protected_methods", int.class));
        metaDataProperties.put(SAPNodeProperties.number_of_public_methods.name(), new PropertyMetadata("number_of_public_methods", int.class));
        metaDataProperties.put(SAPNodeProperties.number_of_private_attributes.name(), new PropertyMetadata("number_of_private_attributes", int.class));
        metaDataProperties.put(SAPNodeProperties.number_of_protected_attributes.name(), new PropertyMetadata("number_of_protected_attributes", int.class));
        metaDataProperties.put(SAPNodeProperties.number_of_public_attributes.name(), new PropertyMetadata("number_of_public_attributes", int.class));

        // Elements, for which we want to show REFERENCES relation
        nodesWithReferencesRelationByType = Arrays.asList(
                "METH",
                "FUNC",
                "REPS",
                "FORM",
                "FUGR");

        // Elements, for which we want to show USES relation
        nodesWithUsesRelationByType = Arrays.asList(
                "TABB",
                "VIEW",
                "STRU",
                "DOMA",
                "DATA");

        // Elements, for which we want to show INHERIT relation
        nodesWithInheritRelationByType = Arrays.asList(
                "CLAS",
                "INTF");

        nodesWithMigrationRelationByType = Arrays.asList(
                "CLAS",
                "INTF");
    }

    public static Map<String, PropertyMetadata> getMetaDataProperties() {
        return metaDataProperties;
    }

    public static PropertyMetadata getMetaDataProperty(String key) {
        return metaDataProperties.get(key);
    }

    public static List<String> getNodesWithMigrationRelationByType() {
        return nodesWithMigrationRelationByType;
    }

    public static List<String> getNodesWithReferencesRelationByType() {
        return nodesWithReferencesRelationByType;
    }

    public static List<String> getNodesWithUsesRelationByType(){
        return nodesWithUsesRelationByType;
    }

    public static List<String> getNodesWithInheritRelationByType() {
        return nodesWithInheritRelationByType;
    }
}
