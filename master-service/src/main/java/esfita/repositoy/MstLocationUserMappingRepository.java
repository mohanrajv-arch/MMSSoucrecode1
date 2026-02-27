package esfita.repositoy;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import esfita.entity.MstLocationUserMappingHib;

@Repository
public interface MstLocationUserMappingRepository extends JpaRepository<MstLocationUserMappingHib, Integer> {

	@Query("select m from MstLocationUserMappingHib m where m.userId = :userFk and m.locationFk = :locationFk and m.status = 'A'")
	MstLocationUserMappingHib findActiveMapping(@Param("userFk") int userFk, @Param("locationFk") int locationFk);

}
