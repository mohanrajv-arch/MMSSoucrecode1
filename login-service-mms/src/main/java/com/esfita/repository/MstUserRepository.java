package com.esfita.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.esfita.entity.MstUserHib;

@Repository
public interface MstUserRepository extends JpaRepository<MstUserHib, Integer> {
	Optional<MstUserHib> findByEmailId(String email);

	@Query("select m from MstUserHib m where m.userType = ?1 and m.status = 'A' order by m.firstName asc")
	List<MstUserHib> forUserDropdown(int typeFk);
}
