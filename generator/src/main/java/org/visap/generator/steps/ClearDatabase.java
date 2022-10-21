package org.visap.generator.steps;

import org.visap.generator.configuration.Config;
import org.visap.generator.database.DatabaseConnector;

import java.util.logging.Logger;

public class ClearDatabase {
    private static final DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());
    private static Logger logger = Logger.getLogger("org.visap.generator.steps");

    public static void main(String[] args) {
        connector.executeWrite("MATCH (n) DETACH DELETE n;");
        connector.close();

        logger.info("Database has been cleared");
    }
}
