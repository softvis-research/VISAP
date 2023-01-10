package org.visap.generator.steps;

import org.visap.generator.configuration.Config;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.abap.enums.SAPNodeTypes;
import org.visap.generator.abap.enums.SAPRelationLabels;
import org.visap.generator.repository.CityRepository;
import org.visap.generator.repository.SourceNodeRepository;
import org.visap.generator.database.DatabaseConnector;
import org.visap.generator.metaphors.metropolis.steps.MetropolisCreator;
import org.visap.generator.metaphors.metropolis.steps.MetropolisDesigner;
import org.visap.generator.metaphors.metropolis.steps.MetropolisLayouter;

public class DesignerStep {
    private static DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());
    private static SourceNodeRepository nodeRepository;
    private static CityRepository cityRepositoryitory;

    public static void main(String[] args) {
        nodeRepository = new SourceNodeRepository();
        nodeRepository.loadNodesByPropertyValue(SAPNodeProperties.type_name, SAPNodeTypes.Namespace.name());
        nodeRepository.loadNodesByRelation(SAPRelationLabels.CONTAINS, true);
        nodeRepository.loadNodesByRelation(SAPRelationLabels.TYPEOF, true);
        nodeRepository.loadNodesByRelation(SAPRelationLabels.USES, true);
        nodeRepository.loadNodesByRelation(SAPRelationLabels.INHERIT, true);
        nodeRepository.loadNodesByRelation(SAPRelationLabels.REFERENCES, true);

        cityRepositoryitory = new CityRepository();

        MetropolisCreator creator = new MetropolisCreator(cityRepositoryitory, nodeRepository);
        creator.createRepositoryFromNodeRepository();

        MetropolisLayouter layouter = new MetropolisLayouter(cityRepositoryitory, nodeRepository);
        layouter.layoutRepository();

        MetropolisDesigner designer = new MetropolisDesigner(cityRepositoryitory, nodeRepository);
        designer.designRepository();

        // Delete old ACityRepository Nodes
        connector.executeWrite("MATCH (n:ACityRep) DETACH DELETE n;");

        // Update Neo4j with new nodes
        cityRepositoryitory.writeRepositoryToNeo4j();

        // System.out.println(Thread.currentThread());

        connector.close();
        System.out.println("\nDesigner step was completed\"");
    }
}
