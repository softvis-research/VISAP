package org.visap.generator.steps;

import org.aeonbits.owner.ConfigFactory;

import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.abap.enums.SAPNodeTypes;
import org.visap.generator.abap.enums.SAPRelationLabels;
import org.visap.generator.database.DatabaseConnector;
import org.visap.generator.configuration.SettingsConfig;
import org.visap.generator.metropolis.steps.MetropolisCreator;
import org.visap.generator.repository.ACityRepository;
import org.visap.generator.repository.SourceNodeRepository;

public class CreatorStep {
    static SettingsConfig config = ConfigFactory.create(SettingsConfig.class);
    private static final DatabaseConnector connector = DatabaseConnector.getInstance(config.boltAddress());

    public static void main(String[] args) {
        SourceNodeRepository nodeRepository = new SourceNodeRepository();
        nodeRepository.loadNodesByPropertyValue(SAPNodeProperties.type_name, SAPNodeTypes.Namespace.name());
        nodeRepository.loadNodesByRelation(SAPRelationLabels.CONTAINS, true);
        nodeRepository.loadNodesByRelation(SAPRelationLabels.TYPEOF, true);
        nodeRepository.loadNodesByRelation(SAPRelationLabels.USES, true);
        nodeRepository.loadNodesByRelation(SAPRelationLabels.CONTAINS, true);
        nodeRepository.loadNodesByRelation(SAPRelationLabels.REFERENCES, true);

        ACityRepository aCityRepository = new ACityRepository();

        MetropolisCreator creator = new MetropolisCreator(aCityRepository, nodeRepository, config);
        creator.createRepositoryFromNodeRepository();

        // Delete old ACityRepository Nodes
        connector.executeWrite("MATCH (n:ACityRep) DETACH DELETE n;");

        // Update Neo4j with new nodes
        aCityRepository.writeRepositoryToNeo4j();

        connector.close();
        System.out.println("\nCreator step was completed\"");
    }
}
