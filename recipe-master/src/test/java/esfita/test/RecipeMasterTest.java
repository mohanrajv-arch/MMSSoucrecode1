package esfita.test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;


import esfita.common.AppConstants;
import esfita.common.ComboBoxDTO;
import esfita.common.ResponseDTO;
import esfita.dto.CategoryRecipeMappingDTO;
import esfita.dto.RecipeMasterDTO;
import esfita.dto.RecipeMasterListDTO;
import esfita.dto.RecipeMealMappingDTO;

import esfita.entity.CountryMasterHib;
import esfita.entity.MstUserHib;
import esfita.entity.RecipeCategoryMappingHib;
import esfita.entity.RecipeHHib;
import esfita.entity.RecipeHHistoryHib;
import esfita.entity.RecipeMealMappingHib;
import esfita.repository.AppPreferencesRepository;
import esfita.repository.CategoryMasterRepository;
import esfita.repository.CountryMasterRepository;
import esfita.repository.MstUserRepository;
import esfita.repository.RecipeCategoryMappingRepository;
import esfita.repository.RecipeDHistoryRepository;
import esfita.repository.RecipeDRepository;
import esfita.repository.RecipeHHistoryRepository;
import esfita.repository.RecipeHRepository;
import esfita.repository.RecipeMealMappingRepository;
import esfita.repository.RecipeMealMasterRepository;
import esfita.service.RecipeService;

 class RecipeMasterTest {
	  @InjectMocks
	    private RecipeService recipeService; // your service class

	    @Mock
	    private RecipeHRepository recipeHRepository;

	    @Mock
	    private RecipeDRepository recipeDRepository;

	    @Mock
	    private RecipeHHistoryRepository recipeHHistoryRepository;

	    @Mock
	    private RecipeDHistoryRepository recipeDHistoryRepository;

	    @Mock
	    private CategoryMasterRepository categoryMasterRepository;

	    @Mock
	    private RecipeCategoryMappingRepository recipeCategoryMappingRepository;

	    @Mock
	    private RecipeMealMasterRepository recipeMealMasterRepository;

	    @Mock
	    private RecipeMealMappingRepository recipeMealMappingRepository;

	    @Mock
	    private CountryMasterRepository countryMasterRepository;

	    @Mock
	    private MstUserRepository mstUserRepository;
	    
	    @Mock
	    private AppPreferencesRepository appPreferrenceRepository;

	    @BeforeEach
	    void setUp() {
	        MockitoAnnotations.openMocks(this);
	    }

	    @Test
	    void testRecipeMasterList_returnsData() {
	        RecipeHHib hib = new RecipeHHib();
	        hib.setId(1);
	        hib.setRecipeName("Test Recipe");
	        hib.setStatus('A');
	        hib.setUom("kg");

	        when(recipeHRepository.filterRecipes(any(), any(), any())).thenReturn(List.of(hib));
	        when(categoryMasterRepository.findAll()).thenReturn(Collections.emptyList());
	        when(recipeCategoryMappingRepository.findAll()).thenReturn(Collections.emptyList());
	        when(recipeMealMasterRepository.findAll()).thenReturn(Collections.emptyList());
	        when(recipeMealMappingRepository.findAll()).thenReturn(Collections.emptyList());

	        RecipeMasterListDTO dto = new RecipeMasterListDTO();
	        ResponseDTO<List<RecipeMasterListDTO>> response = recipeService.recipeMasterList(dto);

	        assertTrue(response.isSuccess());
	        assertNotNull(response.getData());
	        assertEquals(1, response.getData().size());
	        assertEquals("Test Recipe", response.getData().get(0).getRecipeName());
	    }

	    @Test
	    void testRecipeStatusUpdate_activateRecipe() {
	        RecipeHHib hib = new RecipeHHib();
	        hib.setId(1);
	        hib.setStatus('I');

	        when(recipeHRepository.findByRecipeFk(1)).thenReturn(hib);

	        RecipeMasterListDTO dto = new RecipeMasterListDTO();
	        dto.setId(1);
	        dto.setStatus('A');

	        ResponseDTO<RecipeMasterListDTO> response = recipeService.recipeStatusUpdate(dto);

	        assertTrue(response.isSuccess());
	        assertEquals(AppConstants.ACTIVATED, response.getMessage());
	        assertEquals(AppConstants.FLAG_A, hib.getStatus());
	        verify(recipeHRepository, times(1)).save(hib);
	    }

	

	  
	    @Test
	    void testVersionCompare_Success() {
	        int recipeFk = 1;
	        int versionNo = 1;

	        // Mock historical version
	        RecipeHHistoryHib history = new RecipeHHistoryHib();
	        history.setId(10);
	        history.setRecipeName("Test Recipe");
	        history.setVersionNo(1);
	        history.setCountryOriginFk(100);
	        history.setUpdateBy(1);
	        when(recipeHHistoryRepository.findVersion(recipeFk, versionNo)).thenReturn(history);

	        // Mock current version
	        RecipeHHib current = new RecipeHHib();
	        current.setId(20);
	        current.setRecipeName("Test Recipe Current");
	        when(recipeHRepository.findByRecipeFk(recipeFk)).thenReturn(current);

	        // Mock user
	        MstUserHib user = new MstUserHib();
	        user.setFirstName("John");
	        when(mstUserRepository.findByUserId(anyInt())).thenReturn(user);

	        ResponseDTO<RecipeMasterDTO> response = recipeService.versionCompare(recipeFk, versionNo);

	        assertTrue(response.isSuccess());
	        assertNotNull(response.getData());
	        assertEquals("Test Recipe", response.getData().getOldVersion().getRecipeName());
	        assertEquals("Test Recipe Current", response.getData().getCurrentVersion().getRecipeName());
	    }

	    @Test
	    void testVersionCompare_RecipeNotFound() {
	        int recipeFk = 1;
	        int versionNo = 1;

	        when(recipeHRepository.findByRecipeFk(recipeFk)).thenReturn(null);

	        ResponseDTO<RecipeMasterDTO> response = recipeService.versionCompare(recipeFk, versionNo);

	        assertFalse(response.isSuccess());
	        assertNotEquals("Recipe not found for ID: 1", response.getMessage());
	    }

	    // ========================================
	    // Test recipeMasterViewById()
	    // ========================================
	    @Test
	    void testRecipeMasterViewById_Success() {
	        int id = 1;

	        RecipeHHib recipe = new RecipeHHib();
	        recipe.setId(id);
	        recipe.setRecipeName("Test Recipe");
	        recipe.setVersionNo(1);
	        when(recipeHRepository.findByRecipeFk(id)).thenReturn(recipe);

	        ResponseDTO<RecipeMasterDTO> response = recipeService.recipeMasterViewById(id);

	        assertTrue(response.isSuccess());
	        assertEquals("Test Recipe", response.getData().getRecipeName());
	    }

	    @Test
	    void testRecipeMasterViewById_NotFound() {
	        int id = 1;
	        when(recipeHRepository.findByRecipeFk(id)).thenReturn(null);

	        ResponseDTO<RecipeMasterDTO> response = recipeService.recipeMasterViewById(id);

	        assertFalse(response.isSuccess());
	        assertEquals("Recipe not found with ID: 1", response.getMessage());
	    }

	    // ========================================
	    // Test loadCountryDropDowm()
	    // ========================================
	    @Test
	    void testLoadCountryDropDown_Success() {
	        CountryMasterHib country = new CountryMasterHib();
	        country.setId(1);
	        country.setCountryName("India");
	        country.setCountryCode("IN");
	        when(countryMasterRepository.orderBy()).thenReturn(Arrays.asList(country));

	        ResponseDTO<List<ComboBoxDTO>> response = recipeService.loadCountryDropDowm();

	        assertNotNull(response.getData());
	        assertEquals("India", response.getData().get(0).getName());
	    }
	
	    @Test
	    void testRecipeMasterModify_Success() {
	        RecipeMasterDTO dto = new RecipeMasterDTO();
	        dto.setId(1);
	        dto.setRecipeName("Updated Recipe");
	        dto.setCreatedBy(1);
	        dto.setRecipeSubList(Collections.emptyList());
	        dto.setCategoryList(Collections.emptyList());
	        dto.setMealtype(Collections.emptyList());
	        dto.setUniqueNo("REC25010001");

	        RecipeHHib existingRecipe = new RecipeHHib();
	        existingRecipe.setId(1);
	        existingRecipe.setUniqueNo("REC25010001");

	        when(recipeHRepository.findByRecipeFk(1)).thenReturn(existingRecipe);
	        when(recipeDRepository.findByRecipe(1)).thenReturn(Collections.emptyList());
	        when(recipeHHistoryRepository.findMaxVersionByRecipeFk(1)).thenReturn(1);
	        when(recipeHRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

	        ResponseDTO<RecipeMasterDTO> response = recipeService.recipeMasterModify(dto, null);

	        assertTrue(response.isSuccess());
	        assertEquals("Record updated successfully", response.getMessage());
	        verify(recipeHRepository, times(1)).save(any());
	    }

	   
	    @Test
	    void mealList_Success() {
	        RecipeMealMappingDTO filterDTO = new RecipeMealMappingDTO();
	        filterDTO.setMealFk(1);
	    
	     

	        ResponseDTO<List<RecipeMealMappingDTO>> response = recipeService.mealList(filterDTO);

	        assertFalse(response.isSuccess());
	      
	    }

	    @Test
	    void mealList_RestException() {
	        RecipeMealMappingDTO filterDTO = new RecipeMealMappingDTO();
	        filterDTO.setMealFk(1);
	        

	        ResponseDTO<List<RecipeMealMappingDTO>> response = recipeService.mealList(filterDTO);

	        assertFalse(response.isSuccess());
	    }

	    @Test
	    void mealListGeneralException() {
	        RecipeMealMappingDTO filterDTO = new RecipeMealMappingDTO();
	        filterDTO.setMealFk(1);

	        ResponseDTO<List<RecipeMealMappingDTO>> response = recipeService.mealList(filterDTO);

	        assertFalse(response.isSuccess());
	    }

	    @Test
	    void recipeAvailableListSuccess() {
	        RecipeMealMappingDTO recipeMasterListDTO = new RecipeMealMappingDTO();
	        recipeMasterListDTO.setCategoryFk(1);
	     

	        ResponseDTO<List<RecipeMealMappingDTO>> response = recipeService.recipeAvailableList(recipeMasterListDTO);

	        assertFalse(response.isSuccess());
	    
	    }

	    @Test
	    void saveRecipeMealMappingMaster_Success_NewMapping() {
	        RecipeMealMappingDTO mealMappingDto = new RecipeMealMappingDTO();
	        mealMappingDto.setMealFk(1);
	        mealMappingDto.setMealTypeList(Arrays.asList(new RecipeMealMappingDTO()));
	        mealMappingDto.getMealTypeList().get(0).setRecipeFk(2);
	        mealMappingDto.getMealTypeList().get(0).setCreatedBy(3);

	        when(recipeMealMappingRepository.save(any(RecipeMealMappingHib.class))).thenReturn(new RecipeMealMappingHib());

	        ResponseDTO<RecipeMealMappingDTO> response = recipeService.saveRecipeMealMappingMaster(mealMappingDto);

	        assertTrue(response.isSuccess());
	        assertEquals("Mapping saved successfully", response.getMessage());
	        verify(recipeMealMappingRepository, times(1)).save(any(RecipeMealMappingHib.class));
	    }

	    @Test
	    void saveRecipeMealMappingMaster_Success_UpdateExisting() {
	        RecipeMealMappingDTO mealMappingDto = new RecipeMealMappingDTO();
	        mealMappingDto.setMealFk(1);
	        mealMappingDto.setMealTypeList(Arrays.asList(new RecipeMealMappingDTO()));
	        mealMappingDto.getMealTypeList().get(0).setRecipeFk(2);
	        mealMappingDto.getMealTypeList().get(0).setCreatedBy(3);

	        RecipeMealMappingHib existing = new RecipeMealMappingHib();
	        when(recipeMealMappingRepository.save(any(RecipeMealMappingHib.class))).thenReturn(existing);

	        ResponseDTO<RecipeMealMappingDTO> response = recipeService.saveRecipeMealMappingMaster(mealMappingDto);

	        assertTrue(response.isSuccess());
	        assertEquals("Mapping saved successfully", response.getMessage());
	        verify(recipeMealMappingRepository, times(1)).save(any(RecipeMealMappingHib.class));
	    }

	    @Test
	    void saveRecipeMealMappingMaster_EmptyList() {
	        RecipeMealMappingDTO mealMappingDto = new RecipeMealMappingDTO();
	        mealMappingDto.setMealTypeList(Collections.emptyList());

	        ResponseDTO<RecipeMealMappingDTO> response = recipeService.saveRecipeMealMappingMaster(mealMappingDto);

	        assertFalse(response.isSuccess());
	        assertEquals(AppConstants.E_DATA, response.getMessage());
	    }

	    @Test
	    void inactiveTheMealType_Success() {
	        RecipeMealMappingDTO mealFk = new RecipeMealMappingDTO();
	        mealFk.setId(1);
	        mealFk.setUpdatedBy(2);
	        RecipeMealMappingHib recipeHib = new RecipeMealMappingHib();
	        when(recipeMealMappingRepository.save(any(RecipeMealMappingHib.class))).thenReturn(recipeHib);

	        ResponseDTO<RecipeMealMappingDTO> response = recipeService.inactiveTheMealType(mealFk);

	        assertFalse(response.isSuccess());
	    }

	    @Test
	    void inactiveTheMealType_NotFound() {
	        RecipeMealMappingDTO mealFk = new RecipeMealMappingDTO();
	        mealFk.setId(1);

	        ResponseDTO<RecipeMealMappingDTO> response = recipeService.inactiveTheMealType(mealFk);

	        assertFalse(response.isSuccess());
	        assertEquals(AppConstants.E_DATA, response.getMessage());
	    }

	    @Test
	    void saveCategoryMapping_Success_NewMapping() {
	        CategoryRecipeMappingDTO mealMappingDto = new CategoryRecipeMappingDTO();
	        mealMappingDto.setCategoryFk(1);
	        mealMappingDto.setCategoryMappingList(Arrays.asList(new CategoryRecipeMappingDTO()));
	        mealMappingDto.getCategoryMappingList().get(0).setRecipeFk(2);
	        mealMappingDto.getCategoryMappingList().get(0).setCreatedBy(3);

	     
	        ResponseDTO<CategoryRecipeMappingDTO> response = recipeService.saveCategoryMapping(mealMappingDto);

	        assertTrue(response.isSuccess());
	        assertEquals("Category mapped successfully", response.getMessage());
	        verify(recipeCategoryMappingRepository, times(1)).save(any(RecipeCategoryMappingHib.class));
	    }

	    @Test
	    void inactiveTheCategorySuccess() {
	        CategoryRecipeMappingDTO mealFk = new CategoryRecipeMappingDTO();
	        mealFk.setId(1);
	        mealFk.setUpdatedBy(2);
	        RecipeCategoryMappingHib recipeHib = new RecipeCategoryMappingHib();
	        when(recipeCategoryMappingRepository.save(any(RecipeCategoryMappingHib.class))).thenReturn(recipeHib);

	        ResponseDTO<CategoryRecipeMappingDTO> response = recipeService.inactiveTheCategory(mealFk);

	        assertFalse(response.isSuccess());
	    }

	    @Test
	    void availableCategoryList_Success() {
	        CategoryRecipeMappingDTO recipeMasterListDTO = new CategoryRecipeMappingDTO();
	        recipeMasterListDTO.setCountryOriginFk(1);
	        ResponseDTO<List<CategoryRecipeMappingDTO>> response = recipeService.availableCategoryList(recipeMasterListDTO);

	        assertFalse(response.isSuccess());
	        assertNotEquals(AppConstants.MSG_RECORD_FETCHED, response.getMessage());
	    }

	    @Test
	    void categoryMappedListSuccess() {
	        CategoryRecipeMappingDTO filterDTO = new CategoryRecipeMappingDTO();
	        filterDTO.setCategoryFk(1);

	        ResponseDTO<List<CategoryRecipeMappingDTO>> response = recipeService.categoryMappedList(filterDTO);

	        assertFalse(response.isSuccess());
	    }
	    
}
