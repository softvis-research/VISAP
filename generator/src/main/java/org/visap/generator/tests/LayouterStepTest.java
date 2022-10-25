package org.visap.generator.tests;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import org.visap.generator.configuration.Config;

public class LayouterStepTest {
    @Test
    void configIsFetched() {
        assertNotNull(Config.Visualization.Metropolis.building.defaultWidth());
        assertNotNull(Config.Visualization.Metropolis.building.defaultLength());
        assertNotNull(Config.Visualization.Metropolis.building.defaultHeight());
    }
}
