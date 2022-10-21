package org.visap.generator.configuration.Metropolis;

import org.aeonbits.owner.Config;

@Config.Sources("file:${user.dir}/src/main/java/properties/metropolis/designer/Model.properties")
public interface Model extends Config {
    String mountainModel();
    String cloudModel();

    String mountainScale();
    String cloudScale();
}
