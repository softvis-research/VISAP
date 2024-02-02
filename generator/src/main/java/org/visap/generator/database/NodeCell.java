package org.visap.generator.database;

import org.neo4j.driver.Value;
import org.neo4j.driver.types.Node;

public class NodeCell {
    public Node node;

    public NodeCell(Node node) {
        this.node = node;
    }

    public long id() {
        return this.node.id();
    }

    public Iterable<String> labels() {
        return this.node.labels();
    }

    public Value get(String key) {
        return this.node.get(key);
    }
}
