package esfita.service.MenuSimulation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import esfita.dto.ComboBoxDTO;
import esfita.dto.MenuSimulationDTO;
import esfita.dto.ResponseDTO;
import esfita.entity.MstCategoryMasterHib;
import esfita.entity.RecipeMealMasterHib;
import esfita.repository.CountryMasterRepository;
import esfita.repository.ItemCategoryMasterRepository;
import esfita.repository.MstCategoryMasterRepository;
import esfita.repository.RecipeCategoryMappingRepository;
import esfita.repository.RecipeDRepository;
import esfita.repository.RecipeHRepository;
import esfita.repository.RecipeMealMappingRepository;
import esfita.repository.RecipeMealMasterRepository;
import esfita.service.MenuSimulationService;

class MenuSimulationServiceTest {

	@InjectMocks
	private MenuSimulationService service;

	@Mock
	private RecipeMealMasterRepository recipeMealMasterRepository;
	@Mock
	private MstCategoryMasterRepository mstCategoryMasterRepository;
	@Mock
	private RecipeMealMappingRepository recipeMealMappingRepository;
	@Mock
	private RecipeCategoryMappingRepository recipeCategoryMappingRepository;
	@Mock
	private CountryMasterRepository countryMasterRepository;
	@Mock
	private RecipeHRepository recipeHRepository;
	@Mock
	private RecipeDRepository recipeDRepository;
	@Mock
	private ItemCategoryMasterRepository itemCategoryMasterRepository;

	@BeforeEach
	void setup() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void testRecipeList_NoData() {
		when(recipeHRepository.filterRecipeEnquiry(any())).thenReturn(Collections.emptyList());

		ResponseDTO<List<MenuSimulationDTO>> response = service.recipeList(new MenuSimulationDTO());

		assertFalse(response.isSuccess());
	}

	@Test
	void testRecipeList_Exception() {
		when(recipeHRepository.filterRecipeEnquiry(any())).thenThrow(new RuntimeException("error"));

		ResponseDTO<List<MenuSimulationDTO>> response = service.recipeList(new MenuSimulationDTO());

		assertFalse(response.isSuccess());
	}

	@Test
	void testLoadMealTypeDropDown_Success() {
		RecipeMealMasterHib hib = new RecipeMealMasterHib();
		hib.setId(1);
		hib.setRecipeMealName("Breakfast");
		hib.setRecipeMealCode("BRK");

		when(recipeMealMasterRepository.orderBy()).thenReturn(List.of(hib));

		ResponseDTO<List<ComboBoxDTO>> response = service.loadMealTypeDropDown();

		assertTrue(response.isSuccess());
		assertEquals(1, response.getData().size());
	}

	@Test
	void testLoadCategoryDropDown_Success() {
		MstCategoryMasterHib hib = new MstCategoryMasterHib();
		hib.setId(1);
		hib.setCategoryName("Cat");
		hib.setCategoryCode("C1");

		when(mstCategoryMasterRepository.orderBy()).thenReturn(List.of(hib));

		ResponseDTO<List<ComboBoxDTO>> response = service.loadCategoryDropDown();

		assertTrue(response.isSuccess());
	}

	@SuppressWarnings("deprecation")
	@Test
	void testExportMenuSimulationExcel_Success() {
		MenuSimulationDTO dto = new MenuSimulationDTO();

		ResponseEntity<byte[]> resp = service.exportMenuSimulationExcel(dto);

		assertEquals(200, resp.getStatusCodeValue());
		assertNotNull(resp.getBody());
	}

	@SuppressWarnings("deprecation")
	@Test
	void testExportMenuSimulationExcel_Exception() {
		// passing null triggers exception path safely
		ResponseEntity<byte[]> resp = service.exportMenuSimulationExcel(null);

		assertEquals(500, resp.getStatusCodeValue());
	}
}
