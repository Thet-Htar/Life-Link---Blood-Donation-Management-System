package org.example.lifelink.dao.donor;

import org.example.lifelink.entity.donor.Donor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DonorDao extends JpaRepository<Donor, Long> {

    boolean existsByDonorCode(String donorCode);

    Optional<Donor> findByUserEmail(String email);

    @EntityGraph(attributePaths = {"user"})
    Optional<Donor> findByUser_EmailIgnoreCase(String email);

    @Query(
            value = """
                    select donor
                    from Donor donor
                    join donor.user user
                    where (
                        :search = ''
                        or lower(user.fullName)
                            like lower(concat('%', :search, '%'))
                        or lower(user.email)
                            like lower(concat('%', :search, '%'))
                        or lower(donor.donorCode)
                            like lower(concat('%', :search, '%'))
                    )
                    order by user.createdAt desc
                    """,

            countQuery = """
                    select count(donor)
                    from Donor donor
                    join donor.user user
                    where (
                        :search = ''
                        or lower(user.fullName)
                            like lower(concat('%', :search, '%'))
                        or lower(user.email)
                            like lower(concat('%', :search, '%'))
                        or lower(donor.donorCode)
                            like lower(concat('%', :search, '%'))
                    )
                    """
    )
    Page<Donor> searchForAdmin(
            @Param("search") String search,
            Pageable pageable
    );
}
