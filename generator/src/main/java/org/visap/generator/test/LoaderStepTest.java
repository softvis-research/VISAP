package org.visap.generator.test;

import org.aeonbits.owner.ConfigFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import org.visap.generator.configuration.SettingsConfig;

class LoaderStepTest {
    SettingsConfig config = ConfigFactory.create(SettingsConfig.class);

    @Test
    void settingsConfigIsInstantiated() {
        assertNotNull(config);
    }
    @Test
    void boltAddressIsNotEmpty() {
        assertNotNull(config.boltAddress());
    }
    @Test
    void maxThreadsIs5() {
        assertEquals(5, config.maxThreads());
    }
}