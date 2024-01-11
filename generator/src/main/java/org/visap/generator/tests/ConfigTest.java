package org.visap.generator.tests;
import org.visap.generator.configuration.Config;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class ConfigTest {
    @Test
    void settingsConfigIsInstantiated() {
        assertNotNull(Config.class);
    }

    @Test
    void configIsFetched() {
        assertNotNull(Config.Visualization.Metropolis.building.defaultWidth());
        assertNotNull(Config.Visualization.Metropolis.building.defaultLength());
        assertNotNull(Config.Visualization.Metropolis.building.defaultHeight());
        assertNotNull(Config.setup.boltAddress());
    }
}
