package com.hu.cm.service.util;

import org.apache.pdfbox.cos.COSDictionary;
import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.color.PDColor;
import org.apache.pdfbox.pdmodel.graphics.color.PDDeviceRGB;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAnnotationWidget;
import org.apache.pdfbox.pdmodel.interactive.annotation.PDAppearanceCharacteristicsDictionary;
import org.apache.pdfbox.pdmodel.interactive.form.PDAcroForm;
import org.apache.pdfbox.pdmodel.interactive.form.PDField;
import org.apache.pdfbox.pdmodel.interactive.form.PDTextField;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.List;

public final class PDFFileUtil {
    private static final Logger log = LoggerFactory.getLogger(PDFFileUtil.class);
    private static final int DEF_COUNT = 20;

    private PDFFileUtil() {
        /*
        h1 is   32px   (2em)
        h2 is   24px (1.5em)
        h3 is 20.8px (1.3em)
        h4 is   16px   (1em)
        h5 is 12.8px (0.8em)
        h6 is 11.2px (0.7em)
        */
    }


    public static void createPDFFile(String fileName) {
        File directory = new File("savedFiles");
        if(!directory.exists() || !directory.isDirectory()){
            if (!directory.mkdir()) {
                log.info("Can't create folder " + directory );
            }
        }
        String filePathName = directory.getAbsolutePath()+"/"+fileName;
        PDDocument document = new PDDocument();
        PDPage page = new PDPage();
        document.addPage(page);
        //Creating the PDDocumentInformation object
        PDDocumentInformation pdd = document.getDocumentInformation();

        //Setting the author of the document
        pdd.setAuthor("Tutorialspoint");

        // Setting the title of the document
        pdd.setTitle("Sample document");

        //Setting the creator of the document
        pdd.setCreator("PDF Examples");

        //Setting the subject of the document
        pdd.setSubject("Example document");

        //Setting the created date of the document
        Calendar date = new GregorianCalendar();
        date.set(2016, 11, 5);
        pdd.setCreationDate(date);
        //Setting the modified date of the document
        date.set(2016, 11, 15);
        pdd.setModificationDate(date);

        //Setting keywords for the document
        pdd.setKeywords("sample, first example, my pdf");

        try {
            PDImageXObject pdImage = PDImageXObject.createFromFile("/Users/wenyaohu/Pictures/MSG_75_large6.png", document);

            PDPageContentStream contentStream = new PDPageContentStream(document, page);
            contentStream.drawImage(pdImage, 225, 600);

            contentStream.beginText();
            contentStream.newLineAtOffset(25, 590);
            contentStream.setFont(PDType1Font.COURIER_BOLD, 12);
            contentStream.setLeading(14.5f);

            String text = "This is the sample document and we are adding content to it.";
            contentStream.showText(text);
            contentStream.newLine();
            contentStream.showText("This is second line of text");
            contentStream.endText();

            contentStream.close();

            document.save(filePathName);
            document.close();
        } catch(IOException e){
            log.info("Exception when creating file " + fileName + " Exception: " + e.getMessage() );
        }
    }

    public static String loadPDFFile(String filePathName) {
        File file = new File(filePathName);
        try {
            PDDocument document = PDDocument.load(file);
            PDAcroForm acroForm = document.getDocumentCatalog().getAcroForm();
            if(acroForm != null){
                List<PDField> fields = acroForm.getFields();
            }

            PDFTextStripper pdfStripper = new PDFTextStripper();
            String text = pdfStripper.getText(document);
            return text;
        } catch(IOException e){
            log.info("Exception when loading file " + filePathName + " Exception: " + e.getMessage() );
        }
        return null;
    }

