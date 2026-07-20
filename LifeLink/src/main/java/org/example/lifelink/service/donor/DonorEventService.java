package org.example.lifelink.service.donor;

import lombok.RequiredArgsConstructor;
import org.example.lifelink.dao.donor.DonationEventRegistrationDao;
import org.example.lifelink.dao.donor.DonorDao;
import org.example.lifelink.dao.hospital.DonationEventDao;
import org.example.lifelink.dto.donor.event.DonorEventMatchType;
import org.example.lifelink.dto.donor.event.DonorEventRegistrationResponse;
import org.example.lifelink.dto.donor.event.DonorEventResponse;
import org.example.lifelink.entity.Address;
import org.example.lifelink.entity.User;
import org.example.lifelink.entity.donor.Donor;
import org.example.lifelink.entity.hospital.event.DonationEventRegistration;
import org.example.lifelink.entity.hospital.event.DonationEventRegistrationStatus;
import org.example.lifelink.entity.hospital.event.DonationEventStatus;
import org.example.lifelink.entity.hospital.event.DonationEvents;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class DonorEventService {

    public static final Set<DonationEventRegistrationStatus> COUNTED_REGISTRATION_STATUSES =
            EnumSet.of(DonationEventRegistrationStatus.REGISTERED,
                    DonationEventRegistrationStatus.COMPLETED);

    private final DonationEventDao donationEventDao;
    private final DonationEventRegistrationDao registrationDao;
    private final DonorDao donorDao;

    @Transactional(readOnly = true)
    public List<DonorEventResponse> getRecommendedEvents(String authenticatedEmail) {

        Donor donor = findAuthenticatedDonor(authenticatedEmail);
        LocalDate today = LocalDate.now();

        List<DonationEvents> events = donationEventDao
                .findAllByStatusAndEventDateGreaterThanEqualAndRegistrationDeadlineGreaterThanEqualOrderByEventDateAsc(
                        DonationEventStatus.PUBLISHED,
                        today,
                        today
                );

        return events.stream()
                .filter(event -> hasMatchingBloodType(event, donor))
                .map(event -> mapEventResponse(event, donor))
                .sorted(Comparator.comparingInt((DonorEventResponse response) -> matchPriority(response.matchType()))
                        .thenComparing(DonorEventResponse::eventDate, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(DonorEventResponse::startTime, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    @Transactional(readOnly = true)
    public DonorEventResponse getEventDetail(
            String authenticatedEmail,
            Long eventId) {
        Donor donor = findAuthenticatedDonor(authenticatedEmail);

        DonationEvents event = donationEventDao
                .findByIdAndStatus(eventId,
                        DonationEventStatus.PUBLISHED)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Published donation event was not found"));

        validateEventVisibleToDonor(event, donor);
        return mapEventResponse(event, donor);
    }

    @Transactional
    public DonorEventRegistrationResponse registerForEvent(
            String authenticatedEmail,
            Long eventId) {

        Donor donor = findAuthenticatedDonor(authenticatedEmail);
        validateDonorAccount(donor);

        DonationEvents event = donationEventDao
                .findByIdForRegistration(eventId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Donation event was not found"));

        validateEventForRegistration(event, donor);

        DonationEventRegistration existingRegistration = registrationDao
                .findByDonationEvent_IdAndDonor_Id(
                        event.getId(),
                        donor.getId())
                .orElse(null);

        if (existingRegistration != null) {
            if (existingRegistration.getStatus() == DonationEventRegistrationStatus.REGISTERED) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "You are already registered for this event");
            }
            if (existingRegistration.getStatus() == DonationEventRegistrationStatus.COMPLETED) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "This donation was already completed");
            }
        }

        long registeredCount = countRegisteredDonors(event.getId());
        int targetDonorCount = getTargetDonorCount(event);

        if (registeredCount >= targetDonorCount) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Registration capacity is full");
        }

        DonationEventRegistration registration;

        if (existingRegistration != null &&
                existingRegistration.getStatus() == DonationEventRegistrationStatus.CANCELLED) {

            existingRegistration.reactivateRegistration();
            registration = existingRegistration;
        } else {
            registration = new DonationEventRegistration();
            registration.setDonationEvent(event);
            registration.setDonor(donor);
            registration.setStatus(DonationEventRegistrationStatus.REGISTERED);
        }

        DonationEventRegistration saved = registrationDao.save(registration);
        return mapRegistrationResponse(saved);
    }


    @Transactional(readOnly = true)
    public List<DonorEventRegistrationResponse> getMyRegistrations(String authenticatedEmail) {
        Donor donor = findAuthenticatedDonor(authenticatedEmail);

        return registrationDao
                .findAllByDonor_IdOrderByRegisteredAtDesc(donor.getId())
                .stream()
                .map(this::mapRegistrationResponse)
                .toList();
    }

    private Donor findAuthenticatedDonor(String authenticatedEmail) {

        return donorDao.findByUser_EmailIgnoreCase(authenticatedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Donor profile was not found"));
    }

    private void validateDonorAccount(Donor donor) {

        User user = donor.getUser();

        if (user == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Donor user account was not found");
        }
        if (!user.isEnabled()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account is not enabled");
        }
        if (user.isAccountLocked()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account is locked");
        }
        if (!donor.isEligible()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You are currently not eligible to register for a donation event");
        }
    }

    private void validateEventVisibleToDonor(DonationEvents event, Donor donor) {

        LocalDate today = LocalDate.now();

        if (event.getEventDate() == null || event.getEventDate().isBefore(today)) {
            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "This donation event has already ended");
        }
        if (event.getRegistrationDeadline() == null || event.getRegistrationDeadline().isBefore(today)) {
            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "Registration deadline has passed");
        }
        if (!hasMatchingBloodType(event, donor)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your blood type does not match this event");
        }
    }

    private void validateEventForRegistration(DonationEvents event, Donor donor) {

        if (event.getStatus() != DonationEventStatus.PUBLISHED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only published events accept registrations");
        }

        LocalDate today = LocalDate.now();

        if (event.getEventDate() == null || event.getEventDate().isBefore(today)) {
            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "This donation event has already ended");
        }
        if (event.getRegistrationDeadline() == null || event.getRegistrationDeadline().isBefore(today)) {
            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "Registration deadline has passed");
        }
        if (!hasMatchingBloodType(event, donor)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your blood type does not match this event");
        }
        if (event.getTargetDonorCount() == null || event.getTargetDonorCount() < 1) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This event does not have a valid donor capacity");
        }
    }

    private boolean hasMatchingBloodType(DonationEvents event, Donor donor) {

        return event.getRequiredBloodTypes() != null
                && donor.getBloodType() != null
                && event.getRequiredBloodTypes().contains(donor.getBloodType());
    }

    private long countRegisteredDonors(Long eventId) {
        return registrationDao.countByDonationEvent_IdAndStatusIn(
                eventId,
                COUNTED_REGISTRATION_STATUSES);
    }

    private int getTargetDonorCount(DonationEvents event) {

        if (event.getTargetDonorCount() == null) {
            return 0;
        }
        return Math.max(event.getTargetDonorCount(), 0);
    }

    private DonorEventResponse mapEventResponse(DonationEvents event, Donor donor) {

        long registeredCount = countRegisteredDonors(event.getId());
        int targetDonorCount = getTargetDonorCount(event);
        long remainingSlots = Math.max(targetDonorCount - registeredCount, 0);

        boolean alreadyRegistered = registrationDao
                .findByDonationEvent_IdAndDonor_Id(
                        event.getId(),
                        donor.getId())
                .map(registration ->
                        registration.getStatus() == DonationEventRegistrationStatus.REGISTERED
                                || registration.getStatus() == DonationEventRegistrationStatus.COMPLETED)
                .orElse(false);

        Address address = event.getAddress();

        return new DonorEventResponse(
                event.getId(),
                nullToEmpty(event.getEventTitle()),
                nullToEmpty(event.getDescription()),
                event.getHospital() == null ? "" : nullToEmpty(event.getHospital().getHospitalName()),
                event.getEventDate(),
                event.getStartTime(),
                event.getEndTime(),
                event.getRegistrationDeadline(),
                event.getRequiredBloodTypes() == null ? Set.of() : Set.copyOf(event.getRequiredBloodTypes()),
                nullToEmpty(event.getContactPersonName()),
                nullToEmpty(event.getContactPhone()),
                address == null ? "" : nullToEmpty(address.getStreet()),
                address == null ? "" : nullToEmpty(address.getTownship()),
                address == null ? "" : nullToEmpty(address.getCity()),
                targetDonorCount,
                registeredCount,
                remainingSlots,
                remainingSlots == 0,
                alreadyRegistered,
                determineMatchType(donor, event)
        );
    }

    private DonorEventRegistrationResponse mapRegistrationResponse(DonationEventRegistration registration) {

        DonationEvents event = registration.getDonationEvent();
        Address address = event.getAddress();

        return new DonorEventRegistrationResponse(
                registration.getId(),
                event.getId(),
                nullToEmpty(event.getEventTitle()),
                event.getHospital() == null ? "" : nullToEmpty(event.getHospital().getHospitalName()),
                event.getEventDate(),
                event.getStartTime(),
                event.getEndTime(),
                address == null ? "" : nullToEmpty(address.getStreet()),
                address == null ? "" : nullToEmpty(address.getTownship()),
                address == null ? "" : nullToEmpty(address.getCity()),
                registration.getStatus(),
                registration.getRegisteredAt(),
                registration.getCancelledAt(),
                registration.getCompletedAt()
        );
    }

    private DonorEventMatchType determineMatchType(Donor donor, DonationEvents event) {

        Address donorAddress = donor.getUser() == null ? null : donor.getUser().getAddress();
        Address eventAddress = event.getAddress();

        if (donorAddress == null || eventAddress == null) {
            return DonorEventMatchType.OTHER_CITY;
        }

        boolean sameCity = equalLocation(donorAddress.getCity(), eventAddress.getCity());
        boolean sameTownship = equalLocation(donorAddress.getTownship(), eventAddress.getTownship());

        if (sameCity && sameTownship) {
            return DonorEventMatchType.SAME_TOWNSHIP;
        }

        return sameCity ? DonorEventMatchType.SAME_CITY : DonorEventMatchType.OTHER_CITY;
    }

    private int matchPriority(DonorEventMatchType matchType) {
        return switch (matchType) {
            case SAME_TOWNSHIP -> 1;
            case SAME_CITY -> 2;
            case OTHER_CITY -> 3;
        };
    }

    private boolean equalLocation(String first, String second) {
        if (first == null || second == null) {
            return false;
        }
        return first.trim().equalsIgnoreCase(second.trim());
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    @Transactional
    public DonorEventRegistrationResponse cancelRegistration(String authenticatedEmail, Long eventId) {

        Donor donor = findAuthenticatedDonor(authenticatedEmail);

        DonationEventRegistration registration = registrationDao
                .findByDonationEvent_IdAndDonor_Id(
                        eventId,
                        donor.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Registration was not found"));

        if (registration.getStatus() != DonationEventRegistrationStatus.REGISTERED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    getCancellationConflictMessage(registration.getStatus()));
        }

        DonationEvents event = registration.getDonationEvent();
        LocalDate today = LocalDate.now();

        if (event.getRegistrationDeadline() != null && event.getRegistrationDeadline().isBefore(today)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "The registration deadline has already passed"
            );
        }

        if (event.getEventDate() != null && !event.getEventDate().isAfter(today)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Registration cannot be cancelled on or after the event date");
        }

        registration.cancelRegistration();
        DonationEventRegistration savedRegistration = registrationDao.save(registration);
        return mapRegistrationResponse(savedRegistration);
    }

    private String getCancellationConflictMessage(DonationEventRegistrationStatus status) {

        return switch (status) {
            case COMPLETED -> "Completed donations cannot be cancelled";
            case CANCELLED -> "This registration has already been cancelled";
            case NO_SHOW -> "No-show registrations cannot be cancelled";
            case DEFERRED -> "Deferred registrations cannot be cancelled";
            default -> "This registration cannot be cancelled";
        };
    }
}