package org.visap.generator.output;

import org.visap.generator.configuration.Config;

public class MetropolisAFrameUI implements OutputFormat {
    public String head() {
        return  "<!DOCTYPE html>" +
                "\n" +
                "<html>" +
                "\n" +
                "\t <head>" +
                "\n" +
                "\t\t <meta charset=\"utf-8\">" +
                "\n" +
                "\t    <title>Metropolis</title>" +
                "\n" +
                "\t    <meta name=\"description\" content=\"Getaviz\">" +
                "\n" +
                "\t </head>" +
                "\n" +
                "\t <body>" +
                "\n" +
                "\t\t <a-scene id=\"aframe-canvas\" cursor=\"rayOrigin: mouse\" embedded=\"true\" renderer=\"logarithmicDepthBuffer: true;\">" +
                "\n" +
                "\t\t\t <a-assets>" +
                "\n" +
                "\t\t\t\t <img id=\"sky\" crossorigin=\"anonymous\" src=\"" + Config.assets.sky()  +  "\">" +
                "\n" +
                "\t\t\t\t <img id=\"ground\" crossorigin=\"anonymous\" src=\"" + Config.assets.ground()  + "\">" +
                "\n" +
                "\t\t\t </a-assets>" +
                "\n" +
                "\t\t\t <a-sky src=\"#sky\" radius=\"7000\"></a-sky>" +
                "\n" +
                "\t\t\t <a-plane src=\"#ground\" height=\"5000\" width=\"5000\" rotation=\"-90 0 0\" position=\"0 0 0\" repeat=\"30 30\"></a-plane>" +
                "\n";

    }

    public String tail() {
        return "\t\t </a-scene>" +
                "\n" +
                " \t </body>" +
                "\n" +
                "</html>" +
                "\n";
    }

}
