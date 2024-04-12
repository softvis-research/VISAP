package org.visap.generator.repository;

import java.util.Collection;

public interface ICityRelationMapper {

    Collection<CityElement> getRelatedACityElements(CityElement element, boolean reverse);

    Collection<CityElement> getAggregatedRelatedACityElements(CityElement element, RelationAggregationLevel aggregationLevel, boolean reverse);

    int getAmountOfRelatedACityElements(CityElement element, boolean reverse);

    int getAmountOfRelationsToACityElement(CityElement source, CityElement target, boolean reverse);

    enum RelationAggregationLevel {
        BUILDING,
        SOURCE_CODE_DISTRICT,
        PACKAGE_DISTRICT
    }
}