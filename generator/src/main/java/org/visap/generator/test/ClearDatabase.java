package org.visap.generator.test;

import org.aeonbits.owner.ConfigFactory;
import org.visap.generator.configuration.SettingsConfig;
import org.visap.generator.database.DatabaseConnector;

public class ClearDatabase {
    static SettingsConfig config = ConfigFactory.create(SettingsConfig.class);
    private static final DatabaseConnector connector = DatabaseConnector.getInstance(config.boltAddress());

    public static void main(String[] args) {
        connector.executeWrite("MATCH (n) DETACH DELETE n;");
        connector.close();
    }
}
