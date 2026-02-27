package esfita.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import esfita.entity.MstItemCategoryHib;

@Repository
public interface MstItemCategoryRepository extends JpaRepository<MstItemCategoryHib, String> {

}