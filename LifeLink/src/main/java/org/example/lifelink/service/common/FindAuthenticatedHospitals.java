package org.example.lifelink.service.common;

import lombok.RequiredArgsConstructor;
import org.example.lifelink.dao.hospital.HospitalDao;
import org.example.lifelink.entity.hospital.Hospital;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
@RequiredArgsConstructor
public class FindAuthenticatedHospitals {

    private final HospitalDao hospitalDao;

    public Hospital findAuthenticatedHospital (String authenticatedEmail){
        return hospitalDao
                .findByUser_EmailIgnoreCase(
                        authenticatedEmail
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Hospital profile was not found"
                        )
                );
    }


}