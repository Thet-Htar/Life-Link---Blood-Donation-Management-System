package org.example.lifelink.entity.hospital.event;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.lifelink.entity.Address;
import org.example.lifelink.entity.BloodType;
import org.example.lifelink.entity.IdClass;
import org.example.lifelink.entity.hospital.Hospital;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "donation_events",
        indexes = {
                @Index(
                        name = "idx_donation_event_hospital",
                        columnList = "hospital_id"
                ),
                @Index(
                        name = "idx_donation_event_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_donation_event_date",
                        columnList = "event_date"
                ),
                @Index(
                        name = "idx_donation_event_location",
                        columnList = "event_city,event_township"
                )
        }
)
public class DonationEvents extends IdClass {

    @ManyToOne(fetch = FetchType.LAZY,
            optional = false)
    @JoinColumn(name = "hospital_id",
            nullable = false)
    private Hospital hospital;

    @Column(name = "event_title",
            nullable = false,
            length = 200)
    private String eventTitle;

    @Column(name = "target_donor_count")
    private Integer targetDonorCount;

    @Lob
    @Column(name = "description")
    private String description;

    @Column(name = "event_date")
    private LocalDate eventDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "registration_deadline")
    private LocalDate registrationDeadline;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "donation_event_blood_types",
            joinColumns = @JoinColumn(
                    name = "donation_event_id"
            )
    )

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_type",
            nullable = false,
            length = 30)
    private Set<BloodType> requiredBloodTypes =
            new HashSet<>();

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(
                    name = "street",
                    column = @Column(
                            name = "event_street",
                            length = 255
                    )
            ),
            @AttributeOverride(
                    name = "township",
                    column = @Column(
                            name = "event_township",
                            length = 100
                    )
            ),
            @AttributeOverride(
                    name = "city",
                    column = @Column(
                            name = "event_city",
                            length = 100
                    )
            )
    })
    private Address address;

    @Column(name = "contact_person_name",
            length = 150
    )
    private String contactPersonName;

    @Column(name = "contact_phone",
            length = 30
    )
    private String contactPhone;

    @Enumerated(EnumType.STRING)
    @Column(name = "status",
            nullable = false,
            length = 20
    )
    private DonationEventStatus status =
            DonationEventStatus.DRAFT;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Version
    private Long version;

    @PrePersist
    private void beforeInsert() {
        if (status == null) {
            status =
                    DonationEventStatus.DRAFT;
        }

        if (requiredBloodTypes == null) {
            requiredBloodTypes =
                    new HashSet<>();
        }
    }
}