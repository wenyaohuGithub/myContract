package com.hu.cm.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.hu.cm.domain.*;
import com.hu.cm.domain.admin.Account;
import com.hu.cm.domain.admin.Department;
import com.hu.cm.domain.admin.User;
import com.hu.cm.domain.configuration.ContractSample;
import com.hu.cm.domain.enumeration.ContractStatus;
import com.hu.cm.repository.*;
import com.hu.cm.repository.admin.AccountRepository;
import com.hu.cm.repository.admin.DepartmentRepository;
import com.hu.cm.repository.admin.UserRepository;
import com.hu.cm.repository.configuration.ProcessRepository;
import com.hu.cm.security.SecurityUtils;
import com.hu.cm.security.xauth.TokenManager;
import com.hu.cm.service.ContractSearchService;
import com.hu.cm.service.ContractService;
import com.hu.cm.service.ProcessService;
import com.hu.cm.service.TaskService;
import com.hu.cm.web.rest.dto.*;
import com.hu.cm.web.rest.util.PaginationUtil;
import org.apache.commons.io.IOUtils;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.inject.Inject;
import javax.validation.Valid;
import java.io.*;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.*;

/**
 * REST controller for managing Contract.
 */
@RestController
@RequestMapping("/api")
public class ContractResource {

    private final Logger log = LoggerFactory.getLogger(ContractResource.class);
    private final DateTimeFormatter formatter = DateTimeFormat.forPattern("yyyy-MM-dd");

    @Inject
    private ContractRepository contractRepository;

    @Inject
    private AccountRepository accountRepository;

    @Inject
    private DepartmentRepository departmentRepository;

    @Inject
    private ContractPartyRepository contractPartyRepository;

    @Inject
    private CategoryRepository categoryRepository;

    @Inject
    private ProcessRepository processRepository;

    @Inject
    private UserRepository userRepository;

    @Inject
    private ProjectRepository projectRepository;

    @Inject
    ContractHistoryRepository contractHistoryRepository;

    @Inject
    private ContractService contractService;

    @Inject
    private TaskService taskService;

    @Inject
    private ContractSearchService contractSearchService;

    @Inject
    private AttachmentRepository attachmentRepository;

