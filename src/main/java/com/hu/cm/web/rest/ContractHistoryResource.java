package com.hu.cm.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.hu.cm.domain.ContractHistory;
import com.hu.cm.domain.admin.Account;
import com.hu.cm.repository.ContractHistoryRepository;
import com.hu.cm.repository.ContractRepository;
import com.hu.cm.repository.TaskRepository;
import com.hu.cm.repository.admin.AccountRepository;
import com.hu.cm.repository.admin.UserRepository;
import com.hu.cm.security.SecurityUtils;
import com.hu.cm.security.xauth.TokenManager;
import com.hu.cm.web.rest.dto.ContractHistoryDTO;
import com.hu.cm.web.rest.util.PaginationUtil;
import com.hu.cm.web.rest.mapper.ContractHistoryMapper;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST controller for managing ContractHistory.
 */
@RestController
@RequestMapping("/api")
public class ContractHistoryResource {

    private final Logger log = LoggerFactory.getLogger(ContractHistoryResource.class);

    @Inject
    private ContractHistoryRepository contract_historyRepository;

    @Inject
    private ContractRepository contractRepository;

    @Inject
    private TaskRepository taskRepository;

    @Inject
    private UserRepository userRepository;

    @Inject
    private AccountRepository accountRepository;

    /**
     * POST  /contract_historys -> Create a new contract_history.
     */
    @RequestMapping(value = "/contract_histories",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ContractHistoryDTO> create(@RequestBody ContractHistoryDTO contract_historyDTO) throws URISyntaxException {
        log.debug("REST request to save ContractHistory : {}", contract_historyDTO);
        if (contract_historyDTO.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new contract_history cannot already have an ID").body(null);
        }

        ContractHistory contract_history = mapFromDTO(contract_historyDTO);
        ContractHistory result = contract_historyRepository.save(contract_history);
        return ResponseEntity.created(new URI("/api/contract_histories/" + contract_historyDTO.getId())).body(map(result));
    }

    /**
     * PUT  /contract_historys -> Updates an existing contract_history.
     */
    @RequestMapping(value = "/contract_histories",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ContractHistoryDTO> update(@RequestBody ContractHistoryDTO contract_historyDTO) throws URISyntaxException {
        log.debug("REST request to update ContractHistory : {}", contract_historyDTO);
        if (contract_historyDTO.getId() == null) {
            return create(contract_historyDTO);
        }
        ContractHistory contract_history = mapFromDTO(contract_historyDTO);
        ContractHistory result = contract_historyRepository.save(contract_history);
        return ResponseEntity.ok().body(map(result));
    }

    /**
     * GET  /contract_historys -> get all the contract_historys.
     */
    @RequestMapping(value = "/contract_histories",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    @Transactional(readOnly = true)
    public ResponseEntity<List<ContractHistoryDTO>> getAll(@RequestParam(value = "page" , required = false) Integer offset,
                                                           @RequestParam(value = "per_page", required = false) Integer limit,
                                                           @RequestParam(value = "contractId", required = false) Long contractId)
        throws URISyntaxException {
        Long accountId = TokenManager.getCurrentToken().getAccount().getId();
        if(accountId == null){
            log.error("create: Account id missing");
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }
        Account account = accountRepository.findOne(accountId);

        Page<ContractHistory> page = null;
        HttpHeaders headers = null;
        List<ContractHistory> contractHistories = null;
        if(contractId == null) {
            log.error("contract with id " + contractId + " not found");
            return new ResponseEntity<>(null, headers, HttpStatus.NOT_FOUND);
        } else {
            contractHistories = contract_historyRepository.findAllForContract(contractId);
        }

        List<ContractHistoryDTO> results = new ArrayList<>();
        for(ContractHistory history : contractHistories){
            ContractHistoryDTO dto = map(history);
            results.add(dto);
        }
        return new ResponseEntity<>(results, headers, HttpStatus.OK);
    }

    /**
     * GET  /contract_historys/:id -> get the "id" contract_history.
     */
    @RequestMapping(value = "/contract_histories/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ContractHistoryDTO> get(@PathVariable Long id) {
        log.debug("REST request to get ContractHistory : {}", id);

        ContractHistory history = contract_historyRepository.findOne(id);
        if(history == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } else {
            return new ResponseEntity<>(map(history), HttpStatus.OK);
        }
    }

    /**
     * DELETE  /contract_historys/:id -> delete the "id" contract_history.
     */
    @RequestMapping(value = "/contract_histories/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public void delete(@PathVariable Long id) {
        log.debug("REST request to delete ContractHistory : {}", id);
        contract_historyRepository.delete(id);
    }



    private ContractHistory mapFromDTO(ContractHistoryDTO dto){
        ContractHistory history = new ContractHistory();
        history.setAction(dto.getAction());
        history.setAction_datetime(new DateTime());
        history.setContract(contractRepository.findOne(dto.getContractId()));
        history.setNote(dto.getNote());
        history.setTask(taskRepository.findOne(dto.getTaskId()));
        history.setUser(userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get());
        return history;
    }

    private ContractHistoryDTO map(ContractHistory history){
        ContractHistoryDTO dto = new ContractHistoryDTO();
        dto.setAction(history.getAction());
        dto.setAction_datetime(history.getAction_datetime());
        dto.setContractId(history.getContract().getId());
        dto.setNote(history.getNote());
        dto.setTaskId(history.getTask().getId());
        dto.setUser(userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get());
        dto.setContractName(history.getContract().getName());
        dto.setTaskProcessName(history.getTask().getProcess().getName());
        return dto;
    }
}
