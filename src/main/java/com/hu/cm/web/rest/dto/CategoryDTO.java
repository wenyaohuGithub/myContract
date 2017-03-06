package com.hu.cm.web.rest.dto;

import com.hu.cm.domain.Category;
import com.hu.cm.domain.Workflow;

import java.util.HashSet;
import java.util.Set;

public class CategoryDTO {

    private Long id;

    private String name;

    private String description;

    private Category parent_category;

    private Workflow workflow;

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

    public Category getParent_category() {
        return parent_category;
    }

    public void setParent_category(Category category) {
        this.parent_category = category;
    }

    public Workflow getWorkflow() {
        return workflow;
    }

    public void setWorkflow(Workflow workflow) {
        this.workflow = workflow;
    }

    public CategoryDTO(Long id){
        this.id = id;
    }

    @Override
    public String toString() {
        return "CategoryDTO{" +
            "id=" + id +
            ", name='" + name + "'" +
            ", description='" + description + "'" +
            '}';
    }
}
