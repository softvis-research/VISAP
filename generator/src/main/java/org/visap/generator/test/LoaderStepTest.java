package org.visap.generator.test;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import org.visap.generator.configuration.Config;
import org.visap.generator.database.DatabaseConnector;

class LoaderStepTest {
    @Test
    void settingsConfigIsInstantiated() {
        assertNotNull(Config.class);
    }
    @Test
    void boltAddressIsNotEmpty() {
        assertNotNull(Config.setup.boltAddress());
    }
    @Test
    void connectionToDatabaseSucceeds() {
        DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());
        connector.executeWrite("CREATE (test)");
        connector.executeWrite("MATCH (n) RETURN n");
        connector.close();
    }
    @Test
    void visualizationConfigIsLoadable() {
        assertNotNull(Config.visualization.abapFloorHeightSum());
    }
}