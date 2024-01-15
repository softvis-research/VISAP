package org.visap.generator.database;

import org.neo4j.driver.types.Node;

public class NodeCell {
    public Node node;

    public NodeCell(Node node) {
        this.node = node;
    }
}
