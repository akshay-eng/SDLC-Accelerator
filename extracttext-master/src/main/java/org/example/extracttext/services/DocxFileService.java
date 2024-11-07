package org.example.extracttext.services;

import net.sourceforge.plantuml.SourceStringReader;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;


@Service
public class DocxFileService {

    public String extractTextFromDocxFile(MultipartFile file) throws IOException {
        StringBuilder text = new StringBuilder();
        try (InputStream inputStream = file.getInputStream();
             XWPFDocument docx = new XWPFDocument(inputStream);
             XWPFWordExtractor extractor = new XWPFWordExtractor(docx)) {
             text.append(extractor.getText());
        }catch(Exception e) {
            throw new IOException("Error extracting text");
        }

        return text.toString();
    }

    public byte[] generateDiagramFromPlantUML(String plantuml_code) throws IOException {
        SourceStringReader reader;
        try {
            reader = new SourceStringReader(plantuml_code);
            ByteArrayOutputStream diagram = new ByteArrayOutputStream();
            reader.generateImage(diagram);
            byte[] imageData = diagram.toByteArray();
            return imageData;
        }
        catch(Exception e) {
            throw new IOException("Error during diagram generation: Please check for Syntax Error in PlantUML code");
        }
    }
}
