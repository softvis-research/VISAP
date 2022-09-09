package org.visap.generator.layouts;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import org.visap.generator.repository.ACityElement;

import java.util.Collection;

public class AStackLayout {

    private Log log = LogFactory.getLog(this.getClass());

    private ACityElement rootElement;
    private Collection<ACityElement> stackElements;


    public AStackLayout(ACityElement rootElement, Collection<ACityElement> stackElements){
        this.rootElement = rootElement;
        this.stackElements = stackElements;
    }

    public void calculate(){
        stackSubElements(stackElements, rootElement.getHeight());
    }

    private void stackSubElements(Collection<ACityElement> elements, double parentHeight){
        for (ACityElement element : elements) {

            //stack element
            double stackedYPosition = element.getYPosition() + parentHeight;
            element.setYPosition(stackedYPosition);

            //stack sub elements
            Collection<ACityElement> subElements = element.getSubElements();
            if (!subElements.isEmpty()) {
                stackSubElements(subElements, parentHeight);
            }
        }
    }



}
