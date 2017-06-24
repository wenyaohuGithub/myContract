package com.hu.cm.service;

import com.hu.cm.config.Constants;
import com.hu.cm.domain.*;
import com.hu.cm.domain.admin.Department;
import com.hu.cm.domain.admin.Role;
import com.hu.cm.domain.admin.User;
import com.hu.cm.domain.configuration.Process;
import com.hu.cm.domain.enumeration.ContractStatus;
import com.hu.cm.domain.enumeration.DepartmentType;
import com.hu.cm.domain.enumeration.UserAction;
import com.hu.cm.repository.*;
import com.hu.cm.repository.admin.DepartmentRepository;
import com.hu.cm.repository.admin.UserRepository;
import com.hu.cm.repository.configuration.ProcessRepository;
import com.hu.cm.security.SecurityUtils;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;
import java.util.*;

/**
 * Service class for managing users.
 */
@Service
@Transactional
public class ContractService {

    private final Logger log = LoggerFactory.getLogger(ContractService.class);
    @Inject
    private ProcessRepository processRepository;

    @Inject
    private ContractRepository contractRepository;

    @Inject
    private CategoryRepository categoryRepository;

    @Inject
    private ProcessService processService;

    @Inject
    private DepartmentService departmentService;

    @Inject
    private UserService userService;

    @Inject
    private TaskService taskService;

    @Inject
    private WorkflowRepository workflowRepository;

    @Inject
    private WorkflowProcessRepository wpRepository;

    @Inject
    private DepartmentRepository departmentRepository;

    @Inject
    private ContractHistoryRepository contractHistoryRepository;

    @Inject
    private UserRepository userRepository;

    @Inject
    private MessageRepository messageRepository;

    @Inject
    private AttachmentRepository attachmentRepository;

    public Contract createContract(Contract contract){
        User currentUser = userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get();

        contract.setStatus(ContractStatus.Drafting);
        contract.setAdministrator(currentUser);
        contract.setAuthor(currentUser);
        contract.setAssignee(currentUser);
        if(currentUser.getDepartmentId() != null){
            contract.setAdministrativeDepartment(departmentRepository.findOne(currentUser.getDepartmentId()));
        }

        contract.setTasks(createTasks(contract));
        contract.setCreatedDate(new DateTime());

        /* set first task as current task CONTRACT_DRAFT */
        Set<Task> tasks = contract.getTasks();
        for(Task t : tasks){
            if(t.getSequence() == 1){
                contract.setCurrentTask(t);
                break;
            }
        }

        Contract result = contractRepository.save(contract);

        result.setContractIdentifier("C-"+ Calendar.YEAR+"-"+ Calendar.MONTH+1+"-"+result.getId());
        result.setReviewIdentifier("R-"+Calendar.YEAR+"-"+ Calendar.MONTH+1+"-"+result.getId());

        result = contractRepository.save(result);

        ContractHistory history = new ContractHistory();
        history.setContract(result);
        history.setUser(currentUser);
        history.setTask(result.getCurrentTask());
        history.setAction(UserAction.CREATE);
        history.setAction_datetime(new DateTime());
        contractHistoryRepository.save(history);

        return result;
    }

