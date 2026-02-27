package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import esfita.entity.MstLocationUserMappingHib;

@Repository
public interface MstLocationUserMappingRepository extends JpaRepository<MstLocationUserMappingHib, Integer> {

	@Query("select m from MstLocationUserMappingHib m where m.userId = :userFk and m.status = 'A'")
	List<MstLocationUserMappingHib> findLocation(@Param("userFk") int userFk);

}
