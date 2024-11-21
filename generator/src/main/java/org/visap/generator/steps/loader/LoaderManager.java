package org.visap.generator.steps.loader;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.configuration.Config;
import org.visap.generator.database.DatabaseConnector;

import java.lang.reflect.InvocationTargetException;

public class LoaderManager {

    private static final Log log = LogFactory.getLog(LoaderManager.class);
    private static final Class<?>[] classes = {
        NodesLoaderStep.class,
        ReferencesLoaderStep.class,
        MetaDataLoaderStep.class,
        MetricsLoaderStep.class,
        NoesLoaderStep.class,
    };

    public static void main(String[] args) {
        DatabaseConnector connector = DatabaseConnector.getInstance(Config.setup.boltAddress());

        try {
            for (Class<?> loaderClass : classes) {
                try {
                    loaderClass
                        .getMethod("main", String[].class)
                        .invoke(null, new Object[] { args });
                } catch (
                    NoSuchMethodException
                    | IllegalAccessException
                    | InvocationTargetException e
                ) {
                    Log log = LogFactory.getLog(loaderClass);
                    if (e.getCause() != null) {
                        log.warn(e.getCause().getMessage());
                    } else {
                        log.warn(e.getMessage());
                    }
                }
            }
        } finally {
            connector.close();
            log.info("DatabaseConnector closed.");
        }
    }
}
