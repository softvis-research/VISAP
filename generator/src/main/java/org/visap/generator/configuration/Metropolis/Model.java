package org.visap.generator.configuration.Metropolis;

import org.aeonbits.owner.Config;

@Config.Sources("file:${user.dir}/src/main/java/properties/metropolis/designer/Model.properties")
public interface Model extends Config {
    @DefaultValue("#mountain")
    String mountainModel();
    @DefaultValue("#cloud_black")
    String cloudModel();

    @DefaultValue("0 0 0")
    String mountainScale();
    @DefaultValue("0.3 0.3 0.3")
    String cloudScale();
}
