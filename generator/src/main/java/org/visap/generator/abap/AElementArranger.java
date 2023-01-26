package org.visap.generator.abap;

import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.repository.CityElement;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class AElementArranger {
    public List<List<CityElement>> constructElementSets(Collection<CityElement> elements) {
        List<CityElement> originSet = new ArrayList<>();
        List<CityElement> customCode = new ArrayList<>();
        List<CityElement> standardCode = new ArrayList<>();

        // order the rectangles to the fit sets
        for (CityElement element : elements) {
            String creator = element.getSourceNodeProperty(SAPNodeProperties.creator);
            String iterationString = element.getSourceNodeProperty(SAPNodeProperties.iteration);
            int iteration = Integer.parseInt(iterationString);

            if (iteration == 0 && (!creator.equals("SAP"))) {
                originSet.add(element);
            } else if (iteration >= 1 && (!creator.equals("SAP"))) {
                customCode.add(element);
            } else {
                standardCode.add(element);
            }
        }

        ArrayList<List<CityElement>> result = new ArrayList<>();
        result.add(originSet);
        result.add(customCode);
        result.add(standardCode);

        return result;
    }
}