    public static void fillPDFFile(String fileName) {
        File directory = new File("savedFiles");
        if(!directory.exists() || !directory.isDirectory()){
            log.info("Directory " + directory + " doesn't exist or not a directory" );
        }
        String filePathName = directory.getAbsolutePath()+"/"+"FillFormField.pdf";
        File file = new File(filePathName);
        try {
            PDDocument document = PDDocument.load(file);
            PDFTextStripper pdfStripper = new PDFTextStripper();
            String text = pdfStripper.getText(document);
            log.info(text);
            PDAcroForm acroForm = document.getDocumentCatalog().getAcroForm();

            if (acroForm != null)
            {
                // Retrieve an individual field and set its value.
                PDTextField field = (PDTextField) acroForm.getField( "sampleField" );
                field.setValue("Text Entry");
                field = (PDTextField) acroForm.getField( "fieldsContainer.nestedSampleField" );
                field.setValue("Nested Text Entry");
            }
            document.save(directory.getAbsolutePath()+"/"+"FillFormFieldModified.pdf");
            document.close();
        } catch(IOException e){
            log.info("Exception when fill PDF file " + fileName + " Exception: " + e.getMessage() );
        }
    }

    public static void createFormFile(String fileName) {
        File directory = new File("savedFiles");
        if(!directory.exists() || !directory.isDirectory()){
            if (!directory.mkdir()) {
                log.info("Can't create folder " + directory );
            }
        }
        String filePathName = directory.getAbsolutePath()+"/"+"SimpleForm.pdf";
        PDDocument document = new PDDocument();
        PDPage page = new PDPage();
        document.addPage(page);
        PDFont font = PDType1Font.COURIER_BOLD;
        PDResources resources = new PDResources();
        resources.put(COSName.getPDFName("Courb"), font);
        PDAcroForm acroForm = new PDAcroForm(document);
        document.getDocumentCatalog().setAcroForm(acroForm);
        acroForm.setDefaultResources(resources);
        String defaultAppearanceString = "/Courb 0 Tf 0 g";
        acroForm.setDefaultAppearance(defaultAppearanceString);
        PDTextField textBox = new PDTextField(acroForm);
        textBox.setPartialName("SampleField");
        defaultAppearanceString = "/Courb 12 Tf 0 0 1 rg";
        textBox.setDefaultAppearance(defaultAppearanceString);
        acroForm.getFields().add(textBox);
        PDAnnotationWidget widget = textBox.getWidgets().get(0);
        PDRectangle rect = new PDRectangle(350, 572, 200, 13);
        widget.setRectangle(rect);
        widget.setPage(page);

        PDAppearanceCharacteristicsDictionary fieldAppearance = new PDAppearanceCharacteristicsDictionary(new COSDictionary());
        fieldAppearance.setBorderColour(new PDColor(new float[]{0,1,0}, PDDeviceRGB.INSTANCE));
        fieldAppearance.setBackground(new PDColor(new float[]{1,1,0}, PDDeviceRGB.INSTANCE));
        widget.setAppearanceCharacteristics(fieldAppearance);

        // make sure the annotation is visible on screen and paper
        widget.setPrinted(true);

        try {
            // Add the annotation to the page
            page.getAnnotations().add(widget);
            // set the field value
            textBox.setValue("Sample field");

            PDImageXObject pdImage = PDImageXObject.createFromFile("/Users/wenyaohu/Pictures/MSG_75_large6.png", document);

            PDPageContentStream contentStream = new PDPageContentStream(document, page);
            contentStream.drawImage(pdImage, 225, 600);

            contentStream.beginText();
            contentStream.newLineAtOffset(25, 590);
            contentStream.setFont(PDType1Font.COURIER_BOLD, 12);
            contentStream.setLeading(14.5f);

            String text = "This is the sample document and we are adding content to it.";
            contentStream.showText(text);
            contentStream.newLine();
            contentStream.showText("This is second line of text Enter your name: ");
            contentStream.endText();

            contentStream.close();

            document.save(filePathName);
            document.close();
        } catch(IOException e){
            log.info("Exception when creating file " + fileName + " Exception: " + e.getMessage() );
        }
    }
}
