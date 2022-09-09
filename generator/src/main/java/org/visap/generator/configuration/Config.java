package org.visap.generator.configuration;

import org.aeonbits.owner.ConfigFactory;
import org.visap.generator.configuration.Metropolis.ReferenceBuilding.Cloud;
import org.visap.generator.configuration.Metropolis.ReferenceBuilding.Mountain;
import org.visap.generator.configuration.Metropolis.ReferenceBuilding.Sea;

public class Config {
    public static Setup setup = ConfigFactory.create(Setup.class);

    public static class Visualization {
        public static class Metropolis {
            public static class ReferenceBuilding {
                public static Sea sea = ConfigFactory.create(Sea.class);
                public static Mountain mountain = ConfigFactory.create(Mountain.class);
                public static Cloud cloud = ConfigFactory.create(Cloud.class);
            }
        }
    }
}