    /**
     * POST  /contracts -> Create a new contract.
     */
    @RequestMapping(value = "/contracts",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ContractDTO> create(@RequestBody ContractDTO dto) throws URISyntaxException {
        log.debug("REST request to save Contract : {}", dto);
        if (dto.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new contract cannot already have an ID").body(null);
        }
        //LoginUser user = (LoginUser)TokenManager.getCurrentToken().getUserDetails();
        Long accountId = TokenManager.getCurrentToken().getAccount().getId();
        if(accountId == null){
            log.error("create: Account id missing");
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }
        Account account = accountRepository.findOne(accountId);

        Contract contract = mapFromDTO(dto);
        contract.setAccount(account);
        Contract result = contractService.createContract(contract);

        ContractDTO returnedDto = new ContractDTO();
        returnedDto.setId(result.getId());
        returnedDto.setName(result.getName());

        return ResponseEntity.created(new URI("/api/contracts/" + contract.getId())).body(returnedDto);
    }

    /**
     * POST  /contracts -> Create a new contract attachment.
     */
    @RequestMapping(value = "/contracts/{id}/attachments",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<AttachmentDTO> createAttachment(@PathVariable Long id, MultipartFile file) throws URISyntaxException {
        log.debug("REST request to create Attachment : {}", file.getOriginalFilename());

        Long accountId = TokenManager.getCurrentToken().getAccount().getId();
        if(accountId == null){
            log.error("create: Account id missing");
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }

        Contract contract = contractRepository.findOne(id);

        if(contract == null){
            return ResponseEntity.badRequest().header("Failure", "Contract with id " + id + " not found").body(null);
        }

        String filename = file.getOriginalFilename();

        if (!file.isEmpty()) {
            try {
                File directory = new File("contractFiles");
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
                Attachment attachment = new Attachment();
                attachment.setFilePath(directory.getPath()+"/"+filename);
                attachment.setContract(contract);
                attachment.setUploadDatetime(new DateTime());
                Attachment result = contractService.createContractAttachment(attachment);

                AttachmentDTO returnedDto = new AttachmentDTO(result.getId());
                returnedDto.setFilePath(result.getFilePath());
                returnedDto.setUploadDatetime(result.getUploadDatetime().toString());
                return ResponseEntity.created(new URI("/api/contracts/"+id+"/attachments")).body(returnedDto);
            } catch (Exception e) {
                return ResponseEntity.badRequest().header("Failure", "File upload failed").body(null);
            }
        } else {
            return ResponseEntity.badRequest().header("Failure", "Uploaded file is empty").body(null);
        }
    }


    /**
     * PUT  /contracts -> Updates an existing contract.
     */
    @RequestMapping(value = "/contracts",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ContractDTO> update(@Valid @RequestBody Contract contract) throws URISyntaxException {
        log.debug("REST request to update Contract : {}", contract.getId());
        if (contract.getId() == null) {
            return null;//create(contract);
        }
        Contract c = contractRepository.findByIdAndFetchEager(contract.getId());
        c.setName(contract.getName());
        c.setAmount(contract.getAmount());
        c.setContent(contract.getContent());
        c.setContractParty(contract.getContractParty());
        Contract result = contractRepository.save(c);
        ContractDTO dto = map(result);
        return ResponseEntity.ok().body(dto);
    }

    /**
     * PUT  /contracts -> Updates an existing contract.
     */
    @RequestMapping(value = "/contracts/{id}/submit",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ContractDTO> submitToNextTask(@RequestBody String note, @PathVariable Long id)
        throws URISyntaxException {
        log.debug("REST request to submitToNextTask Contract : {}", id);
        Contract contract = contractRepository.findByIdAndFetchEager(id);
        if(contract != null){
            contract = contractService.submitToNextTask(contract, note);
            ContractDTO dto = map(contract);
            return ResponseEntity.ok().body(dto);
        }else {
            log.info("Contract with id "+ id + " not found!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    /**
     * PUT  /contracts -> Reject an existing contract.
     */
    @RequestMapping(value = "/contracts/{id}/reject",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ContractDTO> reject(@RequestBody String note, @PathVariable Long id)
        throws URISyntaxException {
        log.debug("REST request to approve Contract : {}", id);
        Contract contract = contractRepository.findByIdAndFetchEager(id);
        if(contract != null){
            if(contract.getCurrentTask().getProcess().getName().equals("CONTRACT_SIGN") ||
                contract.getCurrentTask().getProcess().getName().equals("CONTRACT_EXECUTION") ||
                contract.getCurrentTask().getProcess().getName().equals("CONTRACT_ARCHIVE")){
                log.info("This contract " + contract.getId() + " is already approved. Cannot be rejected!");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            } else {
                contract = contractService.rejectContract(contract, note);
                ContractDTO dto = map(contract);
                return ResponseEntity.ok().body(dto);
            }
        }else {
            log.info("Contract with id "+ id + " not found!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    /**
     * PUT  /contracts -> Approve an existing contract.
     */
    @RequestMapping(value = "/contracts/{id}/approve",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ContractDTO> approve(@RequestBody String note, @PathVariable Long id)
        throws URISyntaxException {
        log.debug("REST request to approve Contract : {}", id);
        Contract contract = contractRepository.findByIdAndFetchEager(id);
        if(contract != null){
            if(contract.getCurrentTask().getProcess().getName().equals("CONTRACT_SIGN") ||
                contract.getCurrentTask().getProcess().getName().equals("CONTRACT_EXECUTION") ||
                contract.getCurrentTask().getProcess().getName().equals("CONTRACT_ARCHIVE")){
                log.info("This contract " + contract.getId() + " is already approved. No more approval necessary");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            } else {
                contract = contractService.approveContract(contract, note);
                ContractDTO dto = map(contract);
                return ResponseEntity.ok().body(dto);
            }
        }else {
            log.info("Contract with id "+ id + " not found!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    /**
     * GET  /contracts -> get all the contracts.
     */
    @RequestMapping(value = "/contracts",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<ContractDTO>> getAll(@RequestParam(value = "page" , required = false) Integer offset,
                                  @RequestParam(value = "per_page", required = false) Integer limit)
        throws URISyntaxException {
        //LoginUser user = (LoginUser)TokenManager.getCurrentToken().getUserDetails();
        Long accountId = TokenManager.getCurrentToken().getAccount().getId();
        if(accountId == null){
            log.error("getAll(): Account id missing");
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }
        User user = userRepository.findByIdAndFetchUserAccountByLogin(TokenManager.getCurrentToken().getUserName());
        Page<Contract> page = null;
        if(TokenManager.getCurrentToken().getAuthorities().contains(new SimpleGrantedAuthority("ROLE_EXECUTIVE"))){
            page = contractRepository.findAllForAccount(PaginationUtil.generatePageRequest(offset, limit), accountId);
        }else if(TokenManager.getCurrentToken().getAuthorities().contains(new SimpleGrantedAuthority("ROLE_DEPT_HEAD"))){
            page = contractRepository.findAllForDepartment(PaginationUtil.generatePageRequest(offset, limit), accountId, user.getDepartmentId());
        }else {
            page = contractRepository.findAllForUser(PaginationUtil.generatePageRequest(offset, limit), accountId, user.getId());
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/contracts", offset, limit);

        List<Contract> contracts = page.getContent();
        List<ContractDTO> results = new ArrayList<>();
        for(Contract contract : contracts){
            ContractDTO dto = new ContractDTO();
            dto.setId(contract.getId());
            dto.setName(contract.getName());
            dto.setAmount(contract.getAmount());
            CategoryDTO catDto = new CategoryDTO(contract.getCategory().getId());
            catDto.setName(contract.getCategory().getName());
            dto.setCategory(catDto);
            dto.setCurrency(contract.getCurrency());
            dto.setCreatedDate(contract.getCreatedDate().toLocalDate().toString());
            dto.setStatus(contract.getStatus().name());
            results.add(dto);
        }
        return new ResponseEntity<>(results, headers, HttpStatus.OK);
    }

    /**
     * GET  /contracts/search -> search the contracts.
     */
    @RequestMapping(value = "/contracts/search",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<ContractDTO>> search(@RequestParam(value = "page" , required = false) Integer offset,
                                                    @RequestParam(value = "per_page", required = false) Integer limit,
                                                    @RequestParam(value = "search") String searchString)
            throws URISyntaxException {
        log.debug("REST request to search Contract : {}", searchString);
        //LoginUser user = (LoginUser)TokenManager.getCurrentToken().getUserDetails();
        Long accountId = TokenManager.getCurrentToken().getAccount().getId();
        if(accountId == null){
            log.error("search(): Account id missing");
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }

        Page<Contract> page = contractSearchService.findBySearchTerm(searchString,PaginationUtil.generatePageRequest(offset, limit, "name", "ASC"), accountId);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/contracts/search", offset, limit);

        List<Contract> contracts = page.getContent();

        List<ContractDTO> results = new ArrayList<>();
        for(Contract contract : contracts){
            ContractDTO dto = new ContractDTO();
            dto.setId(contract.getId());
            dto.setName(contract.getName());
            dto.setAmount(contract.getAmount());
            CategoryDTO catDto = new CategoryDTO(contract.getCategory().getId());
            catDto.setName(contract.getCategory().getName());
            dto.setCategory(catDto);
            dto.setCurrency(contract.getCurrency());
            dto.setCreatedDate(contract.getCreatedDate().toLocalDate().toString());
            dto.setStatus(contract.getStatus().name());
            results.add(dto);
        }
        return new ResponseEntity<>(results, headers, HttpStatus.OK);
    }

    /**
     * GET  /contracts/statistics -> get contracts statistics sum by month.
     */
    @RequestMapping(value = "/contracts/sumbymonth",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Map<String, Double>> getSumByMonth()
            throws URISyntaxException {
        log.debug("REST request to get contracts statistics sum by month");
        //LoginUser user = (LoginUser)TokenManager.getCurrentToken().getUserDetails();
        Long accountId = TokenManager.getCurrentToken().getAccount().getId();
        if(accountId == null){
            log.error("search(): Account id missing");
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }
        Map<String, Double> sumByMonth = new HashMap<>();
        sumByMonth.put("January", 0.0);
        sumByMonth.put("February", 0.0);
        sumByMonth.put("March", 0.0);
        sumByMonth.put("April", 0.0);
        sumByMonth.put("May", 0.0);
        sumByMonth.put("June", 0.0);
        sumByMonth.put("July", 0.0);
        sumByMonth.put("August", 0.0);
        sumByMonth.put("September", 0.0);
        sumByMonth.put("October", 0.0);
        sumByMonth.put("November", 0.0);
        sumByMonth.put("December", 0.0);
        Map<String, Double> results = contractSearchService.amountSumByMonth(accountId);

        for (Map.Entry<String, Double> entry : results.entrySet())
        {
            Object o = entry.getKey();
            String dateString = o.toString().substring(0, 10); //yyyy-MM-dd format
            DateTime date = formatter.parseDateTime(dateString);
            if(date.getMonthOfYear() == 1){
                sumByMonth.put("January", entry.getValue());
            } else if(date.getMonthOfYear() == 2){
                sumByMonth.put("February", entry.getValue());
            } else if(date.getMonthOfYear() == 3){
                sumByMonth.put("March", entry.getValue());
            } else if(date.getMonthOfYear() == 4){
                sumByMonth.put("April", entry.getValue());
            } else if(date.getMonthOfYear() == 5){
                sumByMonth.put("May", entry.getValue());
            } else if(date.getMonthOfYear() == 6){
                sumByMonth.put("June", entry.getValue());
            } else if(date.getMonthOfYear() == 7){
                sumByMonth.put("July", entry.getValue());
            } else if(date.getMonthOfYear() == 8){
                sumByMonth.put("August", entry.getValue());
            } else if(date.getMonthOfYear() == 9){
                sumByMonth.put("September", entry.getValue());
            } else if(date.getMonthOfYear() == 10){
                sumByMonth.put("October", entry.getValue());
            } else if(date.getMonthOfYear() == 11){
                sumByMonth.put("November", entry.getValue());
            } else if(date.getMonthOfYear() == 12){
                sumByMonth.put("December", entry.getValue());
            }
        }
        return new ResponseEntity<>(sumByMonth, HttpStatus.OK);
    }
    /**
     * GET  /contracts/:id -> get the "id" contract.
     */
    @RequestMapping(value = "/contracts/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ContractDTO> get(@PathVariable Long id) {
        log.debug("REST request to get Contract : {}", id);

        Contract c = contractRepository.findByIdAndFetchEager(id);
        if (c != null){
            ContractDTO dto = map(c);
            return ResponseEntity.status(HttpStatus.OK).body(dto);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
    /**
     * GET  /contracts/{id}/attachments -> get all the contracts attachments.
     */
    @RequestMapping(value = "/contracts/{id}/attachments",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<AttachmentDTO>> getAllAttachments(@PathVariable Long id)
            throws URISyntaxException {
        Long accountId = TokenManager.getCurrentToken().getAccount().getId();
        if(accountId == null){
            log.error("getAll(): Account id missing");
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }
        Contract c = contractRepository.findByIdAndFetchAttachments(id);
        if (c != null){
            List<AttachmentDTO> attachments = new ArrayList<AttachmentDTO>();
            for(Attachment a : c.getAttachments()){
                AttachmentDTO dto = new AttachmentDTO(a.getId());
                dto.setFilePath(a.getFilePath());
                dto.setUploadDatetime(a.getUploadDatetime().toString());
                attachments.add(dto);
            }
            return ResponseEntity.status(HttpStatus.OK).body(attachments);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    /**
     * GET  /contracts/attachments/{id} -> get an attachment.
     */
    @RequestMapping(value = "/contracts/attachments/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<AttachmentDTO> getAttachment(@PathVariable Long id)
            throws URISyntaxException {
        Long accountId = TokenManager.getCurrentToken().getAccount().getId();
        if(accountId == null){
            log.error("getAll(): Account id missing");
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }
        Attachment a = attachmentRepository.findOne(id);
        if (a != null){
            AttachmentDTO dto = new AttachmentDTO(a.getId());
            dto.setFilePath(a.getFilePath());
            dto.setUploadDatetime(a.getUploadDatetime().toString());
            return ResponseEntity.status(HttpStatus.OK).body(dto);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    /**
     * DELETE  /contracts/:id -> delete the "id" contract.
     */
    @RequestMapping(value = "/contracts/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public void delete(@PathVariable Long id) {
        log.debug("REST request to delete Contract : {}", id);
        contractRepository.delete(id);
    }

    /**
     * POST  /contracts/:id -> add comment to the "id" contract.
     */
    @RequestMapping(value = "/contracts/{id}/comment",
        method = RequestMethod.POST,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ContractHistoryDTO> addComment(@RequestBody ContractHistory contractHistory, @PathVariable Long id) {
        log.debug("REST request to add comment to Contract : {}", id);

        if(contractRepository.findOne(id) == null){
            log.info("Add contract history to contract with id " + id + " not found!");
            return  ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } else {
            ContractHistory newHistory = contractService.addComment(contractRepository.findOne(id), contractHistory);
            ContractHistoryDTO dto = new ContractHistoryDTO();
            dto.setAction(newHistory.getAction());
            dto.setAction_datetime(new DateTime());
            dto.setContractId(newHistory.getContract().getId());
            dto.setNote(newHistory.getNote());
            dto.setTaskId(newHistory.getTask().getId());
            dto.setContractName(newHistory.getContract().getName());
            dto.setTaskProcessName(newHistory.getTask().getProcess().getName());
            dto.setUser(userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get());
            return  ResponseEntity.status(HttpStatus.OK).body(dto);
        }
    }

    @RequestMapping(value="/contracts/{id}/file", method=RequestMethod.DELETE)
    public ResponseEntity deleteContractFile(@PathVariable Long id) throws IOException
    {
        log.info("deleting contract " + id +  " file ");
        Contract c = contractRepository.findOne(id);
        if (c == null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        File contractFile = new File(c.getContractFilePath());
        if(!contractFile.exists()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        if(contractFile.delete()){
            log.info("Contract file " + c.getContractFilePath() + " deleted");
            c.setContractFilePath(null);
            contractRepository.save(c);
        } else {
            log.info("Contract file " + c.getContractFilePath() + " not deleted");
            return ResponseEntity.status(HttpStatus.FAILED_DEPENDENCY).body(null);
        }

        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @RequestMapping(value="/contracts/download/{id}", method=RequestMethod.GET)
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long id) throws IOException
    {
        log.info("downloading contract " + id +  " ... ");
        Contract c = contractRepository.findOne(id);
        if (c == null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        File contractFile = new File(c.getContractFilePath());
        if(!contractFile.exists()){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        String filePathName = contractFile.getAbsolutePath();
        InputStream is = new FileInputStream(filePathName);

        byte[] file = IOUtils.toByteArray(is);
        HttpHeaders header = new HttpHeaders();
        if(c.getContractFilePath().endsWith("pdf")) {
            header.set("Content-Type", "application/pdf");
        }else if (c.getContractFilePath().endsWith("doc")){
            header.set("Content-Type", "application/doc");
        }else {
            header.set("Content-Type", "application/txt");
        }
        header.setContentLength(file.length);

        return new ResponseEntity<byte[]>(file, header, HttpStatus.OK);
    }

    /* below are internal methods to map data object */
    private ContractDTO map(Contract contract){
        ContractDTO dto = new ContractDTO();
        dto.setId(contract.getId());
        dto.setName(contract.getName());
        dto.setDescription(contract.getDescription());
        dto.setStatus(contract.getStatus().name());
        dto.setAdministrator(contract.getAdministrator());
        dto.setAuthor(contract.getAuthor());
        dto.setAmount(contract.getAmount());
        dto.setAmountCurrentYear(contract.getAmountCurrentYear());
        dto.setAmountWritten(contract.getAmountWritten());
        dto.setApproveDate(contract.getApproveDate() == null ? null : contract.getApproveDate().toString());
        dto.setArchiveDate(contract.getArchiveDate() == null ? null : contract.getArchiveDate().toString());
        dto.setContractIdentifier(contract.getContractIdentifier());
        dto.setContractingMethod(contract.getContractingMethod());
        dto.setCurrency(contract.getCurrency());
        dto.setContractSample(contract.getContractSample());
        dto.setEndDate(contract.getEndDate() == null ? null : contract.getEndDate().toString());
        dto.setExpireDate(contract.getExpireDate() == null ? null : contract.getExpireDate().toString());
        dto.setFundSource(contract.getFundSource());
        dto.setReviewIdentifier(contract.getReviewIdentifier());
        dto.setSignDate(contract.getSignDate() == null ? null : contract.getSignDate().toString());
        dto.setStartDate(contract.getStartDate() == null ? null : contract.getStartDate().toString());
        dto.setSubmitDate(contract.getSubmitDate() == null ? null : contract.getSubmitDate().toString());
        dto.setCreatedDate(contract.getCreatedDate() == null ? null : contract.getCreatedDate().toString());
        dto.setAssignee(contract.getAssignee());
        dto.setModifiedBy(contract.getModifiedBy());
        dto.setContent(contract.getContent());
        //Strip file path, just send file name
        if(contract.getContractFilePath() != null) {
            dto.setContractFilePath(contract.getContractFilePath().substring(contract.getContractFilePath().lastIndexOf("/") + 1));
        }

        if(contract.getCurrentTask() != null){
            TaskDTO taskDTO = new TaskDTO(contract.getCurrentTask().getId());
            taskDTO.setSequence(contract.getCurrentTask().getSequence());
            taskDTO.setProcessName(contract.getCurrentTask().getProcess().getName());
            dto.setCurrentTask(taskDTO);
        }

        TaskDTO nextTaskDto = new TaskDTO();
        Task nextTask = taskService.getNextTask(contract);
        if(nextTask != null) {
            nextTaskDto.setId(nextTask.getId());
            nextTaskDto.setProcessName(nextTask.getProcess().getName());
            nextTaskDto.setSequence(nextTask.getSequence());
            nextTaskDto.setContractId(nextTask.getContract().getId());
            dto.setNextTask(nextTaskDto);
        }

        if(contract.getContractParty() != null){
            ContractPartyDTO partyDTO = new ContractPartyDTO(contract.getContractParty().getId());
            partyDTO.setName(contract.getContractParty().getName());
            dto.setContractParty(partyDTO);
        }

        for(Department dept : contract.getRelatedDepartments()){
            DepartmentDTO d = new DepartmentDTO(dept.getId());
            d.setName(dept.getName());
            dto.getRelatedDepartments().add(d);
        }
        for(Project project : contract.getProjects()){
            ProjectDTO pDto = new ProjectDTO(project.getId());
            pDto.setName(project.getName());
            pDto.setManager(project.getManager());
            dto.getProjects().add(pDto);
        }

        CategoryDTO catDto = new CategoryDTO(contract.getCategory().getId());
        catDto.setName(contract.getCategory().getName());
        dto.setCategory(catDto);

        DepartmentDTO deptDTO = new DepartmentDTO(contract.getAdministrativeDepartment().getId());
        deptDTO.setName(contract.getAdministrativeDepartment().getName());
        dto.setAdministrativeDepartment(deptDTO);

        if(contract.getStatus() == ContractStatus.Drafting){
            dto.setIsDraft(true);
        } else {
            dto.setIsDraft(false);
        }

        if(contract.getCurrentTask().getProcess().getName().equals("CONTRACT_SIGN") ||
            contract.getCurrentTask().getProcess().getName().equals("CONTRACT_EXECUTION") ||
            contract.getCurrentTask().getProcess().getName().equals("CONTRACT_ARCHIVE")){
            dto.setApprovable(false);
            dto.setRejectable(false);
        } else {
            dto.setApprovable(true);
            dto.setRejectable(true);
        }
        return dto;
    }

    private Contract mapFromDTO(ContractDTO dto){
        Contract contract = new Contract();
        contract.setName(dto.getName());
        contract.setDescription(dto.getDescription());
        contract.setAmount(dto.getAmount());
        contract.setAmountCurrentYear(dto.getAmountCurrentYear());
        contract.setAmountWritten(dto.getAmountWritten());
        contract.setContractingMethod(dto.getContractingMethod());
        contract.setCurrency(dto.getCurrency());
        contract.setEndDate(new DateTime(dto.getEndDate()));
        contract.setExpireDate(new DateTime(dto.getExpireDate()));
        contract.setFundSource(dto.getFundSource());
        contract.setIsMultiYear(dto.getIsMultiYear());
        contract.setStartDate(new DateTime(dto.getStartDate()));
        contract.setContent(dto.getContent());

        if(dto.getFirstReviewProcess() != null){
            contract.setFirstReviewProcess(processRepository.findOneByName(dto.getFirstReviewProcess().getName()));
        }

        if(dto.getContractParty() != null){
            contract.setContractParty(contractPartyRepository.findOne(dto.getContractParty().getId()));
        }

        for(DepartmentDTO deptDto : dto.getRelatedDepartments()){
            if(deptDto.getId() != null){
                Department dept = departmentRepository.findOne(deptDto.getId());
                if(dept != null){
                    contract.getRelatedDepartments().add(dept);
                }
            }
        }

        for(ProjectDTO pDto : dto.getProjects()){
            if(pDto.getId() != null){
                Project p = projectRepository.findOne(pDto.getId());
                if(p != null){
                    contract.getProjects().add(p);
                }
            }
        }

        if(dto.getCategory() != null){
            Category cat = categoryRepository.findOne(dto.getCategory().getId());
            if(cat != null){
                contract.setCategory(cat);
            }
        } else {

        }

        return contract;
    }
}
