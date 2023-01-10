package org.visap.generator.steps;

import org.visap.generator.configuration.Config;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.abap.enums.SAPNodeTypes;
import org.visap.generator.abap.enums.SAPRelationLabels;
import org.visap.generator.repository.CityRepository;
import org.visap.generator.repository.SourceNodeRepository;
import org.visap.generator.database.DatabaseConnector;
import org.visap.generator.metaphors.metropolis.steps.MetaDataExporter;
import org.visap.generator.metaphors.metropolis.steps.MetropolisCreator;
import org.visap.generator.model.MetaDataOutput;

public class MetaDataExporterStep {
    private static DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());
    private static SourceNodeRepository nodeRepository;
    private static CityRepository cityRepository;
    private static MetaDataOutput metaDataOutput;

    public static void main(String[] args) {
        nodeRepository = new SourceNodeRepository();
        nodeRepository.loadNodesByPropertyValue(SAPNodeProperties.type_name, SAPNodeTypes.Namespace.name());
        nodeRepository.loadNodesByRelation(SAPRelationLabels.CONTAINS, true);
        nodeRepository.loadNodesByRelation(SAPRelationLabels.TYPEOF, true);
        nodeRepository.loadNodesByRelation(SAPRelationLabels.USES, true);
        nodeRepository.loadNodesByRelation(SAPRelationLabels.INHERIT, true);
        nodeRepository.loadNodesByRelation(SAPRelationLabels.REFERENCES, true);
        cityRepository = new CityRepository();

        MetropolisCreator metropolisCreator = new MetropolisCreator(cityRepository, nodeRepository);
        metropolisCreator.createRepositoryFromNodeRepository();


        MetaDataExporter metaDataExporter = new MetaDataExporter(cityRepository, nodeRepository);
        metaDataOutput = Config.output.metaData();

        // Depending on setting, create file or write metaData as Node's property, or both actions
        if (metaDataOutput == MetaDataOutput.FILE || metaDataOutput == MetaDataOutput.BOTH ) {
            metaDataExporter.exportMetaDataFile();
        }

        if (metaDataOutput == MetaDataOutput.NODEPROP || metaDataOutput == MetaDataOutput.BOTH ) {
            metaDataExporter.setMetaDataPropToCityElements();
        }

        connector.executeWrite("MATCH (n:cityRep) DETACH DELETE n;");
        cityRepository.writeRepositoryToNeo4j();

        connector.close();
        System.out.println("\nMetaDataExporter step was completed\"");
    }
}