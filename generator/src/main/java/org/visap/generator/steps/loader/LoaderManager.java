package org.visap.generator.steps.loader;

import java.lang.reflect.InvocationTargetException;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class LoaderManager {

    private static Class<?>[] classes = {
        NodesLoaderStep.class,
        ReferencesLoaderStep.class,
        MetaDataLoaderStep.class,
        //NoesLoaderStep.class,
        MetricsLoaderStep.class,
    };

    public static void main(String[] args) {
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
    }
}
