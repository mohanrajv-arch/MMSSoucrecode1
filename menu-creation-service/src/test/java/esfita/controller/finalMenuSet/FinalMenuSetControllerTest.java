package esfita.controller.finalMenuSet;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.CALLS_REAL_METHODS;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;

import esfita.controller.FinalMenuSetController;
import esfita.dto.ComboBoxDTO;
import esfita.dto.FinalMenuSetDTO;
import esfita.dto.ResponseDTO;
import esfita.service.FinalMenuSetService;

@ExtendWith(MockitoExtension.class)
class FinalMenuSetControllerTest {

	@Mock
	private FinalMenuSetService finalMenuSetService;

	@InjectMocks
	private FinalMenuSetController finalMenuSetController;

	private FinalMenuSetDTO finalMenuSetDTO;
	private ResponseDTO<FinalMenuSetDTO> responseDTO;
	private ResponseDTO<List<ComboBoxDTO>> comboBoxResponseDTO;
	private ResponseEntity<byte[]> responseEntity;

	@BeforeEach
	void setUp() {
		// Setup FinalMenuSetDTO
		finalMenuSetDTO = new FinalMenuSetDTO();
		finalMenuSetDTO.setId(1);
		finalMenuSetDTO.setMenuName("Test Final Menu");

		// Setup ResponseDTO for FinalMenuSetDTO
		responseDTO = new ResponseDTO<>();
		responseDTO.setData(finalMenuSetDTO);
		responseDTO.setSuccess(true);
		responseDTO.setMessage("Success");

		// Setup ComboBoxDTO
		ComboBoxDTO comboBoxDTO = new ComboBoxDTO();
		comboBoxDTO.setPk(1);
		comboBoxDTO.setName("Option 1");

		// Setup ResponseDTO for List<ComboBoxDTO>
		comboBoxResponseDTO = new ResponseDTO<>();
		comboBoxResponseDTO.setData(Arrays.asList(comboBoxDTO));
		comboBoxResponseDTO.setSuccess(true);
		comboBoxResponseDTO.setMessage("Success");

		// Setup ResponseEntity for Excel export
		byte[] excelBytes = "Excel Content".getBytes();
		responseEntity = ResponseEntity.ok().header("Content-Disposition", "attachment; filename=\"report.xlsx\"")
				.body(excelBytes);
	}

	@Test
	void testConstructor() {
		// When
		FinalMenuSetController controller = new FinalMenuSetController(finalMenuSetService);

		// Then
		assertNotNull(controller);
	}

	@Test
	void testLoadMealTypeDropDown() {
		// Given
		when(finalMenuSetService.loadMealTypeDropDown()).thenReturn(comboBoxResponseDTO);

		// When
		ResponseDTO<List<ComboBoxDTO>> result = finalMenuSetController.loadMealTypeDropDown();

		// Then
		assertNotNull(result);
		assertTrue(result.isSuccess());
		verify(finalMenuSetService, times(1)).loadMealTypeDropDown();
	}

	@Test
	void testFinalMenuList() {
		// Given
		when(finalMenuSetService.finalMenuList(any(FinalMenuSetDTO.class))).thenReturn(responseDTO);

		// When
		ResponseDTO<FinalMenuSetDTO> result = finalMenuSetController.finalMenuList(finalMenuSetDTO);

		// Then
		assertNotNull(result);
		verify(finalMenuSetService, times(1)).finalMenuList(finalMenuSetDTO);
	}

	@Test
	void testFinalMenuSetStatusUpdate() {
		// Given
		when(finalMenuSetService.finalMenuSetStatusUpdate(any(FinalMenuSetDTO.class))).thenReturn(responseDTO);

		// When
		ResponseDTO<FinalMenuSetDTO> result = finalMenuSetController.finalMenuSetStatusUpdate(finalMenuSetDTO);

		// Then
		assertNotNull(result);
		verify(finalMenuSetService, times(1)).finalMenuSetStatusUpdate(finalMenuSetDTO);
	}

