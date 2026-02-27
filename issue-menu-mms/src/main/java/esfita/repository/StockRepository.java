package esfita.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import esfita.entity.StockHib;



@Repository
public interface StockRepository  extends JpaRepository<StockHib, Integer> {
	
	
	
}