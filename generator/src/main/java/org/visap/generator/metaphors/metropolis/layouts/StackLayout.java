package org.visap.generator.metaphors.metropolis.layouts;

import org.visap.generator.repository.CityElement;

import java.util.Collection;

public class StackLayout {
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