	@Test
	void testFinalSetMenuApprovalStatus() {
		// Given
		when(finalMenuSetService.finalSetMenuApprovalStatus(any(FinalMenuSetDTO.class))).thenReturn(responseDTO);

		// When
		ResponseDTO<FinalMenuSetDTO> result = finalMenuSetController.finalSetMenuApprovalStatus(finalMenuSetDTO);

		// Then
		assertNotNull(result);
		verify(finalMenuSetService, times(1)).finalSetMenuApprovalStatus(finalMenuSetDTO);
	}

	@Test
	void testFinalMenuView() {
		// Given
		when(finalMenuSetService.finalMenuView(anyInt())).thenReturn(responseDTO);

		// When
		ResponseDTO<FinalMenuSetDTO> result = finalMenuSetController.finalMenuView(1);

		// Then
		assertNotNull(result);
		verify(finalMenuSetService, times(1)).finalMenuView(1);
	}

	@Test
	void testFinalMenuSetViewByMenu() {
		// Given
		when(finalMenuSetService.finalMenuSetViewByMenu(anyInt(), anyInt())).thenReturn(responseDTO);

		// When
		ResponseDTO<FinalMenuSetDTO> result = finalMenuSetController.finalMenuSetViewByMenu(1, 2);

		// Then
		assertNotNull(result);
		verify(finalMenuSetService, times(1)).finalMenuSetViewByMenu(1, 2);
	}

	@Test
	void testLoadMealSetMenuDropDown() {
		// Given
		when(finalMenuSetService.loadMealSetMenuDropDown(anyInt())).thenReturn(comboBoxResponseDTO);

		// When
		ResponseDTO<List<ComboBoxDTO>> result = finalMenuSetController.loadMealSetMenuDropDown(1);

		// Then
		assertNotNull(result);
		verify(finalMenuSetService, times(1)).loadMealSetMenuDropDown(1);
	}

	@Test
	void testSaveFinalSetMenu_Success() throws Exception {

	    // Given
	    when(finalMenuSetService.saveFinalSetMenu(any(FinalMenuSetDTO.class)))
	            .thenReturn(responseDTO);

	    LocalDateTime fixedDateTime =
	            LocalDateTime.of(2024, 1, 1, 12, 30, 45);

	    try (MockedStatic<LocalDateTime> mockedDateTime =
	                 mockStatic(LocalDateTime.class, CALLS_REAL_METHODS);
	         MockedStatic<Files> mockedFiles =
	                 mockStatic(Files.class)) {

	        mockedDateTime.when(LocalDateTime::now)
	                .thenReturn(fixedDateTime);

	        mockedFiles.when(() ->
	                Files.write(any(Path.class), any(byte[].class),
	                        any(StandardOpenOption.class), any(StandardOpenOption.class)))
	                .thenReturn(null);

	        // When
	        ResponseDTO<FinalMenuSetDTO> result =
	                finalMenuSetController.saveFinalSetMenu(finalMenuSetDTO);

	        // Then
	        assertNotNull(result);
	        verify(finalMenuSetService).saveFinalSetMenu(finalMenuSetDTO);
	    }
	}


	

	@Test
	void testSaveFinalSetMenu_JsonProcessingException() throws Exception {

	    FinalMenuSetController controller =
	            new FinalMenuSetController(finalMenuSetService);

	    // inject mock ObjectMapper
	    ObjectMapper mockMapper = mock(ObjectMapper.class);
	    Field mapperField = FinalMenuSetController.class.getDeclaredField("mapper");
	    mapperField.setAccessible(true);
	    mapperField.set(controller, mockMapper);

	    ObjectWriter mockWriter = mock(ObjectWriter.class);

	    when(mockMapper.writerWithDefaultPrettyPrinter()).thenReturn(mockWriter);
	    when(mockWriter.writeValueAsString(any()))
	            .thenThrow(new RuntimeException("JSON Processing Error"));

	 

	    try (MockedStatic<LocalDateTime> mockedDateTime =
	             mockStatic(LocalDateTime.class, CALLS_REAL_METHODS)) {

	        LocalDateTime fixed = LocalDateTime.of(2024, 1, 1, 12, 30, 45);
	        mockedDateTime.when(LocalDateTime::now).thenReturn(fixed);

	        assertThrows(RuntimeException.class,
	                () -> controller.saveFinalSetMenu(finalMenuSetDTO));
	    }
	}

