package org.example.extracttext.controller;
import org.example.extracttext.services.DocxFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;

@RestController
public class DocxFileController {

    @Autowired
    private DocxFileService docxFileService;

    @PostMapping("/extracttext")
    public ResponseEntity<Object> extractTextFromFile(@RequestParam("file") MultipartFile file) {
        try {
            String text = docxFileService.extractTextFromDocxFile(file);
            return ResponseEntity.ok().body(Collections.singletonMap("result", text));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to process the file and extract text, please check the uploaded file");
        }
    }
    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<String> handleMultipartException(MultipartException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please upload file");
    }

    @PostMapping("/generateDiagram")
    public ResponseEntity<?> generateDiagram(@RequestBody(required = false) String plantuml_code) {
        try{
            if(plantuml_code == null) {
                throw new IOException("Missing Body");
            }
            byte[] imageData = docxFileService.generateDiagramFromPlantUML(plantuml_code);
            return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(imageData);
        } catch (IOException e) {
            if (e.getMessage().contains("Syntax Error")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
            }
            else if(e.getMessage().contains("Missing Body")){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please provide a valid plantuml code");
            }
            else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
            }
        }
    }
}
