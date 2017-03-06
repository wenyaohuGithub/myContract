package com.hu.cm.web.rest.dto;

import org.springframework.web.multipart.MultipartFile;

public class FileUploadDTO {

    private MultipartFile file;
    private String name;
    private String desc;

    public FileUploadDTO() {
    }

    public FileUploadDTO(MultipartFile file, String name, String desc) {
        this.file = file;
        this.name = name;
        this.desc = desc;
    }

    public MultipartFile getFile() {
        return file;
    }

    public void setFile(MultipartFile file) {
        this.file = file;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }
}