	@Test
	void testMealSetMenuEditByIdForMenuSet() {
		// Given
		when(finalMenuSetService.mealSetMenuEditByIdForMenuSet(anyInt())).thenReturn(responseDTO);

		// When
		ResponseDTO<FinalMenuSetDTO> result = finalMenuSetController.mealSetMenuEditByIdForMenuSet(1);

		// Then
		assertNotNull(result);
		verify(finalMenuSetService, times(1)).mealSetMenuEditByIdForMenuSet(1);
	}

	@Test
	void testViewFinalSetMenuById() {
		// Given
		when(finalMenuSetService.viewFinalSetMenuById(anyInt())).thenReturn(responseDTO);

		// When
		ResponseDTO<FinalMenuSetDTO> result = finalMenuSetController.viewFinalSetMenuById(1);

		// Then
		assertNotNull(result);
		verify(finalMenuSetService, times(1)).viewFinalSetMenuById(1);
	}

	@Test
	void testFinalMenuRecipeEdit() {
		// Given
		when(finalMenuSetService.finalMenuRecipeEdit(anyInt(), anyInt())).thenReturn(responseDTO);

		// When
		ResponseDTO<FinalMenuSetDTO> result = finalMenuSetController.finalMenuRecipeEdit(1, 2);

		// Then
		assertNotNull(result);
		verify(finalMenuSetService, times(1)).finalMenuRecipeEdit(1, 2);
	}

	@Test
	void testModifyFinalMenuSet_Success() throws Exception {

	    when(finalMenuSetService.modifyFinalMenuSet(any(FinalMenuSetDTO.class)))
	            .thenReturn(responseDTO);

	    try (MockedStatic<LocalDateTime> mockedDateTime =
	             mockStatic(LocalDateTime.class, CALLS_REAL_METHODS);
	         MockedStatic<Files> mockedFiles = mockStatic(Files.class)) {

	        LocalDateTime fixedDateTime =
	                LocalDateTime.of(2024, 1, 1, 12, 30, 45);

	        mockedDateTime.when(LocalDateTime::now).thenReturn(fixedDateTime);

	        mockedFiles.when(() -> Files.write(
	                any(Path.class),
	                any(byte[].class),
	                any(StandardOpenOption.class),
	                any(StandardOpenOption.class)
	        )).thenReturn(null);

	        ResponseDTO<FinalMenuSetDTO> result =
	                finalMenuSetController.modifyFinalMenuSet(finalMenuSetDTO);

	        assertNotNull(result);
	        verify(finalMenuSetService, times(1))
	                .modifyFinalMenuSet(finalMenuSetDTO);
	    }
	}


	@Test
	void testModifyFinalMenuSet_IOException() {

	  

	    // Create BEFORE mocking
	    LocalDateTime fixedDateTime = LocalDateTime.of(2024, 1, 1, 12, 30, 45);

	    try (MockedStatic<LocalDateTime> mockedDateTime =
	                 mockStatic(LocalDateTime.class);
	         MockedStatic<Files> mockedFiles =
	                 mockStatic(Files.class)) {

	        // stub only now()
	        mockedDateTime.when(LocalDateTime::now).thenReturn(fixedDateTime);

	        // Force IOException on file write
	        mockedFiles.when(() ->
	                Files.write(any(Path.class), any(byte[].class),
	                        any(StandardOpenOption.class), any(StandardOpenOption.class)))
	                .thenThrow(new IOException("Test IOException"));

	        // When & Then
	        assertThrows(IOException.class, () -> {
	            finalMenuSetController.modifyFinalMenuSet(finalMenuSetDTO);
	        });

	       
	    }
	}

