package org.visap.generator.metropolis.steps;

import org.apache.commons.lang3.math.NumberUtils;
import org.visap.generator.abap.AMetaDataMap;
import org.visap.generator.configuration.Config;
import org.visap.generator.abap.enums.SAPNodeProperties;
import org.visap.generator.abap.enums.SAPRelationLabels;
import org.visap.generator.repository.CityElement;
import org.visap.generator.repository.CityRepository;
import org.visap.generator.repository.SourceNodeRepository;
import org.neo4j.driver.types.Node;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;
import java.util.Arrays;
import java.util.Collection;
import java.util.*;

public class MetaDataExporter {
    private SourceNodeRepository nodeRepository;
    private CityRepository cityRepository;

    public MetaDataExporter(CityRepository cityRepository, SourceNodeRepository sourceNodeRepository) {
        this.nodeRepository = sourceNodeRepository;
        this.cityRepository = cityRepository;
    }

    public void exportMetaDataFile() {
        Writer fw = null;
        try {
            File outputDir = new File(Config.output.mapPath());
            String path = outputDir.getAbsolutePath() + "/metaData.json";
            fw = new FileWriter(path);
            fw.write(toJSON(cityRepository.getAllElements()));
        } catch (IOException e) {
            System.out.println(e);
        } finally {
            if (fw != null)
                try {
                    fw.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
        }
    }

    public void setMetaDataPropToCityElements() {
        Collection<CityElement> cityElements = cityRepository.getAllElements();
        for (final CityElement element : cityElements) {

            // skip reference buildings (only Metropolis)
            if (element.getSourceNode() == null) {
                continue;
            } else {
                String metaData = toMetaData(element);
                element.setMetaData("{" + metaData + "}");
            }
        }
    }

    private String toJSON(Collection<CityElement> elements) {
        StringBuilder metaDataFile = new StringBuilder();
        boolean hasElements = false;
        for (final CityElement element: elements) {



            if (element.getSourceNode() == null) {
                    continue;
            } else {


                if (!hasElements) {
                    hasElements = true;
                    metaDataFile.append("[{");
                } else {
                    metaDataFile.append("\n},{");
                }
                metaDataFile.append("\n");
                metaDataFile.append(toMetaData(element));
            }
        }
        if (hasElements) {
            metaDataFile.append("}]");
        }
        return metaDataFile.toString();
    }

    private String toMetaData(CityElement element) {
        StringBuilder builder = new StringBuilder();

        // Add element hash
        builder.append("\""+ AMetaDataMap.getMetaDataProperty(SAPNodeProperties.element_id.name()) + "\": \"" + element.getHash() + "\"," +"\n");
        // Add qualifiedName
        builder.append("\"qualifiedName\": \"" + getQualifiedName(element) + "\",\n");
        // Add node information
        builder.append(getNodeMetaInfo(element));
        // Add relations
        builder.append(getRelationsMetaInfo(element));
        // Add additional meta
        builder.append(getAdditionalMetaInfo(element));

        // Make sure we have the right syntax -> no commas at the end
        char lastChar = builder.charAt(builder.length() - 1);
        if (Character.compare(lastChar, '\n') == 0) {
            lastChar = builder.charAt(builder.length() - 2);

            if (Character.compare(lastChar, ',') == 0) {
                builder.deleteCharAt(builder.length() - 1); // Delete '\n'
                builder.deleteCharAt(builder.length() - 1); // Delete ,
            }
        }

        return builder.toString();
    }

    private String toMetaDataForReferenceElements(CityElement element) {
        StringBuilder builder = new StringBuilder();

        // Add element hash
        builder.append("\"id\": \"" + element.getHash() + "\"," +"\n");
        // Add Belongs to
        builder.append("\"belongsTo\": \"" + element.getParentElement().getHash() + "\",\n");
        // Add Name
        builder.append("\"type\": \"" + element.getType() + "\",\n");
        // Add Type
        builder.append("\"name\": \"" + element.getSubType() + "\",\n");

        // Make sure we have the right syntax -> no commas at the end
        char lastChar = builder.charAt(builder.length() - 1);
        if (Character.compare(lastChar, '\n') == 0) {
            lastChar = builder.charAt(builder.length() - 2);

            if (Character.compare(lastChar, ',') == 0) {
                builder.deleteCharAt(builder.length() - 1); // Delete '\n'
                builder.deleteCharAt(builder.length() - 1); // Delete ,
            }
        }

        return builder.toString();
    }

    private String getMigrationRelation(CityElement element) {

        StringBuilder builder = new StringBuilder();

        //new hash list for all migrationRelations
        List<String> migrationHashes = new ArrayList<>();

        // Parent for specific cloud
        CityElement district = element.getParentElement();

        // get subElements of this parentDistrict with migrationFindings and fill hash value into list migrationHashes
        getBuildingsWithMigrationFindingsHash(district, migrationHashes);

        builder.append("\"rcData\": \"" + String.join(", ", migrationHashes) + "\",\n");

        return builder.toString();
    }

    private Object getBuildingsWithMigrationFindingsHash(CityElement district, List<String> migrationHashes) {

        Collection<CityElement> buildingsWithMigrationFindings = district.getSubElements();

        for (CityElement buildingsWithMigrationFinding: buildingsWithMigrationFindings) {

            // only subElements with the flag "migrationFindings" matters
            String migrationFindingsString = buildingsWithMigrationFinding.getSourceNodeProperty(SAPNodeProperties.migration_findings);
            if (!migrationFindingsString.equals("true")) {
                continue;
            } else {
                //fill list
                migrationHashes.add(buildingsWithMigrationFinding.getHash());
            }
        }

        // If there is no subElement, then the relationship connector is drawn from the cloud to the district
        if (migrationHashes.size() == 0){
            migrationHashes.add(district.getHash());
        }

        return migrationHashes;
    }

    private String getNodeMetaInfo(CityElement element) {
        StringBuilder builder = new StringBuilder();
        Node node = element.getSourceNode();
        // For some accessory elements there is no source node
        if (node == null) {
            return "";
        }
        Arrays.asList(SAPNodeProperties.values()).forEach(prop -> {
            if (prop == SAPNodeProperties.element_id) {
                return; // already added as first prop by toMetaData()
            }

            // Don't write properties  with NULL value
            if (node.get(prop.toString()).isNull()) {
                return;
            }

            // Remove extra "" (written by Neo4j)
            String propValue = node.get(prop.toString()).toString().replaceAll("\"", "");



            // Write strings with quotation marks and numbers without
            if (NumberUtils.isCreatable(propValue)) {
                builder.append("\""+ AMetaDataMap.getMetaDataProperty(prop.toString()) + "\": " + propValue + "," + "\n");
            } else {
                builder.append("\""+ AMetaDataMap.getMetaDataProperty(prop.toString()) + "\": \"" + propValue + "\"," + "\n");
            }
        });

        return builder.toString();
    }

    private String getRelationsMetaInfo(CityElement element) {
        StringBuilder builder = new StringBuilder();
        Node node = element.getSourceNode();

        // For some accessory elements there is no source node
        if (node == null) {
            return "";
        }

        if (element.getParentElement() != null) {
            builder.append("\"belongsTo\": \"" + element.getParentElement().getHash() + "\",\n");
        }

        // Add USES and INHERIT relations
        String nodeType = node.get("type").asString();
        if (AMetaDataMap.getNodesWithReferencesRelationByType().contains(nodeType)) {
            builder.append("\"calls\": \"" + getRelations(node, SAPRelationLabels.REFERENCES, true) + "\",\n");
            builder.append("\"calledBy\": \"" + getRelations(node, SAPRelationLabels.REFERENCES, false) + "\",\n");
        }
        if (AMetaDataMap.getNodesWithInheritRelationByType().contains(nodeType)) {
            builder.append("\"subClassOf\": \"" + getRelations(node, SAPRelationLabels.INHERIT, true) + "\",\n");
            builder.append("\"superClassOf\": \"" + getRelations(node, SAPRelationLabels.INHERIT, false) + "\",\n");
        }

        return builder.toString();
    }

    private String getAdditionalMetaInfo(CityElement element) {
        StringBuilder builder = new StringBuilder();
        Node node = element.getSourceNode();
        String nodeType = node.get("type").asString();

        //signature for methods
        if (node.get("type").asString().equals("METH")) {
            builder.append("\"signature\": \"" + "" + "\",\n");
        }

        return builder.toString();
    }

    private String getQualifiedName(CityElement element) {
        Node node = element.getSourceNode();
        List<String> qualifiedNameAsList = getQualifiedNameAsList(node);
        return String.join(".", qualifiedNameAsList); //returns "name1.name2.name3"
    }

    private List<String> getQualifiedNameAsList(Node node) {
        List<String> qualifiedNameAsList = new ArrayList<>();
        Collection<Node> parentNodes = nodeRepository.getRelatedNodes(node, SAPRelationLabels.CONTAINS, false);
        if (!parentNodes.isEmpty()) {
            qualifiedNameAsList.addAll(getQualifiedNameAsList(parentNodes.iterator().next()));
        }

        String nodeName = node.get(SAPNodeProperties.object_name.name()).asString();
        qualifiedNameAsList.add(nodeName);
        return qualifiedNameAsList;
    }

    private String getContainerHash(Node node) {
        Collection<Node> parentNodes = nodeRepository.getRelatedNodes(node, SAPRelationLabels.CONTAINS, false);
        if (parentNodes.isEmpty()) {
            parentNodes = nodeRepository.getRelatedNodes(node, SAPRelationLabels.USES, false);
            if (parentNodes.isEmpty()) {
                return "";
            }
        }

        Node parentNode = parentNodes.iterator().next();

        CityElement parentElement = cityRepository.getElementBySourceID(parentNode.id());
        if (parentElement == null) {  // Some SAP standard packages may not included
            return "";
        }
        return parentElement.getHash();
    }

    private String getRelations(Node node, SAPRelationLabels label, Boolean direction) {
        Collection<Node> nodes = nodeRepository.getRelatedNodes(node, label, direction);
        if (nodes.isEmpty()) {
            return "";
        }

        List<String> nodesHashes = getNodesHashes(nodes);
        return String.join(", ", nodesHashes); //returns "hash, hash_2, hash*"
    }

    private List<String> getNodesHashes(Collection<Node> nodes) {
        List<String> nodesHashes = new ArrayList<>();
        for (Node node : nodes) {
            Long nodeId = node.id();
            CityElement cityElement = cityRepository.getElementBySourceID(nodeId);
            if (cityElement == null) {
                continue;
            }

            nodesHashes.add(cityElement.getHash());
        }
        return nodesHashes;
    }

}

