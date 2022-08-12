package org.visap.generator.test;

import org.aeonbits.owner.ConfigFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import org.visap.generator.configuration.SettingsConfig;
import org.visap.generator.database.DatabaseConnector;

class LoaderStepTest {
    SettingsConfig config = ConfigFactory.create(SettingsConfig.class);

    @Test
    void settingsConfigIsInstantiated() {
        assertNotNull(config);
    }
    @Test
    void boltAddressIsNotEmpty() {
        assertNotNull(config.boltAddress());
    }

    @Test
    void connectionToDatabaseSucceeds() {
        DatabaseConnector connector = DatabaseConnector.getInstance(config.boltAddress());
        connector.executeWrite("CREATE (test)");
        connector.executeWrite("MATCH (n) RETURN n");
        connector.close();
    }
}