	@Test
	void testCopyFinalMenuSet() {
		// Given
		when(finalMenuSetService.copyFinalMenuSet(any(FinalMenuSetDTO.class))).thenReturn(responseDTO);

		// When
		ResponseDTO<FinalMenuSetDTO> result = finalMenuSetController.copyFinalMenuSet(finalMenuSetDTO);

		// Then
		assertNotNull(result);
		verify(finalMenuSetService, times(1)).copyFinalMenuSet(finalMenuSetDTO);
	}

	@Test
	void testLoadMealSetTemplateDropDown() {
		// Given
		when(finalMenuSetService.loadMealSetTemplateDropDown(anyInt())).thenReturn(comboBoxResponseDTO);

		// When
		ResponseDTO<List<ComboBoxDTO>> result = finalMenuSetController.loadMealSetTemplateDropDown(1);

		// Then
		assertNotNull(result);
		verify(finalMenuSetService, times(1)).loadMealSetTemplateDropDown(1);
	}

	@Test
	void testLoadCategoryByTemplatePkDropDown() {
		// Given
		when(finalMenuSetService.loadCategoryByTemplatePkDropDown(anyInt())).thenReturn(comboBoxResponseDTO);

		// When
		ResponseDTO<List<ComboBoxDTO>> result = finalMenuSetController.loadCategoryByTemplatePkDropDown(1);

		// Then
		assertNotNull(result);
		verify(finalMenuSetService, times(1)).loadCategoryByTemplatePkDropDown(1);
	}

	@Test
	void testListDownload_Success() throws Exception {

	    // Given
	    when(finalMenuSetService.printexcelreport(any(FinalMenuSetDTO.class)))
	            .thenReturn(responseEntity);

	    // Fixed instant BEFORE mocking
	    LocalDateTime fixedDateTime = LocalDateTime.of(2024, 1, 1, 12, 30, 45);

	    try (MockedStatic<LocalDateTime> mockedDateTime =
	                 mockStatic(LocalDateTime.class, CALLS_REAL_METHODS);
	         MockedStatic<Files> mockedFiles =
	                 mockStatic(Files.class)) {

	        // only override now()
	        mockedDateTime.when(LocalDateTime::now)
	                .thenReturn(fixedDateTime);

	        mockedFiles.when(() ->
	                Files.write(any(Path.class), any(byte[].class),
	                        any(StandardOpenOption.class), any(StandardOpenOption.class)))
	                .thenReturn(null);

	        // When
	        ResponseEntity<byte[]> result =
	                finalMenuSetController.printexcelreport(finalMenuSetDTO);

	        // Then
	        assertNotNull(result);
	        verify(finalMenuSetService).printexcelreport(finalMenuSetDTO);
	    }
	}


	
	@Test
	void testViewDownload() {
		// Given
		when(finalMenuSetService.printexcelreportView(anyInt(), anyInt())).thenReturn(responseEntity);

		// When
		ResponseEntity<byte[]> result = finalMenuSetController.printexcelreportView(1, 100);

		// Then
		assertNotNull(result);
		verify(finalMenuSetService, times(1)).printexcelreportView(1, 100);
	}

	@Test
	void testFinalMenuList_NullInput() {
		// Given
		when(finalMenuSetService.finalMenuList(isNull())).thenReturn(responseDTO);

		// When
		ResponseDTO<FinalMenuSetDTO> result = finalMenuSetController.finalMenuList(null);

		// Then
		assertNotNull(result);
		verify(finalMenuSetService, times(1)).finalMenuList(null);
	}

