package esfita.repositoy;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import esfita.entity.MstUserTypeHib;

@Repository
public interface MstUserTypeRepository extends JpaRepository<MstUserTypeHib, Integer> {

}
