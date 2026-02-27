package esfita.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import esfita.entity.AppPreferences;

public interface AppPreferencesRepository  extends JpaRepository<AppPreferences, Integer>{
	@Query("select ap from AppPreferences ap ")
	AppPreferences findAppPreferencesByEntityID();
}