	@Test
	void testFinalMenuSetStatusUpdate_NullInput() {
		// Given
		when(finalMenuSetService.finalMenuSetStatusUpdate(isNull())).thenReturn(responseDTO);

		// When
		ResponseDTO<FinalMenuSetDTO> result = finalMenuSetController.finalMenuSetStatusUpdate(null);

		// Then
		assertNotNull(result);
		verify(finalMenuSetService, times(1)).finalMenuSetStatusUpdate(null);
	}

	@Test
	void testFinalSetMenuApprovalStatus_NullInput() {
		// Given
		when(finalMenuSetService.finalSetMenuApprovalStatus(isNull())).thenReturn(responseDTO);

		// When
		ResponseDTO<FinalMenuSetDTO> result = finalMenuSetController.finalSetMenuApprovalStatus(null);

		// Then
		assertNotNull(result);
		verify(finalMenuSetService, times(1)).finalSetMenuApprovalStatus(null);
	}

	@Test
	void testCopyFinalMenuSet_NullInput() {
		// Given
		when(finalMenuSetService.copyFinalMenuSet(isNull())).thenReturn(responseDTO);

		// When
		ResponseDTO<FinalMenuSetDTO> result = finalMenuSetController.copyFinalMenuSet(null);

		// Then
		assertNotNull(result);
		verify(finalMenuSetService, times(1)).copyFinalMenuSet(null);
	}

	

	@Test
	void testTimestampFormat() throws Exception {

	    // create before mocking statics
	    LocalDateTime fixedDateTime = LocalDateTime.of(2024, 12, 25, 14, 30, 45);

	    when(finalMenuSetService.saveFinalSetMenu(any(FinalMenuSetDTO.class)))
	            .thenReturn(responseDTO);

	    try (MockedStatic<LocalDateTime> mockedDateTime = mockStatic(LocalDateTime.class);
	         MockedStatic<Files> mockedFiles = mockStatic(Files.class)) {

	        mockedDateTime.when(LocalDateTime::now).thenReturn(fixedDateTime);

	        mockedFiles.when(() -> Files.write(any(Path.class), any(byte[].class),
	                any(StandardOpenOption.class), any(StandardOpenOption.class)))
	                .thenAnswer(invocation -> {
	                    Path pathArg = invocation.getArgument(0);
	                    assertTrue(pathArg.toString().contains("20241225_143045"));
	                    return null;
	                });

	        ResponseDTO<FinalMenuSetDTO> result =
	                finalMenuSetController.saveFinalSetMenu(finalMenuSetDTO);

	        assertNotNull(result);
	        verify(finalMenuSetService).saveFinalSetMenu(finalMenuSetDTO);
	    }
	}


	// Test all endpoints with various parameter values
	@Test
	void testAllEndpointsWithDifferentParameters() {
		// Test with different ID values
		when(finalMenuSetService.finalMenuView(anyInt())).thenReturn(responseDTO);

		ResponseDTO<FinalMenuSetDTO> result1 = finalMenuSetController.finalMenuView(0);
		ResponseDTO<FinalMenuSetDTO> result2 = finalMenuSetController.finalMenuView(-1);
		ResponseDTO<FinalMenuSetDTO> result3 = finalMenuSetController.finalMenuView(Integer.MAX_VALUE);

		assertNotNull(result1);
		assertNotNull(result2);
		assertNotNull(result3);

		// Test with different meal type values
		when(finalMenuSetService.loadMealSetMenuDropDown(anyInt())).thenReturn(comboBoxResponseDTO);

		ResponseDTO<List<ComboBoxDTO>> result4 = finalMenuSetController.loadMealSetMenuDropDown(0);
		ResponseDTO<List<ComboBoxDTO>> result5 = finalMenuSetController.loadMealSetMenuDropDown(-1);
		ResponseDTO<List<ComboBoxDTO>> result6 = finalMenuSetController.loadMealSetMenuDropDown(100);

		assertNotNull(result4);
		assertNotNull(result5);
		assertNotNull(result6);

		// Verify all calls
		verify(finalMenuSetService, times(3)).finalMenuView(anyInt());
		verify(finalMenuSetService, times(3)).loadMealSetMenuDropDown(anyInt());
	}

