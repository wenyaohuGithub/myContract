package com.hu.cm.service;

import com.hu.cm.domain.WorkflowProcess;
import com.hu.cm.domain.admin.Role;
import com.hu.cm.domain.admin.User;
import com.hu.cm.domain.admin.UserAccount;
import com.hu.cm.domain.configuration.Process;
import com.hu.cm.repository.WorkflowProcessRepository;
import com.hu.cm.repository.WorkflowRepository;
import com.hu.cm.repository.admin.AuthorityRepository;
import com.hu.cm.repository.admin.RoleRepository;
import com.hu.cm.repository.admin.UserRepository;
import com.hu.cm.repository.configuration.ProcessRepository;
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
public class ProcessService {

    private final Logger log = LoggerFactory.getLogger(ProcessService.class);
    @Inject
    private ProcessRepository processRepository;

    @Inject
    private WorkflowRepository workflowRepository;

    @Inject
    private WorkflowProcessRepository wpRepository;

    @Inject
    private UserRepository userRepository;

    public List<Process>  getNextAvailableProcesses(Long workflowId, Long currentProcessId){
        List<Process> nextProcesses = new ArrayList<>();
        Process currentProcess = null;
        if(currentProcessId != null){
            currentProcess = processRepository.findOne(currentProcessId);
        } else {
            currentProcess = processRepository.findOne(1L);
        }

        //This list wps is sorted by sequence
        List<WorkflowProcess> wps = wpRepository.findWithWorkflowId(workflowId);

        if(currentProcess.getName().equals("CONTRACT_DRAFT")){
            User currentUser = userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get();
            UserAccount userAccount = currentUser.getUserAccounts().iterator().next();
            Set<Role> userRoles = userAccount.getRoles();
            Role deptHead = new Role("ROLE_DEPT_HEAD");
            Role divHead = new Role("ROLE_DIV_HEAD");

            if(userRoles.contains(deptHead)){
                if(wps.get(1) != null && wps.get(1).getProcess().getName().equals("INTERNAL_DIV_REVIEW")){
                    nextProcesses.add(wps.get(1).getProcess()); //"INTERNAL_DIV_REVIEW"
                }
                if(wps.get(2) != null && wps.get(2).getProcess().getName().equals("RELATED_DIV_REVIEW")){
                    nextProcesses.add(wps.get(2).getProcess()); //"RELATED_DIV_REVIEW"
                }
                if(wps.get(3) != null && wps.get(3).getProcess().getName().equals("INTERNAL_DEPT_REVIEW")){
                    nextProcesses.add(wps.get(3).getProcess()); //"INTERNAL_DEPT_REVIEW"
                }
            } else if(userRoles.contains(divHead)){
                if(wps.get(1) != null && wps.get(1).getProcess().getName().equals("INTERNAL_DIV_REVIEW")){
                    nextProcesses.add(wps.get(1).getProcess()); //"INTERNAL_DIV_REVIEW"
                }
                if(wps.get(2) != null && wps.get(2).getProcess().getName().equals("RELATED_DIV_REVIEW")){
                    nextProcesses.add(wps.get(2).getProcess()); //"RELATED_DIV_REVIEW"
                }
            } else {
                if(wps.get(1) != null){
                    nextProcesses.add(wps.get(1).getProcess()); //"INTERNAL_DIV_REVIEW"
                }
            }
        }else {
            for(WorkflowProcess wp : wps){
                if(wp.getProcess().equals(currentProcess));
                int index = wps.indexOf(wp)+1;
                nextProcesses.add(wps.get(index).getProcess());
                break;
            }
        }
        return nextProcesses;
    }

    public Process  getNextProcess(Long workflowId, Long currentProcessId) {
        Process currentProcess = null;
        if (currentProcessId != null) {
            currentProcess = processRepository.findOne(currentProcessId);
        } else {
            currentProcess = processRepository.findOne(1L);
        }

        //This list wps is sorted by sequence
        List<WorkflowProcess> wps = wpRepository.findWithWorkflowId(workflowId);
        Process nextProcess = null;
        for (WorkflowProcess wp : wps) {
            if(wp.getSequence() == wps.size()){
                // current process is already the last one in the workflow, no more "nextProcess".
                return null;
            }
            if (wp.getProcess().equals(currentProcess)){ ;
                int index = wps.indexOf(wp) + 1;
                nextProcess = wps.get(index).getProcess();
                break;
            }
        }

        return nextProcess;
    }
}
