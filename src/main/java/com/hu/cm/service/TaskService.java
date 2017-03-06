package com.hu.cm.service;

import com.hu.cm.domain.Contract;
import com.hu.cm.domain.Task;
import com.hu.cm.domain.admin.Department;
import com.hu.cm.domain.enumeration.DepartmentType;
import com.hu.cm.repository.TaskRepository;
import com.hu.cm.repository.admin.DepartmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Service class for managing users.
 */
@Service
@Transactional
public class TaskService {
    @Inject
    TaskRepository taskRepository;

    private final Logger log = LoggerFactory.getLogger(TaskService.class);

    public Task getFirstTask(Contract contract){
        Set<Task> tasks = contract.getTasks();
        for(Task t : tasks){
            if(t.getSequence() == 1){
                return t;
            }
        }
        return null;
    }

    public Task getNextTask(Contract contract){
        Task currentTask = contract.getCurrentTask();
        if(currentTask == null){
            return getFirstTask(contract);
        } else {
            Set<Task> tasks = contract.getTasks();
            for(Task t : tasks){
                if ((t.getSequence()-currentTask.getSequence()) == 1){
                    return t;
                }
            }
        }
        return null;
    }
}
