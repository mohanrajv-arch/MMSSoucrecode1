package esfita.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import esfita.entity.MstUserHib;

public interface MstUserRepository extends JpaRepository<MstUserHib, Integer> {
	
}
