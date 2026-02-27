package esfita.masterTest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.dao.DataAccessException;

import esfita.common.AppConstants;
import esfita.common.ResponseDTO;
import esfita.dto.BasePortionQuantityMasterDTO;
import esfita.dto.CategoryMasterDTO;
import esfita.dto.CountryMasterDTO;
import esfita.dto.ItemCategoryMasterDTO;
import esfita.dto.RecipeMealMasterDTO;
import esfita.entity.BasePortionQuantityMasterHib;
import esfita.entity.CategoryMasterHib;
import esfita.entity.CountryMasterHib;
import esfita.entity.ItemCategoryMasterHib;
import esfita.entity.MstUserHib;
import esfita.entity.RecipeMealMasterHib;
import esfita.repositoy.BasePortionQuantityMasterRepository;
import esfita.repositoy.CategoryMasterRepository;
import esfita.repositoy.CountryMasterRepository;
import esfita.repositoy.ItemCategoryMasterRepository;
import esfita.repositoy.MstUserRepository;
import esfita.repositoy.RecipeMealMasterRepository;
import esfita.service.MasterService;

 class RecipeMealMasterServiceTest {

    @InjectMocks
    private MasterService masterService;

    @Mock
    private RecipeMealMasterRepository recipeMealMasterRepository;

    @Mock
    private MstUserRepository mstUserRepository;

    @Mock
    private CountryMasterRepository countryMasterRepository;

   
    @Mock
    private CategoryMasterRepository categoryMasterRepository;
 
    @Mock
    private ItemCategoryMasterRepository itemCategoryMasterRepository;
 
    @Mock
    private BasePortionQuantityMasterRepository basePortionQuantityMasterRepository;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // ==============================
    // TEST CASES FOR RECIPE MEAL MASTER
    // ==============================

    @Test
    void testSaveRecipeMealMaster_Success() {
        RecipeMealMasterDTO dto = new RecipeMealMasterDTO();
        dto.setRecipeMealcode("RM001");
        dto.setRecipeMealName("Breakfast");
        dto.setCreatedBy(1);

        when(recipeMealMasterRepository.findCode(anyString())).thenReturn(null);

        ResponseDTO<RecipeMealMasterDTO> response = masterService.saveRecipeMealMaster(dto);

        assertTrue(response.isSuccess());
        assertTrue(response.getMessage().contains(AppConstants.MSG_RECORD_CREATED));
        verify(recipeMealMasterRepository, times(1)).save(any(RecipeMealMasterHib.class));
    }

    @Test
    void testSaveRecipeMealMaster_DuplicateCode() {
        RecipeMealMasterDTO dto = new RecipeMealMasterDTO();
        dto.setRecipeMealcode("RM001");
        dto.setRecipeMealName("Breakfast");

        when(recipeMealMasterRepository.findCode(anyString())).thenReturn(new RecipeMealMasterHib());

        ResponseDTO<RecipeMealMasterDTO> response = masterService.saveRecipeMealMaster(dto);

        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains(AppConstants.CODE_VALIDATION));
        verify(recipeMealMasterRepository, never()).save(any());
    }

    @Test
    void testRecipeMealMasterList_Success() {
        RecipeMealMasterHib hib = new RecipeMealMasterHib();
        hib.setId(1);
        hib.setRecipeMealCode("RM001");
        hib.setRecipeMealName("Breakfast");
        hib.setStatus(AppConstants.FLAG_A);
        hib.setUpdateBy(1);
        hib.setUpdatedDate(new Date());

        MstUserHib user = new MstUserHib();
        user.setFirstName("Admin");
        user.setEmailId("admin@test.com");

        when(recipeMealMasterRepository.orderBy()).thenReturn(List.of(hib));
        when(mstUserRepository.findByUserId(1)).thenReturn(user);

        ResponseDTO<List<RecipeMealMasterDTO>> response = masterService.recipeMealMasterList();

        assertTrue(response.isSuccess());
        assertEquals(1, response.getData().size());
        assertEquals("Admin", response.getData().get(0).getUserName());
    }

    @Test
    void testRecipeMealView_Found() {
        RecipeMealMasterHib hib = new RecipeMealMasterHib();
        hib.setId(1);
        hib.setRecipeMealCode("RM001");
        hib.setRecipeMealName("Breakfast");
        hib.setStatus(AppConstants.FLAG_A);

        when(recipeMealMasterRepository.findByRecipeMealId(1)).thenReturn(hib);

        ResponseDTO<RecipeMealMasterDTO> response = masterService.recipeMealView(1);

        assertTrue(response.isSuccess());
        assertEquals("RM001", response.getData().getRecipeMealcode());
    }

    @Test
    void testRecipeMealModify_Success() {
        RecipeMealMasterDTO dto = new RecipeMealMasterDTO();
        dto.setId(1);
        dto.setRecipeMealName("Updated");
        dto.setUpdatedBy(1);

        RecipeMealMasterHib hib = new RecipeMealMasterHib();
        hib.setId(1);
        hib.setRecipeMealName("Old");

        when(recipeMealMasterRepository.findByRecipeMealId(1)).thenReturn(hib);

        ResponseDTO<RecipeMealMasterDTO> response = masterService.recipeMealModify(dto);

        assertTrue(response.isSuccess());
        verify(recipeMealMasterRepository, times(1)).save(hib);
    }

    @Test
    void testRecipeMealStatusUpdate_Activate() {
        RecipeMealMasterDTO dto = new RecipeMealMasterDTO();
        dto.setId(1);
        dto.setStatus(AppConstants.FLAG_A);

        RecipeMealMasterHib hib = new RecipeMealMasterHib();
        hib.setId(1);

        when(recipeMealMasterRepository.findByRecipeMealId(1)).thenReturn(hib);

        ResponseDTO<RecipeMealMasterDTO> response = masterService.recipeMealStatusUpdate(dto);

        assertTrue(response.isSuccess());
        assertEquals(AppConstants.ACTIVATED, response.getMessage());
        verify(recipeMealMasterRepository).save(hib);
    }

    // ==============================
    // TEST CASES FOR COUNTRY MASTER
    // ==============================

    @Test
    void testCountryMasterSave_Success() {
        CountryMasterDTO dto = new CountryMasterDTO();
        dto.setCountryCode("IN");
        dto.setCountryName("India");
        dto.setCreatedBy(1);

        when(countryMasterRepository.findCode(anyString())).thenReturn(null);

        ResponseDTO<CountryMasterDTO> response = masterService.countryMasterSave(dto);

        assertTrue(response.isSuccess());
        verify(countryMasterRepository, times(1)).save(any(CountryMasterHib.class));
    }

    @Test
    void testCountryMasterList_Success() {
        CountryMasterHib hib = new CountryMasterHib();
        hib.setId(1);
        hib.setCountryCode("IN");
        hib.setCountryName("India");
        hib.setStatus(AppConstants.FLAG_A);
        hib.setUpdateBy(1);
        hib.setUpdatedDate(new Date());

        MstUserHib user = new MstUserHib();
        user.setFirstName("Admin");
        user.setEmailId("admin@test.com");

        when(countryMasterRepository.orderBy()).thenReturn(List.of(hib));
        when(mstUserRepository.findByUserId(1)).thenReturn(user);

        ResponseDTO<List<CountryMasterDTO>> response = masterService.countryMasterList();

        assertTrue(response.isSuccess());
        assertEquals(1, response.getData().size());
        assertEquals("India", response.getData().get(0).getCountryName());
    }

    @Test
    void testCountryModify_Success() {
        CountryMasterDTO dto = new CountryMasterDTO();
        dto.setId(1);
        dto.setCountryName("Updated");
        dto.setUpdatedBy(1);

        CountryMasterHib hib = new CountryMasterHib();
        hib.setId(1);
        hib.setCountryName("Old");

        when(countryMasterRepository.findOne(1)).thenReturn(hib);

        ResponseDTO<CountryMasterDTO> response = masterService.countryModify(dto);

        assertTrue(response.isSuccess());
        verify(countryMasterRepository, times(1)).save(hib);
    }

    @Test
    void testCheckCountryCode_Existing() {
        CountryMasterDTO dto = new CountryMasterDTO();
        dto.setCountryCode("IN");

        when(countryMasterRepository.findCode("IN")).thenReturn(new CountryMasterHib());

        ResponseDTO<CountryMasterDTO> response = masterService.checkCountryCode(dto);

        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains(AppConstants.CODE_VALIDATION));
    }

    @Test
    void testCountryStatusUpdate_Inactivate() {
        CountryMasterDTO dto = new CountryMasterDTO();
        dto.setId(1);
        dto.setStatus(AppConstants.FLAG_I);

        CountryMasterHib hib = new CountryMasterHib();
        hib.setId(1);

        when(countryMasterRepository.findOne(1)).thenReturn(hib);

        ResponseDTO<CountryMasterDTO> response = masterService.countryStatusUpdate(dto);

        assertTrue(response.isSuccess());
        assertEquals(AppConstants.IN_ACTIVATED, response.getMessage());
        verify(countryMasterRepository).save(hib);
    }
    @Test
     void testCategoryMasterSave_NewCategory_Success() {
        CategoryMasterDTO dto = new CategoryMasterDTO();
        dto.setCategoryCode("CAT01");
        dto.setCategoryName("Category One");
        dto.setCreatedBy(1);

        when(categoryMasterRepository.findByCode("CAT01")).thenReturn(null);

        ResponseDTO<CategoryMasterDTO> response = masterService.categoryMasterSave(dto);

        assertTrue(response.isSuccess());
        assertTrue(response.getMessage().contains("Category One"));
        verify(categoryMasterRepository, times(1)).save(any());
    }

