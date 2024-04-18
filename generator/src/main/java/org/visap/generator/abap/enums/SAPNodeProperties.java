package org.visap.generator.abap.enums;

public enum SAPNodeProperties {
        // alle Elemente
        element_id, object_name, type, type_name, creator, created, changed_by, changed, iteration,

        // spezifische Eigenschaften
        number_of_statements, local_class, container_id, number_of_fields,

      /*  amount_of_results,
        amount_of_namspa,
        amount_of_chnhis,
        amount_of_codlen,
        amount_of_commam,
        amount_of_dynsta,
        amount_of_enhmod,
        amount_of_formty,
        amount_of_nomac,
        amount_of_objnam,
        amount_of_praefi,
        amount_of_sql,
        amount_of_todo, */

        migration_findings,

        //new Metrics
        number_of_object_references,
        number_of_exec_statements,
        maximum_nesting_depth,
        cyclomatic_complexity,
        keyword_named_variables,
        number_of_comments,
        halstead_difficulty,
        halstead_volume,
        halstead_effort,
        number_of_methods,
        number_of_interfaces,
        number_of_attributes,
        number_of_events,
        number_of_redefined_methods,
        number_of_protected_methods,
        number_of_public_methods,
        number_of_private_attributes,
        number_of_protected_attributes,
        number_of_public_attributes,
        amount_of_slin_findings
}
