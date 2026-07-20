package org.example.lifelink.dao.hospital;

import org.example.lifelink.dto.admin.AdminHospitalResponse;
import org.example.lifelink.entity.VerificationStatus;
import org.example.lifelink.entity.hospital.Hospital;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface  HospitalDao extends JpaRepository<Hospital,Long> {

    Optional<Hospital> findByUser_EmailIgnoreCase(String email);

    @Query(
            value = """
                select new org.example.lifelink.dto.admin.AdminHospitalResponse(
                    hospital.id,
                    user.id,
                    hospital.hospitalName,
                    hospital.hospitalLicenseCode,
                    hospital.representativeStaffName,
                    user.email,
                    verification.status,
                    user.accountLocked,
                    hospital.createdAt,
                    verification.verifiedAt,
                    verification.remarks
                )
                from Hospital hospital
                join hospital.user user
                left join Verification verification
                    on verification.user.id = user.id
                where (
                    :search = ''
                    or lower(hospital.hospitalName)
                        like lower(concat('%', :search, '%'))
                    or lower(hospital.hospitalLicenseCode)
                        like lower(concat('%', :search, '%'))
                    or lower(hospital.representativeStaffName)
                        like lower(concat('%', :search, '%'))
                    or lower(user.email)
                        like lower(concat('%', :search, '%'))
                )
                and (
                    :status is null
                    or verification.status = :status
                )
                order by hospital.createdAt desc
                """,

            countQuery = """
                select count(hospital)
                from Hospital hospital
                join hospital.user user
                left join Verification verification
                    on verification.user.id = user.id
                where (
                    :search = ''
                    or lower(hospital.hospitalName)
                        like lower(concat('%', :search, '%'))
                    or lower(hospital.hospitalLicenseCode)
                        like lower(concat('%', :search, '%'))
                    or lower(hospital.representativeStaffName)
                        like lower(concat('%', :search, '%'))
                    or lower(user.email)
                        like lower(concat('%', :search, '%'))
                )
                and (
                    :status is null
                    or verification.status = :status
                )
                """
    )
    Page<AdminHospitalResponse> searchForAdmin(
            @Param("search")
            String search,

            @Param("status")
            VerificationStatus status,

            Pageable pageable
    );
}
