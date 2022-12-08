package org.visap.generator.database;

import org.neo4j.driver.*;
import org.neo4j.driver.Record;
import org.neo4j.driver.types.Node;
import org.visap.generator.configuration.Config;

import java.util.List;

public class DatabaseConnector implements AutoCloseable {
    private static String URL;
    private final Driver driver;
    private static DatabaseConnector instance = null;

    private DatabaseConnector() {
        driver = GraphDatabase.driver(URL);
    }

    private DatabaseConnector(String URL) {
        DatabaseConnector.URL = URL;
        driver = GraphDatabase.driver(URL, AuthTokens.basic(Config.setup.username(), Config.setup.password()));
    }

    public static String getDatabaseURL() {
        return URL;
    }

    public static DatabaseConnector getInstance(String URL) {
        if (instance == null) {
            instance = new DatabaseConnector(URL);
        }
        return instance;
    }

    public void executeWrite(String... statements) {
        try (Session session = driver.session()) {
            session.writeTransaction((Transaction tx) -> {
                for (String statement : statements) {
                    tx.run(statement);
                }
                return 1;
            });
        }
    }

    public Node addNode(String statement, String parameterName) {
        Node result;

        try (Session session = driver.session()) {
            result = session.writeTransaction(tx -> {
                Result stateResult = tx.run(statement + " RETURN " + parameterName);

                return stateResult.single().get(0).asNode();
            });
        }
        return result;
    }

    public List<Record> executeRead(String statement) {
        try (Session session = driver.session(SessionConfig.builder().withDefaultAccessMode(AccessMode.READ).build())) {
            return session.run(statement).list();
        }
    }

    public Node getVisualizedEntity(Long id) {
        return executeRead("MATCH (n)-[:VISUALIZES]->(e) WHERE ID(n) = " + id + " RETURN e").get(0).get("e").asNode();
    }

    public Node getPosition(Long id) {
        return executeRead("MATCH (n)-[:HAS]->(p:Position) WHERE ID(n) = " + id + " RETURN p").get(0).get("p").asNode();
    }

    @Override
    public void close() {
        driver.close();
    }
}