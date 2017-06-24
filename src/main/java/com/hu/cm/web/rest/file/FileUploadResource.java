package com.hu.cm.web.rest.file;

import com.codahale.metrics.annotation.Timed;
import com.hu.cm.domain.Contract;
import com.hu.cm.domain.configuration.ContractSample;
import com.hu.cm.domain.Attachment;
import com.hu.cm.domain.admin.User;
import com.hu.cm.repository.AttachmentRepository;
import com.hu.cm.repository.ContractRepository;
import com.hu.cm.repository.configuration.Contract_sampleRepository;
import com.hu.cm.repository.admin.UserRepository;
import com.hu.cm.security.SecurityUtils;
import com.hu.cm.service.ContractService;
import com.hu.cm.service.util.PDFFileUtil;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import javax.inject.Inject;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URI;
import java.net.URISyntaxException;
import org.joda.time.DateTime;


/**
 * REST controller for managing ContractSample.
 */
@RestController
@RequestMapping("/api/fileupload")
@MultipartConfig(fileSizeThreshold = 20971520)
public class FileUploadResource {

    private final Logger log = LoggerFactory.getLogger(FileUploadResource.class);

    @Inject
    private Contract_sampleRepository contract_sampleRepository;

    @Inject
    private ContractRepository contractRepository;

    @Inject
    private UserRepository userRepository;

    @Inject
    private AttachmentRepository attachmentRepository;

    /**
     * POST
     */
    @RequestMapping(
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity create(@RequestParam (required = true) String type, @RequestParam (required = true) Long id, MultipartFile file) throws URISyntaxException {
        log.debug("REST request to upload file : {}", file.getOriginalFilename());
        File directory = null;
        String newFileName = null;
        Contract c = null;
        ContractSample s = null;
        Attachment a = null;

        if(type.equals("ContractSample")){
            s = contract_sampleRepository.findOne(id);
            if(s==null) {
                return ResponseEntity.badRequest().header("Failure", "Contract Sample not found").body("{\"status\": \"error\"}");
            }
            directory  = new File("uploadedFiles");
            newFileName = file.getOriginalFilename();
        } else if (type.equals("ContractContent")){
            c = contractRepository.findOne(id);
            if(c == null) {
                return ResponseEntity.badRequest().header("Failure", "Contract not found").body("{\"status\": \"error\"}");
            }
            directory  = new File("contractFiles/"+id.toString());
            newFileName = "C_"+file.getOriginalFilename();
        } else if (type.equals("ContractAttachment")){
            c = contractRepository.findOne(id);
            if(c == null) {
                return ResponseEntity.badRequest().header("Failure", "Contract not found").body("{\"status\": \"error\"}");
            }
            directory  = new File("contractFiles/"+id.toString());
            newFileName = "A_"+file.getOriginalFilename();

            a = new Attachment();
            a.setContract(c);
            a.setUploadDatetime(new DateTime());
            attachmentRepository.save(a);
        } else {

        }

        if (!file.isEmpty()) {
            try {
                if(!directory.exists() || !directory.isDirectory()){
                    if (!directory.mkdir()) {
                        return ResponseEntity.badRequest().header("Failure", "Directory doesn't not exist, and can't be created").body(null);
                    }
                }
                byte[] bytes = file.getBytes();
                BufferedOutputStream stream =
                    new BufferedOutputStream(new FileOutputStream(new File(directory + "/" + newFileName)));
                stream.write(bytes);
                stream.close();
                if(type.equals("ContractSample")){
                    s.setFile_name(newFileName);
                    s.setPath(directory.getPath());
                    contract_sampleRepository.save(s);
                }else if (type.equals("ContractContent")){
                    c.setContractFilePath(directory+"/"+newFileName);
                    contractRepository.save(c);
                }else if (type.equals("ContractAttachment")){
                    a.setFilePath(directory+"/"+newFileName);
                    attachmentRepository.save(a);
                } else {

                }
                return ResponseEntity.created(new URI("/api/fileupload")).body("{\"status\": \"done\"}");
            } catch (Exception e) {
                return ResponseEntity.badRequest().header("Failure", "File upload failed").body("{\"status\": \"error\"}");
            }
        } else {
            return ResponseEntity.badRequest().header("Failure", "Uploaded file is empty").body("{\"status\": \"error\"}");
        }
    }

    /**
     * GET
     */
    @RequestMapping(
        value = "/{id}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public void get(@PathVariable Long id, HttpServletResponse response) throws IOException {
        log.debug("REST request to download file : {}", id);
        ContractSample sample = contract_sampleRepository.findOne(id);
        if(sample != null) {
            try {
                String filename = sample.getFile_name();
                String path = sample.getPath();
                path = path + (path.endsWith("/") ? filename : ("/" + filename));
                File file = new File(path);
                if (file.exists()) {
                    log.debug("file " + filename + " found");
                    PDFFileUtil.loadPDFFile(path);
                    InputStream is = new FileInputStream(file);
                    IOUtils.copy(is, response.getOutputStream());
                    response.flushBuffer();
                } else {
                    log.debug("file " + filename + " not found");
                    throw new RuntimeException("File " + filename + " not found");
                }
            } catch (IOException e){
                log.debug("Exception: " + e.getMessage());
                throw new RuntimeException("IOError writing file to output stream");
            }
        }else{
            log.debug("Sample contract " + id + " not found");
            throw new RuntimeException("Sample contract " + id + " not found");
        }
    }

    /**
     * GET
     */
    @RequestMapping(
        value = "/{id}/fields",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity retrieveSampleContractFields(@PathVariable Long id) throws IOException {
        log.debug("REST request to retrieve sample contract fields : {}", id);

        ContractSample sample = contract_sampleRepository.findOne(id);
        if(sample != null) {
            try {
                String filename = sample.getFile_name();
                String path = sample.getPath();
                path = path + (path.endsWith("/") ? filename : ("/" + filename));
                File file = new File(path);
                if (file.exists()) {
                    log.debug("file " + filename + " found");
                    PDFFileUtil.loadPDFFile(path);
                } else {
                    log.debug("file " + filename + " not found");
                    throw new RuntimeException("File " + filename + " not found");
                }
            } catch (Exception e){
                log.debug("Exception: " + e.getMessage());
                throw new RuntimeException("IOError writing file to output stream");
            }
        }else{
            log.debug("Sample contract " + id + " not found");
            throw new RuntimeException("Sample contract " + id + " not found");
        }

        return null;
    }

    /**
     * GET
     */
    @RequestMapping("/files/{filename}")
    @ResponseBody
    public ResponseEntity serveFile(@PathVariable String filename) {

        String path = "uploadedFiles";
        path = path + (path.endsWith("/") ? filename : ("/" + filename));
        File file = new File("uploadedFiles/a.pdf");
        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\""+file.getName()+"\"")
                .body(file);
    }
}