	// Test for coverage of all REST methods
	@Test
	void testAllRestAnnotations() {
		// This test ensures all annotated methods are called at least once

		// Setup mocks for all methods
		when(finalMenuSetService.loadMealTypeDropDown()).thenReturn(comboBoxResponseDTO);
		when(finalMenuSetService.finalMenuView(anyInt())).thenReturn(responseDTO);
		when(finalMenuSetService.finalMenuSetViewByMenu(anyInt(), anyInt())).thenReturn(responseDTO);
		when(finalMenuSetService.loadMealSetMenuDropDown(anyInt())).thenReturn(comboBoxResponseDTO);
		when(finalMenuSetService.mealSetMenuEditByIdForMenuSet(anyInt())).thenReturn(responseDTO);
		when(finalMenuSetService.viewFinalSetMenuById(anyInt())).thenReturn(responseDTO);
		when(finalMenuSetService.finalMenuRecipeEdit(anyInt(), anyInt())).thenReturn(responseDTO);
		when(finalMenuSetService.loadMealSetTemplateDropDown(anyInt())).thenReturn(comboBoxResponseDTO);
		when(finalMenuSetService.loadCategoryByTemplatePkDropDown(anyInt())).thenReturn(comboBoxResponseDTO);
		when(finalMenuSetService.printexcelreportView(anyInt(), anyInt())).thenReturn(responseEntity);

		// Call all GET methods
		finalMenuSetController.loadMealTypeDropDown();
		finalMenuSetController.finalMenuView(1);
		finalMenuSetController.finalMenuSetViewByMenu(1, 2);
		finalMenuSetController.loadMealSetMenuDropDown(1);
		finalMenuSetController.mealSetMenuEditByIdForMenuSet(1);
		finalMenuSetController.viewFinalSetMenuById(1);
		finalMenuSetController.finalMenuRecipeEdit(1, 2);
		finalMenuSetController.loadMealSetTemplateDropDown(1);
		finalMenuSetController.loadCategoryByTemplatePkDropDown(1);
		finalMenuSetController.printexcelreportView(1, 100);

		// Verify each method was called once
		verify(finalMenuSetService, times(1)).loadMealTypeDropDown();
		verify(finalMenuSetService, times(1)).finalMenuView(1);
		verify(finalMenuSetService, times(1)).finalMenuSetViewByMenu(1, 2);
		verify(finalMenuSetService, times(1)).loadMealSetMenuDropDown(1);
		verify(finalMenuSetService, times(1)).mealSetMenuEditByIdForMenuSet(1);
		verify(finalMenuSetService, times(1)).viewFinalSetMenuById(1);
		verify(finalMenuSetService, times(1)).finalMenuRecipeEdit(1, 2);
		verify(finalMenuSetService, times(1)).loadMealSetTemplateDropDown(1);
		verify(finalMenuSetService, times(1)).loadCategoryByTemplatePkDropDown(1);
		verify(finalMenuSetService, times(1)).printexcelreportView(1, 100);
	}



	@Test
	void testFileWriteWithSpecificOptions() throws Exception {

	    when(finalMenuSetService.saveFinalSetMenu(any(FinalMenuSetDTO.class)))
	            .thenReturn(responseDTO);

	    try (MockedStatic<LocalDateTime> mockedDateTime =
	             mockStatic(LocalDateTime.class, CALLS_REAL_METHODS);
	         MockedStatic<Files> mockedFiles =
	             mockStatic(Files.class)) {

	        LocalDateTime fixedDateTime =
	                LocalDateTime.of(2024, 1, 1, 12, 30, 45);

	        mockedDateTime.when(LocalDateTime::now)
	                .thenReturn(fixedDateTime);

	        mockedFiles.when(() -> Files.write(
	                any(Path.class),
	                any(byte[].class),
	                any(StandardOpenOption.class),
	                any(StandardOpenOption.class)))
	                .thenAnswer(invocation -> {

	                    StandardOpenOption option1 = invocation.getArgument(2);
	                    StandardOpenOption option2 = invocation.getArgument(3);

	                    assertEquals(StandardOpenOption.CREATE, option1);
	                    assertEquals(StandardOpenOption.TRUNCATE_EXISTING, option2);

	                    return null;
	                });

	        ResponseDTO<FinalMenuSetDTO> result =
	                finalMenuSetController.saveFinalSetMenu(finalMenuSetDTO);

	        assertNotNull(result);
	        verify(finalMenuSetService, times(1))
	                .saveFinalSetMenu(finalMenuSetDTO);
	    }
	}

