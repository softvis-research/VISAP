package org.visap.generator.steps.loader;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.visap.generator.configuration.Config;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class CsvFilesInputFilter {

    private String folderName;
    private String fileSuffix;
    private String fileExtension = ".csv";
    private static final Log log = LogFactory.getLog(CsvFilesInputFilter.class);
    private static String path = Config.setup.inputCSVFilePath();

    public CsvFilesInputFilter(String FolderName, String FileSuffix){
        this.folderName = FolderName.toLowerCase();
        this.fileSuffix = FileSuffix.toLowerCase();
    }

    public List<Path> getFiles(){
        File currentDir = new File(path);
        String helper = currentDir.getAbsolutePath();

        List<Path> files = getFilesFromFolder(helper);
        if (files.isEmpty()){
            files = getFileFromRootWithSuffix(helper);
            if (files.size() > 1){
                log.warn("more than one file detected\nput all files of type "+ fileSuffix +" in a folder named "+ "\""+ folderName +"\"");
                System.exit(0);
            }
        }
        return files;
    }

    private List<Path> getFilesFromFolder(String AbsolutePath) {

        List<Path> files = new ArrayList<>();
        try {
            files = Files.walk(Paths.get(AbsolutePath), 1)
                    .filter(Files::isDirectory)
                    .filter(p -> p.getFileName().toString().equalsIgnoreCase(folderName))
                    .filter(p -> !isEmptyFolder(p))
                    .collect(Collectors.toList());
        } catch (IOException e) {
            e.printStackTrace();
        }

        if (!files.isEmpty())
            return getFileFromRootWithSuffix(files.get(0).toString(), fileExtension);
        return files;
    }

    private boolean isEmptyFolder(Path folderPath) {

        try {
            Stream<Path> entries = Files.list(folderPath);
            return entries.findFirst().isEmpty();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return true;
    }

    private List<Path> getFileFromRootWithSuffix(String AbsolutePath){
        List<Path> files = new ArrayList<>();
        try {
            files = Files.walk(Paths.get(AbsolutePath), 1)
                    .filter(Files::isRegularFile)
                    .filter(p -> p.getFileName().toString().toLowerCase().endsWith(fileSuffix))
                    .collect(Collectors.toList());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return files;
    }

    private List<Path> getFileFromRootWithSuffix(String AbsolutePath, String extension){
        List<Path> files = new ArrayList<>();
        try {
            files = Files.walk(Paths.get(AbsolutePath), 1)
                    .filter(Files::isRegularFile)
                    .filter(p -> p.getFileName().toString().toLowerCase().endsWith(extension))
                    .collect(Collectors.toList());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return files;
    }
}
