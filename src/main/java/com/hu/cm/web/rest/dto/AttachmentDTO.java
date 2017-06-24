package com.hu.cm.web.rest.dto;

import com.hu.cm.domain.Category;
import com.hu.cm.domain.Workflow;

public class AttachmentDTO {

    private Long id;

    private String filePath;

    private String uploadDatetime;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getUploadDatetime() {
        return uploadDatetime;
    }

    public void setUploadDatetime(String uploadDatetime) {
        this.uploadDatetime = uploadDatetime;
    }

    public AttachmentDTO(Long id){
        this.id = id;
    }

    @Override
    public String toString() {
        return "AttachmentDTO{" +
            "id=" + id +
            ", file_path='" + filePath + "'" +
            '}';
    }
}