//    @Test
//     void testCategoryMasterSave_ExistingCategory_Failure() {
//        CategoryMasterDTO dto = new CategoryMasterDTO();
//        dto.setCategoryCode("CAT01q");
//        dto.setCategoryName("Category One");
//
//        when(categoryMasterRepository.findByCode("CAT01q")).thenReturn(new CategoryMasterHib());
//
//        ResponseDTO<CategoryMasterDTO> response = masterService.categoryMasterSave(dto);
//
//        assertFalse(response.isSuccess());
//        assertEquals(AppConstants.CODE_VALIDATION, response.getMessage());
//        verify(categoryMasterRepository, never()).save(any());
//    }

    @Test
     void testCategoryMasterList_FoundCategories_Success() {
        CategoryMasterHib hib1 = new CategoryMasterHib();
        hib1.setId(1);
        hib1.setCategoryCode("CAT01");
        hib1.setCategoryName("Category One");
        hib1.setStatus(AppConstants.FLAG_A);
        hib1.setUpdatedBy(1);
        hib1.setUpdatedDate(new Date());

        MstUserHib user = new MstUserHib();
        user.setFirstName("John");
        user.setEmailId("john@example.com");

        when(categoryMasterRepository.orderBy()).thenReturn(Arrays.asList(hib1));
        when(mstUserRepository.findByUserId(1)).thenReturn(user);

        ResponseDTO<List<CategoryMasterDTO>> response = masterService.categoryMasterList();

        assertTrue(response.isSuccess());
        assertEquals(1, response.getData().size());
        assertEquals("John", response.getData().get(0).getUserName());
    }

    @Test
     void testCategoryViewById_Found_Success() {
        CategoryMasterHib hib = new CategoryMasterHib();
        hib.setId(1);
        hib.setCategoryCode("CAT01");
        hib.setCategoryName("Category One");
        hib.setStatus(AppConstants.FLAG_A);

        when(categoryMasterRepository.findById(1)).thenReturn(hib);

        ResponseDTO<CategoryMasterDTO> response = masterService.categoryViewById(1);

        assertTrue(response.isSuccess());
        assertEquals("CAT01", response.getData().getCategoryCode());
    }

    @Test
     void testCategoryStatusUpdate_Activate_Success() {
        CategoryMasterDTO dto = new CategoryMasterDTO();
        dto.setId(1);
        dto.setStatus(AppConstants.FLAG_A);

        CategoryMasterHib hib = new CategoryMasterHib();
        hib.setId(1);

        when(categoryMasterRepository.findById(1)).thenReturn(hib);

        ResponseDTO<CategoryMasterDTO> response = masterService.categoryStatusUpdate(dto);

        assertTrue(response.isSuccess());
        assertEquals(AppConstants.ACTIVATED, response.getMessage());
        verify(categoryMasterRepository, times(1)).save(hib);
    }

    @Test
     void testCategoryMasterModify_Update_Success() {
        CategoryMasterDTO dto = new CategoryMasterDTO();
        dto.setId(1);
        dto.setCategoryName("Updated Name");
        dto.setUpdatedBy(2);

        CategoryMasterHib hib = new CategoryMasterHib();
        hib.setId(1);

        when(categoryMasterRepository.findById(1)).thenReturn(hib);

        ResponseDTO<CategoryMasterDTO> response = masterService.categoryMasterModify(dto);

        assertTrue(response.isSuccess());
        assertEquals("Updated Name " + AppConstants.MSG_RECORD_UPDATED, response.getMessage());
        verify(categoryMasterRepository, times(1)).save(hib);
    }

    @Test
     void testCheckByCategoryCode_NotExists_Success() {
        CategoryMasterDTO dto = new CategoryMasterDTO();
        dto.setCategoryCode("NEWCODE");

        when(categoryMasterRepository.findByCode("NEWCODE")).thenReturn(null);

        ResponseDTO<CategoryMasterDTO> response = masterService.checkByCategoryCode(dto);

        assertTrue(response.isSuccess());
    }

    @Test
     void testCheckByCategoryCode_Exists_Failure() {
        CategoryMasterDTO dto = new CategoryMasterDTO();
        dto.setCategoryCode("CAT01");

        when(categoryMasterRepository.findByCode("CAT01")).thenReturn(new CategoryMasterHib());

        ResponseDTO<CategoryMasterDTO> response = masterService.checkByCategoryCode(dto);

        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains(AppConstants.CODE_VALIDATION));
    }
    // 1️⃣ itemCategoryMasterSave()
    // ============================================

    @Test
    void testItemCategoryMasterSave_Success_NewRecord() {
        ItemCategoryMasterDTO dto = new ItemCategoryMasterDTO();
        dto.setItemCode("ITM01");
        dto.setItemName("Test Item");
        dto.setCreatedBy(1);

        when(itemCategoryMasterRepository.findByCode("ITM01")).thenReturn(null);

        ResponseDTO<ItemCategoryMasterDTO> response = masterService.itemCategoryMasterSave(dto);

        assertTrue(response.isSuccess());
        assertTrue(response.getMessage().contains(AppConstants.MSG_RECORD_CREATED));
        verify(itemCategoryMasterRepository, times(1)).save(any());
    }

    @Test
    void testItemCategoryMasterSave_AlreadyExists() {
        ItemCategoryMasterDTO dto = new ItemCategoryMasterDTO();
        dto.setItemCode("ITM01");

        when(itemCategoryMasterRepository.findByCode("ITM01")).thenReturn(new ItemCategoryMasterHib());

        ResponseDTO<ItemCategoryMasterDTO> response = masterService.itemCategoryMasterSave(dto);

        assertFalse(response.isSuccess());
        assertEquals("Item Category Code already exists", response.getMessage());
        verify(itemCategoryMasterRepository, never()).save(any());
    }

    @Test
    void testItemCategoryMasterSave_DataAccessException() {
        ItemCategoryMasterDTO dto = new ItemCategoryMasterDTO();
        dto.setItemCode("ITM011");

        when(itemCategoryMasterRepository.findByCode("ITM011"))
            .thenThrow(mock(DataAccessException.class));

        ResponseDTO<ItemCategoryMasterDTO> response = masterService.itemCategoryMasterSave(dto);

        assertFalse(response.isSuccess());
        assertEquals(AppConstants.DATA_EXCEPTION_SAVE, response.getMessage());
    }

    // ============================================
    // 2️⃣ itemCategoryMasterList()
    // ============================================

    @Test
    void testItemCategoryMasterList_Success() {
        ItemCategoryMasterHib hib = new ItemCategoryMasterHib();
        hib.setId(1);
        hib.setItemCategoryCode("ITM01");
        hib.setItemCategoryName("Item One");
        hib.setStatus(AppConstants.FLAG_A);
        hib.setUpdatedBy(1);
        hib.setUpdatedDate(new Date());

        MstUserHib user = new MstUserHib();
        user.setFirstName("John");
        user.setEmailId("john@example.com");

        when(itemCategoryMasterRepository.orderBy()).thenReturn(Arrays.asList(hib));
        when(mstUserRepository.findByUserId(1)).thenReturn(user);

        ResponseDTO<List<ItemCategoryMasterDTO>> response = masterService.itemCategoryMasterList();

        assertTrue(response.isSuccess());
        assertEquals(AppConstants.MSG_RECORD_FETCHED, response.getMessage());
        assertEquals(1, response.getData().size());
        assertEquals("John", response.getData().get(0).getUserName());
    }

    @Test
    void testItemCategoryMasterList_Empty() {
        when(itemCategoryMasterRepository.orderBy()).thenReturn(null);

        ResponseDTO<List<ItemCategoryMasterDTO>> response = masterService.itemCategoryMasterList();

        assertFalse(response.isSuccess());
        assertEquals(AppConstants.IS_EMPTY, response.getMessage());
    }

    // ============================================
    // 3️⃣ itemCategoryViewById()
    // ============================================

    @Test
    void testItemCategoryViewById_Success() {
        ItemCategoryMasterHib hib = new ItemCategoryMasterHib();
        hib.setId(1);
        hib.setItemCategoryCode("ITM01");
        hib.setItemCategoryName("Item One");
        hib.setStatus(AppConstants.FLAG_A);

        when(itemCategoryMasterRepository.findById(1)).thenReturn(hib);

        ResponseDTO<ItemCategoryMasterDTO> response = masterService.itemCategoryViewById(1);

        assertTrue(response.isSuccess());
        assertEquals(AppConstants.MSG_RECORD_FETCHED, response.getMessage());
        assertEquals("ITM01", response.getData().getItemCode());
    }

    @Test
    void testItemCategoryViewById_NotFound() {
        when(itemCategoryMasterRepository.findById(1)).thenReturn(null);

        ResponseDTO<ItemCategoryMasterDTO> response = masterService.itemCategoryViewById(1);

        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains(AppConstants.IS_EMPTY));
    }

    // ============================================
    // 4️⃣ itemCatagoryStatusUpdate()
    // ============================================

    @Test
    void testItemCatagoryStatusUpdate_Activate() {
        ItemCategoryMasterDTO dto = new ItemCategoryMasterDTO();
        dto.setId(1);
        dto.setStatus(AppConstants.FLAG_A);

        ItemCategoryMasterHib hib = new ItemCategoryMasterHib();
        hib.setId(1);

        when(itemCategoryMasterRepository.findById(1)).thenReturn(hib);

        ResponseDTO<ItemCategoryMasterDTO> response = masterService.itemCatagoryStatusUpdate(dto);

        assertTrue(response.isSuccess());
        assertEquals(AppConstants.ACTIVATED, response.getMessage());
        verify(itemCategoryMasterRepository, times(1)).save(hib);
    }

    @Test
    void testItemCatagoryStatusUpdate_Inactivate() {
        ItemCategoryMasterDTO dto = new ItemCategoryMasterDTO();
        dto.setId(1);
        dto.setStatus(AppConstants.FLAG_I);

        ItemCategoryMasterHib hib = new ItemCategoryMasterHib();
        hib.setId(1);

        when(itemCategoryMasterRepository.findById(1)).thenReturn(hib);

        ResponseDTO<ItemCategoryMasterDTO> response = masterService.itemCatagoryStatusUpdate(dto);

        assertTrue(response.isSuccess());
        assertEquals(AppConstants.IN_ACTIVATED, response.getMessage());
    }

    @Test
    void testItemCatagoryStatusUpdate_NotFound() {
        ItemCategoryMasterDTO dto = new ItemCategoryMasterDTO();
        dto.setId(1);
        dto.setStatus(AppConstants.FLAG_A);

        when(itemCategoryMasterRepository.findById(1)).thenReturn(null);

        ResponseDTO<ItemCategoryMasterDTO> response = masterService.itemCatagoryStatusUpdate(dto);

        assertFalse(response.isSuccess());
        assertEquals(AppConstants.IS_EMPTY, response.getMessage());
    }

    // ============================================
    // 5️⃣ itemCatagoryMasterModify()
    // ============================================

    @Test
    void testItemCatagoryMasterModify_Success() {
        ItemCategoryMasterDTO dto = new ItemCategoryMasterDTO();
        dto.setId(1);
        dto.setItemName("Updated Item");
        dto.setUpdatedBy(2);

        ItemCategoryMasterHib hib = new ItemCategoryMasterHib();
        hib.setId(1);

        when(itemCategoryMasterRepository.findById(1)).thenReturn(hib);

        ResponseDTO<ItemCategoryMasterDTO> response = masterService.itemCatagoryMasterModify(dto);

        assertTrue(response.isSuccess());
        assertTrue(response.getMessage().contains(AppConstants.MSG_RECORD_UPDATED));
        verify(itemCategoryMasterRepository, times(1)).save(hib);
    }

    @Test
    void testItemCatagoryMasterModify_NotFound() {
        ItemCategoryMasterDTO dto = new ItemCategoryMasterDTO();
        dto.setId(99);
        dto.setItemName("Unknown Item");

        when(itemCategoryMasterRepository.findById(99)).thenReturn(null);

        ResponseDTO<ItemCategoryMasterDTO> response = masterService.itemCatagoryMasterModify(dto);

        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains(AppConstants.IS_EMPTY));
    }

    // ============================================
    // 6️⃣ checkByCode()
    // ============================================

    @Test
    void testCheckByCode_Success_NotExists() {
        ItemCategoryMasterDTO dto = new ItemCategoryMasterDTO();
        dto.setItemCode("NEWCODE");

        when(itemCategoryMasterRepository.findByCode("NEWCODE")).thenReturn(null);

        ResponseDTO<ItemCategoryMasterDTO> response = masterService.checkByCode(dto);

        assertTrue(response.isSuccess());
    }

    @Test
    void testCheckByCode_AlreadyExists() {
        ItemCategoryMasterDTO dto = new ItemCategoryMasterDTO();
        dto.setItemCode("DUPLICATE");

        when(itemCategoryMasterRepository.findByCode("DUPLICATE")).thenReturn(new ItemCategoryMasterHib());

        ResponseDTO<ItemCategoryMasterDTO> response = masterService.checkByCode(dto);

        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains(AppConstants.CODE_VALIDATION));
    }
    @Test
    void testSaveBasePortionQuantityMaster_Success() {
        BasePortionQuantityMasterDTO dto = new BasePortionQuantityMasterDTO();
        dto.setQuantity(10);
        dto.setCreatedBy(1);

        when(basePortionQuantityMasterRepository.findCode(10)).thenReturn(null);

        ResponseDTO<BasePortionQuantityMasterDTO> response = masterService.saveBasePortionQuantityMaster(dto);

        assertTrue(response.isSuccess());
        assertTrue(response.getMessage().contains(AppConstants.MSG_RECORD_CREATED));
        verify(basePortionQuantityMasterRepository, times(1)).save(any(BasePortionQuantityMasterHib.class));
    }

    @Test
    void testSaveBasePortionQuantityMaster_Duplicate() {
        BasePortionQuantityMasterDTO dto = new BasePortionQuantityMasterDTO();
        dto.setQuantity(10);

        when(basePortionQuantityMasterRepository.findCode(10)).thenReturn(new BasePortionQuantityMasterHib());

        ResponseDTO<BasePortionQuantityMasterDTO> response = masterService.saveBasePortionQuantityMaster(dto);

        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains(AppConstants.CODE_VALIDATION));
        verify(basePortionQuantityMasterRepository, never()).save(any());
    }

    @Test
    void testSaveBasePortionQuantityMaster_NullDTO() {
        ResponseDTO<BasePortionQuantityMasterDTO> response = masterService.saveBasePortionQuantityMaster(null);

        assertFalse(response.isSuccess());
        assertEquals(AppConstants.E_DATA, response.getMessage());
    }

    // ========================================================================
    // 2️⃣ basePortionQuantityMasterList()
    // ========================================================================
    @Test
    void testBasePortionQuantityMasterList_Success() {
        BasePortionQuantityMasterHib hib = new BasePortionQuantityMasterHib();
        hib.setId(1);
        hib.setQuantity(10);
        hib.setStatus(AppConstants.FLAG_A);
        hib.setUpdateBy(1);
        hib.setUpdatedDate(new Date());

        MstUserHib user = new MstUserHib();
        user.setFirstName("John");
        user.setEmailId("john@example.com");

        when(basePortionQuantityMasterRepository.orderBy()).thenReturn(List.of(hib));
        when(mstUserRepository.findByUserId(1)).thenReturn(user);

        ResponseDTO<List<BasePortionQuantityMasterDTO>> response = masterService.basePortionQuantityMasterList();

        assertTrue(response.isSuccess());
        assertEquals(1, response.getData().size());
        assertEquals(10, response.getData().get(0).getQuantity());
    }

    @Test
    void testBasePortionQuantityMasterList_Empty() {
        when(basePortionQuantityMasterRepository.orderBy()).thenReturn(Collections.emptyList());
        ResponseDTO<List<BasePortionQuantityMasterDTO>> response = masterService.basePortionQuantityMasterList();

        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains(AppConstants.EMPTY));
    }

    // ========================================================================
    // 3️⃣ basePortionQuantityMasterView()
    // ========================================================================
    @Test
    void testBasePortionQuantityMasterView_Success() {
        BasePortionQuantityMasterHib hib = new BasePortionQuantityMasterHib();
        hib.setId(1);
        hib.setQuantity(10);
        hib.setStatus(AppConstants.FLAG_A);

        when(basePortionQuantityMasterRepository.findOne(1)).thenReturn(hib);

        ResponseDTO<BasePortionQuantityMasterDTO> response = masterService.basePortionQuantityMasterView(1);

        assertTrue(response.isSuccess());
        assertEquals(10, response.getData().getQuantity());
    }

    @Test
    void testBasePortionQuantityMasterView_NotFound() {
        when(basePortionQuantityMasterRepository.findOne(1)).thenReturn(null);

        ResponseDTO<BasePortionQuantityMasterDTO> response = masterService.basePortionQuantityMasterView(1);

        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains(AppConstants.NOT_FOUND));
    }

    // ========================================================================
    // 4️⃣ basePortionQuantityModify()
    // ========================================================================
    @Test
    void testBasePortionQuantityModify_Success() {
        BasePortionQuantityMasterDTO dto = new BasePortionQuantityMasterDTO();
        dto.setId(1);
        dto.setQuantity(10);
        dto.setUpdatedBy(1);

        BasePortionQuantityMasterHib hib = new BasePortionQuantityMasterHib();
        hib.setId(1);
        hib.setQuantity(10);

        when(basePortionQuantityMasterRepository.findOne(1)).thenReturn(hib);

        ResponseDTO<BasePortionQuantityMasterDTO> response = masterService.basePortionQuantityModify(dto);

        assertTrue(response.isSuccess());
        assertTrue(response.getMessage().contains(AppConstants.MSG_RECORD_UPDATED));
        verify(basePortionQuantityMasterRepository, times(1)).save(hib);
    }

    @Test
    void testBasePortionQuantityModify_NotFound() {
        BasePortionQuantityMasterDTO dto = new BasePortionQuantityMasterDTO();
        dto.setId(1);
        when(basePortionQuantityMasterRepository.findOne(1)).thenReturn(null);

        ResponseDTO<BasePortionQuantityMasterDTO> response = masterService.basePortionQuantityModify(dto);

        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains(AppConstants.IS_EMPTY));
    }

    // ========================================================================
    // 5️⃣ basePortionQuantityStatusUpdate()
    // ========================================================================
    @Test
    void testBasePortionQuantityStatusUpdate_Success() {
        BasePortionQuantityMasterDTO dto = new BasePortionQuantityMasterDTO();
        dto.setId(1);
        dto.setStatus(AppConstants.FLAG_A);

        BasePortionQuantityMasterHib hib = new BasePortionQuantityMasterHib();
        hib.setId(1);
        hib.setStatus(AppConstants.FLAG_I);

        when(basePortionQuantityMasterRepository.findOne(1)).thenReturn(hib);

        ResponseDTO<BasePortionQuantityMasterDTO> response = masterService.basePortionQuantityStatusUpdate(dto);

        assertTrue(response.isSuccess());
        assertEquals(AppConstants.ACTIVATED, response.getMessage());
        verify(basePortionQuantityMasterRepository).save(hib);
    }

    // ========================================================================
    // 6️⃣ checkQty()
    // ========================================================================
    @Test
    void testCheckQty_Success() {
        BasePortionQuantityMasterDTO dto = new BasePortionQuantityMasterDTO();
        dto.setQuantity(10);
        when(basePortionQuantityMasterRepository.findCode(10)).thenReturn(null);

        ResponseDTO<BasePortionQuantityMasterDTO> response = masterService.checkQty(dto);

        assertTrue(response.isSuccess());
    }

    @Test
    void testCheckQty_Duplicate() {
        BasePortionQuantityMasterDTO dto = new BasePortionQuantityMasterDTO();
        dto.setQuantity(10);
        when(basePortionQuantityMasterRepository.findCode(10)).thenReturn(new BasePortionQuantityMasterHib());

        ResponseDTO<BasePortionQuantityMasterDTO> response = masterService.checkQty(dto);

        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains(AppConstants.CODE_VALIDATION));
    }

    @Test
    void testCheckQty_NullDTO() {
        ResponseDTO<BasePortionQuantityMasterDTO> response = masterService.checkQty(null);
        assertFalse(response.isSuccess());
        assertEquals(AppConstants.E_DATA, response.getMessage());
    }
}
