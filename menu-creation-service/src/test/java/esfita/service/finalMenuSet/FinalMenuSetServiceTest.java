package esfita.service.finalMenuSet;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import esfita.dto.ComboBoxDTO;
import esfita.dto.FinalMenuSetDTO;
import esfita.dto.ResponseDTO;
import esfita.entity.FinalSetMenuDHib;
import esfita.entity.FinalSetMenuHHib;
import esfita.entity.FinalSetMenuIHib;
import esfita.entity.FinalSetMenuMHib;
import esfita.entity.MealSetMenuDHib;
import esfita.entity.MealSetMenuHHib;
import esfita.entity.MealSetMenuIHib;
import esfita.entity.MealSetTemplateDHib;
import esfita.entity.MealSetTemplateHHib;
import esfita.entity.MstCategoryMasterHib;
import esfita.entity.MstUserHib;
import esfita.entity.RecipeDHib;
import esfita.entity.RecipeHHib;
import esfita.entity.RecipeMealMasterHib;
import esfita.repository.FinalSetMenuDRepository;
import esfita.repository.FinalSetMenuHRepository;
import esfita.repository.FinalSetMenuIRepository;
import esfita.repository.FinalSetMenuMRepository;
import esfita.repository.MealSetMenuDRepository;
import esfita.repository.MealSetMenuHRepository;
import esfita.repository.MealSetMenuIRepository;
import esfita.repository.MealSetTemplateDRepository;
import esfita.repository.MealSetTemplateHRepository;
import esfita.repository.MstCategoryMasterRepository;
import esfita.repository.MstUserRepository;
import esfita.repository.RecipeDRepository;
import esfita.repository.RecipeHRepository;
import esfita.repository.RecipeMealMasterRepository;
import esfita.service.FinalMenuSetService;
import esfita.utils.AppConstants;
import esfita.utils.RestException;

@ExtendWith(MockitoExtension.class)
class FinalMenuSetServiceTest {

	@Mock
	private MealSetTemplateHRepository mealSetTemplateHRepository;

	@Mock
	private MealSetTemplateDRepository mealSetTemplateDRepository;

	@Mock
	private MstUserRepository mstUserRepository;

	@Mock
	private RecipeMealMasterRepository recipeMealMasterRepository;

	@Mock
	private MstCategoryMasterRepository mstCategoryMasterRepository;

	@Mock
	private MealSetMenuDRepository mealSetMenuDRepository;

	@Mock
	private MealSetMenuHRepository mealSetMenuHRepository;

	@Mock
	private MealSetMenuIRepository mealSetMenuIRepository;

	@Mock
	private RecipeHRepository recipeHRepository;

	@Mock
	private RecipeDRepository recipeDRepository;

	@Mock
	private FinalSetMenuDRepository finalSetMenuDRepository;

	@Mock
	private FinalSetMenuMRepository finalSetMenuMRepository;

	@Mock
	private FinalSetMenuHRepository finalSetMenuHRepository;

	@Mock
	private FinalSetMenuIRepository finalSetMenuIRepository;

	@InjectMocks
	private FinalMenuSetService finalMenuSetService;

	private FinalMenuSetDTO finalMenuSetDTO;
	private FinalSetMenuMHib finalSetMenuMHib;
	private FinalSetMenuHHib finalSetMenuHHib;
	private FinalSetMenuDHib finalSetMenuDHib;
	private FinalSetMenuIHib finalSetMenuIHib;
	private MealSetMenuHHib mealSetMenuHHib;
	private MealSetMenuDHib mealSetMenuDHib;
	private MealSetMenuIHib mealSetMenuIHib;
	private RecipeHHib recipeHHib;
	private RecipeDHib recipeDHib;
	private RecipeMealMasterHib recipeMealMasterHib;
	private MealSetTemplateHHib mealSetTemplateHHib;
	private MealSetTemplateDHib mealSetTemplateDHib;
	private MstUserHib mstUserHib;
	private MstCategoryMasterHib mstCategoryMasterHib;

	@BeforeEach
	void setUp() {
		// Setup entities
		finalMenuSetDTO = new FinalMenuSetDTO();
		finalMenuSetDTO.setId(1);
		finalMenuSetDTO.setMenuName("Test Final Menu");
		finalMenuSetDTO.setMealTypeFk(1);
		finalMenuSetDTO.setCreatedBy(1);
		finalMenuSetDTO.setLastActBy(1);
		finalMenuSetDTO.setTotalCost(1000.0);
		finalMenuSetDTO.setTotalRecipeCount(10);
		finalMenuSetDTO.setNotes("Test Notes");
		finalMenuSetDTO.setNewMenuName("Copied Menu");

		finalSetMenuMHib = new FinalSetMenuMHib();
		finalSetMenuMHib.setId(1);
		finalSetMenuMHib.setName("Test Final Menu");
		finalSetMenuMHib.setNotes("Test Notes");
		finalSetMenuMHib.setTotal(1000.0);
		finalSetMenuMHib.setTotalRecipeCount(10);
		finalSetMenuMHib.setMealTypeFk(1);
		finalSetMenuMHib.setStatus(AppConstants.FLAG_A);
		finalSetMenuMHib.setApprovalStatus(3);
		finalSetMenuMHib.setCreatedBy(1);
		finalSetMenuMHib.setApprovedBy(2);
		finalSetMenuMHib.setCreatedDateTime(new Date());
		finalSetMenuMHib.setLastActDateTime(new Date());

		finalSetMenuHHib = new FinalSetMenuHHib();
		finalSetMenuHHib.setId(1);
		finalSetMenuHHib.setFinalMenuFk(1);
		finalSetMenuHHib.setMenuFk(2);
		finalSetMenuHHib.setMealTypeFk(1);
		finalSetMenuHHib.setMealTypeName("Breakfast");
		finalSetMenuHHib.setTemplateFk(1);
		finalSetMenuHHib.setTemplateName("Test Template");
		finalSetMenuHHib.setMenuName("Test Menu");
		finalSetMenuHHib.setCategoryCount(2);
		finalSetMenuHHib.setRecipeCount(5);
		finalSetMenuHHib.setTotalCost(500.0);
		finalSetMenuHHib.setStatus(AppConstants.FLAG_A);
		finalSetMenuHHib.setApprovalStatus(3);
		finalSetMenuHHib.setCreatedBy(1);
		finalSetMenuHHib.setCreatedDateTime(new Date());

		finalSetMenuDHib = new FinalSetMenuDHib();
		finalSetMenuDHib.setId(1);
		finalSetMenuDHib.setFinalMenuFk(1);
		finalSetMenuDHib.setMenuFk(2);
		finalSetMenuDHib.setRecipeFk(1);
		finalSetMenuDHib.setRecipeName("Test Recipe");
		finalSetMenuDHib.setCategoryFk(1);
		finalSetMenuDHib.setCategoryName("Main Course");
		finalSetMenuDHib.setPerPortionCost(20.0);
		finalSetMenuDHib.setPortionSize(2.0);
		finalSetMenuDHib.setUom("kg");
		finalSetMenuDHib.setBaseQuantity(1.0);
		finalSetMenuDHib.setStatus(AppConstants.FLAG_A);

		finalSetMenuIHib = new FinalSetMenuIHib();
		finalSetMenuIHib.setId(1);
		finalSetMenuIHib.setFinalMenuFk(1);
		finalSetMenuIHib.setMenuFk(2);
		finalSetMenuIHib.setMenuDFk(1);
		finalSetMenuIHib.setRecipeFk(1);
		finalSetMenuIHib.setItemFk(1);
		finalSetMenuIHib.setItemName("Test Item");
		finalSetMenuIHib.setBaseQuantity(0.5);
		finalSetMenuIHib.setStatus(AppConstants.FLAG_A);

		mealSetMenuHHib = new MealSetMenuHHib();
		mealSetMenuHHib.setId(2);
		mealSetMenuHHib.setMenuName("Test Menu");
		mealSetMenuHHib.setMealTypeFk(1);
		mealSetMenuHHib.setMealTypeName("Breakfast");
		mealSetMenuHHib.setTemplateFk(1);
		mealSetMenuHHib.setTemplateName("Test Template");
		mealSetMenuHHib.setTotalCost(500.0);
		mealSetMenuHHib.setCategoryCount(2);
		mealSetMenuHHib.setRecipeCount(5);
		mealSetMenuHHib.setStatus(AppConstants.FLAG_A);
		mealSetMenuHHib.setApprovalStatus(3);

		mealSetMenuDHib = new MealSetMenuDHib();
		mealSetMenuDHib.setId(1);
		mealSetMenuDHib.setMenuFk(2);
		mealSetMenuDHib.setRecipeFk(1);
		mealSetMenuDHib.setRecipeName("Test Recipe");
		mealSetMenuDHib.setCategoryFk(1);
		mealSetMenuDHib.setCategoryName("Main Course");
		mealSetMenuDHib.setPerPortionCost(20.0);
		mealSetMenuDHib.setPortionSize(2.0);
		mealSetMenuDHib.setUom("kg");
		mealSetMenuDHib.setBaseQuantity(1.0);
		mealSetMenuDHib.setStatus(AppConstants.FLAG_A);

		mealSetMenuIHib = new MealSetMenuIHib();
		mealSetMenuIHib.setId(1);
		mealSetMenuIHib.setMenuFk(2);
		mealSetMenuIHib.setMenuDFk(1);
		mealSetMenuIHib.setRecipeFk(1);
		mealSetMenuIHib.setItemFk(1);
		mealSetMenuIHib.setItemName("Test Item");
		mealSetMenuIHib.setBaseQuantity(0.5);
		mealSetMenuIHib.setStatus(AppConstants.FLAG_A);

		recipeHHib = new RecipeHHib();
		recipeHHib.setId(1);
		recipeHHib.setRecipeName("Test Recipe");
		recipeHHib.setPerPortionCost(20.0);
		recipeHHib.setPortionSize(2.0);
		recipeHHib.setUom("kg");
		recipeHHib.setUniqueNo("R001");
		recipeHHib.setRefNo("REF001");
		recipeHHib.setTotalCost(100.0);
		recipeHHib.setBaseQuantity(1.0);
		recipeHHib.setImageUrl("image.jpg");
		recipeHHib.setFinishedProduct(15.0);
		recipeHHib.setCookingInstruction("Cook well");

		recipeDHib = new RecipeDHib();
		recipeDHib.setId(1);
		recipeDHib.setRecipeFk(1);
		recipeDHib.setItemFk(1);
		recipeDHib.setItemName("Test Item");
		recipeDHib.setCategoryFk(1);
		recipeDHib.setCategoryName("Ingredients");
		recipeDHib.setBaseQuantity(0.5);
		recipeDHib.setSecondaryQuantity(500.0);
		recipeDHib.setTotal(10.0);

		recipeMealMasterHib = new RecipeMealMasterHib();
		recipeMealMasterHib.setId(1);
		recipeMealMasterHib.setRecipeMealName("Breakfast");
		recipeMealMasterHib.setRecipeMealCode("BRK");

		mealSetTemplateHHib = new MealSetTemplateHHib();
		mealSetTemplateHHib.setId(1);
		mealSetTemplateHHib.setTemplateName("Test Template");
		mealSetTemplateHHib.setMealTypeFk(1);
		mealSetTemplateHHib.setMealTypeName("Breakfast");

		mealSetTemplateDHib = new MealSetTemplateDHib();
		mealSetTemplateDHib.setId(1);
		mealSetTemplateDHib.setTemplateFk(1);
		mealSetTemplateDHib.setCategoryFk(1);
		mealSetTemplateDHib.setCategoryName("Main Course");
		mealSetTemplateDHib.setRecipesRequired(2);

		mstUserHib = new MstUserHib();
		mstUserHib.setUserPk(1);
		mstUserHib.setFirstName("John");
		mstUserHib.setLastName("Doe");

		mstCategoryMasterHib = new MstCategoryMasterHib();
		mstCategoryMasterHib.setId(1);
		mstCategoryMasterHib.setCategoryName("Main Course");
		mstCategoryMasterHib.setCategoryCode("MC");
	}

