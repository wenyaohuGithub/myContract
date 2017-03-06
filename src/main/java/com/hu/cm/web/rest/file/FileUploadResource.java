package com.hu.cm.web.rest.file;

import com.codahale.metrics.annotation.Timed;
import com.hu.cm.domain.configuration.ContractSample;
import com.hu.cm.domain.admin.User;
import com.hu.cm.repository.configuration.Contract_sampleRepository;
import com.hu.cm.repository.admin.UserRepository;
import com.hu.cm.security.SecurityUtils;
import com.hu.cm.service.util.PDFFileUtil;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private UserRepository userRepository;

    /**
     * POST
     */
    @RequestMapping(
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity create(@RequestParam String name, @RequestParam (required = false) String desc, MultipartFile file) throws URISyntaxException {
        log.debug("REST request to upload file : {}", file.getOriginalFilename());
        String filename = file.getOriginalFilename();
        if (!file.isEmpty()) {
            try {
                File directory = new File("uploadedFiles");
                if(!directory.exists() || !directory.isDirectory()){
                    if (!directory.mkdir()) {
                        return ResponseEntity.badRequest().header("Failure", "Directory doesn't not exist, and dan't being created").body(null);
                    }
                }
                byte[] bytes = file.getBytes();
                BufferedOutputStream stream =
                    new BufferedOutputStream(new FileOutputStream(new File(directory + "/" +filename)));
                stream.write(bytes);
                stream.close();
                ContractSample sample = new ContractSample();
                sample.setName(name);
                if(desc != null){
                    sample.setDescription(desc);
                }
                sample.setFile_name(filename);
                sample.setPath(directory.getAbsolutePath());
                User currentUser = userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get();
                sample.setUploaded_by(currentUser.getFirstName() + " " + currentUser.getLastName());
                sample.setUploaded_date_time(new DateTime());
                contract_sampleRepository.save(sample);
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
}
