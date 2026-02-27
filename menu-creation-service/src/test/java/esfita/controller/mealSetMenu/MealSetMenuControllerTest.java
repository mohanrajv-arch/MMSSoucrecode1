package esfita.controller.mealSetMenu;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import com.fasterxml.jackson.databind.ObjectMapper;

import esfita.controller.MealSetMenuController;
import esfita.dto.ComboBoxDTO;
import esfita.dto.MealSetMenuDTO;
import esfita.dto.ResponseDTO;
import esfita.service.MealSetMenuService;

@ExtendWith(MockitoExtension.class)
class MealSetMenuControllerTest {

    @Mock
    private MealSetMenuService mealSetMenuService;

    @InjectMocks
    private MealSetMenuController mealSetMenuController;

    @Mock
    private ObjectMapper objectMapper;

    private MealSetMenuDTO mealSetMenuDTO;
    private ResponseDTO<MealSetMenuDTO> responseDTO;
    private ResponseDTO<List<MealSetMenuDTO>> listResponseDTO;
    private ResponseDTO<List<ComboBoxDTO>> comboBoxResponseDTO;

    @BeforeEach
    void setUp() {
        // Setup MealSetMenuDTO
        mealSetMenuDTO = new MealSetMenuDTO();
        mealSetMenuDTO.setId(1);
        mealSetMenuDTO.setMenuName("Test Meal Set");
        
        // Setup ResponseDTO for MealSetMenuDTO
        responseDTO = new ResponseDTO<>();
        responseDTO.setData(mealSetMenuDTO);
        responseDTO.setSuccess(true);
        responseDTO.setMessage("Success");

        // Setup second MealSetMenuDTO for list
        MealSetMenuDTO mealSetMenuDTO2 = new MealSetMenuDTO();
        mealSetMenuDTO2.setId(2);
        mealSetMenuDTO2.setMenuName("Test Meal Set 2");
        
        // Setup ResponseDTO for List<MealSetMenuDTO>
        listResponseDTO = new ResponseDTO<>();
        listResponseDTO.setData(Arrays.asList(mealSetMenuDTO, mealSetMenuDTO2));
        listResponseDTO.setSuccess(true);
        listResponseDTO.setMessage("Success");

        // Setup ComboBoxDTO
        ComboBoxDTO comboBoxDTO = new ComboBoxDTO();
        comboBoxDTO.setPk(1);
        comboBoxDTO.setName("Option 1");
        
        // Setup ResponseDTO for List<ComboBoxDTO>
        comboBoxResponseDTO = new ResponseDTO<>();
        comboBoxResponseDTO.setData(Arrays.asList(comboBoxDTO));
        comboBoxResponseDTO.setSuccess(true);
        comboBoxResponseDTO.setMessage("Success");
    }

    @Test
    void testMealSetMenuList() {
        // Given
        when(mealSetMenuService.mealSetMenuList(any(MealSetMenuDTO.class))).thenReturn(responseDTO);

        // When
        ResponseDTO<MealSetMenuDTO> result = mealSetMenuController.mealSetMenuList(mealSetMenuDTO);

        // Then
        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertEquals("Success", result.getMessage());
        assertEquals(1, result.getData().getId());
        verify(mealSetMenuService, times(1)).mealSetMenuList(mealSetMenuDTO);
    }

    @Test
    void testMealSetMenuStatusUpdate() {
        // Given
        when(mealSetMenuService.mealSetMenuStatusUpdate(any(MealSetMenuDTO.class))).thenReturn(responseDTO);

        // When
        ResponseDTO<MealSetMenuDTO> result = mealSetMenuController.mealSetMenuStatusUpdate(mealSetMenuDTO);

        // Then
        assertNotNull(result);
        verify(mealSetMenuService, times(1)).mealSetMenuStatusUpdate(mealSetMenuDTO);
    }

    @Test
    void testMealSetMenuViewById() {
        // Given
        when(mealSetMenuService.mealSetMenuViewById(anyInt())).thenReturn(responseDTO);

        // When
        ResponseDTO<MealSetMenuDTO> result = mealSetMenuController.mealSetMenuViewById(1);

        // Then
        assertNotNull(result);
        verify(mealSetMenuService, times(1)).mealSetMenuViewById(1);
    }

    @Test
    void testMealSetMenuApprovalStatus() {
        // Given
        when(mealSetMenuService.mealSetMenuApprovalStatus(any(MealSetMenuDTO.class))).thenReturn(responseDTO);

        // When
        ResponseDTO<MealSetMenuDTO> result = mealSetMenuController.mealSetMenuApprovalStatus(mealSetMenuDTO);

        // Then
        assertNotNull(result);
        verify(mealSetMenuService, times(1)).mealSetMenuApprovalStatus(mealSetMenuDTO);
    }

