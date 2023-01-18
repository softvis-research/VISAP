# VISAP
This project aims to be a revamp of https://github.com/softvis-research/Getaviz. In particular, it aims to reduce bloat in its source code while merging a lot of the features of Getaviz that were previously built separately through the efforts of many individual contributors.

## Current State
The project is currently in a pre-development phase. Porting of functionality from Getaviz is still ongoing, and while we have a rough idea of where we want to go, many important design decisions are yet to be made.

## Installation

### Compiling the Generator

This project requires a JDK version of 12 or higher.

The generator project is built using Maven. Open the project in your IDE of choice by importing the pom.xml file in the generator/ directory and then building the project.

### Initializing the Graph Database

VISAP uses a local Neo4J graph database to generate its model. Download a current version of Neo4J, then set up a new local project there. Setting a password is required, make sure it matches with the password in the "generator/src/java/properties/setup.properties" File, the default value is "123".

Make the following changes to the configuration of that database (… > Settings):
- Comment out ```dbms.directories.import=import``` by prepending #
- De-comment ```dbms.security.allow_csv_import_from_file_urls=true``` by removing the leading #

Then, start the database. The authorization being disabled may cause warnings on start-up, which can be dismissed.

### Generating a Model

- Ensure that the Neo4J database is running
- Place input CSV files inside the directory ```generator/input/```. This directory is meant as a place to store all your model data inside appropriately named sub-directories. It also contains an example sub-directory to get you started.
- Execute the file ```generator/src/main/java/org.visap.generator/steps/LoaderStep.java```. This will place the initial data in the local graph database. Any previously contained data is overwritten!
- Execute the file ```generator/src/main/java/org.visap.generator/steps/AFrameExporterStep.java```. This will run all additional model-generating steps. Depending on the model size, this process can take a few minutes to finish.

The resulting model files (model.html and metaData.json) are placed in the output/ folder. This folder also includes an example sub-directory.

To change your input location, you can change the ```inputCSVFilePath``` property inside the ```generator/properties/Setup.properties``` file. Similarly, to change your output location, you can change the ```mapPath``` property inside the ```generator/properties/Output.properties``` file.

### Displaying a Model in the Browser

After following the instructions in section [Generating a Model](#generating-a-model), two files will have been generated for you: model.html and metaData.json.

To display the model in the browser, first navigate to the folder ```ui/data/```. Create a subfolder with a name of your liking, for example ```Test```. Inside the newly created subfolder, create another subfolder named ```model```. Copy both the model.html file and the metaData.json file from the ```generator/output/``` directory into this subfolder.

Next, you will need a local server. Based on your operating system, we recommend different practices. If these don't work for you, further information about setting up a local server can be found [here](https://aframe.io/docs/0.5.0/introduction/installation.html#local-development).

### On Windows
Install [XAMPP](https://www.apachefriends.org/download.html).

![xampp.png](images/xampp.png)

Click on the config for Apache and select Apache (httpd.conf). Change the path behind ```DocumentRoot``` and in ```<Directory "...">``` to match the location of the ui folder. Alternatively, create a symbolic link to the folder in the existing document root, in which case the symlink name should be inserted correspondingly after "localhost/" for all following localhost URLs.

![apache_config.png](images/apache_config.png)

Save the config, close it, and start the Apache Module.

### On Ubuntu

Install [NPM](https://www.npmjs.com/) and run the command ```npm install -g live-server && live-server``` inside the UI folder.

### View in the browser

Whichever approach for setting up a local server, if things went well, you should now be able to view the visualization in the browser.
Enter the URL {localhost}/index.html?setup={setupPath}&model={folderName}, where ```{localhost}``` is the URL to the webserver, and ```{folderName}``` is the name of the folder inside which you created the ```model/``` subfolder. Instead of the folder you created yourself, you can also use ```Example```. ```{setupPath}``` is where the setup lives inside the ```ui/setups/``` folder. For now, the only available setup is minimal/hover.

When using NPM live-server, our complete URL might be http://127.0.0.1:8080/index.html?setup=minimal/hover&model=Example. When using XAMPP, it might be http://localhost/index.html?setup=minimal/hover&model=Example instead.

The visualization will look similar to this:

![visualization.png](images/visualization.png)

## Testing Changes

When testing changes, make sure that your browser doesn't cache previous visits to the localhost.

Refresh the page with Ctrl-F5 to request an uncached version of the page.

Alternatively, disable caching in your browser entirely. In Chrome, open the Developer Tools with F12, select the Network tab, then select the checkbox "Disable Cache". In Firefox, enter ```about:config``` in the address bar, search for ```browser.cache.disk.enable``` and set it to ```false```.

## Documentation
The development team actively uses and maintains https://miro.com/app/board/uXjVOGFnA-M=/ for project coordination and documentation. The Miro board also includes instructions for installation and usage. Access requests will generally be accepted. Most documentation is currently available in German only.

If you need help or have any suggestions, we appreciate your interest in the project, and hope you will file an issue or message the contributors directly.
