package esfita.test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.text.SimpleDateFormat;
import java.util.Arrays;
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
import esfita.dto.ItemRequisitionDTO;
import esfita.entity.FinalSetMenuDHib;
import esfita.entity.FinalSetMenuHHib;
import esfita.entity.FinalSetMenuMHib;
import esfita.entity.IssueMenuHHib;
import esfita.entity.IssueMenuIHib;
import esfita.entity.IssueMenuMHib;
import esfita.entity.ItemMasterHib;
import esfita.entity.ItemReqDHib;
import esfita.entity.ItemReqHHib;
import esfita.entity.MstLocationMenuHib;
import esfita.repository.CountryMasterRepository;
import esfita.repository.FinalSetMenuDRepository;
import esfita.repository.FinalSetMenuHRepository;
import esfita.repository.FinalSetMenuMRepository;
import esfita.repository.IssueMenuDRepository;
import esfita.repository.IssueMenuHRepository;
import esfita.repository.IssueMenuIRepository;
import esfita.repository.IssueMenuMRepository;
import esfita.repository.ItemMasterRepository;
import esfita.repository.ItemReqDRepository;
import esfita.repository.ItemReqHRepository;
import esfita.repository.MstLocationMenuRepository;
import esfita.repository.RecipeCategoryMappingRepository;
import esfita.repository.RecipeDRepository;
import esfita.repository.RecipeHRepository;
import esfita.repository.RecipeMealMappingRepository;
import esfita.service.IssueMenuService;
import esfita.service.ItemRequisitionService;

class IssueMenuTest {

    @InjectMocks
    private IssueMenuService issueMenuService;

    @Mock
    private FinalSetMenuMRepository finalSetMenuMRepository;
    @Mock
    private FinalSetMenuHRepository finalSetMenuHRepository;
    @Mock
    private FinalSetMenuDRepository finalSetMenuDRepository;
    @Mock
    private IssueMenuMRepository issueMenuMRepository;
    @Mock
    private IssueMenuHRepository issueMenuHRepository;
    @Mock
    private IssueMenuDRepository issueMenuDRepository;
    @Mock
    private IssueMenuIRepository issueMenuIRepository;
    @Mock
    private RecipeHRepository recipeHRepository;
    @Mock
    private RecipeDRepository recipeDRepository;
    @Mock
    private MstLocationMenuRepository mstLoctionMenuRepository;
    @InjectMocks
    private ItemRequisitionService itemRequisitionService;
    @Mock
    private ItemMasterRepository itemMasterRepository;
    @Mock
    private ItemReqHRepository itemReqHRepository;

    @Mock
    private ItemReqDRepository itemReqDRepository;
    @Mock
    private CountryMasterRepository countryMasterRepository;

    @Mock
    private RecipeCategoryMappingRepository recipeCategoryMappingRepository;

