package com.hu.cm.web.rest.dto;

import com.hu.cm.domain.Category;
import com.hu.cm.domain.Workflow;

public class ProcessDTO {

    private Long id;

    private String name;

    private String description;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ProcessDTO(String name){
        this.name = name;
    }

    public ProcessDTO(Long id){
        this.id = id;
    }

    public ProcessDTO(){}
}