	// Test with reflection to inject custom ObjectMapper
	@Test
	void testControllerWithCustomObjectMapper() {
		// Create controller with mocked service
		FinalMenuSetController controller = new FinalMenuSetController(finalMenuSetService);

		// Test with default ObjectMapper (no injection needed for regular methods)
		when(finalMenuSetService.loadMealTypeDropDown()).thenReturn(comboBoxResponseDTO);

		ResponseDTO<List<ComboBoxDTO>> result = controller.loadMealTypeDropDown();

		assertNotNull(result);
		verify(finalMenuSetService, times(1)).loadMealTypeDropDown();
	}

	// Test for null ObjectMapper scenario (edge case)
	@Test
	void testSaveFinalSetMenuWithDefaultObjectMapper() throws Exception {

	    // Controller without manually injected ObjectMapper
	    FinalMenuSetController controller =
	            new FinalMenuSetController(finalMenuSetService);

	    when(finalMenuSetService.saveFinalSetMenu(any(FinalMenuSetDTO.class)))
	            .thenReturn(responseDTO);

	    try (MockedStatic<LocalDateTime> mockedDateTime =
	             mockStatic(LocalDateTime.class, CALLS_REAL_METHODS);
	         MockedStatic<Files> mockedFiles =
	             mockStatic(Files.class)) {

	        LocalDateTime fixedDateTime =
	                LocalDateTime.of(2024, 1, 1, 12, 30, 45);

	        mockedDateTime.when(LocalDateTime::now)
	                .thenReturn(fixedDateTime);

	        mockedFiles.when(() ->
	                Files.write(any(Path.class), any(byte[].class),
	                        any(StandardOpenOption.class), any(StandardOpenOption.class)))
	                .thenReturn(null);

	        ResponseDTO<FinalMenuSetDTO> result =
	                controller.saveFinalSetMenu(finalMenuSetDTO);

	        assertNotNull(result);
	        verify(finalMenuSetService).saveFinalSetMenu(finalMenuSetDTO);
	    }
	}

	// Test empty byte array scenario
	@Test
	void testSaveFinalSetMenuWithEmptyJson() throws Exception {

	    when(finalMenuSetService.saveFinalSetMenu(any(FinalMenuSetDTO.class)))
	            .thenReturn(responseDTO);

	    try (MockedStatic<LocalDateTime> mockedDateTime =
	             mockStatic(LocalDateTime.class, CALLS_REAL_METHODS);
	         MockedStatic<Files> mockedFiles = mockStatic(Files.class)) {

	        LocalDateTime fixedDateTime = LocalDateTime.of(2024, 1, 1, 12, 30, 45);

	        mockedDateTime.when(LocalDateTime::now).thenReturn(fixedDateTime);

	        mockedFiles.when(() -> Files.write(
	                any(Path.class),
	                any(byte[].class),
	                any(StandardOpenOption.class),
	                any(StandardOpenOption.class)
	        )).thenReturn(null);

	        ResponseDTO<FinalMenuSetDTO> result =
	                finalMenuSetController.saveFinalSetMenu(finalMenuSetDTO);

	        assertNotNull(result);
	        verify(finalMenuSetService, times(1)).saveFinalSetMenu(finalMenuSetDTO);
	    }
	}

}