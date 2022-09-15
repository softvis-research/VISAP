package org.visap.generator.configuration;

import org.aeonbits.owner.ConfigFactory;
import org.visap.generator.configuration.Metropolis.ReferenceBuilding.Show;
import org.visap.generator.configuration.Metropolis.ReferenceBuilding.Width;
import org.visap.generator.configuration.Metropolis.ReferenceBuilding.Height;
import org.visap.generator.configuration.Metropolis.ReferenceBuilding.Length;

public class Config {
    public static Setup setup = ConfigFactory.create(Setup.class);

    public static class Visualization {
        public static class Metropolis {
            public static class ReferenceBuilding {
                public static Height height = ConfigFactory.create(Height.class);
                public static Width width = ConfigFactory.create(Width.class);
                public static Length length = ConfigFactory.create(Length.class);

                public static Show show = ConfigFactory.create(Show.class);
            }
        }
    }
}
