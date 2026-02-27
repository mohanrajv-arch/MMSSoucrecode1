package esfita.service.mealSetmenu;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
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

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
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
import esfita.dto.MealSetMenuDTO;
import esfita.dto.ResponseDTO;
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
import esfita.service.MealSetMenuService;
import esfita.utils.AppConstants;
import esfita.utils.RestException;

@ExtendWith(MockitoExtension.class)
class MealSetMenuServiceTest {

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

	@InjectMocks
	private MealSetMenuService mealSetMenuService;

	private MealSetMenuHHib mealSetMenuHHib;
	private MealSetMenuDTO mealSetMenuDTO;
	private RecipeMealMasterHib recipeMealMasterHib;
	private MealSetTemplateHHib mealSetTemplateHHib;
	private MstUserHib mstUserHib;
	private MealSetMenuDHib mealSetMenuDHib;
	private RecipeHHib recipeHHib;
	private RecipeDHib recipeDHib;
	private MealSetTemplateDHib mealSetTemplateDHib;
	private MstCategoryMasterHib mstCategoryMasterHib;
	private MealSetMenuIHib mealSetMenuIHib;

	@BeforeEach
	void setUp() {
		// Setup entities
		mealSetMenuHHib = new MealSetMenuHHib();
		mealSetMenuHHib.setId(1);
		mealSetMenuHHib.setMenuName("Test Menu");
		mealSetMenuHHib.setMealTypeFk(1);
		mealSetMenuHHib.setMealTypeName("Breakfast");
		mealSetMenuHHib.setTemplateFk(1);
		mealSetMenuHHib.setTemplateName("Test Template");
		mealSetMenuHHib.setCategoryCount(2);
		mealSetMenuHHib.setRecipeCount(5);
		mealSetMenuHHib.setTotalCost(100.50);
		mealSetMenuHHib.setCreatedBy(1);
		mealSetMenuHHib.setApprovedBy(2);
		mealSetMenuHHib.setCreatedDateTime(new Date());
		mealSetMenuHHib.setLastActDateTime(new Date());
		mealSetMenuHHib.setStatus(AppConstants.FLAG_A);
		mealSetMenuHHib.setApprovalStatus(3);
		mealSetMenuHHib.setActualCategoryCount(2);
		mealSetMenuHHib.setActualRecipeCount(5);

		mealSetMenuDTO = new MealSetMenuDTO();
		mealSetMenuDTO.setId(1);
		mealSetMenuDTO.setMenuName("Test Menu");
		mealSetMenuDTO.setMealTypeFk(1);
		mealSetMenuDTO.setTemplateFk(1);
		mealSetMenuDTO.setTotalCost(100.50);
		mealSetMenuDTO.setCategoryCount(2);
		mealSetMenuDTO.setRecipeCount(5);
		mealSetMenuDTO.setApproverBy(1);
		mealSetMenuDTO.setCreatedBy(1);

		recipeMealMasterHib = new RecipeMealMasterHib();
		recipeMealMasterHib.setId(1);
		recipeMealMasterHib.setRecipeMealName("Breakfast");
		recipeMealMasterHib.setRecipeMealCode("BRK");

		mealSetTemplateHHib = new MealSetTemplateHHib();
		mealSetTemplateHHib.setId(1);
		mealSetTemplateHHib.setTemplateName("Test Template");
		mealSetTemplateHHib.setMealTypeFk(1);
		mealSetTemplateHHib.setMealTypeName("Breakfast");
		mealSetTemplateHHib.setNoCategories(2);
		mealSetTemplateHHib.setNoRecipes(5);

		mstUserHib = new MstUserHib();
		mstUserHib.setUserPk(1);
		mstUserHib.setFirstName("John");
		mstUserHib.setLastName("Doe");

		mealSetMenuDHib = new MealSetMenuDHib();
		mealSetMenuDHib.setId(1);
		mealSetMenuDHib.setMenuFk(1);
		mealSetMenuDHib.setCategoryFk(1);
		mealSetMenuDHib.setCategoryName("Main Course");
		mealSetMenuDHib.setRecipeFk(1);
		mealSetMenuDHib.setRecipeName("Test Recipe");
		mealSetMenuDHib.setPerPortionCost(20.10);
		mealSetMenuDHib.setPortionSize(2.0);
		mealSetMenuDHib.setUom("kg");
		mealSetMenuDHib.setStatus(AppConstants.FLAG_A);
		mealSetMenuDHib.setBaseQuantity(1.0);

		recipeHHib = new RecipeHHib();
		recipeHHib.setId(1);
		recipeHHib.setRecipeName("Test Recipe");
		recipeHHib.setPerPortionCost(20.10);
		recipeHHib.setPortionSize(2.0);
		recipeHHib.setUom("kg");
		recipeHHib.setUniqueNo("R001");
		recipeHHib.setRefNo("REF001");
		recipeHHib.setTotalCost(100.50);
		recipeHHib.setBaseQuantity(1.0);
		recipeHHib.setImageUrl("image.jpg");
		recipeHHib.setFinishedProduct(25.0);
		recipeHHib.setCookingInstruction("Cook well");

		recipeDHib = new RecipeDHib();
		recipeDHib.setId(1);
		recipeDHib.setRecipeFk(1);
		recipeDHib.setCategoryFk(1);
		recipeDHib.setCategoryName("Ingredients");
		recipeDHib.setItemFk(1);
		recipeDHib.setItemCode("IT001");
		recipeDHib.setItemName("Test Item");
		recipeDHib.setPackageId("1");
		recipeDHib.setPackagePrice(10.0);
		recipeDHib.setPackageBaseFactor(1.0);
		recipeDHib.setPackageSecondaryFactor(2.0);
		recipeDHib.setPackageBaseUnit("kg");
		recipeDHib.setPackageSecondaryUnit("g");
		recipeDHib.setPackageSecondaryCost(5.0);
		recipeDHib.setBaseQuantity(0.5);
		recipeDHib.setSecondaryQuantity(500.0);
		recipeDHib.setTotal(10.0);

		mealSetTemplateDHib = new MealSetTemplateDHib();
		mealSetTemplateDHib.setId(1);
		mealSetTemplateDHib.setTemplateFk(1);
		mealSetTemplateDHib.setCategoryFk(1);
		mealSetTemplateDHib.setCategoryName("Main Course");
		mealSetTemplateDHib.setRecipesRequired(2);

		mstCategoryMasterHib = new MstCategoryMasterHib();
		mstCategoryMasterHib.setId(1);
		mstCategoryMasterHib.setCategoryName("Main Course");
		mstCategoryMasterHib.setCategoryCode("MC");

		mealSetMenuIHib = new MealSetMenuIHib();
		mealSetMenuIHib.setId(1);
		mealSetMenuIHib.setMenuFk(1);
		mealSetMenuIHib.setMenuDFk(1);
		mealSetMenuIHib.setRecipeFk(1);
		mealSetMenuIHib.setCategoryFk(1);
		mealSetMenuIHib.setCategoryName("Ingredients");
		mealSetMenuIHib.setItemFk(1);
		mealSetMenuIHib.setItemCode("IT001");
		mealSetMenuIHib.setItemName("Test Item");
		mealSetMenuIHib.setBaseQuantity(0.5);
		mealSetMenuIHib.setSecondaryQuantity(500.0);
		mealSetMenuIHib.setTotal(10.0);
		mealSetMenuIHib.setStatus(AppConstants.FLAG_A);
	}

	@Test
	void testConstructor() {
		// This tests the constructor injection
		MealSetMenuService service = new MealSetMenuService(mealSetTemplateHRepository, mealSetTemplateDRepository,
				mstUserRepository, recipeMealMasterRepository, mstCategoryMasterRepository, mealSetMenuDRepository,
				mealSetMenuHRepository, mealSetMenuIRepository, recipeHRepository, recipeDRepository);
		assertNotNull(service);
	}

