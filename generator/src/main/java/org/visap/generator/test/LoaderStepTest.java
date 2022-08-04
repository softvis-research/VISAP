package org.visap.generator.test;

import org.aeonbits.owner.ConfigFactory;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import org.visap.generator.configuration.SettingsConfig;

class LoaderStepTest {
    @Test
    void OneEqualsOne() {
        assertEquals(1, 1);
    }
    @Test
    void TwoDoesNotEqualOne() {
        assertNotEquals(1, 2);
    }
    @Test
    void boltAddressIsNotEmpty() {
        SettingsConfig config = ConfigFactory.create(SettingsConfig.class);
        assertNotEquals(config.boltAddress(), null);
    }
}