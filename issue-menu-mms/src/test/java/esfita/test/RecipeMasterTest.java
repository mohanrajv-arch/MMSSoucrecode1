package esfita.test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


import java.util.ArrayList;

import java.util.Collections;
import java.util.Date;
import java.util.List;


import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import esfita.common.AppConstants;
import esfita.common.ComboBoxDTO;
import esfita.common.ResponseDTO;
import esfita.dto.IssueMenuToLocationDTO;

import esfita.entity.FinalSetMenuDHib;
import esfita.entity.FinalSetMenuHHib;
import esfita.entity.FinalSetMenuMHib;
import esfita.entity.IssueMenuDHib;
import esfita.entity.IssueMenuHHib;
import esfita.entity.IssueMenuIHib;
import esfita.entity.IssueMenuMHib;

import esfita.entity.MstLocationMenuHib;

import esfita.repository.AppPreferencesRepository;
import esfita.repository.CategoryMasterRepository;
import esfita.repository.CountryMasterRepository;
import esfita.repository.FinalSetMenuDRepository;
import esfita.repository.FinalSetMenuHRepository;
import esfita.repository.FinalSetMenuIRepository;
import esfita.repository.FinalSetMenuMRepository;
import esfita.repository.IssueMenuDRepository;
import esfita.repository.IssueMenuHRepository;
import esfita.repository.IssueMenuIRepository;
import esfita.repository.IssueMenuMRepository;
import esfita.repository.ItemMasterRepository;
import esfita.repository.ItemReqDRepository;
import esfita.repository.ItemReqHRepository;
import esfita.repository.MstLocationMenuRepository;
import esfita.repository.MstUserRepository;
import esfita.repository.RecipeCategoryMappingRepository;
import esfita.repository.RecipeDHistoryRepository;
import esfita.repository.RecipeDRepository;
import esfita.repository.RecipeHHistoryRepository;
import esfita.repository.RecipeHRepository;
import esfita.repository.RecipeMealMappingRepository;
import esfita.repository.RecipeMealMasterRepository;
import esfita.service.IssueMenuService;
import esfita.service.ItemRequisitionService;

 class RecipeMasterTest {
	  @InjectMocks
	    private ItemRequisitionService recipeService;
	  private IssueMenuService issueMenuService; // your service class

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
	    
	    @Mock
	    private IssueMenuMRepository issueMenuMRepository;

	    @Mock
	    private IssueMenuHRepository issueMenuHRepository;

	    @Mock
	    private IssueMenuIRepository issueMenuIRepository;

	    @Mock
	    private ItemReqHRepository itemReqHRepository;

	    @Mock
	    private ItemReqDRepository itemReqDRepository;

	    @Mock
	    private ItemMasterRepository itemMasterRepository;

	    @Mock
	    private MstLocationMenuRepository mstLoctionMenuRepository;
	    @Mock
	    private FinalSetMenuMRepository finalSetMenuMRepository;

	    @Mock
	    private FinalSetMenuHRepository finalSetMenuHRepository;

	    @Mock
	    private FinalSetMenuDRepository finalSetMenuDRepository;

	    @Mock
	    private FinalSetMenuIRepository finalSetMenuIRepository;

	    

	    @Mock
	    private IssueMenuDRepository issueMenuDRepository;


	    @BeforeEach
	    void setUp() {
	        MockitoAnnotations.openMocks(this);
	    }

	

	    @Test
	    void testLoadFinalMenuDropDown_EmptyList() {
	        // Arrange
	        when(finalSetMenuMRepository.orderBy()).thenReturn(null);

	        // Act
	        ResponseDTO<List<ComboBoxDTO>> response = issueMenuService.loadFinalMenuDropDown();

	        // Assert
	        assertFalse(response.isSuccess());
	        assertEquals(AppConstants.E_DATA, response.getMessage());
	        assertTrue(response.getData().isEmpty());
	    }

	    @Test
	    void testFinalMenuDetailsByPk_Success() {
	        // Arrange
	        int id = 1;
	        FinalSetMenuMHib finalSetMenuMHib = new FinalSetMenuMHib();
	        finalSetMenuMHib.setId(id);
	        finalSetMenuMHib.setName("Test Menu");
	        finalSetMenuMHib.setTotal(100.0);

	        FinalSetMenuHHib header = new FinalSetMenuHHib();
	        header.setMenuFk(1);
	        header.setMealTypeFk(1);
	        header.setMealTypeName("Breakfast");

	        FinalSetMenuDHib detail = new FinalSetMenuDHib();
	        detail.setId(1);
	        detail.setFinalMenuFk(id);
	        detail.setMenuFk(1);
	        detail.setCategoryFk(1);
	        detail.setCategoryName("Main Course");
	        detail.setRecipeFk(1);
	        detail.setRecipeName("Pasta");
	        detail.setPortionSize(1.0);
	        detail.setPerPortionCost(10.0);
	        detail.setUom("kg");

	        when(finalSetMenuMRepository.findById(id)).thenReturn(finalSetMenuMHib);
	        when(finalSetMenuHRepository.findActiveHeadersByFinalMenuFk(id)).thenReturn(Collections.singletonList(header));
	        when(finalSetMenuDRepository.findByActCat(id, 1)).thenReturn(Collections.singletonList(detail));

	        // Act
	        ResponseDTO<IssueMenuToLocationDTO> response = issueMenuService.finalMenuDetailsByPk(id);

	        // Assert
	        assertTrue(response.isSuccess());
	        assertEquals("Test Menu", response.getData().getName());
	        assertEquals(100.0, response.getData().getTotalCost());
	        assertEquals(1, response.getData().getMenuDetail().size());
	        assertEquals("Pasta", response.getData().getMenuDetail().get(0).getRecipeName());
	        assertEquals(AppConstants.MSG_RECORD_FETCHED, response.getMessage());
	    }

	    @Test
	    void testSaveIssuedMenu_Success() {
	        // Arrange
	        IssueMenuToLocationDTO dto = new IssueMenuToLocationDTO();
	        dto.setFinalMenuFk(1);
	        dto.setLocationFk(1);
	        dto.setNotes("Test Notes");
	        dto.setPob(100);
	        dto.setTotalCost(1000.0);
	        dto.setCreatedBy(1);
	        dto.setMenuIssuedDate(new Date());
	        List<IssueMenuToLocationDTO> changedDetails = new ArrayList<>();
	        IssueMenuToLocationDTO changedDto = new IssueMenuToLocationDTO();
	        changedDto.setMenuFk(1);
	        changedDto.setCategoryFk(1);
	        changedDto.setRecipeFk(1);
	        changedDetails.add(changedDto);
	        dto.setChangedDetails(changedDetails);

	        FinalSetMenuMHib finalMenu = new FinalSetMenuMHib();
	        finalMenu.setId(1);
	        finalMenu.setName("Test Menu");

	        FinalSetMenuHHib finalHeader = new FinalSetMenuHHib();
	        finalHeader.setMenuFk(1);
	        finalHeader.setMealTypeFk(1);
	        finalHeader.setMealTypeName("Breakfast");

	        FinalSetMenuDHib finalDetail = new FinalSetMenuDHib();
	        finalDetail.setMenuFk(1);
	        finalDetail.setCategoryFk(1);
	        finalDetail.setRecipeFk(1);
	        finalDetail.setCategoryName("Main Course");

	        when(finalSetMenuMRepository.findById(1)).thenReturn(finalMenu);
	        when(finalSetMenuHRepository.findActiveHeadersByFinalMenuFk(1)).thenReturn(Collections.singletonList(finalHeader));
	        when(finalSetMenuDRepository.findByActCat(1, 1)).thenReturn(Collections.singletonList(finalDetail));
	        when(finalSetMenuDRepository.findByFinalFkMenuFkAndRecipeFk(1, 1, 1, 1)).thenReturn(finalDetail);

	        // Act
	        ResponseDTO<IssueMenuToLocationDTO> response = issueMenuService.saveIssuedMenu(dto);

	        // Assert
	        assertTrue(response.isSuccess());
	        assertEquals("Issued Menu saved successfully!", response.getMessage());
	        verify(issueMenuMRepository, times(1)).save(any(IssueMenuMHib.class));
	        verify(issueMenuHRepository, times(1)).save(any(IssueMenuHHib.class));
	        verify(issueMenuDRepository, times(1)).save(any(IssueMenuDHib.class));
	    }

	    @Test
	    void testIssueMenuToLocationList_Success() {
	        // Arrange
	        int locationFk = 1;
	        IssueMenuMHib entity = new IssueMenuMHib();
	        entity.setId(1);
	        entity.setName("Test Menu");
	        entity.setFinalMenuFk(1);
	        entity.setMenuDate("2023-10-01");
	        entity.setPob(100);

	        IssueMenuHHib header = new IssueMenuHHib();
	        header.setMealTypeName("Breakfast");

	        when(issueMenuMRepository.findByLocationFk(locationFk)).thenReturn(Collections.singletonList(entity));
	        when(issueMenuHRepository.findList(1)).thenReturn(Collections.singletonList(header));

	        // Act
	        ResponseDTO<List<IssueMenuToLocationDTO>> response = issueMenuService.issueMenuToLocationList(1);

	        // Assert
	        assertTrue(response.isSuccess());
	        assertEquals(1, response.getData().size());
	        assertEquals("Test Menu", response.getData().get(0).getName());
	        assertEquals("Breakfast", response.getData().get(0).getMealTypeName());
	        assertEquals(AppConstants.MSG_RECORD_FETCHED, response.getMessage());
	    }

	    @Test
	    void testIssueMenuApprovedStatusList_Success() {
	        // Arrange
	        IssueMenuMHib entity = new IssueMenuMHib();
	        entity.setId(1);
	        entity.setName("Test Menu");
	        entity.setPob(100);
	        entity.setFinalMenuFk(1);
	        entity.setMenuDate("2023-10-01");
	        entity.setLocationFk(1);
	        entity.setIssueStatus(1); // Approved

	        MstLocationMenuHib location = new MstLocationMenuHib();
	        location.setLocationName("Test Location");

	        when(issueMenuMRepository.findAll()).thenReturn(Collections.singletonList(entity));
	        when(mstLoctionMenuRepository.findById(1)).thenReturn(location);

	        // Act
	        ResponseDTO<IssueMenuToLocationDTO> response = issueMenuService.issueMenuApprovedStatusList();

	        // Assert
	        assertTrue(response.isSuccess());
	        assertEquals(1, response.getData().getApprovedApprovals().size());
	        assertEquals("Test Menu", response.getData().getApprovedApprovals().get(0).getName());
	        assertEquals("Test Location", response.getData().getApprovedApprovals().get(0).getLocationName());
	        assertEquals("Issued Menu records " + AppConstants.MSG_RECORD_FETCHED, response.getMessage());
	    }

	    @Test
	    void testUpdateApprovalStatus_Success() {
	        // Arrange
	        IssueMenuToLocationDTO dto = new IssueMenuToLocationDTO();
	        dto.setId(1);
	        dto.setApprovalStatus(1);
	        dto.setCreatedBy(1);

	        IssueMenuMHib master = new IssueMenuMHib();
	        master.setId(1);

	        when(issueMenuMRepository.findById(1)).thenReturn(master);

	        // Act
	        ResponseDTO<IssueMenuToLocationDTO> response = issueMenuService.updateApprovalStatus(dto);

	        // Assert
	        assertTrue(response.isSuccess());
	        assertEquals("Issued Menu updated successfully!", response.getMessage());
	        verify(issueMenuMRepository, times(1)).save(master);
	    }

	    @Test
	    void testIssueMenuToLocationUserList_Success() {
	        // Arrange
	        int id = 1;
	        IssueMenuMHib entity = new IssueMenuMHib();
	        entity.setId(1);
	        entity.setName("Test Menu");
	        entity.setFinalMenuFk(1);
	        entity.setMenuDate("2023-10-01");
	        entity.setPob(100);
	        entity.setStatus('A');
	        entity.setIssueStatus(3);

	        IssueMenuHHib header = new IssueMenuHHib();
	        header.setMealTypeFk(1);
	        header.setMealTypeName("Breakfast");

	        when(issueMenuMRepository.findMenusByLocatioFk(id)).thenReturn(Collections.singletonList(entity));
	        when(issueMenuHRepository.findList(1)).thenReturn(Collections.singletonList(header));

	        // Act
	        ResponseDTO<List<IssueMenuToLocationDTO>> response = issueMenuService.issueMenuToLocationUserList(id);

	        // Assert
	        assertTrue(response.isSuccess());
	        assertEquals(1, response.getData().size());
	        assertEquals("Test Menu", response.getData().get(0).getName());
	        assertEquals("Active", response.getData().get(0).getStatusStr());
	        assertEquals("Finalized", response.getData().get(0).getIssuedStatusStr());
	        assertEquals("Breakfast", response.getData().get(0).getMenuDetail().get(0).getMealTypeName());
	        assertEquals(AppConstants.MSG_RECORD_FETCHED, response.getMessage());
	    }

	    @Test
	    void testIssueMenuToLocationUserTabList_Success() {
	        // Arrange
	        int id = 1;
	        IssueMenuMHib entity = new IssueMenuMHib();
	        entity.setId(1);
	        entity.setName("Test Menu");
	        entity.setFinalMenuFk(1);
	        entity.setMenuDate("2023-10-01");
	        entity.setActualPob(100);
	        entity.setIssueStatus(3);
	        entity.setStatus('A');

	        IssueMenuHHib header = new IssueMenuHHib();
	        header.setId(1);
	        header.setMealTypeFk(1);
	        header.setMealTypeName("Breakfast");
	        header.setMenuName("Daily Menu");

	        IssueMenuDHib detail = new IssueMenuDHib();
	        detail.setId(1);
	        detail.setMenuFk(1);
	        detail.setCategoryFk(1);
	        detail.setCategoryName("Main Course");
	        detail.setRecipeFk(1);
	        detail.setRecipeName("Pasta");
	        detail.setActualPobParticipation(50.0);
	        detail.setPortionSize(1.0);
	        detail.setPerPortionCost(10.0);
	        detail.setUom("kg");

	        when(issueMenuMRepository.findById(id)).thenReturn(entity);
	        when(issueMenuHRepository.findList(1)).thenReturn(Collections.singletonList(header));
	        when(issueMenuDRepository.findByIssueMenuHFk(1)).thenReturn(Collections.singletonList(detail));

	        // Act
	        ResponseDTO<IssueMenuToLocationDTO> response = issueMenuService.issueMenuToLocationUserTabList(id);

	        // Assert
	        assertTrue(response.isSuccess());
	        assertEquals("Test Menu", response.getData().getName());
	        assertEquals(500.0, response.getData().getTotalCost()); // 10 * 100 * 50/100
	        assertEquals("Finalized", response.getData().getIssuedStatusStr());
	        assertEquals("Active", response.getData().getStatusStr());
	        assertEquals(1, response.getData().getDetailList().size());
	        assertEquals("Pasta", response.getData().getDetailList().get(0).getRecipeName());
	        assertEquals(AppConstants.MSG_RECORD_FETCHED, response.getMessage());
	    }

	    @Test
	    void testUpdateIssuedMenuStatusAndPob_Success() {
	        // Arrange
	        IssueMenuToLocationDTO dto = new IssueMenuToLocationDTO();
	        dto.setId(1);
	        dto.setIssueStatus(3);
	        dto.setPob(100);
	        dto.setTotalCost(1000.0);
	        dto.setCreatedBy(1);

	        IssueMenuToLocationDTO detailDto = new IssueMenuToLocationDTO();
	        detailDto.setRecipeFk(1);
	        detailDto.setCategoryFk(1);
	        detailDto.setMealTypeFk(1);
	        detailDto.setPobParticipation(50.0);
	        detailDto.setTotalCost(500.0);
	        dto.setDetailList(Collections.singletonList(detailDto));

	        IssueMenuMHib master = new IssueMenuMHib();
	        master.setId(1);

	        IssueMenuDHib detail = new IssueMenuDHib();
	        detail.setId(1);
	        detail.setMenuFk(1);
	        detail.setCategoryFk(1);
	        detail.setRecipeFk(1);

	        when(issueMenuMRepository.findById(1)).thenReturn(master);
	        when(issueMenuDRepository.findByIssueMenuMFk(1)).thenReturn(Collections.singletonList(detail));

	        // Act
	        ResponseDTO<IssueMenuToLocationDTO> response = issueMenuService.updateIssuedMenuStatusAndPob(dto);

	        // Assert
	        assertTrue(response.isSuccess());
	        assertEquals("Issued Menu updated successfully!", response.getMessage());
	        verify(issueMenuMRepository, times(1)).save(master);
	        verify(issueMenuDRepository, times(1)).save(detail);
	    }

	    @Test
	    void testFetchIssuedMenuItemsByDFk_Success() {
	        // Arrange
	        IssueMenuToLocationDTO dtos = new IssueMenuToLocationDTO();
	        dtos.setIssueMenuDFk(1);
	        dtos.setRecipeFk(26);

	        IssueMenuDHib detail = new IssueMenuDHib();
	        detail.setId(1);
	        detail.setRecipeName("Pasta");
	        detail.setCategoryName("Main Course");

	        IssueMenuIHib item = new IssueMenuIHib();
	        item.setId(1);
	        item.setIssueMenuDFk(1);
	        item.setItemCode("ITEM001");
	        item.setItemName("Tomato");
	        item.setTotal(50.0);

	        when(issueMenuIRepository.findByIssueMenuDFkAndRecipeFkAndCategoryFk(1, 1)).thenReturn(Collections.singletonList(item));
	        when(issueMenuDRepository.findById(1)).thenReturn(detail);

	        // Act
	        ResponseDTO<List<IssueMenuToLocationDTO>> response = issueMenuService.fetchIssuedMenuItemsByDFk(dtos);

	        // Assert
	        assertTrue(response.isSuccess());
	        assertEquals(2, response.getData().size()); // 1 item + grand total
	        assertEquals("Tomato", response.getData().get(0).getItemName());
	        assertEquals("Grand Total", response.getData().get(1).getItemName());
	        assertEquals(50.0, response.getData().get(1).getTotalCost());
	        assertEquals("Items fetched successfully!", response.getMessage());
	    }

		public ItemRequisitionService getRecipeService() {
			return recipeService;
		}

		public void setRecipeService(ItemRequisitionService recipeService) {
			this.recipeService = recipeService;
		}

		public RecipeHRepository getRecipeHRepository() {
			return recipeHRepository;
		}

		public void setRecipeHRepository(RecipeHRepository recipeHRepository) {
			this.recipeHRepository = recipeHRepository;
		}

		public RecipeDRepository getRecipeDRepository() {
			return recipeDRepository;
		}

		public void setRecipeDRepository(RecipeDRepository recipeDRepository) {
			this.recipeDRepository = recipeDRepository;
		}

		public RecipeHHistoryRepository getRecipeHHistoryRepository() {
			return recipeHHistoryRepository;
		}

		public void setRecipeHHistoryRepository(RecipeHHistoryRepository recipeHHistoryRepository) {
			this.recipeHHistoryRepository = recipeHHistoryRepository;
		}

		public RecipeDHistoryRepository getRecipeDHistoryRepository() {
			return recipeDHistoryRepository;
		}

		public void setRecipeDHistoryRepository(RecipeDHistoryRepository recipeDHistoryRepository) {
			this.recipeDHistoryRepository = recipeDHistoryRepository;
		}

		public CategoryMasterRepository getCategoryMasterRepository() {
			return categoryMasterRepository;
		}

		public void setCategoryMasterRepository(CategoryMasterRepository categoryMasterRepository) {
			this.categoryMasterRepository = categoryMasterRepository;
		}

		public RecipeCategoryMappingRepository getRecipeCategoryMappingRepository() {
			return recipeCategoryMappingRepository;
		}

		public void setRecipeCategoryMappingRepository(RecipeCategoryMappingRepository recipeCategoryMappingRepository) {
			this.recipeCategoryMappingRepository = recipeCategoryMappingRepository;
		}

		public RecipeMealMasterRepository getRecipeMealMasterRepository() {
			return recipeMealMasterRepository;
		}

		public void setRecipeMealMasterRepository(RecipeMealMasterRepository recipeMealMasterRepository) {
			this.recipeMealMasterRepository = recipeMealMasterRepository;
		}

		public RecipeMealMappingRepository getRecipeMealMappingRepository() {
			return recipeMealMappingRepository;
		}

		public void setRecipeMealMappingRepository(RecipeMealMappingRepository recipeMealMappingRepository) {
			this.recipeMealMappingRepository = recipeMealMappingRepository;
		}

		public CountryMasterRepository getCountryMasterRepository() {
			return countryMasterRepository;
		}

		public void setCountryMasterRepository(CountryMasterRepository countryMasterRepository) {
			this.countryMasterRepository = countryMasterRepository;
		}

		public MstUserRepository getMstUserRepository() {
			return mstUserRepository;
		}

		public void setMstUserRepository(MstUserRepository mstUserRepository) {
			this.mstUserRepository = mstUserRepository;
		}

		public AppPreferencesRepository getAppPreferrenceRepository() {
			return appPreferrenceRepository;
		}

		public void setAppPreferrenceRepository(AppPreferencesRepository appPreferrenceRepository) {
			this.appPreferrenceRepository = appPreferrenceRepository;
		}

		public IssueMenuMRepository getIssueMenuMRepository() {
			return issueMenuMRepository;
		}

		public void setIssueMenuMRepository(IssueMenuMRepository issueMenuMRepository) {
			this.issueMenuMRepository = issueMenuMRepository;
		}

		public IssueMenuHRepository getIssueMenuHRepository() {
			return issueMenuHRepository;
		}

		public void setIssueMenuHRepository(IssueMenuHRepository issueMenuHRepository) {
			this.issueMenuHRepository = issueMenuHRepository;
		}

		public IssueMenuIRepository getIssueMenuIRepository() {
			return issueMenuIRepository;
		}

		public void setIssueMenuIRepository(IssueMenuIRepository issueMenuIRepository) {
			this.issueMenuIRepository = issueMenuIRepository;
		}

		public ItemReqHRepository getItemReqHRepository() {
			return itemReqHRepository;
		}

		public void setItemReqHRepository(ItemReqHRepository itemReqHRepository) {
			this.itemReqHRepository = itemReqHRepository;
		}

		public ItemReqDRepository getItemReqDRepository() {
			return itemReqDRepository;
		}

		public void setItemReqDRepository(ItemReqDRepository itemReqDRepository) {
			this.itemReqDRepository = itemReqDRepository;
		}

		public ItemMasterRepository getItemMasterRepository() {
			return itemMasterRepository;
		}

		public void setItemMasterRepository(ItemMasterRepository itemMasterRepository) {
			this.itemMasterRepository = itemMasterRepository;
		}

		public MstLocationMenuRepository getMstLoctionMenuRepository() {
			return mstLoctionMenuRepository;
		}

		public void setMstLoctionMenuRepository(MstLocationMenuRepository mstLoctionMenuRepository) {
			this.mstLoctionMenuRepository = mstLoctionMenuRepository;
		}
}