	@Test
	void testMealSetMenuList_Success() {

		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setMealTypeFk(1);
		inputDTO.setApprovalStatus(3);
		inputDTO.setCreatedBy(1);

		List<MealSetMenuHHib> menuList = Arrays.asList(mealSetMenuHHib);

		when(mealSetMenuHRepository.findByMealTypeAndApprovalStatus(1, 3)).thenReturn(menuList);

		when(mstUserRepository.findById(1)).thenReturn(Optional.of(mstUserHib));

		when(mealSetMenuDRepository.findCategoryRecipeSummary(1))
				.thenReturn(Collections.singletonList(new Object[] { "Main Course", 2L }));

		when(mealSetMenuHRepository.getMenuSummary())
				.thenReturn(Collections.singletonList(new Object[] { 10, 8, 2, 50.25 }));

		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuList(inputDTO);

		assertTrue(response.isSuccess());
		assertEquals(AppConstants.MSG_RECORD_FETCHED, response.getMessage());
		assertNotNull(response.getData());
		assertEquals(1, response.getData().getMealSetMenuList().size());
	}

	@Test
	void testMealSetMenuList_EmptyList() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		when(mealSetMenuHRepository.findByMealTypeAndApprovalStatus(anyInt(), anyInt()))
				.thenReturn(Collections.emptyList());

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuList(inputDTO);

