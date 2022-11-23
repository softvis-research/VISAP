package org.visap.generator.abap;

import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.layouts.kdtree.CityRectangle;
import org.visap.generator.repository.CityElement;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class AElementArranger {
    public List<List<CityRectangle>> constructElementSets(List<CityRectangle> elements, Map<CityRectangle, CityElement> rectangleElementsMap) {
        List<CityRectangle> originSet = new ArrayList<>();
        List<CityRectangle> customCode = new ArrayList<>();
        List<CityRectangle> standardCode = new ArrayList<>();

        // order the rectangles to the fit sets
        for (CityRectangle element : elements) {
            CityElement recElement = rectangleElementsMap.get(element);
            CityElement.CitySubType refBuilding = recElement.getSubType();

            //no sourceNode, no refBuilding
            if (recElement.getSourceNode() == null && refBuilding == null) {
                continue;
            }

            // for Elements with SourceNode
            if (recElement.getSourceNode() != null && refBuilding == null) {

                String creator = recElement.getSourceNodeProperty(SAPNodeProperties.creator);
                String iterationString = recElement.getSourceNodeProperty(SAPNodeProperties.iteration);
                int iteration = Integer.parseInt(iterationString);

                if (iteration == 0 && (!creator.equals("SAP"))) {
                    originSet.add(element);
                } else if (iteration >= 1 && (!creator.equals("SAP"))) {
                    customCode.add(element);
                } else {
                    standardCode.add(element);
                }
            }
        }

        ArrayList<List<CityRectangle>> result = new ArrayList<>();
        result.add(originSet);
        result.add(customCode);
        result.add(standardCode);

        return result;
    }
}
