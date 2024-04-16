package org.visap.generator.abap;

public class PropertyMetadata {
    private final String name;
    private final Class<?> type;

    public PropertyMetadata(String name, Class<?> type) {
        this.name = name;
        this.type = type;
    }

    public String getName() {
        return this.name;
    }

    public Class<?> getOutputType() {
        return this.type;
    }
}