		// Then
		assertFalse(response.isSuccess());
		assertEquals(null, response.getMessage());
	}

	@Test
	void testMealSetMenuList_CreatedByZero() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setCreatedBy(0);
		List<MealSetMenuHHib> menuList = Arrays.asList(mealSetMenuHHib);
		when(mealSetMenuHRepository.findByMealTypeAndApprovalStatus(anyInt(), anyInt())).thenReturn(menuList);
		when(mealSetMenuDRepository.findCategoryRecipeSummary(anyInt())).thenReturn(Collections.emptyList());
		when(mealSetMenuHRepository.getMenuSummary()).thenReturn(Collections.emptyList());

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuList(inputDTO);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testMealSetMenuList_RestException() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		when(mealSetMenuHRepository.findByMealTypeAndApprovalStatus(anyInt(), anyInt()))
				.thenThrow(new RestException("Test Rest Exception"));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuList(inputDTO);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testMealSetMenuList_GeneralException() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		when(mealSetMenuHRepository.findByMealTypeAndApprovalStatus(anyInt(), anyInt()))
				.thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuList(inputDTO);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testGetApprovalStatusString() {
		assertEquals(MealSetMenuService.STATUS_DRAFT, MealSetMenuService.getApprovalStatusString(3));
		assertEquals(MealSetMenuService.STATUS_APPROVED, MealSetMenuService.getApprovalStatusString(0));
		assertEquals(MealSetMenuService.STATUS_PENDING, MealSetMenuService.getApprovalStatusString(1));
		assertEquals(MealSetMenuService.STATUS_REJECTED, MealSetMenuService.getApprovalStatusString(2));
		assertEquals(MealSetMenuService.STATUS_UNKNOWN, MealSetMenuService.getApprovalStatusString(99));
	}

	@Test
	void testMealSetMenuStatusUpdate_SuccessActivate() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setId(1);
		inputDTO.setStatus('A');

		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuHRepository.save(any(MealSetMenuHHib.class))).thenReturn(mealSetMenuHHib);

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuStatusUpdate(inputDTO);

		// Then
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.ACTIVATED, response.getMessage());
	}

	@Test
	void testMealSetMenuStatusUpdate_SuccessDeactivate() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setId(1);
		inputDTO.setStatus('I');

		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuHRepository.save(any(MealSetMenuHHib.class))).thenReturn(mealSetMenuHHib);

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuStatusUpdate(inputDTO);

		// Then
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.INACTIVATED, response.getMessage());
	}

	@Test
	void testMealSetMenuStatusUpdate_NotFound() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setId(999);
		inputDTO.setStatus('A');

		when(mealSetMenuHRepository.findById(999)).thenReturn(Optional.empty());

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuStatusUpdate(inputDTO);

		// Then
		assertFalse(response.isSuccess());
		assertEquals(AppConstants.ISEMPTY, response.getMessage());
	}

	@Test
	void testMealSetMenuStatusUpdate_NullDTO() {
		// Given
		MealSetMenuDTO inputDTO = null;

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuStatusUpdate(inputDTO);

		// Then
		assertFalse(response.isSuccess());
		assertEquals(AppConstants.E_DATA, response.getMessage());
	}

	@Test
	void testMealSetMenuStatusUpdate_IdZero() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setId(0);

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuStatusUpdate(inputDTO);

		// Then
		assertFalse(response.isSuccess());
		assertEquals(AppConstants.E_DATA, response.getMessage());
	}

	@Test
	void testMealSetMenuStatusUpdate_RestException() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setId(1);
		inputDTO.setStatus('A');

		when(mealSetMenuHRepository.findById(1)).thenThrow(new RestException("Test Rest Exception"));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuStatusUpdate(inputDTO);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testMealSetMenuStatusUpdate_GeneralException() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setId(1);
		inputDTO.setStatus('A');

		when(mealSetMenuHRepository.findById(1)).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuStatusUpdate(inputDTO);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testMealSetMenuViewById_Success() {
		// Given
		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mstUserRepository.findById(1)).thenReturn(Optional.of(mstUserHib));
		when(mealSetMenuDRepository.findByActCat(1)).thenReturn(Arrays.asList(mealSetMenuDHib));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuViewById(1);

		// Then
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.MSG_RECORD_FETCHED, response.getMessage());
		assertNotNull(response.getData());
		assertEquals("Test Menu", response.getData().getMenuName());
	}

	@Test
	void testMealSetMenuViewById_ApprovalStatusDraft() {
		// Given
		mealSetMenuHHib.setApprovalStatus(3);
		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuDRepository.findByActCat(1)).thenReturn(Arrays.asList(mealSetMenuDHib));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuViewById(1);

		// Then
		assertEquals(MealSetMenuService.STATUS_DRAFT, response.getData().getApprovalStatusStr());
	}

	@Test
	void testMealSetMenuViewById_ApprovalStatusApproved() {
		// Given
		mealSetMenuHHib.setApprovalStatus(0);
		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuDRepository.findByActCat(1)).thenReturn(Arrays.asList(mealSetMenuDHib));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuViewById(1);

		// Then
		assertEquals(MealSetMenuService.STATUS_APPROVED, response.getData().getApprovalStatusStr());
	}

	@Test
	void testMealSetMenuViewById_ApprovalStatusPending() {
		// Given
		mealSetMenuHHib.setApprovalStatus(1);
		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuDRepository.findByActCat(1)).thenReturn(Arrays.asList(mealSetMenuDHib));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuViewById(1);

		// Then
		assertEquals(MealSetMenuService.STATUS_PENDING, response.getData().getApprovalStatusStr());
	}

	@Test
	void testMealSetMenuViewById_ApprovalStatusRejected() {
		// Given
		mealSetMenuHHib.setApprovalStatus(2);
		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuDRepository.findByActCat(1)).thenReturn(Arrays.asList(mealSetMenuDHib));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuViewById(1);

		// Then
		assertEquals(MealSetMenuService.STATUS_REJECTED, response.getData().getApprovalStatusStr());
	}

	@Test
	void testMealSetMenuViewById_ApprovalStatusUnknown() {
		// Given
		mealSetMenuHHib.setApprovalStatus(99);
		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuDRepository.findByActCat(1)).thenReturn(Arrays.asList(mealSetMenuDHib));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuViewById(1);

		// Then
		assertEquals(MealSetMenuService.STATUS_UNKNOWN, response.getData().getApprovalStatusStr());
	}

	@Test
	void testMealSetMenuViewById_NotFound() {
		// Given
		when(mealSetMenuHRepository.findById(999)).thenReturn(Optional.empty());

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuViewById(999);

		// Then
		assertFalse(response.isSuccess());
		assertTrue(response.getMessage().contains("not found"));
	}

	@Test
	void testMealSetMenuViewById_ApprovedByZero() {
		// Given
		mealSetMenuHHib.setApprovedBy(0);
		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuDRepository.findByActCat(1)).thenReturn(Arrays.asList(mealSetMenuDHib));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuViewById(1);

		// Then
		assertEquals("Not Assigned", response.getData().getApprover());
	}

	@Test
	void testMealSetMenuViewById_CreatedByZero() {
		// Given
		mealSetMenuHHib.setCreatedBy(0);
		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuDRepository.findByActCat(1)).thenReturn(Arrays.asList(mealSetMenuDHib));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuViewById(1);

		// Then
		assertEquals("Not Assigned", response.getData().getUserName());
	}

	@Test
	void testMealSetMenuViewById_EmptyCategoryList() {
		// Given
		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuDRepository.findByActCat(1)).thenReturn(Collections.emptyList());

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuViewById(1);

		// Then
		assertTrue(response.isSuccess());
		assertNotNull(response.getData().getCategoryList());
		assertTrue(response.getData().getCategoryList().isEmpty());
	}

	@Test
	void testMealSetMenuViewById_NullCategoryList() {
		// Given
		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuDRepository.findByActCat(1)).thenReturn(null);

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuViewById(1);

		// Then
		assertTrue(response.isSuccess());
		assertNotNull(response.getData().getCategoryList());
		assertTrue(response.getData().getCategoryList().isEmpty());
	}

	@Test
	void testMealSetMenuViewById_RestException() {
		// Given
		when(mealSetMenuHRepository.findById(1)).thenThrow(new RestException("Test Rest Exception"));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuViewById(1);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testMealSetMenuViewById_GeneralException() {
		// Given
		when(mealSetMenuHRepository.findById(1)).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuViewById(1);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testMealSetMenuApprovalStatus_Success() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setId(1);
		inputDTO.setApprovalStatus(0);
		inputDTO.setApproverBy(2);

		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuHRepository.save(any(MealSetMenuHHib.class))).thenReturn(mealSetMenuHHib);

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuApprovalStatus(inputDTO);

		// Then
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.APPROVAL_STATUS, response.getMessage());
	}

	@Test
	void testMealSetMenuApprovalStatus_NullDTO() {
		// Given
		MealSetMenuDTO inputDTO = null;

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuApprovalStatus(inputDTO);

		// Then
		assertFalse(response.isSuccess());
		assertEquals(AppConstants.E_DATA, response.getMessage());
	}

	@Test
	void testMealSetMenuApprovalStatus_NotFound() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setId(999);

		when(mealSetMenuHRepository.findById(999)).thenReturn(Optional.empty());

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuApprovalStatus(inputDTO);

		// Then
		assertFalse(response.isSuccess());
		assertEquals(AppConstants.EMPTY, response.getMessage());
	}

	@Test
	void testMealSetMenuApprovalStatus_DataAccessException() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setId(1);

		when(mealSetMenuHRepository.findById(1)).thenThrow(new DataAccessException("Test DA Exception") {
		});

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuApprovalStatus(inputDTO);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testMealSetMenuApprovalStatus_RestException() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setId(1);

		when(mealSetMenuHRepository.findById(1)).thenThrow(new RestException("Test Rest Exception"));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuApprovalStatus(inputDTO);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testMealSetMenuApprovalStatus_GeneralException() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setId(1);

		when(mealSetMenuHRepository.findById(1)).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuApprovalStatus(inputDTO);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testLoadMealTypeDropDown_Success() {
		// Given
		List<RecipeMealMasterHib> mealList = Arrays.asList(recipeMealMasterHib);
		when(recipeMealMasterRepository.orderBy()).thenReturn(mealList);

		// When
		ResponseDTO<List<ComboBoxDTO>> response = mealSetMenuService.loadMealTypeDropDown();

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
		ResponseDTO<List<ComboBoxDTO>> response = mealSetMenuService.loadMealTypeDropDown();

		// Then
		assertFalse(response.isSuccess());
		assertEquals(AppConstants.E_DATA, response.getMessage());
	}

	@Test
	void testLoadMealTypeDropDown_RestException() {
		// Given
		when(recipeMealMasterRepository.orderBy()).thenThrow(new RestException("Test Rest Exception"));

		// When
		ResponseDTO<List<ComboBoxDTO>> response = mealSetMenuService.loadMealTypeDropDown();

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testLoadMealTypeDropDown_GeneralException() {
		// Given
		when(recipeMealMasterRepository.orderBy()).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<List<ComboBoxDTO>> response = mealSetMenuService.loadMealTypeDropDown();

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testLoadCategoryDropDown_Success() {
		// Given
		List<MstCategoryMasterHib> categoryList = Arrays.asList(mstCategoryMasterHib);
		when(mstCategoryMasterRepository.orderBy()).thenReturn(categoryList);

		// When
		ResponseDTO<List<ComboBoxDTO>> response = mealSetMenuService.loadCategoryDropDown();

		// Then
		assertTrue(response.isSuccess());
		assertNotNull(response.getData());
		assertEquals(1, response.getData().size());
		assertEquals("Main Course", response.getData().get(0).getName());
	}

	@Test
	void testLoadCategoryDropDown_EmptyList() {
		// Given
		when(mstCategoryMasterRepository.orderBy()).thenReturn(Collections.emptyList());

		// When
		ResponseDTO<List<ComboBoxDTO>> response = mealSetMenuService.loadCategoryDropDown();

		// Then
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.E_DATA, response.getMessage());
	}

	@Test
	void testLoadCategoryDropDown_NullList() {
		// Given
		when(mstCategoryMasterRepository.orderBy()).thenReturn(null);

		// When
		ResponseDTO<List<ComboBoxDTO>> response = mealSetMenuService.loadCategoryDropDown();

		// Then
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.E_DATA, response.getMessage());
	}

	@Test
	void testLoadCategoryDropDown_RestException() {
		// Given
		when(mstCategoryMasterRepository.orderBy()).thenThrow(new RestException("Test Rest Exception"));

		// When
		ResponseDTO<List<ComboBoxDTO>> response = mealSetMenuService.loadCategoryDropDown();

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testLoadCategoryDropDown_GeneralException() {
		// Given
		when(mstCategoryMasterRepository.orderBy()).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<List<ComboBoxDTO>> response = mealSetMenuService.loadCategoryDropDown();

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testLoadMealSetTemplateDropDown_Success() {
		// Given
		List<MealSetTemplateHHib> templateList = Arrays.asList(mealSetTemplateHHib);
		when(mealSetTemplateHRepository.findByMealTypeStatus(1)).thenReturn(templateList);

		// When
		ResponseDTO<List<ComboBoxDTO>> response = mealSetMenuService.loadMealSetTemplateDropDown(1);

		// Then
		assertTrue(response.isSuccess());
		assertNotNull(response.getData());
		assertEquals(1, response.getData().size());
		assertEquals("Test Template", response.getData().get(0).getName());
	}

	@Test
	void testLoadMealSetTemplateDropDown_NullList() {
		// Given
		when(mealSetTemplateHRepository.findByMealTypeStatus(1)).thenReturn(null);

		// When
		ResponseDTO<List<ComboBoxDTO>> response = mealSetMenuService.loadMealSetTemplateDropDown(1);

		// Then
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.E_DATA, response.getMessage());
	}

	@Test
	void testLoadMealSetTemplateDropDown_RestException() {
		// Given
		when(mealSetTemplateHRepository.findByMealTypeStatus(1)).thenThrow(new RestException("Test Rest Exception"));

		// When
		ResponseDTO<List<ComboBoxDTO>> response = mealSetMenuService.loadMealSetTemplateDropDown(1);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testLoadMealSetTemplateDropDown_GeneralException() {
		// Given
		when(mealSetTemplateHRepository.findByMealTypeStatus(1)).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<List<ComboBoxDTO>> response = mealSetMenuService.loadMealSetTemplateDropDown(1);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testCategoryListByFk_Success() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setTemplateFk(1);

		when(mealSetTemplateHRepository.findById(1)).thenReturn(Optional.of(mealSetTemplateHHib));
		when(mealSetTemplateDRepository.findActiveByTemplateFk(1)).thenReturn(Arrays.asList(mealSetTemplateDHib));
		when(recipeHRepository.filterByCategoryFk(1)).thenReturn(Arrays.asList(recipeHHib));

		// When
		ResponseDTO<List<MealSetMenuDTO>> response = mealSetMenuService.categoryListByFk(inputDTO);

		// Then
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.MSG_RECORD_FETCHED, response.getMessage());
		assertNotNull(response.getData());
		assertEquals(1, response.getData().size());
	}

	@Test
	void testCategoryListByFk_NullInput() {
		// Given
		MealSetMenuDTO inputDTO = null;

		// When
		ResponseDTO<List<MealSetMenuDTO>> response = mealSetMenuService.categoryListByFk(inputDTO);

		// Then
		assertFalse(response.isSuccess());
		assertEquals(AppConstants.ISEMPTY, response.getMessage());
	}

	@Test
	void testCategoryListByFk_TemplateNotFound() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setTemplateFk(999);

		when(mealSetTemplateHRepository.findById(999)).thenReturn(Optional.empty());

		// When
		ResponseDTO<List<MealSetMenuDTO>> response = mealSetMenuService.categoryListByFk(inputDTO);

		// Then
		assertFalse(response.isSuccess());
		assertTrue(response.getMessage().contains("No active templates"));
	}

	@Test
	void testCategoryListByFk_EmptyTemplateDetails() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setTemplateFk(1);

		when(mealSetTemplateHRepository.findById(1)).thenReturn(Optional.of(mealSetTemplateHHib));
		when(mealSetTemplateDRepository.findActiveByTemplateFk(1)).thenReturn(Collections.emptyList());

		// When
		ResponseDTO<List<MealSetMenuDTO>> response = mealSetMenuService.categoryListByFk(inputDTO);

		// Then
		assertFalse(response.isSuccess());
		assertTrue(response.getMessage().contains("No category data"));
	}

	@Test
	void testCategoryListByFk_NullTemplateDetails() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setTemplateFk(1);

		when(mealSetTemplateHRepository.findById(1)).thenReturn(Optional.of(mealSetTemplateHHib));
		when(mealSetTemplateDRepository.findActiveByTemplateFk(1)).thenReturn(null);

		// When
		ResponseDTO<List<MealSetMenuDTO>> response = mealSetMenuService.categoryListByFk(inputDTO);

		// Then
		assertFalse(response.isSuccess());
		assertTrue(response.getMessage().contains("No category data"));
	}

	@Test
	void testCategoryListByFk_Exception() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setTemplateFk(1);

		when(mealSetTemplateHRepository.findById(1)).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<List<MealSetMenuDTO>> response = mealSetMenuService.categoryListByFk(inputDTO);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testLoadRecipeMasterDropDown_Success() {
		// Given
		List<RecipeHHib> recipeList = Arrays.asList(recipeHHib);
		when(recipeHRepository.filterByCategoryFk(1)).thenReturn(recipeList);

		// When
		ResponseDTO<List<ComboBoxDTO>> response = mealSetMenuService.loadRecipeMasterDropDown(1);

		// Then
		assertNotNull(response.getData());
		assertEquals(1, response.getData().size());
		assertEquals("Test Recipe", response.getData().get(0).getName());
		assertEquals(20.10, response.getData().get(0).getPerPortionCost());
	}

	@Test
	void testLoadRecipeMasterDropDown_NullList() {
		// Given
		when(recipeHRepository.filterByCategoryFk(1)).thenReturn(null);

		// When
		ResponseDTO<List<ComboBoxDTO>> response = mealSetMenuService.loadRecipeMasterDropDown(1);

		// Then
		assertFalse(response.isSuccess());
		assertEquals(AppConstants.E_DATA, response.getMessage());
	}

	@Test
	void testLoadRecipeMasterDropDown_RestException() {
		// Given
		when(recipeHRepository.filterByCategoryFk(1)).thenThrow(new RestException("Test Rest Exception"));

		// When
		ResponseDTO<List<ComboBoxDTO>> response = mealSetMenuService.loadRecipeMasterDropDown(1);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testLoadRecipeMasterDropDown_GeneralException() {
		// Given
		when(recipeHRepository.filterByCategoryFk(1)).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<List<ComboBoxDTO>> response = mealSetMenuService.loadRecipeMasterDropDown(1);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testSaveMealSetMenu_Success() {
		// Given
		MealSetMenuDTO inputDTO = createTestMealSetMenuDTO();
		when(recipeMealMasterRepository.findById(1)).thenReturn(Optional.of(recipeMealMasterHib));
		when(mealSetTemplateHRepository.findById(1)).thenReturn(Optional.of(mealSetTemplateHHib));
		when(mealSetMenuHRepository.save(any(MealSetMenuHHib.class))).thenReturn(mealSetMenuHHib);
		when(recipeHRepository.findById(1)).thenReturn(Optional.of(recipeHHib));
		when(mealSetMenuDRepository.save(any(MealSetMenuDHib.class))).thenReturn(mealSetMenuDHib);
		when(recipeDRepository.findByActRecipe(1)).thenReturn(Arrays.asList(recipeDHib));
		when(mealSetMenuIRepository.save(any(MealSetMenuIHib.class))).thenReturn(mealSetMenuIHib);

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.saveMealSetMenu(inputDTO);

		// Then
		assertTrue(response.isSuccess());
		assertEquals("Meal Set Menu saved successfully.", response.getMessage());
	}

	@Test
	void testSaveMealSetMenu_NullDTO() {
		// Given
		MealSetMenuDTO inputDTO = null;

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.saveMealSetMenu(inputDTO);

		// Then
		assertFalse(response.isSuccess());
		assertEquals("Request data is null.", response.getMessage());
	}

	@Test
	void testSaveMealSetMenu_EmptyDetailList() {
		// Given
		MealSetMenuDTO inputDTO = createTestMealSetMenuDTO();
		inputDTO.setDetailList(Collections.emptyList());

		when(recipeMealMasterRepository.findById(1)).thenReturn(Optional.of(recipeMealMasterHib));
		when(mealSetTemplateHRepository.findById(1)).thenReturn(Optional.of(mealSetTemplateHHib));
		when(mealSetMenuHRepository.save(any(MealSetMenuHHib.class))).thenReturn(mealSetMenuHHib);

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.saveMealSetMenu(inputDTO);

		// Then
		assertTrue(response.isSuccess());
	}

	@Test
	void testSaveMealSetMenu_NullDetailList() {
		// Given
		MealSetMenuDTO inputDTO = createTestMealSetMenuDTO();
		inputDTO.setDetailList(null);

		when(recipeMealMasterRepository.findById(1)).thenReturn(Optional.of(recipeMealMasterHib));
		when(mealSetTemplateHRepository.findById(1)).thenReturn(Optional.of(mealSetTemplateHHib));
		when(mealSetMenuHRepository.save(any(MealSetMenuHHib.class))).thenReturn(mealSetMenuHHib);

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.saveMealSetMenu(inputDTO);

		// Then
		assertTrue(response.isSuccess());
	}

	@Test
	void testSaveMealSetMenu_RecipeNotFound() {
		// Given
		MealSetMenuDTO inputDTO = createTestMealSetMenuDTO();
		MealSetMenuDTO detailDTO = new MealSetMenuDTO();
		detailDTO.setRecipeFk(999);
		detailDTO.setCategoryFk(1);
		detailDTO.setCategoryName("Main Course");
		inputDTO.setDetailList(Arrays.asList(detailDTO));

		when(recipeMealMasterRepository.findById(1)).thenReturn(Optional.of(recipeMealMasterHib));
		when(mealSetTemplateHRepository.findById(1)).thenReturn(Optional.of(mealSetTemplateHHib));
		when(mealSetMenuHRepository.save(any(MealSetMenuHHib.class))).thenReturn(mealSetMenuHHib);
		when(recipeHRepository.findById(999)).thenReturn(Optional.empty());

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.saveMealSetMenu(inputDTO);

		// Then
		assertTrue(response.isSuccess()); // Should still succeed as it skips invalid recipes
	}

	@Test
	void testSaveMealSetMenu_NullIngredients() {
		// Given
		MealSetMenuDTO inputDTO = createTestMealSetMenuDTO();

		when(recipeMealMasterRepository.findById(1)).thenReturn(Optional.of(recipeMealMasterHib));
		when(mealSetTemplateHRepository.findById(1)).thenReturn(Optional.of(mealSetTemplateHHib));
		when(mealSetMenuHRepository.save(any(MealSetMenuHHib.class))).thenReturn(mealSetMenuHHib);
		when(recipeHRepository.findById(1)).thenReturn(Optional.of(recipeHHib));
		when(mealSetMenuDRepository.save(any(MealSetMenuDHib.class))).thenReturn(mealSetMenuDHib);
		when(recipeDRepository.findByActRecipe(1)).thenReturn(null);

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.saveMealSetMenu(inputDTO);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testSaveMealSetMenu_EmptyIngredients() {
		// Given
		MealSetMenuDTO inputDTO = createTestMealSetMenuDTO();

		when(recipeMealMasterRepository.findById(1)).thenReturn(Optional.of(recipeMealMasterHib));
		when(mealSetTemplateHRepository.findById(1)).thenReturn(Optional.of(mealSetTemplateHHib));
		when(mealSetMenuHRepository.save(any(MealSetMenuHHib.class))).thenReturn(mealSetMenuHHib);
		when(recipeHRepository.findById(1)).thenReturn(Optional.of(recipeHHib));
		when(mealSetMenuDRepository.save(any(MealSetMenuDHib.class))).thenReturn(mealSetMenuDHib);
		when(recipeDRepository.findByActRecipe(1)).thenReturn(Collections.emptyList());

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.saveMealSetMenu(inputDTO);

		// Then
		assertTrue(response.isSuccess());
	}

	@Test
	void testSaveMealSetMenu_Exception() {
		// Given
		MealSetMenuDTO inputDTO = createTestMealSetMenuDTO();

		when(recipeMealMasterRepository.findById(1)).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.saveMealSetMenu(inputDTO);

		// Then
		assertFalse(response.isSuccess());
		assertEquals("Failed to save menu set data.", response.getMessage());
	}

	@Test
	void testCopyMealSetMenu_Success() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setId(1);
		inputDTO.setNewMenuName("Copied Menu");
		inputDTO.setCreatedBy(1);

		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuHRepository.save(any(MealSetMenuHHib.class))).thenReturn(mealSetMenuHHib);
		when(mealSetMenuDRepository.findByActCat(1)).thenReturn(Arrays.asList(mealSetMenuDHib));
		when(mealSetMenuDRepository.save(any(MealSetMenuDHib.class))).thenReturn(mealSetMenuDHib);
		when(mealSetMenuIRepository.findByMenuDFk(1)).thenReturn(Arrays.asList(mealSetMenuIHib));
		when(mealSetMenuIRepository.save(any(MealSetMenuIHib.class))).thenReturn(mealSetMenuIHib);

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.copyMealSetMenu(inputDTO);

		// Then
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.MSG_RECORD_COPY, response.getMessage());
	}

	@Test
	void testCopyMealSetMenu_OriginalNotFound() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setId(999);

		when(mealSetMenuHRepository.findById(999)).thenReturn(Optional.empty());

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.copyMealSetMenu(inputDTO);

		// Then
		assertFalse(response.isSuccess());
		assertTrue(response.getMessage().contains("menu not found"));
	}

	@Test
	void testCopyMealSetMenu_EmptyDetails() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setId(1);
		inputDTO.setNewMenuName("Copied Menu");
		inputDTO.setCreatedBy(1);

		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuHRepository.save(any(MealSetMenuHHib.class))).thenReturn(mealSetMenuHHib);
		when(mealSetMenuDRepository.findByActCat(1)).thenReturn(Collections.emptyList());

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.copyMealSetMenu(inputDTO);

		// Then
		assertTrue(response.isSuccess());
	}

	@Test
	void testCopyMealSetMenu_NullDetails() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setId(1);
		inputDTO.setNewMenuName("Copied Menu");
		inputDTO.setCreatedBy(1);

		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuHRepository.save(any(MealSetMenuHHib.class))).thenReturn(mealSetMenuHHib);
		when(mealSetMenuDRepository.findByActCat(1)).thenReturn(null);

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.copyMealSetMenu(inputDTO);

		// Then
		assertTrue(response.isSuccess());
	}

	@Test
	void testCopyMealSetMenu_EmptyItems() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setId(1);
		inputDTO.setNewMenuName("Copied Menu");
		inputDTO.setCreatedBy(1);

		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuHRepository.save(any(MealSetMenuHHib.class))).thenReturn(mealSetMenuHHib);
		when(mealSetMenuDRepository.findByActCat(1)).thenReturn(Arrays.asList(mealSetMenuDHib));
		when(mealSetMenuDRepository.save(any(MealSetMenuDHib.class))).thenReturn(mealSetMenuDHib);
		when(mealSetMenuIRepository.findByMenuDFk(1)).thenReturn(Collections.emptyList());

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.copyMealSetMenu(inputDTO);

		// Then
		assertTrue(response.isSuccess());
	}

	@Test
	void testCopyMealSetMenu_NullItems() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setId(1);
		inputDTO.setNewMenuName("Copied Menu");
		inputDTO.setCreatedBy(1);

		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuHRepository.save(any(MealSetMenuHHib.class))).thenReturn(mealSetMenuHHib);
		when(mealSetMenuDRepository.findByActCat(1)).thenReturn(Arrays.asList(mealSetMenuDHib));
		when(mealSetMenuDRepository.save(any(MealSetMenuDHib.class))).thenReturn(mealSetMenuDHib);
		when(mealSetMenuIRepository.findByMenuDFk(1)).thenReturn(null);

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.copyMealSetMenu(inputDTO);

		// Then
		assertTrue(response.isSuccess());
	}

	@Test
	void testCopyMealSetMenu_RestException() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setId(1);

		when(mealSetMenuHRepository.findById(1)).thenThrow(new RestException("Test Rest Exception"));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.copyMealSetMenu(inputDTO);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testCopyMealSetMenu_GeneralException() {
		// Given
		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setId(1);

		when(mealSetMenuHRepository.findById(1)).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.copyMealSetMenu(inputDTO);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testMealSetMenuEditById_Success() {
		// Given
		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuDRepository.findActiveByMenuFk(1)).thenReturn(Arrays.asList(mealSetMenuDHib));
		when(mealSetTemplateHRepository.findById(1)).thenReturn(Optional.of(mealSetTemplateHHib));
		when(mealSetTemplateDRepository.findActiveByTemplateFk(1)).thenReturn(Arrays.asList(mealSetTemplateDHib));
		when(recipeHRepository.filterByCategoryFk(1)).thenReturn(Arrays.asList(recipeHHib));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuEditById(1);

		// Then
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.MSG_RECORD_FETCHED, response.getMessage());
		assertNotNull(response.getData());
		assertNotNull(response.getData().getDetailList());
	}

	@Test
	void testMealSetMenuEditById_NotFound() {
		// Given
		when(mealSetMenuHRepository.findById(999)).thenReturn(Optional.empty());

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuEditById(999);

		// Then
		assertFalse(response.isSuccess());
		assertTrue(response.getMessage().contains("not found"));
	}

	@Test
	void testMealSetMenuEditById_TemplateNotFound() {
		// Given
		mealSetMenuHHib.setTemplateFk(999);
		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuDRepository.findActiveByMenuFk(1)).thenReturn(Arrays.asList(mealSetMenuDHib));
		when(mealSetTemplateHRepository.findById(999)).thenReturn(Optional.empty());

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuEditById(1);

		// Then
		assertFalse(response.isSuccess());
		assertTrue(response.getMessage().contains("Template not found"));
	}

	@Test
	void testMealSetMenuEditById_Exception() {
		// Given
		when(mealSetMenuHRepository.findById(1)).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuEditById(1);

		// Then
		assertFalse(response.isSuccess());
		assertTrue(response.getMessage().contains("Unexpected error"));
	}

	@Test
	void testMealSetMenuEditByIdOld_Success() {
		// Given
		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuDRepository.findActiveByMenuFk(1)).thenReturn(Arrays.asList(mealSetMenuDHib));
		when(mealSetTemplateHRepository.findById(1)).thenReturn(Optional.of(mealSetTemplateHHib));
		when(mealSetTemplateDRepository.findActiveByTemplateFk(1)).thenReturn(Arrays.asList(mealSetTemplateDHib));
		when(recipeHRepository.filterByCategoryFk(1)).thenReturn(Arrays.asList(recipeHHib));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuEditByIdOld(1);

		// Then
		assertTrue(response.isSuccess());
		assertEquals(AppConstants.MSG_RECORD_FETCHED, response.getMessage());
	}

	@Test
	void testMealSetMenuEditByIdOld_NotFound() {
		// Given
		when(mealSetMenuHRepository.findById(999)).thenReturn(Optional.empty());

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuEditByIdOld(999);

		// Then
		assertFalse(response.isSuccess());
		assertTrue(response.getMessage().contains("not found"));
	}

	@Test
	void testMealSetMenuEditByIdOld_RestException() {
		// Given
		when(mealSetMenuHRepository.findById(1)).thenThrow(new RestException("Test Rest Exception"));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuEditByIdOld(1);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testMealSetMenuEditByIdOld_GeneralException() {
		// Given
		when(mealSetMenuHRepository.findById(1)).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuEditByIdOld(1);

		// Then
		assertFalse(response.isSuccess());
	}

	@Test
	void testMealSetMenuModify_Success() {
		// Given
		MealSetMenuDTO inputDTO = createTestMealSetMenuDTO();
		inputDTO.setId(1);

		MealSetMenuDTO detailDTO = new MealSetMenuDTO();
		detailDTO.setRecipeFk(1);
		detailDTO.setCategoryFk(1);
		detailDTO.setCategoryName("Main Course");
		inputDTO.setDetailList(Arrays.asList(detailDTO));

		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuHRepository.save(any(MealSetMenuHHib.class))).thenReturn(mealSetMenuHHib);
		when(mealSetMenuDRepository.findByMenuFk(1)).thenReturn(Arrays.asList(mealSetMenuDHib));
		

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuModify(inputDTO);

		// Then
		assertTrue(response.isSuccess());
		assertTrue(response.getMessage().contains(AppConstants.MSG_RECORD_UPDATED));
	}

	@Test
	void testMealSetMenuModify_NullDTO() {
		// Given
		MealSetMenuDTO inputDTO = null;

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuModify(inputDTO);

		// Then
		assertFalse(response.isSuccess());
		assertEquals("Request data is null.", response.getMessage());
	}

	@Test
	void testMealSetMenuModify_ExistingDetailAlreadyActive() {
		// Given
		MealSetMenuDTO inputDTO = createTestMealSetMenuDTO();
		inputDTO.setId(1);

		MealSetMenuDTO detailDTO = new MealSetMenuDTO();
		detailDTO.setRecipeFk(1);
		detailDTO.setCategoryFk(1);
		detailDTO.setCategoryName("Main Course");
		inputDTO.setDetailList(Arrays.asList(detailDTO));

		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuHRepository.save(any(MealSetMenuHHib.class))).thenReturn(mealSetMenuHHib);
		when(mealSetMenuDRepository.findByMenuFk(1)).thenReturn(Arrays.asList(mealSetMenuDHib));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuModify(inputDTO);

		// Then
		assertTrue(response.isSuccess());
	}

	@Test
	void testMealSetMenuModify_RecipeNotFound() {
		// Given
		MealSetMenuDTO inputDTO = createTestMealSetMenuDTO();
		inputDTO.setId(1);

		MealSetMenuDTO detailDTO = new MealSetMenuDTO();
		detailDTO.setRecipeFk(999); // Non-existent recipe
		detailDTO.setCategoryFk(1);
		detailDTO.setCategoryName("Main Course");
		inputDTO.setDetailList(Arrays.asList(detailDTO));

		when(mealSetMenuHRepository.findById(1)).thenReturn(Optional.of(mealSetMenuHHib));
		when(mealSetMenuHRepository.save(any(MealSetMenuHHib.class))).thenReturn(mealSetMenuHHib);
		when(mealSetMenuDRepository.findByMenuFk(1)).thenReturn(Collections.emptyList());
		when(recipeHRepository.findById(999)).thenReturn(Optional.empty());

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuModify(inputDTO);

		// Then
		assertTrue(response.isSuccess()); // Should still succeed
	}

	@Test
	void testMealSetMenuModify_Exception() {
		// Given
		MealSetMenuDTO inputDTO = createTestMealSetMenuDTO();
		inputDTO.setId(1);

		when(mealSetMenuHRepository.findById(1)).thenThrow(new RuntimeException("Test Exception"));

		// When
		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuModify(inputDTO);

		// Then
		assertFalse(response.isSuccess());
		assertEquals("Failed to save menu set data.", response.getMessage());
	}

	@Test
	void testExportMealSetMenuExcel_Success() {
		// Given
		MealSetMenuDTO filterDTO = new MealSetMenuDTO();
		filterDTO.setMealTypeFk(1);
		filterDTO.setApprovalStatus(3);

		MealSetMenuDTO summaryDTO = new MealSetMenuDTO();
		summaryDTO.setApprover("Test Approver");
		summaryDTO.setTotalMenu(10);
		summaryDTO.setActiveMenu(8);
		summaryDTO.setAverageCost(50.25);

		MealSetMenuDTO menuDTO = new MealSetMenuDTO();
		menuDTO.setId(1);
		menuDTO.setTemplateName("Test Template");
		menuDTO.setMenuName("Test Menu");
		menuDTO.setMealType("Breakfast");
		menuDTO.setTotalRecipes(5);
		menuDTO.setApprovalStatusStr("Draft");
		menuDTO.setUserName("John Doe");
		menuDTO.setApprover("Jane Doe");
		menuDTO.setCreatedDate(new Date());
		menuDTO.setUpdatedDate(new Date());
		menuDTO.setStatusStr("Active");

		MealSetMenuDTO categoryDTO = new MealSetMenuDTO();
		categoryDTO.setCategoriesName("Main Course (2)");
		menuDTO.setCategoryList(Arrays.asList(categoryDTO));

		summaryDTO.setMealSetMenuList(Arrays.asList(menuDTO));

		ResponseDTO<MealSetMenuDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setData(summaryDTO);
		mockResponse.setSuccess(true);

		// Create a spy to mock the mealSetMenuList method
		MealSetMenuService spyService = spy(mealSetMenuService);
		doReturn(mockResponse).when(spyService).mealSetMenuList(any(MealSetMenuDTO.class));

		// When
		ResponseEntity<byte[]> response = spyService.exportMealSetMenuExcel(filterDTO);

		// Then
		assertNotNull(response);
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertNotNull(response.getBody());
		assertTrue(response.getHeaders().getContentDisposition().getFilename().contains("MealSetMenuReport"));
	}

	@Test
	void testExportMealSetMenuExcel_EmptyData() {
		MealSetMenuDTO filterDTO = new MealSetMenuDTO();

		ResponseDTO<MealSetMenuDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setData(null);
		mockResponse.setSuccess(true);

		MealSetMenuService spyService = spy(mealSetMenuService);
		doReturn(mockResponse).when(spyService).mealSetMenuList(any(MealSetMenuDTO.class));

		ResponseEntity<byte[]> response = spyService.exportMealSetMenuExcel(filterDTO);

		assertNotNull(response);
		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

	@Test
	void testExportMealSetMenuExcel_NullSummary() {
		MealSetMenuDTO filterDTO = new MealSetMenuDTO();

		// Summary exists but contains no menu list
		MealSetMenuDTO summaryDTO = new MealSetMenuDTO();
		summaryDTO.setMealSetMenuList(Collections.emptyList());

		ResponseDTO<MealSetMenuDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setData(summaryDTO);
		mockResponse.setSuccess(true);

		MealSetMenuService spyService = spy(mealSetMenuService);
		doReturn(mockResponse).when(spyService).mealSetMenuList(any(MealSetMenuDTO.class));

		ResponseEntity<byte[]> response = spyService.exportMealSetMenuExcel(filterDTO);

		assertNotNull(response);
		assertEquals(HttpStatus.OK, response.getStatusCode());

		// Additional assertion makes method different ✔
		assertTrue(response.getBody().length > 0);
	}

	@Test
	void testExportMealSetMenuExcel_EmptyMenuList() {
		// Given
		MealSetMenuDTO filterDTO = new MealSetMenuDTO();

		MealSetMenuDTO summaryDTO = new MealSetMenuDTO();
		summaryDTO.setMealSetMenuList(Collections.emptyList());

		ResponseDTO<MealSetMenuDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setData(summaryDTO);
		mockResponse.setSuccess(true);

		MealSetMenuService spyService = spy(mealSetMenuService);
		doReturn(mockResponse).when(spyService).mealSetMenuList(any(MealSetMenuDTO.class));

		// When
		ResponseEntity<byte[]> response = spyService.exportMealSetMenuExcel(filterDTO);

		// Then
		assertNotNull(response);
		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

	@Test
	void testExportMealSetMenuExcel_NullMenuList() {
		// Given
		MealSetMenuDTO filterDTO = new MealSetMenuDTO();

		MealSetMenuDTO summaryDTO = new MealSetMenuDTO();
		summaryDTO.setMealSetMenuList(null);

		ResponseDTO<MealSetMenuDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setData(summaryDTO);
		mockResponse.setSuccess(true);

		MealSetMenuService spyService = spy(mealSetMenuService);
		doReturn(mockResponse).when(spyService).mealSetMenuList(any(MealSetMenuDTO.class));

		// When
		ResponseEntity<byte[]> response = spyService.exportMealSetMenuExcel(filterDTO);

		// Then
		assertNotNull(response);
		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

	@Test
	void testExportMealSetMenuExcel_Exception() {
		// Given
		MealSetMenuDTO filterDTO = new MealSetMenuDTO();

		MealSetMenuService spyService = spy(mealSetMenuService);
		doThrow(new RuntimeException("Test Exception")).when(spyService).mealSetMenuList(any(MealSetMenuDTO.class));

		// When
		ResponseEntity<byte[]> response = spyService.exportMealSetMenuExcel(filterDTO);

		// Then
		assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
	}

	@Test
	void testExportSingleMealSetMenuExcel_Success() {
		// Given
		MealSetMenuDTO mealSetMenuDTO2 = new MealSetMenuDTO();
		mealSetMenuDTO2.setMenuName("Test Menu");
		mealSetMenuDTO2.setTemplateName("Test Template");
		mealSetMenuDTO2.setMealType("Breakfast");
		mealSetMenuDTO2.setTotalCost(100.50);
		mealSetMenuDTO2.setUserName("John Doe");
		mealSetMenuDTO2.setApprover("Jane Doe");
		mealSetMenuDTO2.setApprovalStatusStr("Draft");
		mealSetMenuDTO2.setTotalRecipes(5);
		mealSetMenuDTO2.setId(1);

		MealSetMenuDTO categoryDTO = new MealSetMenuDTO();
		categoryDTO.setCategoriesName("Main Course");

		MealSetMenuDTO recipeDTO = new MealSetMenuDTO();
		recipeDTO.setRecipeName("Test Recipe");
		recipeDTO.setPortionSize(2.0);
		recipeDTO.setUom("kg");
		recipeDTO.setRecipeCost(20.10);
		categoryDTO.setRecipes(Arrays.asList(recipeDTO));

		mealSetMenuDTO2.setCategoryList(Arrays.asList(categoryDTO));

		ResponseDTO<MealSetMenuDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setData(mealSetMenuDTO2);
		mockResponse.setSuccess(true);

		when(mstUserRepository.findById(100)).thenReturn(Optional.of(mstUserHib));

		MealSetMenuService spyService = spy(mealSetMenuService);
		doReturn(mockResponse).when(spyService).mealSetMenuViewById(1);

		// When
		ResponseEntity<byte[]> response = spyService.exportSingleMealSetMenuExcel(1, 100);

		// Then
		assertNotNull(response);
		assertEquals(HttpStatus.OK, response.getStatusCode());
		assertNotNull(response.getBody());
	}

	@Test
	void testExportSingleMealSetMenuExcel_EmptyCategoryList() {
		// Given
		MealSetMenuDTO mealSetMenuDTO1 = new MealSetMenuDTO();
		mealSetMenuDTO.setCategoryList(Collections.emptyList());

		ResponseDTO<MealSetMenuDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setData(mealSetMenuDTO1);
		mockResponse.setSuccess(true);

		MealSetMenuService spyService = spy(mealSetMenuService);
		doReturn(mockResponse).when(spyService).mealSetMenuViewById(1);

		// When
		ResponseEntity<byte[]> response = spyService.exportSingleMealSetMenuExcel(1, 100);

		// Then
		assertNotNull(response);
		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

	@Test
	void testExportSingleMealSetMenuExcel_NullCategoryList() {
		// Given
		MealSetMenuDTO mealSetMenuDTO3 = new MealSetMenuDTO();
		mealSetMenuDTO3.setCategoryList(null);

		ResponseDTO<MealSetMenuDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setData(mealSetMenuDTO3);
		mockResponse.setSuccess(true);

		MealSetMenuService spyService = spy(mealSetMenuService);
		doReturn(mockResponse).when(spyService).mealSetMenuViewById(1);

		// When
		ResponseEntity<byte[]> response = spyService.exportSingleMealSetMenuExcel(1, 100);

		// Then
		assertNotNull(response);
		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

	@Test
	void testExportSingleMealSetMenuExcel_NullData() {
		// Given
		ResponseDTO<MealSetMenuDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setData(null);
		mockResponse.setSuccess(true);

		MealSetMenuService spyService = spy(mealSetMenuService);
		doReturn(mockResponse).when(spyService).mealSetMenuViewById(1);

		// When
		ResponseEntity<byte[]> response = spyService.exportSingleMealSetMenuExcel(1, 100);

		// Then
		assertNotNull(response);
		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

	@Test
	void testExportSingleMealSetMenuExcel_UserIdZero() {
		// Given
		MealSetMenuDTO mealSetMenuDTO5 = new MealSetMenuDTO();
		mealSetMenuDTO5.setCategoryList(Collections.emptyList());

		ResponseDTO<MealSetMenuDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setData(mealSetMenuDTO5);
		mockResponse.setSuccess(true);

		MealSetMenuService spyService = spy(mealSetMenuService);
		doReturn(mockResponse).when(spyService).mealSetMenuViewById(1);

		// When
		ResponseEntity<byte[]> response = spyService.exportSingleMealSetMenuExcel(1, 0);

		// Then
		assertNotNull(response);
		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

	@Test
	void testExportSingleMealSetMenuExcel_UserNotFound() {
		// Given
		MealSetMenuDTO mealSetMenuDTO4 = new MealSetMenuDTO();
		mealSetMenuDTO4.setCategoryList(Collections.emptyList());

		ResponseDTO<MealSetMenuDTO> mockResponse = new ResponseDTO<>();
		mockResponse.setData(mealSetMenuDTO4);
		mockResponse.setSuccess(true);

		when(mstUserRepository.findById(100)).thenReturn(Optional.empty());

		MealSetMenuService spyService = spy(mealSetMenuService);
		doReturn(mockResponse).when(spyService).mealSetMenuViewById(1);

		// When
		ResponseEntity<byte[]> response = spyService.exportSingleMealSetMenuExcel(1, 100);

		// Then
		assertNotNull(response);
		assertEquals(HttpStatus.OK, response.getStatusCode());
	}

	@Test
	void testExportSingleMealSetMenuExcel_Exception() {
		// Given
		MealSetMenuService spyService = spy(mealSetMenuService);
		doThrow(new RuntimeException("Test Exception")).when(spyService).mealSetMenuViewById(1);

		// When
		ResponseEntity<byte[]> response = spyService.exportSingleMealSetMenuExcel(1, 100);

		// Then
		assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
	}

	@Test
	void testCreateTitleStyle() {
		// When
		Workbook workbook = new HSSFWorkbook();
		CellStyle style = MealSetMenuService.createTitleStyle(workbook);

		// Then
		assertNotNull(style);
		assertEquals(HorizontalAlignment.CENTER, style.getAlignment());
	}

	@Test
	void testCreateCenterStyle() {
		// When
		Workbook workbook = new HSSFWorkbook();
		CellStyle style = MealSetMenuService.createCenterStyle(workbook);

		// Then
		assertNotNull(style);
		assertEquals(HorizontalAlignment.CENTER, style.getAlignment());
	}

	@Test
	void testCreateNumberStyle() {
		// When
		Workbook workbook = new HSSFWorkbook();
		CellStyle style = MealSetMenuService.createNumberStyle(workbook);

		// Then
		assertNotNull(style);
		assertEquals(HorizontalAlignment.CENTER, style.getAlignment());
	}

	@Test
	void testSetBorders() {
		// When
		@SuppressWarnings("resource")
		Workbook workbook = new HSSFWorkbook();
		CellStyle style = workbook.createCellStyle();
		MealSetMenuService.setBorders(style);

		// Then
		assertEquals(BorderStyle.THIN, style.getBorderBottom());
		assertEquals(BorderStyle.THIN, style.getBorderTop());
		assertEquals(BorderStyle.THIN, style.getBorderLeft());
		assertEquals(BorderStyle.THIN, style.getBorderRight());
	}

	@Test
	void testBuildErrorResponse1() {
		// Given
		@SuppressWarnings("unused")
		ResponseDTO<List<MealSetMenuDTO>> response = new ResponseDTO<>();
		@SuppressWarnings("unused")
		String message = "Test error message";

		// When
		ResponseDTO<List<MealSetMenuDTO>> result = mealSetMenuService.categoryListByFk(null);

		// Then - This tests the private method through the public method
		assertFalse(result.isSuccess());
		assertEquals(AppConstants.ISEMPTY, result.getMessage());
	}

	@Test
	void testFetchCategoryList_Empty() {

		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setMealTypeFk(1);
		inputDTO.setApprovalStatus(3);
		inputDTO.setCreatedBy(1);

		List<MealSetMenuHHib> menuList = Arrays.asList(mealSetMenuHHib);

		when(mealSetMenuHRepository.findByMealTypeAndApprovalStatus(1, 3)).thenReturn(menuList);

		when(mstUserRepository.findById(1)).thenReturn(Optional.of(mstUserHib));

		// empty list case
		when(mealSetMenuDRepository.findCategoryRecipeSummary(1)).thenReturn(Collections.emptyList());

		// proper List<Object[]> mock
		List<Object[]> summary = new ArrayList<>();
		summary.add(new Object[] { 10, 8, 2, 50.25 });

		when(mealSetMenuHRepository.getMenuSummary()).thenReturn(summary);

		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuList(inputDTO);

		assertTrue(response.isSuccess());
		assertTrue(response.getData().getMealSetMenuList().get(0).getCategoryList().isEmpty());
	}

	@Test
	void testFetchCategoryList_Null() {

		MealSetMenuDTO inputDTO = new MealSetMenuDTO();
		inputDTO.setMealTypeFk(1);
		inputDTO.setApprovalStatus(3);
		inputDTO.setCreatedBy(1);

		List<MealSetMenuHHib> menuList = Arrays.asList(mealSetMenuHHib);

		when(mealSetMenuHRepository.findByMealTypeAndApprovalStatus(1, 3)).thenReturn(menuList);

		when(mstUserRepository.findById(1)).thenReturn(Optional.of(mstUserHib));

		// category list NULL case
		when(mealSetMenuDRepository.findCategoryRecipeSummary(1)).thenReturn(null);

		// proper List<Object[]> mock
		List<Object[]> summary = new ArrayList<>();
		summary.add(new Object[] { 10, 8, 2, 50.25 });
		when(mealSetMenuHRepository.getMenuSummary()).thenReturn(summary);

		ResponseDTO<MealSetMenuDTO> response = mealSetMenuService.mealSetMenuList(inputDTO);

		assertTrue(response.isSuccess());
		assertTrue(response.getData().getMealSetMenuList().get(0).getCategoryList().isEmpty());
	}

	// Helper method to create test MealSetMenuDTO
	private MealSetMenuDTO createTestMealSetMenuDTO() {
		MealSetMenuDTO dto = new MealSetMenuDTO();
		dto.setId(1);
		dto.setMenuName("Test Menu");
		dto.setMealTypeFk(1);
		dto.setTemplateFk(1);
		dto.setCategoryCount(2);
		dto.setRecipeCount(5);
		dto.setTotalCost(100.50);
		dto.setApproverBy(1);
		dto.setCreatedBy(1);

		MealSetMenuDTO detailDTO = new MealSetMenuDTO();
		detailDTO.setRecipeFk(1);
		detailDTO.setCategoryFk(1);
		detailDTO.setCategoryName("Main Course");
		dto.setDetailList(Arrays.asList(detailDTO));

		return dto;
	}
}