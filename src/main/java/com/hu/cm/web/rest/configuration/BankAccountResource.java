package com.hu.cm.web.rest.configuration;

import com.codahale.metrics.annotation.Timed;
import com.hu.cm.domain.BankAccount;
import com.hu.cm.domain.ContractParty;
import com.hu.cm.repository.ContractPartyRepository;
import com.hu.cm.repository.configuration.BankAccountRepository;
import com.hu.cm.web.rest.dto.BankAccountDTO;
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
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing BankAccount.
 */
@RestController
@RequestMapping("/api")
public class BankAccountResource {

    private final Logger log = LoggerFactory.getLogger(BankAccountResource.class);

    @Inject
    private BankAccountRepository bank_accountRepository;

    @Inject
    private ContractPartyRepository contractPartyRepository;

    /**
     * POST  /bank_accounts -> Create a new bank_account.
     */
    @RequestMapping(value = "/bank_accounts",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<BankAccount> create(@Valid @RequestBody BankAccountDTO dto) throws URISyntaxException {
        log.debug("REST request to save BankAccount : {}", dto);
        BankAccount account = mapFromDTO(dto);
        if (account.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new bank_account cannot already have an ID").body(null);
        }
        BankAccount result = bank_accountRepository.save(account);
        return ResponseEntity.created(new URI("/api/bank_accounts/" + account.getId())).body(result);
    }

    /**
     * PUT  /bank_accounts -> Updates an existing bank_account.
     */
    @RequestMapping(value = "/bank_accounts",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<BankAccount> update(@Valid @RequestBody BankAccountDTO dto) throws URISyntaxException {
        log.debug("REST request to update BankAccount : {}", dto);
        if (dto.getId() == null) {
            return create(dto);
        }
        BankAccount account = mapFromDTO(dto);
        BankAccount result = bank_accountRepository.save(account);
        return ResponseEntity.ok().body(result);
    }

    /**
     * GET  /bank_accounts -> get all the bank_accounts.
     */
    @RequestMapping(value = "/bank_accounts",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<BankAccount>> getAll(@RequestParam(value = "page" , required = false) Integer offset,
                                                    @RequestParam(value = "per_page", required = false) Integer limit)
        throws URISyntaxException {
        Page<BankAccount> page = bank_accountRepository.findAll(PaginationUtil.generatePageRequest(offset, limit));
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/bank_accounts", offset, limit);
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET  /bank_accounts/:id -> get the "id" bank_account.
     */
    @RequestMapping(value = "/bank_accounts/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<BankAccount> get(@PathVariable Long id) {
        log.debug("REST request to get BankAccount : {}", id);
        return Optional.ofNullable(bank_accountRepository.findOne(id))
            .map(bank_account -> new ResponseEntity<>(
                bank_account,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /bank_accounts/:id -> delete the "id" bank_account.
     */
    @RequestMapping(value = "/bank_accounts/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public void delete(@PathVariable Long id) {
        log.debug("REST request to delete BankAccount : {}", id);
        bank_accountRepository.delete(id);
    }

    public BankAccount mapFromDTO(BankAccountDTO dto){
        BankAccount account = new BankAccount();
        account.setAccount_name(dto.getAccount_name());
        account.setAccount_number(dto.getAccount_number());
        account.setBank_name(dto.getBank_name());
        if(dto.getOwner_id() != null){
            ContractParty owner = contractPartyRepository.findOne(dto.getOwner_id());
                account.setOwner(owner);
        }
        return account;
    }
}