    private Set<Task> createTasks(Contract contract){
        if(contract.getAccount().getProcessConfiguration().equals("BASIC")){
            return createTasksForBasicAccount(contract);
        }

        Set<Task> tasks = new HashSet<>();
        // get the first review process from contract
        Process firstReviewProcess = contract.getFirstReviewProcess();
        if(firstReviewProcess == null){
            firstReviewProcess = processRepository.findOneByName(Constants.PROCESS_INTERNAL_DIV_REVIEW);
        }

        int sequence = 0;
        //This list wps is sorted by sequence
        List<WorkflowProcess> wps = wpRepository.findWithWorkflowId(contract.getCategory().getWorkflow().getId());
        boolean skip = true;
        for(WorkflowProcess wp : wps) {
            if (wp.getProcess().getName().equals(Constants.PROCESS_CONTRACT_DRAFT)) {
                // do whatever needs to do
                Task t = new Task();
                t.setContract(contract);
                t.setProcess(wp.getProcess());
                t.setAssignee(contract.getAdministrator());
                t.setDepartment(contract.getAdministrativeDepartment());
                sequence += 1;
                t.setSequence(sequence);
                tasks.add(t);
            } else {
                if(wp.getProcess().getName().equals(firstReviewProcess.getName())) {
                    // found the first review process
                    skip = false;
                    sequence = addTasks(wp.getProcess(), contract, tasks, sequence);
                } else if (skip && !wp.getProcess().getName().equals(firstReviewProcess.getName())) {
                    // skip these processes
                    continue;
                } else {
                    // processes after first review process, do whatever needs to do
                    sequence  = addTasks(wp.getProcess(), contract, tasks, sequence);
                }
            }
        }

        return tasks;
    }

    private Set<Task> createTasksForBasicAccount(Contract contract){
        Set<Task> tasks = new HashSet<>();
        // for BASIC account configuration, use basic category (only category allowed for this kind of account)
        List<Category> categories = categoryRepository.findAllWithAccountId(contract.getAccount().getId());
        contract.setCategory(categories.get(0));
        int sequence = 0;
        //This list wps is sorted by sequence
        List<WorkflowProcess> wps = wpRepository.findWithWorkflowId(contract.getCategory().getWorkflow().getId());
        boolean skip = true;
        for(WorkflowProcess wp : wps) {
            Task t = new Task();
            t.setContract(contract);
            t.setProcess(wp.getProcess());
            t.setAssignee(contract.getAdministrator());
            t.setDepartment(contract.getAdministrativeDepartment());
            sequence += 1;
            t.setSequence(sequence);
            tasks.add(t);
        }
        return tasks;
    }

    private int addTasks(Process process, Contract contract, Set<Task> tasks, int sequence) {
        if(process.getName().equals(Constants.PROCESS_RELATED_DIV_REVIEW)){
            Set<Department> depts = contract.getRelatedDepartments();
            if(depts != null){
                List<Department> relatedDivisions = departmentService.getDivisions(depts);
                for(Department div : relatedDivisions){
                    Task t = new Task();
                    t.setContract(contract);
                    t.setDepartment(div);
                    t.setProcess(process);
                    t.setAssignee(findAssignee(process, div, contract));
                    sequence +=1;
                    t.setSequence(sequence);
                    tasks.add(t);
                }
            }
            return sequence;
        } else if (process.getName().equals(Constants.PROCESS_RELATED_DEPT_REVIEW)){
            Set<Department> depts = contract.getRelatedDepartments();
            if(depts != null){
                List<Department> relatedDepts = departmentService.getDepartments(depts);
                for(Department dept : relatedDepts){
                    Task t = new Task();
                    t.setContract(contract);
                    t.setDepartment(dept);
                    t.setProcess(process);
                    t.setAssignee(findAssignee(process, dept, contract));
                    sequence +=1;
                    t.setSequence(sequence);
                    tasks.add(t);
                }
            }
            return sequence;
        } else {
            Task t = new Task();
            t.setContract(contract);
            t.setProcess(process);
            User assignee = findAssignee(process, null, contract);
            t.setAssignee(assignee);
            if(assignee.getDepartmentId() != null){
                t.setDepartment(departmentRepository.findOne(assignee.getDepartmentId()));
            }
            sequence += 1;
            t.setSequence(sequence);
            tasks.add(t);
            return sequence;
        }
    }

