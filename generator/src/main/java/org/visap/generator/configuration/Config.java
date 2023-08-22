package org.visap.generator.configuration;

import org.aeonbits.owner.ConfigFactory;
import org.visap.generator.configuration.Metropolis.*;

public class Config {
    public static Setup setup = ConfigFactory.create(Setup.class);

    public static class Visualization {
        public static class Metropolis {
            public static Building building = ConfigFactory.create(Building.class);
            public static District district = ConfigFactory.create(District.class);
            public static RoadNetwork roadNetwork = ConfigFactory.create(RoadNetwork.class);

            public static Color color = ConfigFactory.create(Color.class);
            public static Shape shape = ConfigFactory.create(Shape.class);
        }
    }

    public static Output output = ConfigFactory.create(Output.class);
    public static Assets assets = ConfigFactory.create(Assets.class);
    public static Features features = ConfigFactory.create(Features.class);
}
