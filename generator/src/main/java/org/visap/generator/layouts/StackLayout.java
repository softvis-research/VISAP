package org.visap.generator.layouts;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import org.visap.generator.repository.CityElement;

import java.util.Collection;

public class StackLayout {

    private Log log = LogFactory.getLog(this.getClass());

    private CityElement rootElement;
    private Collection<CityElement> stackElements;


    public StackLayout(CityElement rootElement, Collection<CityElement> stackElements){
        this.rootElement = rootElement;
        this.stackElements = stackElements;
    }

    public void calculate(){
        stackSubElements(stackElements, rootElement.getHeight());
    }

    private void stackSubElements(Collection<CityElement> elements, double parentHeight){
        for (CityElement element : elements) {

            //stack element
            double stackedYPosition = element.getYPosition() + parentHeight;
            element.setYPosition(stackedYPosition);

            //stack sub elements
            Collection<CityElement> subElements = element.getSubElements();
            if (!subElements.isEmpty()) {
                stackSubElements(subElements, parentHeight);
            }
        }
    }



}