    public Contract approveContract(Contract contract, String note){
        Task currentTask = contract.getCurrentTask();
        currentTask.setPerformedDatetime(new DateTime());
        currentTask.setPerformer(userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get());
        currentTask.setResult("APPROVED");
        Task nextTask = taskService.getNextTask(contract);
        contract.setCurrentTask(nextTask);
        contract.setAssignee(nextTask.getAssignee());
        if(currentTask.getProcess().getName().equals(Constants.PROCESS_EXECUTIVE_REVIEW)){
            contract.setStatus(ContractStatus.Approved);
            contract.setApproveDate(new DateTime());
        }

        //create a message
        createMessage(nextTask, userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get(),
            nextTask.getAssignee(), "New Task Assigned", "A new task has been assigned to you " + nextTask.getId());

        contract.setModifiedDate(new DateTime());
        contract.setModifiedBy(userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get());
        Contract result = contractRepository.save(contract);

        ContractHistory history = new ContractHistory();
        history.setContract(result);
        history.setUser(userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get());
        history.setTask(currentTask);
        history.setAction(UserAction.APPROVE);
        history.setNote(note);
        history.setAction_datetime(new DateTime());
        contractHistoryRepository.save(history);

        return result;
    }

    public Contract rejectContract(Contract contract, String note){
        Task currentTask = contract.getCurrentTask();
        currentTask.setPerformedDatetime(new DateTime());
        currentTask.setPerformer(userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get());
        currentTask.setResult("REJECTED");

        Task task = taskService.getFirstTask(contract);
        contract.setCurrentTask(task); // set back to contract draft
        contract.setStatus(ContractStatus.Drafting);
        contract.setAssignee(task.getAssignee());
        contract.setModifiedDate(new DateTime());
        contract.setModifiedBy(userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get());

        //create a message
        createMessage(task, userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get(),
            task.getAssignee(), "Contract rejected", "A new task has been assigned to you " + task.getId());

        Contract result = contractRepository.save(contract);

        ContractHistory history = new ContractHistory();
        history.setContract(result);
        history.setUser(userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get());
        history.setTask(currentTask);
        history.setAction(UserAction.REJECT);
        history.setAction_datetime(new DateTime());
        history.setNote(note);
        contractHistoryRepository.save(history);

        return result;
    }


    public Contract submitToNextTask(Contract contract, String note) {
        Task currentTask = contract.getCurrentTask();
        currentTask.setPerformedDatetime(new DateTime());
        currentTask.setPerformer(userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get());
        currentTask.setResult("COMPLETED");

        Task nextTask = taskService.getNextTask(contract);

        if(currentTask.getProcess().getName().equals(Constants.PROCESS_CONTRACT_DRAFT)){
            contract.setStatus(ContractStatus.Reviewing);
            contract.setSubmitDate(new DateTime());
            contract.setCurrentTask(nextTask);
        } else {
            if (currentTask.getProcess().getName().equals(Constants.PROCESS_CONTRACT_SIGN)) {
                contract.setStatus(ContractStatus.Signed);
                contract.setSignDate(new DateTime());
            } else if (currentTask.getProcess().getName().equals(Constants.PROCESS_CONTRACT_EXECUTION)) {
                contract.setStatus(ContractStatus.Execution);
            } else if (currentTask.getProcess().getName().equals(Constants.PROCESS_CONTRACT_ARCHIVE)) {
                contract.setStatus(ContractStatus.Archived);
                contract.setArchiveDate(new DateTime());
            }
            if (currentTask.getProcess().getName().equals(Constants.PROCESS_CONTRACT_ARCHIVE)) {
                // if it is the last task: archive, leave it as archive, maybe it should set to null, but needs handle null task
                contract.setCurrentTask(currentTask);
            } else {
                contract.setCurrentTask(nextTask);
            }
        }
        if(nextTask != null) {
            contract.setAssignee(nextTask.getAssignee());

            //create a message
            createMessage(nextTask, userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get(),
                nextTask.getAssignee(), "New Task Assigned", "A new task has been assigned to you " + + nextTask.getId());
        }
        contract.setModifiedDate(new DateTime());
        contract.setModifiedBy(userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get());
        /* TODO
        *
        *  need to find the user who is responsible for next process, and set it as assignee
        *  send message to assignee
        *  add task for assignee
        * */

        Contract result = contractRepository.save(contract);

        ContractHistory history = new ContractHistory();
        history.setContract(result);
        history.setUser(userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get());
        history.setTask(currentTask);
        if (currentTask.getProcess().getName().equals(Constants.PROCESS_CONTRACT_DRAFT)){
            history.setAction(UserAction.SUBMIT);
        } else {
            history.setAction(UserAction.COMPLETE);
        }
        history.setAction_datetime(new DateTime());
        history.setNote(note);
        contractHistoryRepository.save(history);

        return result;
    }

