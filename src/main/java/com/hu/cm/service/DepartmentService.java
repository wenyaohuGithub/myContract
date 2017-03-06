package com.hu.cm.service;

import com.hu.cm.domain.admin.Department;
import com.hu.cm.domain.admin.Role;
import com.hu.cm.domain.admin.User;
import com.hu.cm.domain.enumeration.DepartmentType;
import com.hu.cm.repository.admin.AuthorityRepository;
import com.hu.cm.repository.admin.DepartmentRepository;
import com.hu.cm.repository.admin.RoleRepository;
import com.hu.cm.repository.admin.UserRepository;
import com.hu.cm.security.SecurityUtils;
import com.hu.cm.service.util.RandomUtil;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;
import java.util.*;

/**
 * Service class for managing users.
 */
@Service
@Transactional
public class DepartmentService {
    @Inject
    DepartmentRepository departmentRepository;

    private final Logger log = LoggerFactory.getLogger(DepartmentService.class);

    public List<Department> getChildDivisions(Long id){
        List<Department> divisions = new ArrayList<Department>();
        Department dept = departmentRepository.findOne(id);
        if(dept != null && dept.getType().equals(DepartmentType.DEPT)){
            List<Department> allDepts = departmentRepository.findAll();
            for(Department d: allDepts){
                if(d.getParentDepartment() != null && d.getParentDepartment().getId() == dept.getId()
                    && d.getType().equals(DepartmentType.DIV)){
                    divisions.add(d);
                }
            }
        }
        return divisions;
    }

    public List<Department> getSiblingDivisions(Long id){
        List<Department> divisions = new ArrayList<Department>();
        Department div = departmentRepository.findOne(id);
        if(div != null && div.getType().equals(DepartmentType.DIV)){
            Department parentDept = div.getParentDepartment();
            List<Department> allDepts = departmentRepository.findAll();
            for(Department d: allDepts){
                if(d.getParentDepartment() != null && d.getParentDepartment().getId() == parentDept.getId()
                    && d.getType().equals(DepartmentType.DIV)){
                    divisions.add(d);
                }
            }
        }
        return divisions;
    }

    public List<Department> getDivisions(Set<Department> departments){
        List<Department> divisions = new ArrayList<Department>();
        for(Department dept : departments){
            if(dept.getType() == DepartmentType.DIV){
                divisions.add(dept);
            }
        }
        return divisions;
    }

    public List<Department> getDepartments(Set<Department> departments){
        List<Department> depts = new ArrayList<Department>();
        for(Department dept : departments){
            if(dept.getType() == DepartmentType.DEPT){
                depts.add(dept);
            }
        }
        return depts;
    }

}
