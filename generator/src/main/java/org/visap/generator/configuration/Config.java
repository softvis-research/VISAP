package org.visap.generator.configuration;

import org.aeonbits.owner.ConfigFactory;

public class Config {
    public static Setup setup = ConfigFactory.create(Setup.class);
    public static Visualization visualization = ConfigFactory.create(Visualization.class);
}
