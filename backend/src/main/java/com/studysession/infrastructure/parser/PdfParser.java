package com.studysession.infrastructure.parser;

import com.studysession.domain.model.Question;
import com.studysession.domain.repository.FileParser;
import com.studysession.domain.repository.QuestionExtractor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component
public class PdfParser implements FileParser {

    private final QuestionExtractor questionExtractor;

    public PdfParser(QuestionExtractor questionExtractor) {
        this.questionExtractor = questionExtractor;
    }

    @Override
    public boolean supports(String fileExtension) {
        return "pdf".equals(fileExtension);
    }

    @Override
    public List<Question> parse(InputStream inputStream) {
        try (PDDocument doc = Loader.loadPDF(inputStream.readAllBytes())) {
            String text = new PDFTextStripper().getText(doc);
            return questionExtractor.extract(text);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse pdf", e);
        }
    }
}