	// ================================
	// Test Constructor and Serialization
	// ================================
	@Test
	void testConstructor() {
		FinalMenuSetService service = new FinalMenuSetService(mealSetTemplateHRepository, mealSetTemplateDRepository,
				mstUserRepository, recipeMealMasterRepository, mstCategoryMasterRepository, mealSetMenuDRepository,
				mealSetMenuHRepository, mealSetMenuIRepository, recipeHRepository, recipeDRepository,
				finalSetMenuDRepository, finalSetMenuMRepository, finalSetMenuHRepository, finalSetMenuIRepository);
		assertNotNull(service);
		assertNotNull(service.getClass().getAnnotation(org.springframework.stereotype.Service.class));
	}

	@Test
	void testSerialVersionUID() throws NoSuchFieldException, SecurityException {
		assertNotNull(FinalMenuSetService.class.getDeclaredField("serialVersionUID"));
	}

	// ================================
	// Test loadMealTypeDropDown
	// ================================
	@Test
	void testLoadMealTypeDropDown_Success() {
		// Given
		List<RecipeMealMasterHib> mealList = Arrays.asList(recipeMealMasterHib);
		when(recipeMealMasterRepository.orderBy()).thenReturn(mealList);

		// When
		ResponseDTO<List<ComboBoxDTO>> response = finalMenuSetService.loadMealTypeDropDown();

		// Then
		assertTrue(response.isSuccess());
		assertNotNull(response.getData());
		assertEquals(1, response.getData().size());
		assertEquals("Breakfast", response.getData().get(0).getName());
	}

	@Test
	void testLoadMealTypeDropDown_NullList() {
		// Given
		when(recipeMealMasterRepository.orderBy()).thenReturn(null);

		// When
		ResponseDTO<List<ComboBoxDTO>> response = finalMenuSetService.loadMealTypeDropDown();

		// Then
		assertFalse(response.isSuccess());
		assertEquals(AppConstants.E_DATA, response.getMessage());
	}

