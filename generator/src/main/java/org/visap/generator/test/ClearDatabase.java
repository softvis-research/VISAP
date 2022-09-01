package org.visap.generator.test;

import org.visap.generator.configuration.Config;
import org.visap.generator.database.DatabaseConnector;

public class ClearDatabase {
    private static final DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());

    public static void main(String[] args) {
        connector.executeWrite("MATCH (n) DETACH DELETE n;");
        connector.close();
    }
}
