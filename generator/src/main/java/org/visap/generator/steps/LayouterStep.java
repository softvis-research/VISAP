package org.visap.generator.steps;

import org.visap.generator.configuration.Config;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.abap.enums.SAPNodeTypes;
import org.visap.generator.abap.enums.SAPRelationLabels;
import org.visap.generator.metropolis.steps.MetropolisCreator;
import org.visap.generator.metropolis.steps.MetropolisLayouter;
import org.visap.generator.repository.CityRepository;
import org.visap.generator.repository.SourceNodeRepository;
import org.visap.generator.database.DatabaseConnector;

public class LayouterStep {
    private static DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());
    private static SourceNodeRepository nodeRepository;
    private static CityRepository cityRepository;

    public static void main(String[] args) {
        nodeRepository = new SourceNodeRepository();
        nodeRepository.loadNodesByPropertyValue(SAPNodeProperties.type_name, SAPNodeTypes.Namespace.name());
        nodeRepository.loadNodesByRelation(SAPRelationLabels.CONTAINS, true);
        nodeRepository.loadNodesByRelation(SAPRelationLabels.TYPEOF, true);
        nodeRepository.loadNodesByRelation(SAPRelationLabels.USES, true);
        nodeRepository.loadNodesByRelation(SAPRelationLabels.INHERIT, true);
        nodeRepository.loadNodesByRelation(SAPRelationLabels.REFERENCES, true);

        cityRepository = new CityRepository();

        MetropolisCreator creator = new MetropolisCreator(cityRepository, nodeRepository);
        creator.createRepositoryFromNodeRepository();

        MetropolisLayouter layouter = new MetropolisLayouter(cityRepository, nodeRepository);
        layouter.layoutRepository();

        // Delete old CityRepository Nodes
        connector.executeWrite("MATCH (n:ACityRep) DETACH DELETE n;");

        // Update Neo4j with new nodes
        cityRepository.writeRepositoryToNeo4j();

        connector.close();
        System.out.println("\nLayouter step was completed\"");
    }
}
