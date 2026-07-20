package org.example.lifelink.service.hospital;

import lombok.RequiredArgsConstructor;
import org.example.lifelink.dao.donor.DonationEventRegistrationDao;
import org.example.lifelink.dao.donor.DonorDao;
import org.example.lifelink.dao.hospital.DonationEventDao;
import org.example.lifelink.dao.hospital.HospitalDao;
import org.example.lifelink.dto.AddressRequest;
import org.example.lifelink.dto.AddressResponse;
import org.example.lifelink.dto.hospital.event.*;
import org.example.lifelink.dto.hospital.inventory.EventInventorySourceResponse;
import org.example.lifelink.entity.Address;
import org.example.lifelink.entity.User;
import org.example.lifelink.entity.donor.Donor;
import org.example.lifelink.entity.hospital.Hospital;
import org.example.lifelink.entity.hospital.event.DonationEventRegistration;
import org.example.lifelink.entity.hospital.event.DonationEventRegistrationStatus;
import org.example.lifelink.entity.hospital.event.DonationEventStatus;
import org.example.lifelink.entity.hospital.event.DonationEvents;
import org.example.lifelink.service.common.DonationCompletionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.example.lifelink.service.donor.DonorEventService.COUNTED_REGISTRATION_STATUSES;


@Service
@RequiredArgsConstructor
public class DonationEventService {

    private static final int DEFAULT_LIMIT = 3;
    private static final int MAX_LIMIT = 6;
    private final DonationEventDao donationEventDao;
    private final DonationEventRegistrationDao registrationDao;
    private final HospitalDao hospitalDao;
    private final DonorDao donorDao;
    private final DonationCertificateService donationCertificateService;
    private final DonationCompletionService donationCompletionService;

    @Transactional
    public DonationEventResponse createDraft(
            String authenticatedEmail,
            DonationEventRequest request) {

        validateDraft(request);

        Hospital hospital = hospitalDao
                .findByUser_EmailIgnoreCase(authenticatedEmail)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Hospital profile was not found")
                );

        DonationEvents event = new DonationEvents();