    public User findAssignee(Process process, Department department, Contract contract){
        if (process.getName().equals(Constants.PROCESS_INTERNAL_DIV_REVIEW)){
            return contract.getAdministrator();
        } else if (process.getName().equals(Constants.PROCESS_INTERNAL_DEPT_REVIEW)){
            User u = userService.getUserInChargeOfReview(departmentRepository.findOne(contract.getAuthor().getDepartmentId()));
            if (u != null){
                return u;
            }
        } else if (process.getName().equals(Constants.PROCESS_RELATED_DEPT_REVIEW)
            || process.getName().equals(Constants.PROCESS_RELATED_DIV_REVIEW)){
            User u = userService.getUserInChargeOfReview(department);
            if (u != null){
                return u;
            }
        } else if (process.getName().equals(Constants.PROCESS_LEGAL_DEPT_REVIEW)) {
            User u = userService.getUserInChargeOfReview(departmentRepository.findOneByName("DEPT_LEGAL", contract.getAccount().getId()));
            if (u != null){
                return u;
            }
        } else if (process.getName().equals(Constants.PROCESS_FINANCE_DEPT_REVIEW)) {
            User u = userService.getUserInChargeOfReview(departmentRepository.findOneByName("DEPT_FINANCE", contract.getAccount().getId()));
            if (u != null){
                return u;
            }
        }else if (process.getName().equals(Constants.PROCESS_EXECUTIVE_REVIEW)){
            User u = userService.getUserCanApproveContract();
            if(u != null){
                return u;
            } else {
                log.info("The set up is incorrect, cannot find user to approve contract");
                return null;
            }
        } else if (process.getName().equals(Constants.PROCESS_CONTRACT_SIGN)){
            User u = userService.getUserCanSignContract();
            if(u != null){
                return u;
            } else {
                log.info("The set up is incorrect, cannot find user to sign contract");
                return null;
            }
        } else if (process.getName().equals(Constants.PROCESS_CONTRACT_EXECUTION)){
            return contract.getAdministrator();
        } else if (process.getName().equals(Constants.PROCESS_CONTRACT_ARCHIVE)) {
            return contract.getAdministrator();
        }

        // default, no other user found, return contract's administrator
        return contract.getAdministrator();
    }

    public void createMessage(Task task, User sender, User recipient, String subject, String content){
        Message msg = new Message();
        msg.setContent(content);
        msg.setRead(false);
        msg.setRecipient(recipient);
        msg.setSend_datetime(new DateTime());
        msg.setSubject(subject);
        msg.setSender(sender);
        msg.setTask(task);
        messageRepository.save(msg);
    }


    public ContractHistory addComment(Contract contract, ContractHistory contractHistory){
        contractHistory.setAction(UserAction.COMMENT);
        contractHistory.setAction_datetime(new DateTime());
        contractHistory.setContract(contract);
        contractHistory.setUser(userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get());
        contractHistory.setTask(contract.getCurrentTask());

        ContractHistory result = contractHistoryRepository.save(contractHistory);
        return result;
    }

    public String createContractFile(Contract contract){
        String filePath = "a";
        String content = contract.getContent();
        return filePath;
    }

    public Attachment createContractAttachment(Attachment attachment){
        Attachment result = attachmentRepository.save(attachment);
        return result;
    }

    public Attachment getAttachment(Long id){
        return attachmentRepository.findOne(id);
    }
}
