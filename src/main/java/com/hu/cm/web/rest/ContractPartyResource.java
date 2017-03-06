package com.hu.cm.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.hu.cm.domain.ContractParty;
import com.hu.cm.domain.admin.Account;
import com.hu.cm.repository.ContractPartyRepository;
import com.hu.cm.repository.admin.AccountRepository;
import com.hu.cm.security.xauth.TokenManager;
import com.hu.cm.web.rest.admin.LoginUser;
import com.hu.cm.web.rest.dto.ContractPartyDTO;
import com.hu.cm.web.rest.util.PaginationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;
import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing ContractParty.
 */
@RestController
@RequestMapping("/api")
public class ContractPartyResource {

    private final Logger log = LoggerFactory.getLogger(ContractPartyResource.class);

    @Inject
    private ContractPartyRepository contractPartyRepository;

    @Inject
    private AccountRepository accountRepository;

    /**
     * POST  /contract_partys -> Create a new contract_party.
     */
    @RequestMapping(value = "/contract_parties",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ContractParty> create(@Valid @RequestBody ContractParty contract_party) throws URISyntaxException {
        log.debug("REST request to save ContractParty : {}", contract_party);
        if (contract_party.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new contract_party cannot already have an ID").body(null);
        }

        LoginUser user = (LoginUser)TokenManager.getCurrentToken().getUserDetails();
        Long accountId = user.getAccount().getId();
        if(accountId == null){
            log.error("create: Account id missing");
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }
        Account account = accountRepository.findOne(accountId);
        contract_party.setAccount(account);
        ContractParty result = contractPartyRepository.save(contract_party);
        return ResponseEntity.created(new URI("/api/contract_parties/" + contract_party.getId())).body(result);
    }

    /**
     * PUT  /contract_partys -> Updates an existing contract_party.
     */
    @RequestMapping(value = "/contract_parties",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ContractParty> update(@Valid @RequestBody ContractParty contract_party) throws URISyntaxException {
        log.debug("REST request to update ContractParty : {}", contract_party);
        if (contract_party.getId() == null) {
            return create(contract_party);
        }
        ContractParty result = contractPartyRepository.save(contract_party);
        return ResponseEntity.ok().body(result);
    }

    /**
     * GET  /contract_partys -> get all the contract_parties.
     */
    @RequestMapping(value = "/contract_parties",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<ContractPartyDTO>> getAll(@RequestParam(value = "page" , required = false) Integer offset,
                                                         @RequestParam(value = "per_page", required = false) Integer limit)
        throws URISyntaxException {
        LoginUser user = (LoginUser)TokenManager.getCurrentToken().getUserDetails();
        Long accountId = user.getAccount().getId();
        if(accountId == null){
            log.error("getAll(): Account id missing");
            return new ResponseEntity<>(null, null, HttpStatus.BAD_REQUEST);
        }

        Page<ContractParty> page = contractPartyRepository.findAllForAccount(PaginationUtil.generatePageRequest(offset, limit), accountId);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/contract_parties", offset, limit);
        List<ContractParty> contractParties = page.getContent();
        List<ContractPartyDTO> results = new ArrayList<>();
        for(ContractParty cp : contractParties){
            results.add(map(cp, false));
        }

        return new ResponseEntity<>(results, headers, HttpStatus.OK);
    }

    /**
     * GET  /contract_partys/:id -> get the "id" contract_party.
     */
    @RequestMapping(value = "/contract_parties/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<ContractPartyDTO> get(@PathVariable Long id) {
        log.debug("REST request to get ContractParty : {}", id);
        ContractParty cp = contractPartyRepository.findByIdAndFetchEager(id);
        if(cp != null){
            return new ResponseEntity<>(map(cp,true), HttpStatus.OK);
        }else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    /**
     * DELETE  /contract_partys/:id -> delete the "id" contract_party.
     */
    @RequestMapping(value = "/contract_parties/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public void delete(@PathVariable Long id) {
        log.debug("REST request to delete ContractParty : {}", id);
        contractPartyRepository.delete(id);
    }



    private ContractPartyDTO map(ContractParty contractParty, Boolean mapFull){
        ContractPartyDTO dto = new ContractPartyDTO(contractParty.getId());
        dto.setName(contractParty.getName());
        dto.setLegal_representative(contractParty.getLegal_representative());
        dto.setRegistration_id(contractParty.getRegistration_id());
        if(mapFull){
            dto.setAddress(contractParty.getAddress());
            dto.setBank_accounts(contractParty.getBank_accounts());
            dto.setBusiness_certificate(contractParty.getBusiness_certificate());
            //dto.setContracts(contractParty.getContracts());
            dto.setDescription(contractParty.getDescription());
            dto.setProfessional_certificate(contractParty.getProfessional_certificate());
            dto.setRegistered_capital(contractParty.getRegistered_capital());
            dto.setRegistration_inspection_record(contractParty.getRegistration_inspection_record());
        }
        return dto;
    }
}