    @Test
    void testCategoryListByFk() {
        // Given
        when(mealSetMenuService.categoryListByFk(any(MealSetMenuDTO.class))).thenReturn(listResponseDTO);

        // When
        ResponseDTO<List<MealSetMenuDTO>> result = mealSetMenuController.categoryListByFk(mealSetMenuDTO);

        // Then
        assertNotNull(result);
        assertEquals(2, result.getData().size());
        verify(mealSetMenuService, times(1)).categoryListByFk(mealSetMenuDTO);
    }

    @Test
    void testLoadRecipeMasterDropDown() {
        // Given
        when(mealSetMenuService.loadRecipeMasterDropDown(anyInt())).thenReturn(comboBoxResponseDTO);

        // When
        ResponseDTO<List<ComboBoxDTO>> result = mealSetMenuController.loadRecipeMasterDropDown(1);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getData().size());
        verify(mealSetMenuService, times(1)).loadRecipeMasterDropDown(1);
    }

    @Test
    void testLoadMealSetTemplateDropDown() {
        // Given
        when(mealSetMenuService.loadMealSetTemplateDropDown(anyInt())).thenReturn(comboBoxResponseDTO);

        // When
        ResponseDTO<List<ComboBoxDTO>> result = mealSetMenuController.loadMealSetTemplateDropDown(1);

        // Then
        assertNotNull(result);
        verify(mealSetMenuService, times(1)).loadMealSetTemplateDropDown(1);
    }

    @Test
    void testSaveMealSetMenu() throws Exception {
        // Given
        when(mealSetMenuService.saveMealSetMenu(any(MealSetMenuDTO.class))).thenReturn(responseDTO);
        
        // Mock static method for Files.write
        try (MockedStatic<Files> mockedFiles = mockStatic(Files.class)) {
            mockedFiles.when(() -> Files.write(any(Path.class), any(byte[].class), 
                    any(StandardOpenOption.class), any(StandardOpenOption.class)))
                    .thenReturn(null);
            
            // When
            ResponseDTO<MealSetMenuDTO> result = mealSetMenuController.saveMealSetMenu(mealSetMenuDTO);

            // Then
            assertNotNull(result);
            verify(mealSetMenuService, times(1)).saveMealSetMenu(mealSetMenuDTO);
        }
    }

    @Test
    void testSaveMealSetMenu_IOException() {

        // Mock static method to throw IOException
        try (MockedStatic<Files> mockedFiles = mockStatic(Files.class)) {

            mockedFiles.when(() -> Files.write(
                    any(Path.class),
                    any(byte[].class),
                    any(StandardOpenOption.class),
                    any(StandardOpenOption.class)
            )).thenThrow(new IOException("Test IOException"));

            assertThrows(IOException.class, () -> {
                mealSetMenuController.saveMealSetMenu(mealSetMenuDTO);
            });
        }
    }


    @Test
    void testCopyMealSetMenu() {
        // Given
        when(mealSetMenuService.copyMealSetMenu(any(MealSetMenuDTO.class))).thenReturn(responseDTO);

        // When
        ResponseDTO<MealSetMenuDTO> result = mealSetMenuController.copyMealSetMenu(mealSetMenuDTO);

        // Then
        assertNotNull(result);
        verify(mealSetMenuService, times(1)).copyMealSetMenu(mealSetMenuDTO);
    }

    @Test
    void testMealSetMenuEditById() {
        // Given
        when(mealSetMenuService.mealSetMenuEditById(anyInt())).thenReturn(responseDTO);

        // When
        ResponseDTO<MealSetMenuDTO> result = mealSetMenuController.mealSetMenuEditById(1);

        // Then
        assertNotNull(result);
        verify(mealSetMenuService, times(1)).mealSetMenuEditById(1);
    }

    @Test
    void testMealSetMenuModify() throws Exception {
        // Given
        when(mealSetMenuService.mealSetMenuModify(any(MealSetMenuDTO.class))).thenReturn(responseDTO);
        
        // Mock static method for Files.write
        try (MockedStatic<Files> mockedFiles = mockStatic(Files.class)) {
            mockedFiles.when(() -> Files.write(any(Path.class), any(byte[].class), 
                    any(StandardOpenOption.class), any(StandardOpenOption.class)))
                    .thenReturn(null);

            // When
            ResponseDTO<MealSetMenuDTO> result = mealSetMenuController.mealSetMenuModify(mealSetMenuDTO);

            // Then
            assertNotNull(result);
            verify(mealSetMenuService, times(1)).mealSetMenuModify(mealSetMenuDTO);
        }
    }

    @Test
    void testMealSetMenuModify_IOException() {

        try (MockedStatic<Files> mockedFiles = mockStatic(Files.class)) {

            mockedFiles.when(() -> Files.write(
                    any(Path.class),
                    any(byte[].class),
                    any(StandardOpenOption.class),
                    any(StandardOpenOption.class)
            )).thenThrow(new IOException("Test IOException"));

            assertThrows(IOException.class, () -> {
                mealSetMenuController.mealSetMenuModify(mealSetMenuDTO);
            });
        }
    }


    @Test
    void testExportMealSetMenuExcel() throws Exception {
        // Given
        byte[] excelBytes = "Excel Content".getBytes();
        ResponseEntity<byte[]> responseEntity = ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"mealSetMenu.xlsx\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelBytes);
        
        when(mealSetMenuService.exportMealSetMenuExcel(any(MealSetMenuDTO.class))).thenReturn(responseEntity);
        
        // Mock static method for Files.write
        try (MockedStatic<Files> mockedFiles = mockStatic(Files.class)) {
            mockedFiles.when(() -> Files.write(any(Path.class), any(byte[].class), 
                    any(StandardOpenOption.class), any(StandardOpenOption.class)))
                    .thenReturn(null);

            // When
            ResponseEntity<byte[]> result = mealSetMenuController.exportMealSetMenuExcel(mealSetMenuDTO);

            // Then
            assertNotNull(result);
            assertArrayEquals(excelBytes, result.getBody());
            verify(mealSetMenuService, times(1)).exportMealSetMenuExcel(mealSetMenuDTO);
        }
    }

    @Test
    void testExportSingleMealSetMenuExcel() {
        // Given
        byte[] excelBytes = "Single MealSet Excel Content".getBytes();
        ResponseEntity<byte[]> responseEntity = ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"singleMealSet.xlsx\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelBytes);
        
        when(mealSetMenuService.exportSingleMealSetMenuExcel(anyInt(), anyInt())).thenReturn(responseEntity);

        // When
        ResponseEntity<byte[]> result = mealSetMenuController.exportSingleMealSetMenuExcel(1, 100);

        // Then
        assertNotNull(result);
        assertArrayEquals(excelBytes, result.getBody());
        verify(mealSetMenuService, times(1)).exportSingleMealSetMenuExcel(1, 100);
    }

    @Test
    void testLoadMealTypeDropDown() {
        // Given
        when(mealSetMenuService.loadMealTypeDropDown()).thenReturn(comboBoxResponseDTO);

        // When
        ResponseDTO<List<ComboBoxDTO>> result = mealSetMenuController.loadMealTypeDropDown();

        // Then
        assertNotNull(result);
        assertEquals(1, result.getData().size());
        verify(mealSetMenuService, times(1)).loadMealTypeDropDown();
    }

    @Test
    void testLoadCategoryDropDown() {
        // Given
        when(mealSetMenuService.loadCategoryDropDown()).thenReturn(comboBoxResponseDTO);

        // When
        ResponseDTO<List<ComboBoxDTO>> result = mealSetMenuController.loadCategoryDropDown();

        // Then
        assertNotNull(result);
        verify(mealSetMenuService, times(1)).loadCategoryDropDown();
    }

    @Test
    void testConstructor() {
        // When
        MealSetMenuController controller = new MealSetMenuController(mealSetMenuService);
        
        // Then
        assertNotNull(controller);
    }

    // Additional edge case tests for better coverage
    @Test
    void testMealSetMenuList_NullInput() {
        // Given
        when(mealSetMenuService.mealSetMenuList(isNull())).thenReturn(responseDTO);

        // When
        ResponseDTO<MealSetMenuDTO> result = mealSetMenuController.mealSetMenuList(null);

        // Then
        assertNotNull(result);
        verify(mealSetMenuService, times(1)).mealSetMenuList(null);
    }

    @Test
    void testCategoryListByFk_NullInput() {
        // Given
        when(mealSetMenuService.categoryListByFk(isNull())).thenReturn(listResponseDTO);

        // When
        ResponseDTO<List<MealSetMenuDTO>> result = mealSetMenuController.categoryListByFk(null);

        // Then
        assertNotNull(result);
        verify(mealSetMenuService, times(1)).categoryListByFk(null);
    }

    @Test
    void testSaveMealSetMenu_JsonProcessingException() throws Exception {
        // Given - Mock ObjectMapper to throw JsonProcessingException
        MealSetMenuController controllerWithMockMapper = new MealSetMenuController(mealSetMenuService);
        ObjectMapper mockMapper = mock(ObjectMapper.class);
        // Use reflection to inject mock mapper
        var field = MealSetMenuController.class.getDeclaredField("mapper");
        field.setAccessible(true);
        field.set(controllerWithMockMapper, mockMapper);
        
        when(mockMapper.writerWithDefaultPrettyPrinter()).thenThrow(new RuntimeException("JSON Processing Error"));
        

        // When & Then - Should throw IOException
        assertThrows(RuntimeException.class, () -> {

            controllerWithMockMapper.saveMealSetMenu(mealSetMenuDTO);
        });
    }
}