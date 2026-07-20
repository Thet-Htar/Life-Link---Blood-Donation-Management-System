package org.example.lifelink.controller.hospital;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.lifelink.dto.hospital.inventory.*;
import org.example.lifelink.service.hospital.BloodInventoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lifelink/hospital/inventory")
@RequiredArgsConstructor
public class BloodInventoryController {

    private final BloodInventoryService bloodInventoryService;

    @GetMapping
    public ResponseEntity<List<BloodInventoryUnitResponse>> getHospitalInventory(
            Authentication authentication
    ) {
        List<BloodInventoryUnitResponse> response =
                bloodInventoryService
                        .getHospitalInventory(
                                authentication.getName()
                        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    public ResponseEntity<BloodInventorySummaryResponse> getInventorySummary(
            Authentication authentication
    ) {
        BloodInventorySummaryResponse response =
                bloodInventoryService
                        .getSummary(
                                authentication.getName()
                        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{unitId}")
    public ResponseEntity<BloodInventoryUnitResponse> getInventoryUnit(
            Authentication authentication,

            @PathVariable
            Long unitId
    ) {
        BloodInventoryUnitResponse response =
                bloodInventoryService
                        .getInventoryUnit(
                                authentication.getName(),
                                unitId
                        );

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<BloodInventoryUnitResponse> createInventoryUnit(
            Authentication authentication,
            @Valid @RequestBody CreateBloodUnitRequest request
    ) {
        BloodInventoryUnitResponse response =
                bloodInventoryService
                        .createInventoryUnit(
                                authentication.getName(),
                                request
                        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PutMapping("/{unitId}")
    public ResponseEntity<BloodInventoryUnitResponse>
    updateInventoryUnit(
            Authentication authentication,
            @PathVariable Long unitId,
            @Valid @RequestBody UpdateBloodUnitRequest request
    ) {
        BloodInventoryUnitResponse response =
                bloodInventoryService
                        .updateUnit(
                                authentication.getName(),
                                unitId,
                                request
                        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{unitId}/reserve")
    public ResponseEntity<BloodInventoryUnitResponse> reserveInventoryUnit(
            Authentication authentication,
            @PathVariable Long unitId,
            @Valid @RequestBody ReserveBloodUnitRequest request
    ) {
        BloodInventoryUnitResponse response =
                bloodInventoryService
                        .reserveUnit(
                                authentication.getName(),
                                unitId,
                                request
                        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{unitId}/release")
    public ResponseEntity<BloodInventoryUnitResponse> releaseInventoryReservation(
            Authentication authentication,
            @PathVariable Long unitId
    ) {
        BloodInventoryUnitResponse response =
                bloodInventoryService
                        .releaseReservation(
                                authentication.getName(),
                                unitId
                        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{unitId}/issue")
    public ResponseEntity<BloodInventoryUnitResponse> issueInventoryUnit(
            Authentication authentication,
            @PathVariable Long unitId,
            @Valid @RequestBody IssueBloodUnitRequest request
    ) {
        BloodInventoryUnitResponse response =
                bloodInventoryService
                        .issueUnit(
                                authentication.getName(),
                                unitId,
                                request
                        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{unitId}/discard")
    public ResponseEntity<BloodInventoryUnitResponse>
    discardInventoryUnit(
            Authentication authentication,
            @PathVariable Long unitId,
            @Valid @RequestBody DiscardBloodUnitRequest request
    ) {
        BloodInventoryUnitResponse response =
                bloodInventoryService
                        .discardUnit(
                                authentication.getName(),
                                unitId,
                                request
                        );

        return ResponseEntity.ok(response);
    }
}