	@Test
	void testLoadMealTypeDropDown_RestException() {
		// Given
		when(recipeMealMasterRepository.orderBy()).thenThrow(new RestException("Test Rest Exception"));

		// When
		ResponseDTO<List<ComboBoxDTO>> response = finalMenuSetService.loadMealTypeDropDown();

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testLoadMealTypeDropDown_GeneralException() {
		// Given
		when(recipeMealMasterRepository.orderBy()).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<List<ComboBoxDTO>> response = finalMenuSetService.loadMealTypeDropDown();

		// Then
		assertFalse(response.isSuccess());
	}

	// ================================
	// Test getApproverName (private method)
	// ================================
	@Test
	void testGetApproverName_ThroughFinalMenuList() {

		FinalMenuSetDTO filterDto = new FinalMenuSetDTO();
		filterDto.setMealTypeFk(1);
		filterDto.setApprovalStatus(3);
		filterDto.setCreatedBy(1);

		List<FinalSetMenuMHib> mList = List.of(finalSetMenuMHib);

		when(finalSetMenuMRepository.findMByMealTypeAndApprovalStatus(1, 3)).thenReturn(mList);
		when(finalSetMenuHRepository.findActiveByMenuFks(anyList())).thenReturn(List.of(finalSetMenuHHib));

		when(mstUserRepository.findById(1)).thenReturn(Optional.of(mstUserHib)); // createdBy
		when(mstUserRepository.findById(2)).thenReturn(Optional.of(mstUserHib)); // approver

		// correct mock return type
		List<Object[]> summary = new ArrayList<>();
		summary.add(new Object[] { 10, 8, 2, 50.25 });
		when(finalSetMenuMRepository.getMenuSummary()).thenReturn(summary);

		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuList(filterDto);

		assertTrue(response.isSuccess());
		assertEquals("John", response.getData().getUserName());
	}

	@Test
	void testFinalMenuList_Success() {

		FinalMenuSetDTO filterDto = new FinalMenuSetDTO();
		filterDto.setMealTypeFk(1);
		filterDto.setApprovalStatus(3);
		filterDto.setCreatedBy(1);

		List<FinalSetMenuMHib> mList = List.of(finalSetMenuMHib);
		List<FinalSetMenuHHib> hList = List.of(finalSetMenuHHib);

		when(finalSetMenuMRepository.findMByMealTypeAndApprovalStatus(1, 3)).thenReturn(mList);
		when(finalSetMenuHRepository.findActiveByMenuFks(anyList())).thenReturn(hList);

		when(mstUserRepository.findById(1)).thenReturn(Optional.of(mstUserHib));
		when(mstUserRepository.findById(2)).thenReturn(Optional.of(mstUserHib));

		List<Object[]> summary = new ArrayList<>();
		summary.add(new Object[] { 10, 8, 2, 50.25 });
		when(finalSetMenuMRepository.getMenuSummary()).thenReturn(summary);

		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuList(filterDto);

		assertTrue(response.isSuccess());
		assertEquals(AppConstants.MSG_RECORD_FETCHED, response.getMessage());
		assertNotNull(response.getData());
		assertNotNull(response.getData().getFinalSetMenuList());
		assertEquals(1, response.getData().getFinalSetMenuList().size());
	}

	@Test
	void testFinalMenuList_EmptyMList() {
		// Given
		FinalMenuSetDTO filterDto = new FinalMenuSetDTO();
		filterDto.setMealTypeFk(1);
		filterDto.setApprovalStatus(3);

		when(finalSetMenuMRepository.findMByMealTypeAndApprovalStatus(1, 3)).thenReturn(Collections.emptyList());

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuList(filterDto);

		// Then
		assertFalse(response.isSuccess());
		assertEquals(AppConstants.EMPTY, response.getMessage());
	}

	@Test
	void testFinalMenuList_Exception() {
		// Given
		FinalMenuSetDTO filterDto = new FinalMenuSetDTO();
		when(finalSetMenuMRepository.findMByMealTypeAndApprovalStatus(anyInt(), anyInt()))
				.thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuList(filterDto);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testFinalMenuList_ApprovalStatusCases() {

		FinalMenuSetDTO filterDto = new FinalMenuSetDTO();
		filterDto.setMealTypeFk(1);
		filterDto.setApprovalStatus(3);
		filterDto.setCreatedBy(1);

		finalSetMenuMHib.setApprovalStatus(0);

		List<FinalSetMenuMHib> mList = List.of(finalSetMenuMHib);
		List<FinalSetMenuHHib> hList = List.of(finalSetMenuHHib);

		when(finalSetMenuMRepository.findMByMealTypeAndApprovalStatus(1, 3)).thenReturn(mList);
		when(finalSetMenuHRepository.findActiveByMenuFks(anyList())).thenReturn(hList);
		when(mstUserRepository.findById(anyInt())).thenReturn(Optional.of(mstUserHib));

		List<Object[]> summary = new ArrayList<>();
		summary.add(new Object[] { 10, 8, 2, 50.25 });
		when(finalSetMenuMRepository.getMenuSummary()).thenReturn(summary);

		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuList(filterDto);

		assertTrue(response.isSuccess());
		assertEquals(FinalMenuSetService.STATUS_APPROVED,
				response.getData().getFinalSetMenuList().get(0).getApprovalStatusStr());
	}

	@Test
	void testFinalMenuList_StatusCases() {

		FinalMenuSetDTO filterDto = new FinalMenuSetDTO();
		filterDto.setMealTypeFk(1);
		filterDto.setApprovalStatus(3);
		filterDto.setCreatedBy(1);

		finalSetMenuMHib.setStatus('I');

		List<FinalSetMenuMHib> mList = List.of(finalSetMenuMHib);
		List<FinalSetMenuHHib> hList = List.of(finalSetMenuHHib);

		when(finalSetMenuMRepository.findMByMealTypeAndApprovalStatus(1, 3)).thenReturn(mList);
		when(finalSetMenuHRepository.findActiveByMenuFks(anyList())).thenReturn(hList);
		when(mstUserRepository.findById(anyInt())).thenReturn(Optional.of(mstUserHib));

		List<Object[]> summary = new ArrayList<>();
		summary.add(new Object[] { 10, 8, 2, 50.25 });
		when(finalSetMenuMRepository.getMenuSummary()).thenReturn(summary);

		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuList(filterDto);

		assertTrue(response.isSuccess());
		assertEquals("Inactive", response.getData().getFinalSetMenuList().get(0).getStatusStr());
	}

	@Test
	void testFinalMenuList_DefaultStatus() {

		FinalMenuSetDTO filterDto = new FinalMenuSetDTO();
		filterDto.setMealTypeFk(1);
		filterDto.setApprovalStatus(3);
		filterDto.setCreatedBy(1);

		finalSetMenuMHib.setStatus('X');
		finalSetMenuMHib.setApprovalStatus(99);

		List<FinalSetMenuMHib> mList = List.of(finalSetMenuMHib);
		List<FinalSetMenuHHib> hList = List.of(finalSetMenuHHib);

		when(finalSetMenuMRepository.findMByMealTypeAndApprovalStatus(1, 3)).thenReturn(mList);
		when(finalSetMenuHRepository.findActiveByMenuFks(anyList())).thenReturn(hList);
		when(mstUserRepository.findById(anyInt())).thenReturn(Optional.of(mstUserHib));

		List<Object[]> summary = new ArrayList<>();
		summary.add(new Object[] { 10, 8, 2, 50.25 });
		when(finalSetMenuMRepository.getMenuSummary()).thenReturn(summary);

		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuList(filterDto);

		assertTrue(response.isSuccess());
		assertEquals(FinalMenuSetService.STATUS_UNKNOWN,
				response.getData().getFinalSetMenuList().get(0).getApprovalStatusStr());

		assertEquals(FinalMenuSetService.STATUS_UNKNOWN,
				response.getData().getFinalSetMenuList().get(0).getStatusStr());
	}

	@Test
	void testFinalMenuList_EmptySummary() {
		// Given
		FinalMenuSetDTO filterDto = new FinalMenuSetDTO();
		filterDto.setMealTypeFk(1);
		filterDto.setApprovalStatus(3);
		filterDto.setCreatedBy(1);

		List<FinalSetMenuMHib> mList = Arrays.asList(finalSetMenuMHib);
		List<FinalSetMenuHHib> hList = Arrays.asList(finalSetMenuHHib);

		when(finalSetMenuMRepository.findMByMealTypeAndApprovalStatus(1, 3)).thenReturn(mList);
		when(finalSetMenuHRepository.findActiveByMenuFks(anyList())).thenReturn(hList);
		when(mstUserRepository.findById(anyInt())).thenReturn(Optional.of(mstUserHib));
		when(finalSetMenuMRepository.getMenuSummary()).thenReturn(Collections.emptyList());

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuList(filterDto);

		// Then
		assertTrue(response.isSuccess());
		assertNotNull(response.getData());
	}

	// ================================
	// Test finalMenuListOld
	// ================================
	@Test
	void testFinalMenuListOld_Success() {

		// Given
		FinalMenuSetDTO filterDto = new FinalMenuSetDTO();
		filterDto.setMealTypeFk(1);
		filterDto.setApprovalStatus(3);

		// mock M table data
		List<FinalSetMenuMHib> mList = Arrays.asList(finalSetMenuMHib);

		// mock H table data
		List<FinalSetMenuHHib> hList = Arrays.asList(finalSetMenuHHib);

		when(finalSetMenuMRepository.findMByMealTypeAndApprovalStatus(1, 3)).thenReturn(mList);

		when(finalSetMenuHRepository.findActiveByMenuDFk(1)).thenReturn(hList);

		// ⭐ IMPORTANT FIX: List<Object[]> not List<Object>
		List<Object[]> summary = new ArrayList<>();
		summary.add(new Object[] { 10, 8, 2, 50.25 });

		when(finalSetMenuMRepository.getMenuSummary()).thenReturn(summary);

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuListOld(filterDto);

		// Then
		assertNotNull(response);
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.MSG_RECORD_FETCHED, response.getMessage());
		assertNotNull(response.getData());
	}

	@Test
	void testFinalMenuListOld_EmptyMList() {
		// Given
		FinalMenuSetDTO filterDto = new FinalMenuSetDTO();
		when(finalSetMenuMRepository.findMByMealTypeAndApprovalStatus(anyInt(), anyInt()))
				.thenReturn(Collections.emptyList());

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuListOld(filterDto);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testFinalMenuListOld_Exception() {
		// Given
		FinalMenuSetDTO filterDto = new FinalMenuSetDTO();
		when(finalSetMenuMRepository.findMByMealTypeAndApprovalStatus(anyInt(), anyInt()))
				.thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuListOld(filterDto);

		// Then
		assertFalse(response.isSuccess());
	}

	// ================================
	// Test finalSetMenuApprovalStatus
	// ================================
	@Test
	void testFinalSetMenuApprovalStatus_Success() {
		// Given
		FinalMenuSetDTO dto = new FinalMenuSetDTO();
		dto.setId(1);
		dto.setApprovalStatus(0);
		dto.setApproverBy(2);

		when(finalSetMenuMRepository.findById(1)).thenReturn(Optional.of(finalSetMenuMHib));
		when(finalSetMenuMRepository.save(any(FinalSetMenuMHib.class))).thenReturn(finalSetMenuMHib);

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalSetMenuApprovalStatus(dto);

		// Then
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.APPROVAL_STATUS, response.getMessage());
	}

	@Test
	void testFinalSetMenuApprovalStatus_NullDTO() {
		// Given
		FinalMenuSetDTO dto = null;

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalSetMenuApprovalStatus(dto);

		// Then
		assertFalse(response.isSuccess());
		assertEquals(AppConstants.E_DATA, response.getMessage());
	}

	@Test
	void testFinalSetMenuApprovalStatus_NotFound() {
		// Given
		FinalMenuSetDTO dto = new FinalMenuSetDTO();
		dto.setId(999);

		when(finalSetMenuMRepository.findById(999)).thenReturn(Optional.empty());

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalSetMenuApprovalStatus(dto);

		// Then
		assertFalse(response.isSuccess());
		assertEquals(AppConstants.EMPTY, response.getMessage());
	}

	@Test
	void testFinalSetMenuApprovalStatus_DataAccessException() {
		// Given
		FinalMenuSetDTO dto = new FinalMenuSetDTO();
		dto.setId(1);

		when(finalSetMenuMRepository.findById(1)).thenThrow(new DataAccessException("Test DA Exception") {
		});

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalSetMenuApprovalStatus(dto);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testFinalSetMenuApprovalStatus_RestException() {
		// Given
		FinalMenuSetDTO dto = new FinalMenuSetDTO();
		dto.setId(1);

		when(finalSetMenuMRepository.findById(1)).thenThrow(new RestException("Test Rest Exception"));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalSetMenuApprovalStatus(dto);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testFinalSetMenuApprovalStatus_GeneralException() {
		// Given
		FinalMenuSetDTO dto = new FinalMenuSetDTO();
		dto.setId(1);

		when(finalSetMenuMRepository.findById(1)).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalSetMenuApprovalStatus(dto);

		// Then
		assertFalse(response.isSuccess());
	}

	// ================================
	// Test finalMenuSetStatusUpdate
	// ================================
	@Test
	void testFinalMenuSetStatusUpdate_SuccessActivate() {
		// Given
		FinalMenuSetDTO dto = new FinalMenuSetDTO();
		dto.setId(1);
		dto.setStatus('A');

		when(finalSetMenuMRepository.findById(1)).thenReturn(Optional.of(finalSetMenuMHib));
		when(finalSetMenuMRepository.save(any(FinalSetMenuMHib.class))).thenReturn(finalSetMenuMHib);

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuSetStatusUpdate(dto);

		// Then
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.ACTIVATED, response.getMessage());
	}

	@Test
	void testFinalMenuSetStatusUpdate_SuccessDeactivate() {
		// Given
		FinalMenuSetDTO dto = new FinalMenuSetDTO();
		dto.setId(1);
		dto.setStatus('I');

		when(finalSetMenuMRepository.findById(1)).thenReturn(Optional.of(finalSetMenuMHib));
		when(finalSetMenuMRepository.save(any(FinalSetMenuMHib.class))).thenReturn(finalSetMenuMHib);

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuSetStatusUpdate(dto);

		// Then
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.INACTIVATED, response.getMessage());
	}

	@Test
	void testFinalMenuSetStatusUpdate_NotFound() {
		// Given
		FinalMenuSetDTO dto = new FinalMenuSetDTO();
		dto.setId(999);
		dto.setStatus('A');

		when(finalSetMenuMRepository.findById(999)).thenReturn(Optional.empty());

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuSetStatusUpdate(dto);

		// Then
		assertFalse(response.isSuccess());
		assertEquals(AppConstants.EMPTY, response.getMessage());
	}

	@Test
	void testFinalMenuSetStatusUpdate_NullDTO() {
		// Given
		FinalMenuSetDTO dto = null;

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuSetStatusUpdate(dto);

		// Then
		assertFalse(response.isSuccess());
		assertEquals(AppConstants.E_DATA, response.getMessage());
	}

	@Test
	void testFinalMenuSetStatusUpdate_IdZero() {
		// Given
		FinalMenuSetDTO dto = new FinalMenuSetDTO();
		dto.setId(0);

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuSetStatusUpdate(dto);

		// Then
		assertFalse(response.isSuccess());
		assertEquals(AppConstants.E_DATA, response.getMessage());
	}

	@Test
	void testFinalMenuSetStatusUpdate_RestException() {
		// Given
		FinalMenuSetDTO dto = new FinalMenuSetDTO();
		dto.setId(1);
		dto.setStatus('A');

		when(finalSetMenuMRepository.findById(1)).thenThrow(new RestException("Test Rest Exception"));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuSetStatusUpdate(dto);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testFinalMenuSetStatusUpdate_GeneralException() {
		// Given
		FinalMenuSetDTO dto = new FinalMenuSetDTO();
		dto.setId(1);
		dto.setStatus('A');

		when(finalSetMenuMRepository.findById(1)).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuSetStatusUpdate(dto);

		// Then
		assertFalse(response.isSuccess());
	}

	// ================================
	// Test finalMenuView
	// ================================
	@Test
	void testFinalMenuView_Success() {
		// Given
		when(finalSetMenuMRepository.findById(1)).thenReturn(Optional.of(finalSetMenuMHib));
		when(finalSetMenuHRepository.findActiveByMenuDFk(1)).thenReturn(Arrays.asList(finalSetMenuHHib));
		when(mstUserRepository.findById(1)).thenReturn(Optional.of(mstUserHib));
		when(mstUserRepository.findById(2)).thenReturn(Optional.of(mstUserHib));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuView(1);

		// Then
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.MSG_RECORD_FETCHED, response.getMessage());
		assertNotNull(response.getData());
		assertEquals("Test Final Menu", response.getData().getFinalMenuName());
	}

	@Test
	void testFinalMenuView_NotFound() {
		// Given
		when(finalSetMenuMRepository.findById(999)).thenReturn(Optional.empty());

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuView(999);

		// Then
		assertFalse(response.isSuccess());
		assertEquals(AppConstants.EMPTY, response.getMessage());
	}

	@Test
	void testFinalMenuView_Exception() {
		// Given
		when(finalSetMenuMRepository.findById(1)).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuView(1);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testFinalMenuView_ApprovalStatusCases() {
		// Given
		finalSetMenuMHib.setApprovalStatus(0); // Test APPROVED
		when(finalSetMenuMRepository.findById(1)).thenReturn(Optional.of(finalSetMenuMHib));
		when(finalSetMenuHRepository.findActiveByMenuDFk(1)).thenReturn(Arrays.asList(finalSetMenuHHib));
		when(mstUserRepository.findById(anyInt())).thenReturn(Optional.of(mstUserHib));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuView(1);

		// Then
		assertTrue(response.isSuccess());
		assertEquals(FinalMenuSetService.STATUS_APPROVED, response.getData().getApprovalStatusStr());
	}

	// ================================
	// Test finalMenuSetViewByMenu
	// ================================
	@Test
	void testFinalMenuSetViewByMenu_Success() {
		// Given
		when(finalSetMenuHRepository.findHeadersByMenuFk(1, 2)).thenReturn(finalSetMenuHHib);
		when(mstUserRepository.findById(anyInt())).thenReturn(Optional.of(mstUserHib));
		when(finalSetMenuDRepository.findByActCat(1, 2)).thenReturn(Arrays.asList(finalSetMenuDHib));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuSetViewByMenu(1, 2);

		// Then
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.MSG_RECORD_FETCHED, response.getMessage());
		assertNotNull(response.getData());
	}

	@Test
	void testFinalMenuSetViewByMenu_NotFound() {
		// Given
		when(finalSetMenuHRepository.findHeadersByMenuFk(1, 2)).thenReturn(null);

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuSetViewByMenu(1, 2);

		// Then
		assertFalse(response.isSuccess());
		assertTrue(response.getMessage().contains("not found"));
	}

	@Test
	void testFinalMenuSetViewByMenu_NullCategoryList() {
		// Given
		when(finalSetMenuHRepository.findHeadersByMenuFk(1, 2)).thenReturn(finalSetMenuHHib);
		when(mstUserRepository.findById(anyInt())).thenReturn(Optional.of(mstUserHib));
		when(finalSetMenuDRepository.findByActCat(1, 2)).thenReturn(null);

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuSetViewByMenu(1, 2);

		// Then
		assertTrue(response.isSuccess());
		assertNotNull(response.getData().getCategoryList());
		assertTrue(response.getData().getCategoryList().isEmpty());
	}

	@Test
	void testFinalMenuSetViewByMenu_EmptyCategoryList() {
		// Given
		when(finalSetMenuHRepository.findHeadersByMenuFk(1, 2)).thenReturn(finalSetMenuHHib);
		when(mstUserRepository.findById(anyInt())).thenReturn(Optional.of(mstUserHib));
		when(finalSetMenuDRepository.findByActCat(1, 2)).thenReturn(Collections.emptyList());

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuSetViewByMenu(1, 2);

		// Then
		assertTrue(response.isSuccess());
		assertNotNull(response.getData().getCategoryList());
		assertTrue(response.getData().getCategoryList().isEmpty());
	}

	@Test
	void testFinalMenuSetViewByMenu_RestException() {
		// Given
		when(finalSetMenuHRepository.findHeadersByMenuFk(1, 2)).thenThrow(new RestException("Test Rest Exception"));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuSetViewByMenu(1, 2);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testFinalMenuSetViewByMenu_GeneralException() {
		// Given
		when(finalSetMenuHRepository.findHeadersByMenuFk(1, 2)).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuSetViewByMenu(1, 2);

		// Then
		assertFalse(response.isSuccess());
	}

	// ================================
	// Test loadMealSetMenuDropDown
	// ================================
	@Test
	void testLoadMealSetMenuDropDown_Success() {
		// Given
		List<MealSetMenuHHib> menuList = Arrays.asList(mealSetMenuHHib);
		when(mealSetMenuHRepository.findActByFk(1)).thenReturn(menuList);

		// When
		ResponseDTO<List<ComboBoxDTO>> response = finalMenuSetService.loadMealSetMenuDropDown(1);

		// Then
		assertTrue(response.isSuccess());
		assertNotNull(response.getData());
		assertEquals(1, response.getData().size());
		assertEquals("Test Menu", response.getData().get(0).getName());
	}

	@Test
	void testLoadMealSetMenuDropDown_NullList() {
		// Given
		when(mealSetMenuHRepository.findActByFk(1)).thenReturn(null);

		// When
		ResponseDTO<List<ComboBoxDTO>> response = finalMenuSetService.loadMealSetMenuDropDown(1);

		// Then
		assertFalse(response.isSuccess());
		assertEquals(AppConstants.E_DATA, response.getMessage());
	}

	@Test
	void testLoadMealSetMenuDropDown_RestException() {
		// Given
		when(mealSetMenuHRepository.findActByFk(1)).thenThrow(new RestException("Test Rest Exception"));

		// When
		ResponseDTO<List<ComboBoxDTO>> response = finalMenuSetService.loadMealSetMenuDropDown(1);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testLoadMealSetMenuDropDown_GeneralException() {
		// Given
		when(mealSetMenuHRepository.findActByFk(1)).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<List<ComboBoxDTO>> response = finalMenuSetService.loadMealSetMenuDropDown(1);

		// Then
		assertFalse(response.isSuccess());
	}

	// ================================
	// Test saveFinalSetMenu
	// ================================
	@Test
	void testSaveFinalSetMenu_Success() {
		// Given
		FinalMenuSetDTO dto = createTestFinalMenuSetDTO();

		when(finalSetMenuMRepository.save(any(FinalSetMenuMHib.class))).thenReturn(finalSetMenuMHib);
		when(mealSetMenuHRepository.findById(2)).thenReturn(Optional.of(mealSetMenuHHib));
		when(finalSetMenuHRepository.save(any(FinalSetMenuHHib.class))).thenReturn(finalSetMenuHHib);
		when(mealSetMenuDRepository.findActiveByMenuFk(2)).thenReturn(Arrays.asList(mealSetMenuDHib));
		when(mealSetMenuIRepository.findActiveByMenuDFk(1)).thenReturn(Arrays.asList(mealSetMenuIHib));
		when(finalSetMenuDRepository.save(any(FinalSetMenuDHib.class))).thenReturn(finalSetMenuDHib);
		when(finalSetMenuIRepository.save(any(FinalSetMenuIHib.class))).thenReturn(finalSetMenuIHib);

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.saveFinalSetMenu(dto);

		// Then
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.MSG_RECORD_CREATED, response.getMessage());
	}

	@Test
	void testSaveFinalSetMenu_NullDTO() {
		// Given
		FinalMenuSetDTO dto = null;

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.saveFinalSetMenu(dto);

		// Then
		assertFalse(response.isSuccess());
		assertEquals("Empty data", response.getMessage());
	}

	@Test
	void testSaveFinalSetMenu_HeaderNotFound() {
		// Given
		FinalMenuSetDTO dto = createTestFinalMenuSetDTO();

		when(finalSetMenuMRepository.save(any(FinalSetMenuMHib.class))).thenReturn(finalSetMenuMHib);
		when(mealSetMenuHRepository.findById(2)).thenReturn(Optional.empty());

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.saveFinalSetMenu(dto);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testSaveFinalSetMenu_EmptyDetailListAndMealDetails() {
		// Given
		FinalMenuSetDTO dto = createTestFinalMenuSetDTO();
		dto.setSelectedMeals(Arrays.asList(createTestHeaderDTO()));

		// Set empty detail list
		dto.getSelectedMeals().get(0).setDetailList(Collections.emptyList());

		when(finalSetMenuMRepository.save(any(FinalSetMenuMHib.class))).thenReturn(finalSetMenuMHib);
		when(mealSetMenuHRepository.findById(2)).thenReturn(Optional.of(mealSetMenuHHib));
		when(finalSetMenuHRepository.save(any(FinalSetMenuHHib.class))).thenReturn(finalSetMenuHHib);
		when(mealSetMenuDRepository.findActiveByMenuFk(2)).thenReturn(Collections.emptyList());

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.saveFinalSetMenu(dto);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testSaveFinalSetMenu_RecipeNotFound() {
		// Given
		FinalMenuSetDTO dto = createTestFinalMenuSetDTO();
		dto.getSelectedMeals().get(0).getDetailList().get(0).setRecipeFk(999); // Non-existent recipe

		when(finalSetMenuMRepository.save(any(FinalSetMenuMHib.class))).thenReturn(finalSetMenuMHib);
		when(mealSetMenuHRepository.findById(2)).thenReturn(Optional.of(mealSetMenuHHib));
		when(finalSetMenuHRepository.save(any(FinalSetMenuHHib.class))).thenReturn(finalSetMenuHHib);
		when(mealSetMenuDRepository.findActiveByMenuFk(2)).thenReturn(Arrays.asList(mealSetMenuDHib));
		when(recipeHRepository.findById(999)).thenReturn(Optional.empty());

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.saveFinalSetMenu(dto);

		// Then - Should still succeed as it skips invalid recipes
		assertFalse(response.isSuccess());
	}

	@Test
	void testSaveFinalSetMenu_Exception() {
		// Given
		FinalMenuSetDTO dto = createTestFinalMenuSetDTO();

		when(finalSetMenuMRepository.save(any(FinalSetMenuMHib.class)))
				.thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.saveFinalSetMenu(dto);

		// Then
		assertFalse(response.isSuccess());
		assertTrue(response.getMessage().contains("Unexpected error"));
	}

	// ================================
	// Test mealSetMenuEditByIdForMenuSet
	// ================================
	@Test
	void testMealSetMenuEditByIdForMenuSet_Success() {
		// Given
		when(mealSetMenuHRepository.findById(2)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuDRepository.findActiveByMenuFk(2)).thenReturn(Arrays.asList(mealSetMenuDHib));
		when(mealSetTemplateHRepository.findById(1)).thenReturn(Optional.of(mealSetTemplateHHib));
		when(mealSetTemplateDRepository.findActiveByTemplateFk(1)).thenReturn(Arrays.asList(mealSetTemplateDHib));
		when(recipeHRepository.filterByCategoryFk(1)).thenReturn(Arrays.asList(recipeHHib));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.mealSetMenuEditByIdForMenuSet(2);

		// Then
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.MSG_RECORD_FETCHED, response.getMessage());
		assertNotNull(response.getData());
	}

	@Test
	void testMealSetMenuEditByIdForMenuSet_NotFound() {
		// Given
		when(mealSetMenuHRepository.findById(999)).thenReturn(Optional.empty());

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.mealSetMenuEditByIdForMenuSet(999);

		// Then
		assertFalse(response.isSuccess());
		assertTrue(response.getMessage().contains("not found"));
	}

	@Test
	void testMealSetMenuEditByIdForMenuSet_TemplateNotFound() {
		// Given
		mealSetMenuHHib.setTemplateFk(999);
		when(mealSetMenuHRepository.findById(2)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuDRepository.findActiveByMenuFk(2)).thenReturn(Arrays.asList(mealSetMenuDHib));
		when(mealSetTemplateHRepository.findById(999)).thenReturn(Optional.empty());

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.mealSetMenuEditByIdForMenuSet(2);

		// Then
		assertFalse(response.isSuccess());
		assertTrue(response.getMessage().contains("template not found"));
	}

	@Test
	void testMealSetMenuEditByIdForMenuSet_RestException() {
		// Given
		when(mealSetMenuHRepository.findById(2)).thenThrow(new RestException("Test Rest Exception"));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.mealSetMenuEditByIdForMenuSet(2);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testMealSetMenuEditByIdForMenuSet_GeneralException() {
		// Given
		when(mealSetMenuHRepository.findById(2)).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.mealSetMenuEditByIdForMenuSet(2);

		// Then
		assertFalse(response.isSuccess());
	}

	// ================================
	// Test viewFinalSetMenuById
	// ================================
	@Test
	void testViewFinalSetMenuById_Success() {
		// Given
		when(finalSetMenuMRepository.findById(1)).thenReturn(Optional.of(finalSetMenuMHib));
		when(finalSetMenuHRepository.findActiveHeadersByFinalMenuFk(1)).thenReturn(Arrays.asList(finalSetMenuHHib));
		when(finalSetMenuDRepository.findByMenuFkIn(anyList())).thenReturn(Arrays.asList(finalSetMenuDHib));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.viewFinalSetMenuById(1);

		// Then
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.MSG_RECORD_FETCHED, response.getMessage());
		assertNotNull(response.getData());
	}

	@Test
	void testViewFinalSetMenuById_NotFound() {
		// Given
		when(finalSetMenuMRepository.findById(999)).thenReturn(Optional.empty());

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.viewFinalSetMenuById(999);

		// Then
		assertFalse(response.isSuccess());
		assertEquals("No record found for the Final Set Menu.", response.getMessage());
	}

	@Test
	void testViewFinalSetMenuById_Exception() {
		// Given
		when(finalSetMenuMRepository.findById(1)).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.viewFinalSetMenuById(1);

		// Then
		assertFalse(response.isSuccess());
	}

	// ================================
	// Test finalMenuRecipeEdit
	// ================================
	@Test
	void testFinalMenuRecipeEdit_SuccessWithFinalSetMenu() {

		when(finalSetMenuHRepository.findByMenuFk(1, 2)).thenReturn(finalSetMenuHHib);
		when(finalSetMenuDRepository.findByActCat(1, 2)).thenReturn(Arrays.asList(finalSetMenuDHib));
		when(mealSetTemplateHRepository.findById(1)).thenReturn(Optional.of(mealSetTemplateHHib));
		when(mealSetTemplateDRepository.findActiveByTemplateFk(1)).thenReturn(Arrays.asList(mealSetTemplateDHib));

		List<Object[]> recipeList = new ArrayList<>();
		recipeList.add(new Object[] { recipeHHib, 1 });

		when(recipeHRepository.findByCategoryFkIn(anySet())).thenReturn(recipeList);

		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuRecipeEdit(1, 2);

		assertTrue(response.isSuccess());
		assertEquals(AppConstants.MSG_RECORD_FETCHED, response.getMessage());
	}

	@Test
	void testFinalMenuRecipeEdit_FallbackToMealSetMenu() {
		// Given
		when(finalSetMenuHRepository.findByMenuFk(1, 2)).thenReturn(null);
		when(mealSetMenuHRepository.findById(2)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuDRepository.findActiveByMenuFk(2)).thenReturn(Arrays.asList(mealSetMenuDHib));

		List<Object[]> recipeList = new ArrayList<>();
		recipeList.add(new Object[] { recipeHHib, 1 });

		when(recipeHRepository.findByCategoryFkIn(anySet())).thenReturn(recipeList);

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuRecipeEdit(1, 2);

		// Then
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.MSG_RECORD_FETCHED, response.getMessage());
	}

	@Test
	void testFinalMenuRecipeEdit_RestException() {
		// Given
		when(finalSetMenuHRepository.findByMenuFk(1, 2)).thenThrow(new RestException("Test Rest Exception"));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuRecipeEdit(1, 2);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testFinalMenuRecipeEdit_GeneralException() {
		// Given
		when(finalSetMenuHRepository.findByMenuFk(1, 2)).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.finalMenuRecipeEdit(1, 2);

		// Then
		assertFalse(response.isSuccess());
	}

	
	// ================================
	// Test modifyFinalMenuSet
	// ================================
	@Test
	void testModifyFinalMenuSet_Success() {
		// Given
		FinalMenuSetDTO dto = createTestModifyDTO();

		when(finalSetMenuMRepository.findById(1)).thenReturn(Optional.of(finalSetMenuMHib));
		when(finalSetMenuMRepository.save(any(FinalSetMenuMHib.class))).thenReturn(finalSetMenuMHib);
		when(finalSetMenuHRepository.findActiveHeadersByFinalMenuFk(1)).thenReturn(Arrays.asList(finalSetMenuHHib));
		when(finalSetMenuHRepository.findHeadersByMenuFk(1, 2)).thenReturn(finalSetMenuHHib);
		when(finalSetMenuHRepository.save(any(FinalSetMenuHHib.class))).thenReturn(finalSetMenuHHib);
		when(finalSetMenuDRepository.findByFinalFkMenuFkAndRecipeFk(1, 2, 1)).thenReturn(finalSetMenuDHib);

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.modifyFinalMenuSet(dto);

		// Then
		assertTrue(response.isSuccess());
		assertEquals("Final Menu Set updated successfully", response.getMessage());
	}

	@Test
	void testModifyFinalMenuSet_NullDTO() {
		// Given
		FinalMenuSetDTO dto = null;

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.modifyFinalMenuSet(dto);

		// Then
		assertFalse(response.isSuccess());
		assertEquals("Invalid data", response.getMessage());
	}

	@Test
	void testModifyFinalMenuSet_NullSelectedMeals() {
		// Given
		FinalMenuSetDTO dto = new FinalMenuSetDTO();
		dto.setId(1);
		dto.setSelectedMeals(null);

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.modifyFinalMenuSet(dto);

		// Then
		assertFalse(response.isSuccess());
		assertEquals("Invalid data", response.getMessage());
	}

	@Test
	void testModifyFinalMenuSet_MasterNotFound() {
		// Given
		FinalMenuSetDTO dto = createTestModifyDTO();

		when(finalSetMenuMRepository.findById(1)).thenReturn(Optional.empty());

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.modifyFinalMenuSet(dto);

		// Then
		assertFalse(response.isSuccess());
		assertEquals("Master record not found", response.getMessage());
	}

	@Test
	void testModifyFinalMenuSet_NewHeaderCreation() {
		// Given
		FinalMenuSetDTO dto = createTestModifyDTO();
		dto.getSelectedMeals().get(0).setId(0); // New header

		when(finalSetMenuMRepository.findById(1)).thenReturn(Optional.of(finalSetMenuMHib));
		when(finalSetMenuMRepository.save(any(FinalSetMenuMHib.class))).thenReturn(finalSetMenuMHib);
		when(finalSetMenuHRepository.findActiveHeadersByFinalMenuFk(1)).thenReturn(Collections.emptyList());
		when(mealSetMenuHRepository.findById(2)).thenReturn(Optional.of(mealSetMenuHHib));
		when(finalSetMenuHRepository.save(any(FinalSetMenuHHib.class))).thenReturn(finalSetMenuHHib);
		when(finalSetMenuDRepository.findByFinalFkMenuFkAndRecipeFk(1, 2, 1)).thenReturn(null);
		when(recipeHRepository.findById(1)).thenReturn(Optional.of(recipeHHib));
		when(finalSetMenuDRepository.save(any(FinalSetMenuDHib.class))).thenReturn(finalSetMenuDHib);
		when(recipeDRepository.findByActRecipe(1)).thenReturn(Arrays.asList(recipeDHib));
		when(finalSetMenuIRepository.save(any(FinalSetMenuIHib.class))).thenReturn(finalSetMenuIHib);

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.modifyFinalMenuSet(dto);

		// Then
		assertTrue(response.isSuccess());
	}

	@Test
	void testModifyFinalMenuSet_Exception() {
		// Given
		FinalMenuSetDTO dto = createTestModifyDTO();

		when(finalSetMenuMRepository.findById(1)).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.modifyFinalMenuSet(dto);

		// Then
		assertFalse(response.isSuccess());
		assertTrue(response.getMessage().contains("Error"));
	}

	// ================================
	// Test copyFinalMenuSet
	// ================================
	@Test
	void testCopyFinalMenuSet_Success() {
		// Given
		FinalMenuSetDTO dto = new FinalMenuSetDTO();
		dto.setId(1);
		dto.setNewMenuName("Copied Menu");
		dto.setCreatedBy(1);

		when(finalSetMenuMRepository.findById(1)).thenReturn(Optional.of(finalSetMenuMHib));
		when(finalSetMenuMRepository.save(any(FinalSetMenuMHib.class))).thenReturn(finalSetMenuMHib);
		when(finalSetMenuHRepository.findByMenuDFk(1)).thenReturn(Arrays.asList(finalSetMenuHHib));
		when(finalSetMenuHRepository.save(any(FinalSetMenuHHib.class))).thenReturn(finalSetMenuHHib);
		when(finalSetMenuDRepository.findByAct(1)).thenReturn(Arrays.asList(finalSetMenuDHib));
		when(finalSetMenuDRepository.save(any(FinalSetMenuDHib.class))).thenReturn(finalSetMenuDHib);
		when(finalSetMenuIRepository.findActiveItemsByMenuDFk(1)).thenReturn(Arrays.asList(finalSetMenuIHib));
		when(finalSetMenuIRepository.save(any(FinalSetMenuIHib.class))).thenReturn(finalSetMenuIHib);

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.copyFinalMenuSet(dto);

		// Then
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.MSG_RECORD_COPY, response.getMessage());
	}

	@Test
	void testCopyFinalMenuSet_NullDTO() {
		// Given
		FinalMenuSetDTO dto = null;

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.copyFinalMenuSet(dto);

		// Then
		assertFalse(response.isSuccess());
		assertEquals("Empty data", response.getMessage());
	}

	@Test
	void testCopyFinalMenuSet_IdZero() {
		// Given
		FinalMenuSetDTO dto = new FinalMenuSetDTO();
		dto.setId(0);

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.copyFinalMenuSet(dto);

		// Then
		assertFalse(response.isSuccess());
		assertEquals("Empty data", response.getMessage());
	}

	@Test
	void testCopyFinalMenuSet_MasterNotFound() {
		// Given
		FinalMenuSetDTO dto = new FinalMenuSetDTO();
		dto.setId(1);
		dto.setNewMenuName("Copied Menu");
		dto.setCreatedBy(1);

		when(finalSetMenuMRepository.findById(1)).thenReturn(Optional.empty());

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.copyFinalMenuSet(dto);

		// Then
		assertFalse(response.isSuccess());
		assertEquals("Master menu not found", response.getMessage());
	}

	@Test
	void testCopyFinalMenuSet_NoHeaders() {
		// Given
		FinalMenuSetDTO dto = new FinalMenuSetDTO();
		dto.setId(1);
		dto.setNewMenuName("Copied Menu");
		dto.setCreatedBy(1);

		when(finalSetMenuMRepository.findById(1)).thenReturn(Optional.of(finalSetMenuMHib));
		when(finalSetMenuMRepository.save(any(FinalSetMenuMHib.class))).thenReturn(finalSetMenuMHib);
		when(finalSetMenuHRepository.findByMenuDFk(1)).thenReturn(Collections.emptyList());

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.copyFinalMenuSet(dto);

		// Then
		assertFalse(response.isSuccess());
		assertEquals("No header records found", response.getMessage());
	}

	@Test
	void testCopyFinalMenuSet_Exception() {
		// Given
		FinalMenuSetDTO dto = new FinalMenuSetDTO();
		dto.setId(1);
		dto.setNewMenuName("Copied Menu");
		dto.setCreatedBy(1);

		when(finalSetMenuMRepository.findById(1)).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<FinalMenuSetDTO> response = finalMenuSetService.copyFinalMenuSet(dto);

		// Then
		assertFalse(response.isSuccess());
	}

	// ================================
	// Test loadMealSetTemplateDropDown
	// ================================
	@Test
	void testLoadMealSetTemplateDropDown_Success() {
		// Given
		List<MealSetTemplateHHib> templateList = Arrays.asList(mealSetTemplateHHib);
		when(mealSetTemplateHRepository.findByMealTypeStatus(1)).thenReturn(templateList);

		// When
		ResponseDTO<List<ComboBoxDTO>> response = finalMenuSetService.loadMealSetTemplateDropDown(1);

		// Then
		assertTrue(response.isSuccess());
		assertNotNull(response.getData());
		assertEquals(1, response.getData().size());
		assertEquals("Test Template", response.getData().get(0).getName());
	}

	// ================================
	// Test loadCategoryByTemplatePkDropDown
	// ================================
	@Test
	void testLoadCategoryByTemplatePkDropDown_Success() {
		// Given
		List<MealSetTemplateDHib> templateDetails = Arrays.asList(mealSetTemplateDHib);
		when(mealSetTemplateDRepository.findByActCat(1)).thenReturn(templateDetails);
		when(mstCategoryMasterRepository.findById(1)).thenReturn(Optional.of(mstCategoryMasterHib));

		// When
		ResponseDTO<List<ComboBoxDTO>> response = finalMenuSetService.loadCategoryByTemplatePkDropDown(1);

		// Then
		assertNotNull(response.getData());
		assertEquals(1, response.getData().size());
		assertEquals("Main Course", response.getData().get(0).getName());
	}

	@Test
	void testLoadCategoryByTemplatePkDropDown_CategoryNotFound() {
		// Given
		List<MealSetTemplateDHib> templateDetails = Arrays.asList(mealSetTemplateDHib);
		when(mealSetTemplateDRepository.findByActCat(1)).thenReturn(templateDetails);
		when(mstCategoryMasterRepository.findById(1)).thenReturn(Optional.empty());

		// When
		ResponseDTO<List<ComboBoxDTO>> response = finalMenuSetService.loadCategoryByTemplatePkDropDown(1);

		// Then
		assertFalse(response.isSuccess());
		assertEquals(AppConstants.E_DATA, response.getMessage());
	}

	// ================================
	// Test printexcelreport
	// ================================
	@Test
	void testPrintexcelreport_Success() {
		// Given
		FinalMenuSetDTO filterDTO = new FinalMenuSetDTO();
		filterDTO.setMealTypeFk(1);
		filterDTO.setApprovalStatus(3);

		FinalMenuSetService spyService = spy(finalMenuSetService);

		FinalMenuSetDTO mockData = new FinalMenuSetDTO();
		mockData.setUserName("Test User");
		mockData.setTotalMenu(10);
		mockData.setActiveMenu(8);
		mockData.setAverageCost(50.25);

		FinalMenuSetDTO menuDTO = new FinalMenuSetDTO();
		menuDTO.setFinalMenuName("Test Menu");
		menuDTO.setUserName("John Doe");
		menuDTO.setApprover("Jane Doe");
		menuDTO.setRecipeCount(5);
		menuDTO.setTotalCost(1000.0);
		menuDTO.setCreatedDate(new Date());
		menuDTO.setUpdatedDate(new Date());
		menuDTO.setApprovalStatusStr("Draft");
		menuDTO.setStatusStr("Active");

		FinalMenuSetDTO detailDTO = new FinalMenuSetDTO();
		detailDTO.setMealTypeName("Breakfast");
		detailDTO.setMenuName("Menu 1");
		menuDTO.setDetailList(Arrays.asList(detailDTO));

		mockData.setFinalSetMenuList(Arrays.asList(menuDTO));

		ResponseDTO<FinalMenuSetDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setData(mockData);
		mockResponse.setSuccess(true);

		doReturn(mockResponse).when(spyService).finalMenuList(any(FinalMenuSetDTO.class));

		// When
		ResponseEntity<byte[]> response = spyService.printexcelreport(filterDTO);

		// Then
		assertNotNull(response);
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertNotNull(response.getBody());
		assertTrue(response.getHeaders().getContentDisposition().getFilename().contains("FinalMenuSet.xls"));
	}

	@Test
	void testPrintexcelreport_NullResponse() {
		// Given
		FinalMenuSetDTO filterDTO = new FinalMenuSetDTO();
		FinalMenuSetService spyService = spy(finalMenuSetService);

		doReturn(null).when(spyService).finalMenuList(any(FinalMenuSetDTO.class));

		// When
		ResponseEntity<byte[]> response = spyService.printexcelreport(filterDTO);

		// Then
		assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
	}

	@Test
	void testPrintexcelreport_UnsuccessfulResponse() {
		// Given
		FinalMenuSetDTO filterDTO = new FinalMenuSetDTO();
		FinalMenuSetService spyService = spy(finalMenuSetService);

		ResponseDTO<FinalMenuSetDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setSuccess(false);

		doReturn(mockResponse).when(spyService).finalMenuList(any(FinalMenuSetDTO.class));

		// When
		ResponseEntity<byte[]> response = spyService.printexcelreport(filterDTO);

		// Then
		assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
	}

	@Test
	void testPrintexcelreport_NullData() {
		// Given
		FinalMenuSetDTO filterDTO = new FinalMenuSetDTO();
		FinalMenuSetService spyService = spy(finalMenuSetService);

		ResponseDTO<FinalMenuSetDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setSuccess(true);
		mockResponse.setData(null);

		doReturn(mockResponse).when(spyService).finalMenuList(any(FinalMenuSetDTO.class));

		// When
		ResponseEntity<byte[]> response = spyService.printexcelreport(filterDTO);

		// Then
		assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
	}

	@Test
	void testPrintexcelreport_EmptyMenuList() {
		// Given
		FinalMenuSetDTO filterDTO = new FinalMenuSetDTO();
		FinalMenuSetService spyService = spy(finalMenuSetService);

		FinalMenuSetDTO mockData = new FinalMenuSetDTO();
		mockData.setFinalSetMenuList(Collections.emptyList());

		ResponseDTO<FinalMenuSetDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setData(mockData);
		mockResponse.setSuccess(true);

		doReturn(mockResponse).when(spyService).finalMenuList(any(FinalMenuSetDTO.class));

		// When
		ResponseEntity<byte[]> response = spyService.printexcelreport(filterDTO);

		// Then
		assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
	}

	@Test
	void testPrintexcelreport_NullMenuList() {
		// Given
		FinalMenuSetDTO filterDTO = new FinalMenuSetDTO();
		FinalMenuSetService spyService = spy(finalMenuSetService);

		FinalMenuSetDTO mockData = new FinalMenuSetDTO();
		mockData.setFinalSetMenuList(null);

		ResponseDTO<FinalMenuSetDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setData(mockData);
		mockResponse.setSuccess(true);

		doReturn(mockResponse).when(spyService).finalMenuList(any(FinalMenuSetDTO.class));

		// When
		ResponseEntity<byte[]> response = spyService.printexcelreport(filterDTO);

		// Then
		assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
	}

	@Test
	void testPrintexcelreport_Exception() {
		// Given
		FinalMenuSetDTO filterDTO = new FinalMenuSetDTO();
		FinalMenuSetService spyService = spy(finalMenuSetService);

		doThrow(new RuntimeException("Test Exception")).when(spyService).finalMenuList(any(FinalMenuSetDTO.class));

		// When
		ResponseEntity<byte[]> response = spyService.printexcelreport(filterDTO);

		// Then
		assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
	}

	// ================================
	// Test printexcelreportView
	// ================================
	@Test
	void testPrintexcelreportView_Success() {
		// Given
		FinalMenuSetService spyService = spy(finalMenuSetService);

		FinalMenuSetDTO mockData = new FinalMenuSetDTO();
		mockData.setFinalMenuName("Test Final Menu");
		mockData.setUserName("John Doe");
		mockData.setApprover("Jane Doe");
		mockData.setRecipeCount(5);

		FinalMenuSetDTO detailDTO = new FinalMenuSetDTO();
		detailDTO.setMenuFk(2);
		mockData.setDetailList(Arrays.asList(detailDTO));

		ResponseDTO<FinalMenuSetDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setData(mockData);
		mockResponse.setSuccess(true);

		FinalMenuSetDTO viewData = new FinalMenuSetDTO();
		viewData.setMealType("Breakfast");

		FinalMenuSetDTO categoryDTO = new FinalMenuSetDTO();
		categoryDTO.setCategoriesName("Main Course");

		FinalMenuSetDTO recipeDTO = new FinalMenuSetDTO();
		recipeDTO.setRecipeName("Test Recipe");
		recipeDTO.setPerPortionSize(2.0);
		recipeDTO.setUom("kg");
		recipeDTO.setRecipeCost(20.0);
		categoryDTO.setRecipes(Arrays.asList(recipeDTO));

		viewData.setCategoryList(Arrays.asList(categoryDTO));

		ResponseDTO<FinalMenuSetDTO> mockViewResponse = new ResponseDTO<>();
		mockViewResponse.setData(viewData);
		mockViewResponse.setSuccess(true);

		when(mstUserRepository.findById(100)).thenReturn(Optional.of(mstUserHib));
		doReturn(mockResponse).when(spyService).finalMenuView(1);
		doReturn(mockViewResponse).when(spyService).finalMenuSetViewByMenu(1, 2);

		// When
		ResponseEntity<byte[]> response = spyService.printexcelreportView(1, 100);

		// Then
		assertNotNull(response);
		assertNotNull(response.getBody());
	}

	@Test
	void testPrintexcelreportView_NullResponse() {
		// Given
		FinalMenuSetService spyService = spy(finalMenuSetService);

		doReturn(null).when(spyService).finalMenuView(1);

		// When
		ResponseEntity<byte[]> response = spyService.printexcelreportView(1, 100);

		// Then
		assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
	}

	@Test
	void testPrintexcelreportView_UnsuccessfulResponse() {
		// Given
		FinalMenuSetService spyService = spy(finalMenuSetService);

		ResponseDTO<FinalMenuSetDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setSuccess(false);

		doReturn(mockResponse).when(spyService).finalMenuView(1);

		// When
		ResponseEntity<byte[]> response = spyService.printexcelreportView(1, 100);

		// Then
		assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
	}

	@Test
	void testPrintexcelreportView_EmptyDetailList() {
		// Given
		FinalMenuSetService spyService = spy(finalMenuSetService);

		FinalMenuSetDTO mockData = new FinalMenuSetDTO();
		mockData.setDetailList(Collections.emptyList());

		ResponseDTO<FinalMenuSetDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setData(mockData);
		mockResponse.setSuccess(true);

		doReturn(mockResponse).when(spyService).finalMenuView(1);

		// When
		ResponseEntity<byte[]> response = spyService.printexcelreportView(1, 100);

		// Then
		assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
	}

	@Test
	void testPrintexcelreportView_NullDetailList() {
		// Given
		FinalMenuSetService spyService = spy(finalMenuSetService);

		FinalMenuSetDTO mockData = new FinalMenuSetDTO();
		mockData.setDetailList(null);

		ResponseDTO<FinalMenuSetDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setData(mockData);
		mockResponse.setSuccess(true);

		doReturn(mockResponse).when(spyService).finalMenuView(1);

		// When
		ResponseEntity<byte[]> response = spyService.printexcelreportView(1, 100);

		// Then
		assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
	}

	@Test
	void testPrintexcelreportView_UserNotFound() {
		// Given
		FinalMenuSetService spyService = spy(finalMenuSetService);

		FinalMenuSetDTO mockData = new FinalMenuSetDTO();
		mockData.setDetailList(Arrays.asList(new FinalMenuSetDTO()));

		ResponseDTO<FinalMenuSetDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setData(mockData);
		mockResponse.setSuccess(true);

		when(mstUserRepository.findById(100)).thenReturn(Optional.empty());
		doReturn(mockResponse).when(spyService).finalMenuView(1);

		// When
		ResponseEntity<byte[]> response = spyService.printexcelreportView(1, 100);

		// Then
		assertNotNull(response);
	}

	@Test
	void testPrintexcelreportView_UserIdZero() {
		// Given
		FinalMenuSetService spyService = spy(finalMenuSetService);

		FinalMenuSetDTO mockData = new FinalMenuSetDTO();
		mockData.setDetailList(Arrays.asList(new FinalMenuSetDTO()));

		ResponseDTO<FinalMenuSetDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setData(mockData);
		mockResponse.setSuccess(true);

		doReturn(mockResponse).when(spyService).finalMenuView(1);

		// When
		ResponseEntity<byte[]> response = spyService.printexcelreportView(1, 0);

		// Then
		assertNotNull(response);
	}

	@Test
	void testPrintexcelreportView_Exception() {
		// Given
		FinalMenuSetService spyService = spy(finalMenuSetService);

		doThrow(new RuntimeException("Test Exception")).when(spyService).finalMenuView(1);

		// When
		ResponseEntity<byte[]> response = spyService.printexcelreportView(1, 100);

		// Then
		assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
	}

	// ================================
	// Test Excel Style Methods
	// ================================
	@Test
	void testExcelStylesThroughReport() {
		// This tests that the Excel creation doesn't crash due to style issues
		FinalMenuSetService spyService = spy(finalMenuSetService);

		// Setup minimal data for Excel creation
		FinalMenuSetDTO mockData = new FinalMenuSetDTO();
		mockData.setUserName("Test User");
		mockData.setTotalMenu(1);
		mockData.setActiveMenu(1);
		mockData.setAverageCost(50.0);

		FinalMenuSetDTO menuDTO = new FinalMenuSetDTO();
		menuDTO.setFinalMenuName("Test Menu");
		menuDTO.setUserName("John");
		menuDTO.setApprover("Jane");
		menuDTO.setRecipeCount(1);
		menuDTO.setTotalCost(100.0);
		menuDTO.setCreatedDate(new Date());
		menuDTO.setUpdatedDate(new Date());
		menuDTO.setApprovalStatusStr("Draft");
		menuDTO.setStatusStr("Active");
		menuDTO.setDetailList(Arrays.asList(new FinalMenuSetDTO()));

		mockData.setFinalSetMenuList(Arrays.asList(menuDTO));

		ResponseDTO<FinalMenuSetDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setData(mockData);
		mockResponse.setSuccess(true);

		doReturn(mockResponse).when(spyService).finalMenuList(any(FinalMenuSetDTO.class));

		// When
		ResponseEntity<byte[]> response = spyService.printexcelreport(new FinalMenuSetDTO());

		// Then - Should not crash
		assertNotNull(response);
	}

	// ================================
	// Helper Methods
	// ================================
	private FinalMenuSetDTO createTestFinalMenuSetDTO() {
		FinalMenuSetDTO dto = new FinalMenuSetDTO();
		dto.setMenuName("Test Final Menu");
		dto.setMealTypeFk(1);
		dto.setCreatedBy(1);
		dto.setTotalCost(1000.0);
		dto.setTotalRecipeCount(10);
		dto.setNotes("Test Notes");

		FinalMenuSetDTO headerDTO = createTestHeaderDTO();
		dto.setSelectedMeals(Arrays.asList(headerDTO));

		return dto;
	}

	private FinalMenuSetDTO createTestHeaderDTO() {
		FinalMenuSetDTO headerDTO = new FinalMenuSetDTO();
		headerDTO.setMenuFk(2);
		headerDTO.setCategoryCount(2);
		headerDTO.setRecipeCount(5);
		headerDTO.setCost(500.0);

		FinalMenuSetDTO detailDTO = new FinalMenuSetDTO();
		detailDTO.setRecipeFk(1);
		detailDTO.setCategoryFk(1);
		detailDTO.setCategoryName("Main Course");
		headerDTO.setDetailList(Arrays.asList(detailDTO));

		return headerDTO;
	}

	private FinalMenuSetDTO createTestModifyDTO() {
		FinalMenuSetDTO dto = new FinalMenuSetDTO();
		dto.setId(1);
		dto.setMenuSetName("Updated Menu");
		dto.setNotes("Updated Notes");
		dto.setTotalCost(1200.0);
		dto.setTotalRecipeCount(12);
		dto.setLastActBy(1);

		FinalMenuSetDTO headerDTO = new FinalMenuSetDTO();
		headerDTO.setId(1);
		headerDTO.setFinalMenuFk(1);
		headerDTO.setMenuFk(2);
		headerDTO.setRecipeCount(5);
		headerDTO.setCost(500.0);
		headerDTO.setCategoryCount(2);

		FinalMenuSetDTO recipeDTO = new FinalMenuSetDTO();
		recipeDTO.setRecipeFk(1);
		recipeDTO.setCategoryFk(1);
		recipeDTO.setCategoryName("Main Course");
		headerDTO.setDetailList(Arrays.asList(recipeDTO));

		dto.setSelectedMeals(Arrays.asList(headerDTO));

		return dto;
	}
}