        event.setHospital(hospital);
        event.setStatus(DonationEventStatus.DRAFT);
        applyRequest(event, request);
        DonationEvents savedEvent = donationEventDao.save(event);
        return responseDonationEvents(savedEvent);
    }

    @Transactional
    public DonationEventResponse updateDraft(
            String authenticatedEmail,
            Long eventId,
            DonationEventRequest request) {

        validateDraft(request);
        DonationEvents event = findOwnedEvent(eventId, authenticatedEmail);
        ensureDraft(event);
        applyRequest(event, request);
        DonationEvents savedEvent = donationEventDao.save(event);
        return responseDonationEvents(savedEvent);
    }

    @Transactional
    public DonationEventResponse createAndPublish(
            String authenticatedEmail,
            DonationEventRequest request) {

        validateForPublish(request);

        Hospital hospital = hospitalDao
                .findByUser_EmailIgnoreCase(authenticatedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Hospital profile was not found"));
        DonationEvents event = new DonationEvents();

        event.setHospital(hospital);
        event.setStatus(DonationEventStatus.PUBLISHED);
        event.setPublishedAt(LocalDateTime.now());
        applyRequest(event, request);
        DonationEvents savedEvent = donationEventDao.save(event);
        return responseDonationEvents(savedEvent);
    }

    @Transactional
    public DonationEventResponse publishDraft(
            String authenticatedEmail,
            Long eventId,
            DonationEventRequest request) {

        validateForPublish(request);
        DonationEvents event = findOwnedEvent(eventId, authenticatedEmail);
        ensureDraft(event);
        applyRequest(event, request);
        event.setStatus(DonationEventStatus.PUBLISHED);
        event.setPublishedAt(LocalDateTime.now());
        DonationEvents savedEvent = donationEventDao.save(event);
        return responseDonationEvents(savedEvent);
    }


    @Transactional(readOnly = true)
    public List<DonationEventResponse> getMyEvents(String authenticatedEmail) {

        return donationEventDao
                .findAllByHospital_User_EmailIgnoreCaseOrderByCreatedAtDesc(authenticatedEmail)
                .stream()
                .map(this::responseDonationEvents)
                .toList();
    }

    @Transactional(readOnly = true)
    public DonationEventResponse getMyEvent(
            String authenticatedEmail,
            Long eventId) {

        DonationEvents event = findOwnedEvent(eventId, authenticatedEmail);
        return responseDonationEvents(event);
    }

    private DonationEvents findOwnedEvent(
            Long eventId,
            String authenticatedEmail) {

        return donationEventDao
                .findByIdAndHospital_User_EmailIgnoreCase(
                        eventId,
                        authenticatedEmail)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Donation event was not found"));
    }

    private void ensureDraft(DonationEvents event) {

        if (event.getStatus() !=
                DonationEventStatus.DRAFT) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only draft events can be edited");
        }
    }

    private void validateDraft(DonationEventRequest request) {

        if (request.eventTitle() == null ||
                request.eventTitle().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Event title is required before saving a draft");
        }
    }


    private void validateForPublish(DonationEventRequest request) {

        validateDraft(request);

        if (request.targetDonorCount() == null
                || request.targetDonorCount() < 1) {

            throw badRequest("Target donor count must be at least 1");
        }

        if (request.eventDate() == null) {

            throw badRequest("Event date is required");
        }

        if (request.eventDate().isBefore(LocalDate.now())) {

            throw badRequest("Event date cannot be in the past");
        }

        if (request.startTime() == null) {

            throw badRequest("Start time is required");
        }

        if (request.endTime() == null) {

            throw badRequest("End time is required");
        }

        if (!request.endTime().isAfter(request.startTime())) {
            throw badRequest("End time must be after start time");
        }

        if (request.registrationDeadline() == null) {
            throw badRequest("Registration deadline is required");
        }

        if (request.registrationDeadline()
                .isAfter(request.eventDate())) {

            throw badRequest("Registration deadline cannot be after the event date");
        }

        if (request.requiredBloodTypes() == null
                || request.requiredBloodTypes().isEmpty()) {

            throw badRequest("Select at least one blood type");
        }

        if (isBlank(request.contactPersonName())) {
            throw badRequest("Contact person name is required");
        }

        if (isBlank(request.contactPhone())) {
            throw badRequest("Contact phone is required");
        }

        if (request.address() == null) {
            throw badRequest("Event address is required");
        }

        if (isBlank(request.address().street())) {
            throw badRequest("Event street is required");
        }

        if (isBlank(request.address().township())) {
            throw badRequest("Event township is required");
        }

        if (isBlank(request.address().city())) {
            throw badRequest("Event city is required");
        }
    }

    private ResponseStatusException badRequest(String message) {

        return new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                message
        );
    }

    private void applyRequest(
            DonationEvents event,
            DonationEventRequest request) {

        event.setEventTitle(request.eventTitle());
        event.setTargetDonorCount(request.targetDonorCount());
        event.setDescription(request.description());
        event.setEventDate(request.eventDate());
        event.setStartTime(request.startTime());
        event.setEndTime(request.endTime());
        event.setRegistrationDeadline(request.registrationDeadline());
        event.setRequiredBloodTypes(request.requiredBloodTypes() == null
                ? new HashSet<>()
                : new HashSet<>(
                request.requiredBloodTypes()));
        event.setContactPersonName(request.contactPersonName());
        event.setContactPhone(request.contactPhone());
        event.setAddress(mapAddress(request.address()));
    }

    private Address mapAddress(AddressRequest request) {
        Address address = new Address();
        address.setStreet(request.street());
        address.setTownship(request.township());
        address.setCity(request.city());
        return address;
    }

    private DonationEventResponse responseDonationEvents(DonationEvents event) {

        long registeredDonorCount = registrationDao
                .countByDonationEvent_IdAndStatusIn(
                        event.getId(),
                        COUNTED_REGISTRATION_STATUSES);

        return new DonationEventResponse(
                event.getId(),
                event.getHospital().getHospitalName(),
                event.getEventTitle(),
                event.getTargetDonorCount(),
                event.getDescription(),
                event.getEventDate(),
                event.getStartTime(),
                event.getEndTime(),
                event.getRegistrationDeadline(),
                event.getRequiredBloodTypes() ==
                        null
                        ? Collections.emptySet()
                        : new HashSet<>(
                        event.getRequiredBloodTypes()),
                event.getContactPersonName(),
                event.getContactPhone(),
                mapAddressResponse(event.getAddress()),
                event.getStatus(),
                registeredDonorCount,
                event.getStatus() == DonationEventStatus.DRAFT,
                event.getCreatedAt(),
                event.getUpdatedAt(),
                event.getPublishedAt()
        );
    }


    @Transactional(readOnly = true)
    public List<RegisteredEventDonorResponse> getRegisteredDonors(
            String authenticatedEmail,
            Long eventId) {

        DonationEvents event = findOwnedEvent(eventId, authenticatedEmail);

        return registrationDao
                .findAllByDonationEvent_IdOrderByRegisteredAtAsc(event.getId())
                .stream()
                .map(this::registeredEventDonorsResponse)
                .toList();
    }


    private RegisteredEventDonorResponse registeredEventDonorsResponse(DonationEventRegistration registration) {

        Donor donor = registration.getDonor();
        User user = donor.getUser();

        return new RegisteredEventDonorResponse(
                registration.getId(),
                donor.getId(),
                donor.getDonorCode(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                donor.getBloodType(),
                registration.getStatus(),
                registration.getRegisteredAt(),
                registration.getCancelledAt(),
                registration.getCompletedAt(),
                registration.getNoShowAt(),
                registration.getDeferredAt(),
                registration.getDeferralReason(),
                registration.getOutcomeNote()
        );
    }

    @Transactional
    public DonationEventResponse updatePublishedEvent(
            String hospitalEmail,
            Long eventId,
            DonationEventRequest request) {

        DonationEvents event = findOwnedEvent(eventId, hospitalEmail);

        if (event.getStatus() != DonationEventStatus.PUBLISHED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only published events can be updated using this operation");
        }

        validateForPublish(request);
        long registeredDonorCount = registrationDao
                .countByDonationEvent_IdAndStatusIn(
                        eventId,
                        COUNTED_REGISTRATION_STATUSES
                );

        if (request.targetDonorCount() == null
                || request.targetDonorCount()
                < registeredDonorCount) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Target donor count cannot be lower than the current registered donor count");
        }

        LocalDateTime originalPublishedAt = event.getPublishedAt();
        applyRequest(event, request);
        event.setStatus(DonationEventStatus.PUBLISHED);
        event.setPublishedAt(originalPublishedAt);

        DonationEvents savedEvent = donationEventDao.save(event);

        return responseDonationEvents(savedEvent);
    }

    @Transactional
    public RegisteredEventDonorResponse completeDonation(
            String authenticatedEmail,
            Long eventId,
            Long registrationId) {

        DonationEventRegistration registration = findOwnedRegistration(
                authenticatedEmail,
                eventId,
                registrationId);

        if (registration.getStatus()
                != DonationEventRegistrationStatus.REGISTERED) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only registered donors can be marked as completed");
        }

        DonationEvents event = registration.getDonationEvent();
        ensureEventHasStarted(event);
        Donor donor = registration.getDonor();

        if (donor == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Donor profile was not found");
        }

        registration.completeDonation();
        DonationEventRegistration savedRegistration = registrationDao.save(registration);

        LocalDate donationDate = event.getEventDate() != null
                ? event.getEventDate()
                : LocalDate.now();


        donationCompletionService.recordCompletedDonation(
                donor,
                donationDate
        );


        donationCertificateService.createForCompletedRegistration(savedRegistration);

        return mapRegisteredDonorResponse(savedRegistration);
    }

    private RegisteredEventDonorResponse mapRegisteredDonorResponse(DonationEventRegistration registration) {

        Donor donor = registration.getDonor();
        if (donor == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Donor profile was not found"
            );
        }

        User user = donor.getUser();
        if (user == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Donor user account was not found"
            );
        }

        return new RegisteredEventDonorResponse(
                registration.getId(),
                donor.getId(),
                donor.getDonorCode(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                donor.getBloodType(),
                registration.getStatus(),
                registration.getRegisteredAt(),
                registration.getCancelledAt(),
                registration.getCompletedAt(),
                registration.getNoShowAt(),
                registration.getDeferredAt(),
                registration.getDeferralReason(),
                registration.getOutcomeNote()
        );
    }

    private void ensureEventHasStarted(DonationEvents event) {
        if (event == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Donation event was not found"
            );
        }

        if (event.getStatus() != DonationEventStatus.PUBLISHED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only published events can record completed donations");
        }

        if (event.getEventDate() == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Event date is not configured");
        }

        if (event.getStartTime() == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Event start time is not configured");
        }

        LocalDateTime eventStart = LocalDateTime.of(
                event.getEventDate(),
                event.getStartTime());

        if (LocalDateTime.now().isBefore(eventStart)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Donation cannot be completed before the event starts"
            );
        }
    }

    @Transactional
    public RegisteredEventDonorResponse markNoShow(
            String authenticatedEmail,
            Long eventId,
            Long registrationId) {

        DonationEventRegistration registration = findOwnedRegistration(
                authenticatedEmail,
                eventId,
                registrationId);

        ensureEventEnded(registration.getDonationEvent());
        registration.markNoShow();

        DonationEventRegistration saved = registrationDao.save(registration);
        return registeredEventDonorsResponse(saved);
    }

    @Transactional
    public RegisteredEventDonorResponse deferDonation(
            String authenticatedEmail,
            Long eventId,
            Long registrationId,
            DeferDonationRequest request) {

        DonationEventRegistration registration = findOwnedRegistration(
                authenticatedEmail,
                eventId,
                registrationId);

        registration.deferDonation(
                request.reason(),
                request.note());

        DonationEventRegistration saved = registrationDao.save(registration);

        return registeredEventDonorsResponse(saved);
    }

    private DonationEventRegistration findOwnedRegistration(
            String authenticatedEmail,
            Long eventId,
            Long registrationId) {

        DonationEventRegistration registration = registrationDao
                .findById(registrationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Registration was not found"
                ));

        DonationEvents event = registration.getDonationEvent();
        boolean eventMatches = event.getId().equals(eventId);
        boolean hospitalOwnsEvent = event.getHospital()
                .getUser()
                .getEmail()
                .equalsIgnoreCase(authenticatedEmail);

        if (!eventMatches || !hospitalOwnsEvent) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Registration was not found");
        }

        return registration;
    }

    private void ensureEventEnded(DonationEvents event) {

        if (event.getEventDate() == null || event.getEndTime() == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Event date and end time are not configured");
        }

        LocalDateTime eventEndDateTime = LocalDateTime.of(
                event.getEventDate(),
                event.getEndTime());

        if (LocalDateTime.now().isBefore(eventEndDateTime)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "The event has not ended yet");
        }
    }

    @Transactional(readOnly = true)
    public Page<EventInventorySourceResponse> getInventorySourceRegistrations(
            String authenticatedEmail,
            String search,
            int page,
            int size) {

        Hospital hospital = hospitalDao
                .findByUser_EmailIgnoreCase(
                        authenticatedEmail)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Hospital profile was not found"));

        int safePage = Math.max(page, 0);

        int safeSize = Math.min(Math.max(size, 1), 20);

        String normalizedSearch = search == null ? "" : search.trim();

        Pageable pageable = PageRequest.of(safePage, safeSize);

        return registrationDao
                .findCompletedRegistrationsAvailableForInventory(
                        hospital.getId(),
                        DonationEventRegistrationStatus.COMPLETED,
                        normalizedSearch,
                        pageable)
                .map(this::mapInventorySourceRegistration);
    }

    private EventInventorySourceResponse mapInventorySourceRegistration(DonationEventRegistration registration) {

        DonationEvents event = registration.getDonationEvent();
        Donor donor = registration.getDonor();
        User user = donor == null ? null : donor.getUser();

        return new EventInventorySourceResponse(

                registration.getId(),
                event == null ? null : event.getId(),
                event == null ? "" : event.getEventTitle(),
                donor == null ? null : donor.getId(),
                donor == null ? "" : donor.getDonorCode(),
                user == null ? "" : user.getFullName(),
                user == null ? "" : user.getEmail(),
                donor == null ? null : donor.getBloodType(),
                event == null ? null : event.getEventDate(),
                registration.getCompletedAt());
    }

    @Transactional(readOnly = true)
    public List<PublicDonationEventResponse> getCurrentEvents(int requestedLimit) {

        int safeLimit = requestedLimit < 1
                ? DEFAULT_LIMIT
                : Math.min(requestedLimit, MAX_LIMIT);

        return donationEventDao
                .findAllByStatusAndEventDateGreaterThanEqualOrderByEventDateAsc(
                        DonationEventStatus.PUBLISHED,
                        LocalDate.now()
                )
                .stream()
                .limit(safeLimit)
                .map(this::responsePublicDonationEvents)
                .toList();
    }

    private PublicDonationEventResponse responsePublicDonationEvents(DonationEvents event) {

        Address address = event.getAddress();

        return new PublicDonationEventResponse(

                event.getId(),
                event.getHospital() == null ? "" : event.getHospital().getHospitalName(),
                event.getEventTitle(),
                event.getDescription(),
                event.getEventDate(),
                event.getStartTime(),
                event.getEndTime(),
                event.getRequiredBloodTypes() == null
                        ? Set.of()
                        : Set.copyOf(
                        event.getRequiredBloodTypes()),
                address == null ? "" : address.getStreet(),
                address == null ? "" : address.getTownship(),
                address == null ? "" : address.getCity(),
                event.getTargetDonorCount()
        );
    }

    private AddressResponse mapAddressResponse(Address address) {

        if (address == null)
            return new AddressResponse("", "", "");

        return new AddressResponse(
                address.getCity(),
                address.getTownship(),
                address.getStreet());
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}