    @Mock
    private RecipeMealMappingRepository recipeMealMappingRepository;
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }
    @Test
    void testLoadFinalMenuDropDown_withData() {
        // Arrange
        FinalSetMenuMHib hib1 = new FinalSetMenuMHib();
        hib1.setId(1);
        hib1.setName("BREAKFAST");

        FinalSetMenuMHib hib2 = new FinalSetMenuMHib();
        hib2.setId(2);
        hib2.setName("DINNER");

        when(finalSetMenuMRepository.orderBy()).thenReturn(Arrays.asList(hib1, hib2));

        // Act
        ResponseDTO<List<ComboBoxDTO>> response = issueMenuService.loadFinalMenuDropDown();

        // Assert
        assertTrue(response.isSuccess());
        assertNotNull(response.getData());
        assertEquals(2, response.getData().size());
        assertEquals("BREAKFAST", response.getData().get(0).getName());
        verify(finalSetMenuMRepository, times(1)).orderBy();
    }

    @Test
    void testLoadFinalMenuDropDown_withNullList() {
        // Arrange
        when(finalSetMenuMRepository.orderBy()).thenReturn(null);

        // Act
        ResponseDTO<List<ComboBoxDTO>> response = issueMenuService.loadFinalMenuDropDown();

        // Assert
        assertTrue(response.isSuccess());
        assertEquals(AppConstants.E_DATA, response.getMessage());
    }

    @Test
    void testFinalMenuDetailsByPk_withValidId() throws Exception {
        int menuId = 1;
        FinalSetMenuMHib menu = new FinalSetMenuMHib();
        menu.setId(menuId);
        menu.setName("BREAKFAST");
        menu.setTotal(250.0);

        FinalSetMenuHHib header = new FinalSetMenuHHib();
        header.setMenuFk(10);
        header.setMealTypeFk(1);
        header.setMealTypeName("MORNING");

        FinalSetMenuDHib detail = new FinalSetMenuDHib();
        detail.setId(100);
        detail.setMenuFk(10);
        detail.setFinalMenuFk(menuId);
        detail.setCategoryFk(5);
        detail.setCategoryName("SOUP");
        detail.setRecipeFk(50);
        detail.setRecipeName("TOMATO SOUP");
        detail.setPerPortionCost(20.0);

        when(finalSetMenuMRepository.findById(menuId)).thenReturn(menu);
        when(finalSetMenuHRepository.findActiveHeadersByFinalMenuFk(menuId)).thenReturn(List.of(header));
        when(finalSetMenuDRepository.findByActCat(menuId, header.getMenuFk())).thenReturn(List.of(detail));

        // Act
        ResponseDTO<IssueMenuToLocationDTO> response = issueMenuService.finalMenuDetailsByPk(menuId);

        // Assert
        assertTrue(response.isSuccess());
        assertNotNull(response.getData());
        assertEquals("BREAKFAST", response.getData().getName());
        assertEquals(1, response.getData().getMenuDetail().size());
    }

    
    @Test
    void testIssueMenuApprovedStatusList_withMixedStatuses() throws Exception {
        IssueMenuMHib approved = new IssueMenuMHib();
        approved.setId(1);
        approved.setName("Menu1");
        approved.setIssueStatus(1);
        approved.setLocationFk(10);
        approved.setMenuDate("2025-10-23");

        IssueMenuMHib rejected = new IssueMenuMHib();
        rejected.setId(2);
        rejected.setName("Menu2");
        rejected.setIssueStatus(2);
        rejected.setLocationFk(10);
        rejected.setMenuDate("2025-10-23");

        IssueMenuMHib pending = new IssueMenuMHib();
        pending.setId(3);
        pending.setName("Menu3");
        pending.setIssueStatus(0);
        pending.setLocationFk(10);
        pending.setMenuDate("2025-10-23");

        MstLocationMenuHib location = new MstLocationMenuHib();
        location.setLocationPk(10);
        location.setLocationName("HQ");

        when(issueMenuMRepository.findAll()).thenReturn(Arrays.asList(approved, rejected, pending));
        when(mstLoctionMenuRepository.findById(10)).thenReturn(location);

        // Act
        ResponseDTO<IssueMenuToLocationDTO> response = issueMenuService.issueMenuApprovedStatusList();

        // Assert
        assertTrue(response.isSuccess());
        IssueMenuToLocationDTO data = response.getData();
        assertEquals(1, data.getApprovedApprovals().size());
        assertEquals(1, data.getRejectedApprovals().size());
        assertEquals(1, data.getPendingApprovals().size());
    }

    @Test
    void testUpdateApprovalStatus_success() {
        IssueMenuToLocationDTO dto = new IssueMenuToLocationDTO();
        dto.setId(1);
        dto.setApprovalStatus(1);
        dto.setCreatedBy(1);

        IssueMenuMHib entity = new IssueMenuMHib();
        entity.setId(1);
        entity.setName("Menu");

        when(issueMenuMRepository.findById(1)).thenReturn(entity);

        // Act
        ResponseDTO<IssueMenuToLocationDTO> response = issueMenuService.updateApprovalStatus(dto);

        // Assert
        assertTrue(response.isSuccess());
        assertEquals("Issued Menu updated successfully!", response.getMessage());
        verify(issueMenuMRepository, times(1)).save(entity);
    }

    
    @Test
    void testItemReqList_withData() throws Exception {
        // Arrange
        ItemRequisitionDTO dto = new ItemRequisitionDTO();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        dto.setLocationFk(1);
        dto.setSingleDates(sdf.parse("2025-10-25"));

        // Mock menu M
        IssueMenuMHib menuM = new IssueMenuMHib();
        menuM.setId(100);
        menuM.setMenuDate("2025-10-25");
        menuM.setActualPob(50);

        when(issueMenuMRepository.findMenus(1, "2025-10-25", null, null))
                .thenReturn(List.of(menuM));

        // Mock menu H
        IssueMenuHHib menuH = new IssueMenuHHib();
        menuH.setId(200);
        menuH.setMenuFk(100);
        menuH.setMenuDate("2025-10-25");
        menuH.setMealTypeFk(1);
        menuH.setMealTypeName("Lunch");
        menuH.setMenuName("Lunch Menu");

        when(issueMenuHRepository.findByMenuMFk(100)).thenReturn(List.of(menuH));

        // Mock menu I items
        IssueMenuIHib item1 = new IssueMenuIHib();
        item1.setItemFk(10);
        item1.setItemCode("ITM001");
        item1.setItemName("Tomato");
        item1.setCategoryFk(1);
        item1.setCategoryName("Vegetable");
        item1.setPackageId("1");
        item1.setPackagePrice(100.0);
        item1.setPackageBaseFactor(1.0);
        item1.setPackageSecondaryFactor(1.0);
        item1.setPackageBaseUnit("Kg");
        item1.setPackageSecondaryUnit("Gm");
        item1.setPackageSecondaryCost(50.0);
        item1.setBaseQuantity(2);
        item1.setSecondaryQuantity(500);
        item1.setTotal(500.0);
        item1.setPobParticipation(100.0);
        item1.setMenuDate("2025-10-25");

        when(issueMenuIRepository.findUniqueItemsByMenuM(100))
                .thenReturn(List.of(item1));
        when(issueMenuIRepository.uniqueItemCountByMenuM(200)).thenReturn(1);

        // Act
        ResponseDTO<ItemRequisitionDTO> response = itemRequisitionService.itemReqList(dto);

        // Assert
        assertTrue(response.isSuccess());
        assertNotNull(response.getData());
        assertEquals(1, response.getData().getTotalDays());
        assertEquals(1, response.getData().getTotalItems());
        assertEquals(1, response.getData().getTotalMeals());
        assertEquals(50, response.getData().getTotalPob(), 0.01);
        assertEquals("100", response.getData().getMenuFkStr());

        // Verify repository calls
        verify(issueMenuMRepository, times(1)).findMenus(1, "2025-10-25", null, null);
        verify(issueMenuHRepository, times(1)).findByMenuMFk(100);
        verify(issueMenuIRepository, times(1)).findUniqueItemsByMenuM(100);
        verify(issueMenuIRepository, times(1)).uniqueItemCountByMenuM(200);
    }
    @Test
    void testLoadItemDropdown_withData() {
        ItemMasterHib hib = new ItemMasterHib();
        hib.setId(1);
        hib.setCategoryFk(2);
        hib.setCategoryName("Veg");
        hib.setItemCode("ITM001");
        hib.setItemName("Tomato");
        hib.setPackageId("10");
        hib.setPackagePrice(50.0);
        hib.setPackageBaseFactor(1.0);
        hib.setPackageSecondaryFactor(1.0);
        hib.setPackageBaseUnit("Kg");
        hib.setPackageSecondaryUnit("Gm");
        hib.setPackageSecondaryCost(30.0);

        when(itemMasterRepository.orderBy()).thenReturn(List.of(hib));

        ResponseDTO<List<ComboBoxDTO>> response = itemRequisitionService.loadItemDropdown();

        assertTrue(response.isSuccess());
        assertEquals(1, response.getData().size());
        assertEquals("Tomato", response.getData().get(0).getName());
        verify(itemMasterRepository, times(1)).orderBy();
    }
    @Test
    void testSaveItemReq_basic() throws Exception {
        ItemRequisitionDTO dto = new ItemRequisitionDTO();
        dto.setLocationFk(1);
        dto.setMenuFkStr("100");
        dto.setSingleDates(new SimpleDateFormat("yyyy-MM-dd").parse("2025-10-25"));
        dto.setRemarks("Test Remark");
        dto.setCreatedBy(1);

        when(itemReqHRepository.transactionNo(anyString())).thenReturn(Collections.emptyList());

        ResponseDTO<ItemRequisitionDTO> response = itemRequisitionService.saveItemReq(dto);

        assertTrue(response.isSuccess());
        verify(itemReqHRepository, times(1)).save(any(ItemReqHHib.class));
    }
   
    @Test
    void testItemReqsList_withData() throws Exception {
        // Prepare test data
        ItemRequisitionDTO inputDto = new ItemRequisitionDTO();
        inputDto.setLocationFk(1);

        ItemReqHHib hib = new ItemReqHHib();
        hib.setId(100);
        hib.setReqId("REQ2310250001");
        hib.setFromDate(new SimpleDateFormat("yyyy-MM-dd").parse("2025-10-23"));
        hib.setToDate(new SimpleDateFormat("yyyy-MM-dd").parse("2025-10-23"));

        // Mock repository
        when(itemReqHRepository.findBym(1)).thenReturn(Collections.singletonList(hib));
        when(itemReqDRepository.uniqueItemCountByMenuM(100)).thenReturn(5);

        // Call service
        ResponseDTO<ItemRequisitionDTO> response = itemRequisitionService.itemReqsList(inputDto);

        // Verify
        assertTrue(response.isSuccess());
        assertEquals("REQ2310250001", response.getData().getItemList().get(0).getReqNo());
        assertEquals(5, response.getData().getItemList().get(0).getItemCount());
        verify(itemReqHRepository, times(1)).findBym(1);
        verify(itemReqDRepository, times(1)).uniqueItemCountByMenuM(100);
    }

    @Test
    void testViewItemRequ_withData() throws Exception {
        int headerId = 100;

        ItemReqHHib hib = new ItemReqHHib();
        hib.setId(headerId);
        hib.setRemarks("Test remarks");
        hib.setFromDate(new Date());
        hib.setToDate(new Date());
        hib.setMenuFk("1,2");

        IssueMenuMHib menuMHib = new IssueMenuMHib();
        menuMHib.setActualPob(10);

        IssueMenuHHib menuHHib = new IssueMenuHHib();
        menuHHib.setId(200);
        menuHHib.setMenuFk(1);
        menuHHib.setMenuName("Test Menu");
        menuHHib.setMealTypeFk(1);
        menuHHib.setMealTypeName("Lunch");
        menuHHib.setMenuDate("2025-10-23");

        ItemReqDHib detailHib = new ItemReqDHib();
        detailHib.setItemCode("ITM01");
        detailHib.setCategory("Veg");
        detailHib.setItemName("Rice");
        detailHib.setQuantity(2.0);
        detailHib.setCost(50.0);
        detailHib.setReqType(0);
        detailHib.setAdditional(0);

        when(itemReqHRepository.findById(headerId)).thenReturn(hib);
        when(issueMenuMRepository.findByMenuFk(1)).thenReturn(menuMHib);
        when(issueMenuHRepository.findByMenuMFk(1)).thenReturn(Collections.singletonList(menuHHib));
        when(issueMenuIRepository.uniqueItemCountByMenuM(200)).thenReturn(3);
        when(itemReqDRepository.findByMenuMFk(headerId)).thenReturn(Collections.singletonList(detailHib));

        ResponseDTO<ItemRequisitionDTO> response = itemRequisitionService.viewItemRequ(headerId);

        assertTrue(response.isSuccess());
        assertEquals("Test remarks", response.getData().getRemarks());
        assertEquals(1, response.getData().getMenuList().size());
        assertEquals(1, response.getData().getItemList().size());
        verify(itemReqHRepository, times(1)).findById(headerId);
    }
    @Test
    void testPrepareItemRequisitionData_withData() throws Exception {
        int headerId = 100;

        ItemReqHHib header = new ItemReqHHib();
        header.setId(headerId);
        header.setReqId("REQ2310250001");
        header.setFromDate(new Date());
        header.setToDate(new Date());
        header.setRemarks("Test");

        ItemReqDHib detail = new ItemReqDHib();
        detail.setItemCode("ITM01");
        detail.setCategory("Veg");
        detail.setItemName("Rice");
        detail.setQuantity(5.0);
        detail.setCost(100.0);
        detail.setReqType(0);
        detail.setAdditional(0);
        detail.setDate(new SimpleDateFormat("yyyy-MM-dd").parse("2025-10-25"));

        when(itemReqHRepository.findById(headerId)).thenReturn(header);
        when(itemReqDRepository.findByMenuMFk(headerId)).thenReturn(Collections.singletonList(detail));

        ResponseDTO<ItemRequisitionDTO> response = itemRequisitionService.prepareItemRequisitionData(headerId);

        assertTrue(response.isSuccess());
        assertEquals("REQ2310250001", response.getData().getReqNo());
        assertEquals(1, response.getData().getDateWiseItemList().size());
        assertEquals(1, response.getData().getDateWiseItemList().get("2025-10-25").size());
        verify(itemReqHRepository, times(1)).findById(headerId);
        verify(itemReqDRepository, times(1)).findByMenuMFk(headerId);
    }
    
}
