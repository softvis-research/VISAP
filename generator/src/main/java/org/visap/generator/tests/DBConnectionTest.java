package org.visap.generator.tests;

import org.junit.jupiter.api.Test;

import org.visap.generator.configuration.Config;
import org.visap.generator.database.DatabaseConnector;

class DBConnectionTest {
    @Test
    void connectionToDatabaseSucceeds() {
        DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());
        connector.executeWrite("CREATE (test)");
        connector.executeWrite("MATCH (n) RETURN n");
        connector.close();
    }
}